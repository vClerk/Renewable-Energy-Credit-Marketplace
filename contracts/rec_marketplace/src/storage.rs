use soroban_sdk::{symbol_short, Address, Env, Vec};
use crate::types::{RECToken, Role, Trade};

// Storage keys
const ADMIN_KEY: &str = "admin";
const TREASURY_KEY: &str = "treasury";
const REGISTRY_KEY: &str = "registry";
const FEE_KEY: &str = "fee_bps";
const INITIALIZED_KEY: &str = "init";
const REC_COUNT_KEY: &str = "rec_cnt";

pub fn is_initialized(env: &Env) -> bool {
    env.storage()
        .instance()
        .has(&soroban_sdk::Symbol::new(env, INITIALIZED_KEY))
}

pub fn set_initialized(env: &Env) {
    env.storage()
        .instance()
        .set(&soroban_sdk::Symbol::new(env, INITIALIZED_KEY), &true);
    env.storage().instance().extend_ttl(100_000, 100_000);
}

pub fn set_admin(env: &Env, admin: &Address) {
    env.storage()
        .instance()
        .set(&soroban_sdk::Symbol::new(env, ADMIN_KEY), admin);
}

pub fn get_admin(env: &Env) -> Address {
    env.storage()
        .instance()
        .get(&soroban_sdk::Symbol::new(env, ADMIN_KEY))
        .unwrap()
}

pub fn set_treasury_contract(env: &Env, addr: &Address) {
    env.storage()
        .instance()
        .set(&soroban_sdk::Symbol::new(env, TREASURY_KEY), addr);
}

pub fn get_treasury_contract(env: &Env) -> Address {
    env.storage()
        .instance()
        .get(&soroban_sdk::Symbol::new(env, TREASURY_KEY))
        .unwrap()
}

pub fn set_registry_contract(env: &Env, addr: &Address) {
    env.storage()
        .instance()
        .set(&soroban_sdk::Symbol::new(env, REGISTRY_KEY), addr);
}

pub fn get_registry_contract(env: &Env) -> Address {
    env.storage()
        .instance()
        .get(&soroban_sdk::Symbol::new(env, REGISTRY_KEY))
        .unwrap()
}

pub fn set_platform_fee_bps(env: &Env, fee: u32) {
    env.storage()
        .instance()
        .set(&soroban_sdk::Symbol::new(env, FEE_KEY), &fee);
}

pub fn get_platform_fee_bps(env: &Env) -> u32 {
    env.storage()
        .instance()
        .get(&soroban_sdk::Symbol::new(env, FEE_KEY))
        .unwrap_or(250u32)
}

pub fn next_rec_id(env: &Env) -> u64 {
    let key = soroban_sdk::Symbol::new(env, REC_COUNT_KEY);
    let current: u64 = env.storage().instance().get(&key).unwrap_or(0u64);
    let next = current + 1;
    env.storage().instance().set(&key, &next);
    next
}

pub fn get_total_recs(env: &Env) -> u64 {
    env.storage()
        .instance()
        .get(&soroban_sdk::Symbol::new(env, REC_COUNT_KEY))
        .unwrap_or(0u64)
}

pub fn save_rec(env: &Env, rec_id: u64, rec: &RECToken) {
    let key = (symbol_short!("rec"), rec_id);
    env.storage().persistent().set(&key, rec);
    env.storage().persistent().extend_ttl(&key, 50_000, 50_000);
}

pub fn get_rec(env: &Env, rec_id: u64) -> Option<RECToken> {
    let key = (symbol_short!("rec"), rec_id);
    env.storage().persistent().get(&key)
}

pub fn add_listing(env: &Env, rec_id: u64) {
    let key = symbol_short!("listings");
    let mut listings: Vec<u64> = env
        .storage()
        .persistent()
        .get(&key)
        .unwrap_or_else(|| Vec::new(env));
    listings.push_back(rec_id);
    env.storage().persistent().set(&key, &listings);
    env.storage().persistent().extend_ttl(&key, 50_000, 50_000);
}

pub fn remove_listing(env: &Env, rec_id: u64) {
    let key = symbol_short!("listings");
    let listings: Vec<u64> = env
        .storage()
        .persistent()
        .get(&key)
        .unwrap_or_else(|| Vec::new(env));
    let mut new_listings: Vec<u64> = Vec::new(env);
    for id in listings.iter() {
        if id != rec_id {
            new_listings.push_back(id);
        }
    }
    env.storage().persistent().set(&key, &new_listings);
}

pub fn get_listings(env: &Env) -> Vec<u64> {
    let key = symbol_short!("listings");
    env.storage()
        .persistent()
        .get(&key)
        .unwrap_or_else(|| Vec::new(env))
}

pub fn add_user_rec(env: &Env, user: &Address, rec_id: u64) {
    let key = (symbol_short!("usr_recs"), user.clone());
    let mut recs: Vec<u64> = env
        .storage()
        .persistent()
        .get(&key)
        .unwrap_or_else(|| Vec::new(env));
    recs.push_back(rec_id);
    env.storage().persistent().set(&key, &recs);
    env.storage().persistent().extend_ttl(&key, 50_000, 50_000);
}

pub fn remove_user_rec(env: &Env, user: &Address, rec_id: u64) {
    let key = (symbol_short!("usr_recs"), user.clone());
    let recs: Vec<u64> = env
        .storage()
        .persistent()
        .get(&key)
        .unwrap_or_else(|| Vec::new(env));
    let mut new_recs: Vec<u64> = Vec::new(env);
    for id in recs.iter() {
        if id != rec_id {
            new_recs.push_back(id);
        }
    }
    env.storage().persistent().set(&key, &new_recs);
}

pub fn get_user_recs(env: &Env, user: &Address) -> Vec<u64> {
    let key = (symbol_short!("usr_recs"), user.clone());
    env.storage()
        .persistent()
        .get(&key)
        .unwrap_or_else(|| Vec::new(env))
}

pub fn set_role(env: &Env, account: &Address, role: Role) {
    let key = (symbol_short!("role"), account.clone());
    env.storage().persistent().set(&key, &role);
    env.storage().persistent().extend_ttl(&key, 100_000, 100_000);
}

pub fn get_role(env: &Env, account: &Address) -> Option<Role> {
    let key = (symbol_short!("role"), account.clone());
    env.storage().persistent().get(&key)
}

pub fn remove_role(env: &Env, account: &Address) {
    let key = (symbol_short!("role"), account.clone());
    env.storage().persistent().remove(&key);
}

pub fn save_trade(env: &Env, trade: &Trade) {
    let key = symbol_short!("trades");
    let mut trades: Vec<Trade> = env
        .storage()
        .persistent()
        .get(&key)
        .unwrap_or_else(|| Vec::new(env));
    trades.push_back(trade.clone());
    env.storage().persistent().set(&key, &trades);
    env.storage().persistent().extend_ttl(&key, 50_000, 50_000);
}

pub fn get_trades(env: &Env) -> Vec<Trade> {
    let key = symbol_short!("trades");
    env.storage()
        .persistent()
        .get(&key)
        .unwrap_or_else(|| Vec::new(env))
}
