#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, contracterror,
    symbol_short, Address, Env, String, Vec,
};

// ─── Types ────────────────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum ProducerStatus {
    Pending,
    Active,
    Suspended,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct Producer {
    pub address: Address,
    pub name: String,
    pub location: String,
    pub energy_types: Vec<String>,
    pub capacity_kw: u64,
    pub certification_id: String,
    pub status: ProducerStatus,
    pub registered_at: u64,
    pub total_mwh_issued: u64,
    pub total_mwh_retired: u64,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct RetirementRecord {
    pub rec_id: u64,
    pub owner: Address,
    pub mwh_amount: u64,
    pub timestamp: u64,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct MarketStats {
    pub total_producers: u32,
    pub total_mwh_issued: u64,
    pub total_mwh_retired: u64,
    pub total_transactions: u32,
    pub total_volume_stroops: i128,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum RegistryError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    Unauthorized = 3,
    ProducerNotFound = 4,
    ProducerAlreadyExists = 5,
    InvalidStatus = 6,
    InvalidAmount = 7,
    Unauthorized2 = 8,
}

// ─── Contract ────────────────────────────────────────────────────────────────

#[contract]
pub struct RECRegistry;

#[contractimpl]
impl RECRegistry {
    // ─── Initialize ──────────────────────────────────────────────────────

    pub fn initialize(env: Env, admin: Address, marketplace_contract: Address) -> Result<(), RegistryError> {
        if env.storage().instance().has(&symbol_short!("init")) {
            return Err(RegistryError::AlreadyInitialized);
        }
        admin.require_auth();

        env.storage().instance().set(&symbol_short!("admin"), &admin);
        env.storage().instance().set(&symbol_short!("mktplace"), &marketplace_contract);
        env.storage().instance().set(&symbol_short!("init"), &true);
        env.storage().instance().extend_ttl(100_000, 100_000);

        env.events().publish(
            (symbol_short!("init"),),
            (admin, marketplace_contract),
        );
        Ok(())
    }

    // ─── Producer Registration ───────────────────────────────────────────

    pub fn register_producer(
        env: Env,
        producer_addr: Address,
        name: String,
        location: String,
        energy_types: Vec<String>,
        capacity_kw: u64,
        certification_id: String,
    ) -> Result<(), RegistryError> {
        producer_addr.require_auth();

        let key = (symbol_short!("prod"), producer_addr.clone());
        if env.storage().persistent().has(&key) {
            return Err(RegistryError::ProducerAlreadyExists);
        }

        let producer = Producer {
            address: producer_addr.clone(),
            name: name.clone(),
            location: location.clone(),
            energy_types,
            capacity_kw,
            certification_id,
            status: ProducerStatus::Pending,
            registered_at: env.ledger().timestamp(),
            total_mwh_issued: 0,
            total_mwh_retired: 0,
        };

        env.storage().persistent().set(&key, &producer);
        env.storage().persistent().extend_ttl(&key, 100_000, 100_000);

        // Update producer list
        let list_key = symbol_short!("prod_lst");
        let mut list: Vec<Address> = env
            .storage()
            .persistent()
            .get(&list_key)
            .unwrap_or_else(|| Vec::new(&env));
        list.push_back(producer_addr.clone());
        env.storage().persistent().set(&list_key, &list);

        // Increment counter
        let count: u32 = env.storage().instance().get(&symbol_short!("prod_cnt")).unwrap_or(0u32);
        env.storage().instance().set(&symbol_short!("prod_cnt"), &(count + 1));

        env.events().publish(
            (symbol_short!("prod_reg"), producer_addr),
            (name, location),
        );
        Ok(())
    }

    pub fn approve_producer(env: Env, admin: Address, producer_addr: Address) -> Result<(), RegistryError> {
        admin.require_auth();
        Self::require_admin_internal(&env, &admin)?;

        let key = (symbol_short!("prod"), producer_addr.clone());
        let mut producer: Producer = env
            .storage()
            .persistent()
            .get(&key)
            .ok_or(RegistryError::ProducerNotFound)?;

        producer.status = ProducerStatus::Active;
        env.storage().persistent().set(&key, &producer);

        env.events().publish(
            (symbol_short!("prod_apv"), producer_addr),
            (),
        );
        Ok(())
    }

    pub fn suspend_producer(env: Env, admin: Address, producer_addr: Address) -> Result<(), RegistryError> {
        admin.require_auth();
        Self::require_admin_internal(&env, &admin)?;

        let key = (symbol_short!("prod"), producer_addr.clone());
        let mut producer: Producer = env
            .storage()
            .persistent()
            .get(&key)
            .ok_or(RegistryError::ProducerNotFound)?;

        producer.status = ProducerStatus::Suspended;
        env.storage().persistent().set(&key, &producer);

        env.events().publish(
            (symbol_short!("prod_sus"), producer_addr),
            (),
        );
        Ok(())
    }

    // ─── Called by Marketplace Contract ─────────────────────────────────

    pub fn is_producer(env: Env, addr: Address) -> bool {
        let key = (symbol_short!("prod"), addr);
        if let Some(producer) = env.storage().persistent().get::<_, Producer>(&key) {
            producer.status == ProducerStatus::Active
        } else {
            false
        }
    }

    pub fn record_retirement(
        env: Env,
        rec_id: u64,
        owner: Address,
        mwh_amount: u64,
    ) -> Result<(), RegistryError> {
        // Only marketplace contract can call this
        let marketplace: Address = env
            .storage()
            .instance()
            .get(&symbol_short!("mktplace"))
            .unwrap();
        marketplace.require_auth();

        let record = RetirementRecord {
            rec_id,
            owner: owner.clone(),
            mwh_amount,
            timestamp: env.ledger().timestamp(),
        };

        let key = symbol_short!("retires");
        let mut records: Vec<RetirementRecord> = env
            .storage()
            .persistent()
            .get(&key)
            .unwrap_or_else(|| Vec::new(&env));
        records.push_back(record);
        env.storage().persistent().set(&key, &records);
        env.storage().persistent().extend_ttl(&key, 50_000, 50_000);

        // Update total retired
        let total_key = symbol_short!("tot_ret");
        let total: u64 = env.storage().instance().get(&total_key).unwrap_or(0u64);
        env.storage().instance().set(&total_key, &(total + mwh_amount));

        env.events().publish(
            (symbol_short!("rec_ret"), rec_id),
            (owner, mwh_amount),
        );
        Ok(())
    }

    // ─── Treasury Functions ──────────────────────────────────────────────

    pub fn process_payment(
        env: Env,
        buyer: Address,
        seller: Address,
        payment_token: Address,
        total_amount: i128,
        platform_fee: i128,
    ) -> Result<(), RegistryError> {
        buyer.require_auth();

        let seller_amount = total_amount - platform_fee;
        let token_client = soroban_sdk::token::TokenClient::new(&env, &payment_token);

        // Transfer to seller
        token_client.transfer(&buyer, &seller, &seller_amount);

        // Transfer fee to treasury (this contract itself)
        let treasury_addr = env.current_contract_address();
        token_client.transfer(&buyer, &treasury_addr, &platform_fee);

        // Update volume stats
        let vol_key = symbol_short!("volume");
        let volume: i128 = env.storage().instance().get(&vol_key).unwrap_or(0i128);
        env.storage().instance().set(&vol_key, &(volume + total_amount));

        let tx_key = symbol_short!("tx_cnt");
        let tx_count: u32 = env.storage().instance().get(&tx_key).unwrap_or(0u32);
        env.storage().instance().set(&tx_key, &(tx_count + 1));

        Ok(())
    }

    pub fn withdraw_fees(env: Env, admin: Address, token: Address, amount: i128) -> Result<(), RegistryError> {
        admin.require_auth();
        Self::require_admin_internal(&env, &admin)?;

        let token_client = soroban_sdk::token::TokenClient::new(&env, &token);
        let treasury_addr = env.current_contract_address();
        token_client.transfer(&treasury_addr, &admin, &amount);

        env.events().publish(
            (symbol_short!("fee_wdrl"),),
            (admin, amount),
        );
        Ok(())
    }

    // ─── View Functions ──────────────────────────────────────────────────

    pub fn get_producer(env: Env, addr: Address) -> Option<Producer> {
        let key = (symbol_short!("prod"), addr);
        env.storage().persistent().get(&key)
    }

    pub fn get_all_producers(env: Env) -> Vec<Address> {
        let key = symbol_short!("prod_lst");
        env.storage()
            .persistent()
            .get(&key)
            .unwrap_or_else(|| Vec::new(&env))
    }

    pub fn get_retirement_records(env: Env) -> Vec<RetirementRecord> {
        let key = symbol_short!("retires");
        env.storage()
            .persistent()
            .get(&key)
            .unwrap_or_else(|| Vec::new(&env))
    }

    pub fn get_stats(env: Env) -> MarketStats {
        MarketStats {
            total_producers: env.storage().instance().get(&symbol_short!("prod_cnt")).unwrap_or(0u32),
            total_mwh_issued: 0,
            total_mwh_retired: env.storage().instance().get(&symbol_short!("tot_ret")).unwrap_or(0u64),
            total_transactions: env.storage().instance().get(&symbol_short!("tx_cnt")).unwrap_or(0u32),
            total_volume_stroops: env.storage().instance().get(&symbol_short!("volume")).unwrap_or(0i128),
        }
    }

    pub fn get_admin(env: Env) -> Address {
        env.storage().instance().get(&symbol_short!("admin")).unwrap()
    }

    // ─── Internal Helpers ────────────────────────────────────────────────

    fn require_admin_internal(env: &Env, caller: &Address) -> Result<(), RegistryError> {
        let admin: Address = env.storage().instance().get(&symbol_short!("admin")).unwrap();
        if *caller != admin {
            return Err(RegistryError::Unauthorized);
        }
        Ok(())
    }

    pub fn upgrade(env: Env, admin: Address, new_wasm_hash: soroban_sdk::BytesN<32>) -> Result<(), RegistryError> {
        admin.require_auth();
        Self::require_admin_internal(&env, &admin)?;
        env.deployer().update_current_contract_wasm(new_wasm_hash);
        Ok(())
    }
}
