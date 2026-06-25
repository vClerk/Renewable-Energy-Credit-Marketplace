#![no_std]

mod types;
mod errors;
mod events;
mod storage;
mod access;

pub use types::*;
pub use errors::*;
pub use events::*;

use soroban_sdk::{
    contract, contractimpl, contracttype, Address, Env, String, Symbol, Vec, Map,
    symbol_short,
};
use storage::*;
use access::*;

#[contract]
pub struct RECMarketplace;

#[contractimpl]
impl RECMarketplace {
    // ─── Initialization ───────────────────────────────────────────────────

    pub fn initialize(
        env: Env,
        admin: Address,
        treasury_contract: Address,
        registry_contract: Address,
        platform_fee_bps: u32,
    ) -> Result<(), RECError> {
        if storage::is_initialized(&env) {
            return Err(RECError::AlreadyInitialized);
        }
        admin.require_auth();

        storage::set_admin(&env, &admin);
        storage::set_treasury_contract(&env, &treasury_contract);
        storage::set_registry_contract(&env, &registry_contract);
        storage::set_platform_fee_bps(&env, platform_fee_bps);
        storage::set_initialized(&env);

        events::emit_initialized(&env, admin, treasury_contract, registry_contract);
        Ok(())
    }

    // ─── REC Issuance ────────────────────────────────────────────────────

    pub fn issue_rec(
        env: Env,
        issuer: Address,
        energy_source: RECEnergySource,
        mwh_amount: u64,
        location: String,
        certification_body: String,
        vintage_year: u32,
        metadata_uri: String,
    ) -> Result<u64, RECError> {
        issuer.require_auth();

        // Verify issuer is registered as producer
        let registry = storage::get_registry_contract(&env);
        let is_producer: bool = env.invoke_contract(
            &registry,
            &Symbol::new(&env, "is_producer"),
            soroban_sdk::vec![&env, issuer.to_val()],
        );
        if !is_producer {
            return Err(RECError::UnauthorizedProducer);
        }

        if mwh_amount == 0 {
            return Err(RECError::InvalidAmount);
        }

        if vintage_year < 2020 || vintage_year > 2030 {
            return Err(RECError::InvalidVintageYear);
        }

        let rec_id = storage::next_rec_id(&env);
        let timestamp = env.ledger().timestamp();

        let rec = RECToken {
            id: rec_id,
            issuer: issuer.clone(),
            owner: issuer.clone(),
            energy_source: energy_source.clone(),
            mwh_amount,
            location: location.clone(),
            certification_body: certification_body.clone(),
            vintage_year,
            metadata_uri: metadata_uri.clone(),
            status: RECStatus::Pending,
            issued_at: timestamp,
            updated_at: timestamp,
            price: None,
            retired_at: None,
            retire_beneficiary: None,
        };

        storage::save_rec(&env, rec_id, &rec);
        storage::add_user_rec(&env, &issuer, rec_id);

        events::emit_rec_issued(
            &env,
            rec_id,
            issuer,
            energy_source,
            mwh_amount,
            vintage_year,
        );

        Ok(rec_id)
    }

    // ─── REC Approval ────────────────────────────────────────────────────

    pub fn approve_rec(env: Env, validator: Address, rec_id: u64) -> Result<(), RECError> {
        validator.require_auth();
        has_role(&env, &validator, Role::Validator)?;

        let mut rec = storage::get_rec(&env, rec_id).ok_or(RECError::RECNotFound)?;
        if rec.status != RECStatus::Pending {
            return Err(RECError::InvalidStateTransition);
        }

        rec.status = RECStatus::Active;
        rec.updated_at = env.ledger().timestamp();
        storage::save_rec(&env, rec_id, &rec);

        events::emit_rec_approved(&env, rec_id, validator);
        Ok(())
    }

    pub fn reject_rec(env: Env, validator: Address, rec_id: u64) -> Result<(), RECError> {
        validator.require_auth();
        has_role(&env, &validator, Role::Validator)?;

        let mut rec = storage::get_rec(&env, rec_id).ok_or(RECError::RECNotFound)?;
        if rec.status != RECStatus::Pending {
            return Err(RECError::InvalidStateTransition);
        }

        rec.status = RECStatus::Rejected;
        rec.updated_at = env.ledger().timestamp();
        storage::save_rec(&env, rec_id, &rec);

        events::emit_rec_rejected(&env, rec_id, validator);
        Ok(())
    }

    // ─── Marketplace Listing ─────────────────────────────────────────────

    pub fn list_for_sale(
        env: Env,
        owner: Address,
        rec_id: u64,
        price_stroops: i128,
    ) -> Result<(), RECError> {
        owner.require_auth();

        let mut rec = storage::get_rec(&env, rec_id).ok_or(RECError::RECNotFound)?;
        if rec.owner != owner {
            return Err(RECError::NotOwner);
        }
        if rec.status != RECStatus::Active {
            return Err(RECError::InvalidStateTransition);
        }
        if price_stroops <= 0 {
            return Err(RECError::InvalidPrice);
        }

        rec.status = RECStatus::Listed;
        rec.price = Some(price_stroops);
        rec.updated_at = env.ledger().timestamp();
        storage::save_rec(&env, rec_id, &rec);
        storage::add_listing(&env, rec_id);

        events::emit_rec_listed(&env, rec_id, owner, price_stroops);
        Ok(())
    }

    pub fn delist(env: Env, owner: Address, rec_id: u64) -> Result<(), RECError> {
        owner.require_auth();

        let mut rec = storage::get_rec(&env, rec_id).ok_or(RECError::RECNotFound)?;
        if rec.owner != owner {
            return Err(RECError::NotOwner);
        }
        if rec.status != RECStatus::Listed {
            return Err(RECError::InvalidStateTransition);
        }

        rec.status = RECStatus::Active;
        rec.price = None;
        rec.updated_at = env.ledger().timestamp();
        storage::save_rec(&env, rec_id, &rec);
        storage::remove_listing(&env, rec_id);

        events::emit_rec_delisted(&env, rec_id, owner);
        Ok(())
    }

    // ─── Purchase ────────────────────────────────────────────────────────

    pub fn purchase_rec(
        env: Env,
        buyer: Address,
        rec_id: u64,
        payment_token: Address,
    ) -> Result<(), RECError> {
        buyer.require_auth();

        let mut rec = storage::get_rec(&env, rec_id).ok_or(RECError::RECNotFound)?;
        if rec.status != RECStatus::Listed {
            return Err(RECError::NotListed);
        }

        let price = rec.price.ok_or(RECError::InvalidPrice)?;
        let platform_fee_bps = storage::get_platform_fee_bps(&env);
        let fee = (price * platform_fee_bps as i128) / 10000;
        let seller_amount = price - fee;

        let treasury = storage::get_treasury_contract(&env);

        // Transfer payment via treasury contract
        env.invoke_contract::<()>(
            &treasury,
            &Symbol::new(&env, "process_payment"),
            soroban_sdk::vec![
                &env,
                buyer.to_val(),
                rec.owner.to_val(),
                payment_token.to_val(),
                price.into(),
                fee.into(),
            ],
        );

        let seller = rec.owner.clone();
        storage::remove_user_rec(&env, &seller, rec_id);
        storage::add_user_rec(&env, &buyer, rec_id);
        storage::remove_listing(&env, rec_id);

        rec.owner = buyer.clone();
        rec.status = RECStatus::Active;
        rec.price = None;
        rec.updated_at = env.ledger().timestamp();
        storage::save_rec(&env, rec_id, &rec);

        // Record trade
        let trade = Trade {
            rec_id,
            seller: seller.clone(),
            buyer: buyer.clone(),
            price,
            fee,
            timestamp: env.ledger().timestamp(),
        };
        storage::save_trade(&env, &trade);

        events::emit_rec_purchased(&env, rec_id, seller, buyer, price, fee);
        Ok(())
    }

    // ─── REC Retirement ──────────────────────────────────────────────────

    pub fn retire_rec(
        env: Env,
        owner: Address,
        rec_id: u64,
        beneficiary_name: String,
        retirement_reason: String,
    ) -> Result<(), RECError> {
        owner.require_auth();

        let mut rec = storage::get_rec(&env, rec_id).ok_or(RECError::RECNotFound)?;
        if rec.owner != owner {
            return Err(RECError::NotOwner);
        }
        if rec.status != RECStatus::Active && rec.status != RECStatus::Listed {
            return Err(RECError::InvalidStateTransition);
        }

        if rec.status == RECStatus::Listed {
            storage::remove_listing(&env, rec_id);
        }

        let timestamp = env.ledger().timestamp();
        rec.status = RECStatus::Retired;
        rec.retired_at = Some(timestamp);
        rec.retire_beneficiary = Some(beneficiary_name.clone());
        rec.updated_at = timestamp;
        storage::save_rec(&env, rec_id, &rec);

        // Notify registry of retirement
        let registry = storage::get_registry_contract(&env);
        env.invoke_contract::<()>(
            &registry,
            &Symbol::new(&env, "record_retirement"),
            soroban_sdk::vec![
                &env,
                rec_id.into(),
                owner.to_val(),
                rec.mwh_amount.into(),
            ],
        );

        events::emit_rec_retired(
            &env,
            rec_id,
            owner,
            rec.mwh_amount,
            beneficiary_name,
            retirement_reason,
        );
        Ok(())
    }

    // ─── Transfer ────────────────────────────────────────────────────────

    pub fn transfer_rec(
        env: Env,
        from: Address,
        to: Address,
        rec_id: u64,
    ) -> Result<(), RECError> {
        from.require_auth();

        let mut rec = storage::get_rec(&env, rec_id).ok_or(RECError::RECNotFound)?;
        if rec.owner != from {
            return Err(RECError::NotOwner);
        }
        if rec.status == RECStatus::Retired {
            return Err(RECError::InvalidStateTransition);
        }
        if rec.status == RECStatus::Listed {
            storage::remove_listing(&env, rec_id);
            rec.price = None;
        }

        storage::remove_user_rec(&env, &from, rec_id);
        storage::add_user_rec(&env, &to, rec_id);

        rec.owner = to.clone();
        rec.status = RECStatus::Active;
        rec.updated_at = env.ledger().timestamp();
        storage::save_rec(&env, rec_id, &rec);

        events::emit_rec_transferred(&env, rec_id, from, to);
        Ok(())
    }

    // ─── Role Management ─────────────────────────────────────────────────

    pub fn grant_role(env: Env, admin: Address, account: Address, role: Role) -> Result<(), RECError> {
        admin.require_auth();
        require_admin(&env, &admin)?;
        storage::set_role(&env, &account, role.clone());
        events::emit_role_granted(&env, account, role);
        Ok(())
    }

    pub fn revoke_role(env: Env, admin: Address, account: Address, role: Role) -> Result<(), RECError> {
        admin.require_auth();
        require_admin(&env, &admin)?;
        storage::remove_role(&env, &account);
        events::emit_role_revoked(&env, account, role);
        Ok(())
    }

    // ─── Admin Functions ─────────────────────────────────────────────────

    pub fn update_platform_fee(env: Env, admin: Address, new_fee_bps: u32) -> Result<(), RECError> {
        admin.require_auth();
        require_admin(&env, &admin)?;
        if new_fee_bps > 1000 {
            return Err(RECError::InvalidFee);
        }
        storage::set_platform_fee_bps(&env, new_fee_bps);
        Ok(())
    }

    pub fn transfer_admin(env: Env, admin: Address, new_admin: Address) -> Result<(), RECError> {
        admin.require_auth();
        require_admin(&env, &admin)?;
        storage::set_admin(&env, &new_admin);
        Ok(())
    }

    pub fn upgrade(env: Env, admin: Address, new_wasm_hash: soroban_sdk::BytesN<32>) -> Result<(), RECError> {
        admin.require_auth();
        require_admin(&env, &admin)?;
        env.deployer().update_current_contract_wasm(new_wasm_hash);
        Ok(())
    }

    // ─── View Functions ──────────────────────────────────────────────────

    pub fn get_rec(env: Env, rec_id: u64) -> Option<RECToken> {
        storage::get_rec(&env, rec_id)
    }

    pub fn get_listings(env: Env) -> Vec<u64> {
        storage::get_listings(&env)
    }

    pub fn get_user_recs(env: Env, user: Address) -> Vec<u64> {
        storage::get_user_recs(&env, &user)
    }

    pub fn get_total_recs(env: Env) -> u64 {
        storage::get_total_recs(&env)
    }

    pub fn get_platform_fee(env: Env) -> u32 {
        storage::get_platform_fee_bps(&env)
    }

    pub fn get_admin(env: Env) -> Address {
        storage::get_admin(&env)
    }

    pub fn get_role(env: Env, account: Address) -> Option<Role> {
        storage::get_role(&env, &account)
    }

    pub fn get_trades(env: Env) -> Vec<Trade> {
        storage::get_trades(&env)
    }
}
