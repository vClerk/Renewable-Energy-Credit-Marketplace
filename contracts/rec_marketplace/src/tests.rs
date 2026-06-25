#![cfg(test)]

use soroban_sdk::{
    testutils::{Address as _, AuthorizedFunction, AuthorizedInvocation, Events, Ledger},
    vec, Address, Env, IntoVal, String, Symbol,
};

// We import both contracts for integration testing
mod marketplace {
    soroban_sdk::contractimport!(
        file = "../../target/wasm32-unknown-unknown/release/rec_marketplace.wasm"
    );
}

mod registry {
    soroban_sdk::contractimport!(
        file = "../../target/wasm32-unknown-unknown/release/rec_registry.wasm"
    );
}

// ─── Test 1: Successful REC Issuance Flow ────────────────────────────────────

#[test]
fn test_successful_rec_issuance() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let producer = Address::generate(&env);

    // Deploy registry
    let registry_id = env.register(registry::WASM, ());
    let registry_client = registry::Client::new(&env, &registry_id);

    // Deploy marketplace with a dummy treasury (registry will handle payments)
    let marketplace_id = env.register(marketplace::WASM, ());
    let marketplace_client = marketplace::Client::new(&env, &marketplace_id);

    // Initialize registry
    registry_client.initialize(&admin, &marketplace_id);

    // Initialize marketplace
    marketplace_client.initialize(
        &admin,
        &marketplace_id, // treasury = registry for tests
        &registry_id,
        &250u32,
    );

    // Register producer
    registry_client.register_producer(
        &producer,
        &String::from_str(&env, "SolarFarm Alpha"),
        &String::from_str(&env, "California, USA"),
        &vec![&env, String::from_str(&env, "Solar")],
        &5000u64,
        &String::from_str(&env, "CERT-2024-001"),
    );

    // Approve producer (admin)
    registry_client.approve_producer(&admin, &producer);

    // Verify producer is active
    let is_prod = registry_client.is_producer(&producer);
    assert!(is_prod, "Producer should be active");

    // Issue REC
    let rec_id = marketplace_client.issue_rec(
        &producer,
        &marketplace::RECEnergySource::Solar,
        &100u64,
        &String::from_str(&env, "California, USA"),
        &String::from_str(&env, "Green-e Energy"),
        &2024u32,
        &String::from_str(&env, "ipfs://QmRecMetadata"),
    );

    assert_eq!(rec_id, 1u64);

    // Verify REC stored correctly
    let rec = marketplace_client.get_rec(&rec_id).unwrap();
    assert_eq!(rec.owner, producer);
    assert_eq!(rec.mwh_amount, 100u64);
    assert!(matches!(rec.status, marketplace::RECStatus::Pending));
    assert!(matches!(rec.energy_source, marketplace::RECEnergySource::Solar));
}

// ─── Test 2: Access Control & Unauthorized Operations ────────────────────────

#[test]
fn test_role_based_access_control() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let unauthorized_user = Address::generate(&env);
    let producer = Address::generate(&env);

    let registry_id = env.register(registry::WASM, ());
    let registry_client = registry::Client::new(&env, &registry_id);
    let marketplace_id = env.register(marketplace::WASM, ());
    let marketplace_client = marketplace::Client::new(&env, &marketplace_id);

    registry_client.initialize(&admin, &marketplace_id);
    marketplace_client.initialize(&admin, &marketplace_id, &registry_id, &250u32);

    // Grant validator role to admin
    marketplace_client.grant_role(
        &admin,
        &admin,
        &marketplace::Role::Validator,
    );

    // Register and approve producer
    registry_client.register_producer(
        &producer,
        &String::from_str(&env, "Wind Energy Co"),
        &String::from_str(&env, "Texas, USA"),
        &vec![&env, String::from_str(&env, "Wind")],
        &10000u64,
        &String::from_str(&env, "CERT-2024-002"),
    );
    registry_client.approve_producer(&admin, &producer);

    // Issue REC as producer
    let rec_id = marketplace_client.issue_rec(
        &producer,
        &marketplace::RECEnergySource::Wind,
        &200u64,
        &String::from_str(&env, "Texas, USA"),
        &String::from_str(&env, "Green-e Energy"),
        &2024u32,
        &String::from_str(&env, "ipfs://QmWindRec"),
    );

    // Approve as validator (admin has validator role)
    let result = marketplace_client.try_approve_rec(&admin, &rec_id);
    assert!(result.is_ok(), "Admin/validator should be able to approve");

    // Verify REC is now Active
    let rec = marketplace_client.get_rec(&rec_id).unwrap();
    assert!(matches!(rec.status, marketplace::RECStatus::Active));

    // Unauthorized user should not be able to grant roles
    let result = marketplace_client.try_grant_role(
        &unauthorized_user,
        &unauthorized_user,
        &marketplace::Role::Validator,
    );
    assert!(result.is_err(), "Unauthorized user should not grant roles");
}

// ─── Test 3: REC Listing, Purchase & Retirement State Machine ────────────────

#[test]
fn test_full_rec_lifecycle() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let producer = Address::generate(&env);

    let registry_id = env.register(registry::WASM, ());
    let registry_client = registry::Client::new(&env, &registry_id);
    let marketplace_id = env.register(marketplace::WASM, ());
    let marketplace_client = marketplace::Client::new(&env, &marketplace_id);

    registry_client.initialize(&admin, &marketplace_id);
    marketplace_client.initialize(&admin, &marketplace_id, &registry_id, &250u32);
    marketplace_client.grant_role(&admin, &admin, &marketplace::Role::Validator);

    // Setup producer
    registry_client.register_producer(
        &producer,
        &String::from_str(&env, "Hydro Power Inc"),
        &String::from_str(&env, "Oregon, USA"),
        &vec![&env, String::from_str(&env, "Hydro")],
        &20000u64,
        &String::from_str(&env, "CERT-2024-003"),
    );
    registry_client.approve_producer(&admin, &producer);

    // Issue REC
    let rec_id = marketplace_client.issue_rec(
        &producer,
        &marketplace::RECEnergySource::Hydro,
        &500u64,
        &String::from_str(&env, "Oregon, USA"),
        &String::from_str(&env, "RECS"),
        &2024u32,
        &String::from_str(&env, "ipfs://QmHydroRec"),
    );

    // Approve REC
    marketplace_client.approve_rec(&admin, &rec_id);

    // List for sale
    marketplace_client.list_for_sale(&producer, &rec_id, &50_000_000i128);
    let listings = marketplace_client.get_listings();
    assert!(listings.contains(&rec_id), "REC should be in listings");

    // Delist
    marketplace_client.delist(&producer, &rec_id);
    let listings_after = marketplace_client.get_listings();
    assert!(!listings_after.contains(&rec_id), "REC should be removed from listings");

    // Re-list
    marketplace_client.list_for_sale(&producer, &rec_id, &50_000_000i128);

    // Verify can't retire a listed REC directly (would need delist first or auto-delist)
    // The contract auto-delists on retirement if Status::Listed
    let result = marketplace_client.try_retire_rec(
        &producer,
        &rec_id,
        &String::from_str(&env, "Acme Corp"),
        &String::from_str(&env, "Carbon Neutrality 2024"),
    );
    assert!(result.is_ok(), "Owner should be able to retire their listed REC");

    // Verify final state
    let rec = marketplace_client.get_rec(&rec_id).unwrap();
    assert!(matches!(rec.status, marketplace::RECStatus::Retired));
    assert!(rec.retired_at.is_some());
    assert!(rec.retire_beneficiary.is_some());
}

// ─── Test 4: Invalid State Transitions ───────────────────────────────────────

#[test]
fn test_invalid_state_transitions() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let producer = Address::generate(&env);
    let unauthorized = Address::generate(&env);

    let registry_id = env.register(registry::WASM, ());
    let registry_client = registry::Client::new(&env, &registry_id);
    let marketplace_id = env.register(marketplace::WASM, ());
    let marketplace_client = marketplace::Client::new(&env, &marketplace_id);

    registry_client.initialize(&admin, &marketplace_id);
    marketplace_client.initialize(&admin, &marketplace_id, &registry_id, &250u32);

    // Validate cannot issue without being registered producer
    let result = marketplace_client.try_issue_rec(
        &unauthorized,
        &marketplace::RECEnergySource::Solar,
        &100u64,
        &String::from_str(&env, "CA, USA"),
        &String::from_str(&env, "Green-e"),
        &2024u32,
        &String::from_str(&env, "ipfs://test"),
    );
    assert!(result.is_err(), "Unregistered user should not be able to issue REC");

    // Validate cannot approve Pending REC if not validator
    registry_client.register_producer(
        &producer,
        &String::from_str(&env, "Test Farm"),
        &String::from_str(&env, "WA, USA"),
        &vec![&env, String::from_str(&env, "Solar")],
        &1000u64,
        &String::from_str(&env, "CERT-000"),
    );
    registry_client.approve_producer(&admin, &producer);

    let rec_id = marketplace_client.issue_rec(
        &producer,
        &marketplace::RECEnergySource::Solar,
        &50u64,
        &String::from_str(&env, "WA, USA"),
        &String::from_str(&env, "Green-e"),
        &2024u32,
        &String::from_str(&env, "ipfs://QmTest"),
    );

    // Cannot list a pending REC
    let result = marketplace_client.try_list_for_sale(&producer, &rec_id, &1_000_000i128);
    assert!(result.is_err(), "Should not be able to list a pending REC");

    // Validate invalid vintage year
    let result = marketplace_client.try_issue_rec(
        &producer,
        &marketplace::RECEnergySource::Solar,
        &50u64,
        &String::from_str(&env, "WA, USA"),
        &String::from_str(&env, "Green-e"),
        &1999u32, // Invalid year
        &String::from_str(&env, "ipfs://QmTest2"),
    );
    assert!(result.is_err(), "Should reject invalid vintage year");
}

// ─── Test 5: Registry Producer Management ────────────────────────────────────

#[test]
fn test_registry_producer_management() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let marketplace_id = Address::generate(&env);
    let producer1 = Address::generate(&env);
    let producer2 = Address::generate(&env);

    let registry_id = env.register(registry::WASM, ());
    let registry_client = registry::Client::new(&env, &registry_id);
    registry_client.initialize(&admin, &marketplace_id);

    // Register multiple producers
    registry_client.register_producer(
        &producer1,
        &String::from_str(&env, "Solar Alpha"),
        &String::from_str(&env, "NV, USA"),
        &vec![&env, String::from_str(&env, "Solar")],
        &5000u64,
        &String::from_str(&env, "CERT-001"),
    );

    registry_client.register_producer(
        &producer2,
        &String::from_str(&env, "Wind Beta"),
        &String::from_str(&env, "TX, USA"),
        &vec![&env, String::from_str(&env, "Wind")],
        &8000u64,
        &String::from_str(&env, "CERT-002"),
    );

    // Both start as Pending
    assert!(!registry_client.is_producer(&producer1));
    assert!(!registry_client.is_producer(&producer2));

    // Approve producer1
    registry_client.approve_producer(&admin, &producer1);
    assert!(registry_client.is_producer(&producer1));
    assert!(!registry_client.is_producer(&producer2));

    // Suspend producer1
    registry_client.suspend_producer(&admin, &producer1);
    assert!(!registry_client.is_producer(&producer1));

    // Verify producer list
    let all_producers = registry_client.get_all_producers();
    assert_eq!(all_producers.len(), 2);
}

// ─── Test 6: Platform Fee Configuration ──────────────────────────────────────

#[test]
fn test_platform_fee_configuration() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let registry_id = Address::generate(&env);
    let treasury_id = Address::generate(&env);

    let marketplace_id = env.register(marketplace::WASM, ());
    let marketplace_client = marketplace::Client::new(&env, &marketplace_id);

    marketplace_client.initialize(&admin, &treasury_id, &registry_id, &250u32);

    // Verify initial fee
    let fee = marketplace_client.get_platform_fee();
    assert_eq!(fee, 250u32);

    // Update fee as admin
    marketplace_client.update_platform_fee(&admin, &300u32);
    let new_fee = marketplace_client.get_platform_fee();
    assert_eq!(new_fee, 300u32);

    // Cannot set fee > 1000 bps (10%)
    let result = marketplace_client.try_update_platform_fee(&admin, &1500u32);
    assert!(result.is_err(), "Fee should not exceed 10%");
}
