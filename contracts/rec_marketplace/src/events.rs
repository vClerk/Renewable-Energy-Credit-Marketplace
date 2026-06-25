use soroban_sdk::{symbol_short, Address, Env, String};
use crate::types::{RECEnergySource, Role};

pub fn emit_initialized(
    env: &Env,
    admin: Address,
    treasury: Address,
    registry: Address,
) {
    env.events().publish(
        (symbol_short!("init"),),
        (admin, treasury, registry),
    );
}

pub fn emit_rec_issued(
    env: &Env,
    rec_id: u64,
    issuer: Address,
    energy_source: RECEnergySource,
    mwh_amount: u64,
    vintage_year: u32,
) {
    env.events().publish(
        (symbol_short!("rec_issue"), rec_id),
        (issuer, energy_source, mwh_amount, vintage_year),
    );
}

pub fn emit_rec_approved(env: &Env, rec_id: u64, validator: Address) {
    env.events().publish(
        (symbol_short!("rec_apprv"), rec_id),
        (validator,),
    );
}

pub fn emit_rec_rejected(env: &Env, rec_id: u64, validator: Address) {
    env.events().publish(
        (symbol_short!("rec_rejct"), rec_id),
        (validator,),
    );
}

pub fn emit_rec_listed(env: &Env, rec_id: u64, owner: Address, price: i128) {
    env.events().publish(
        (symbol_short!("rec_list"), rec_id),
        (owner, price),
    );
}

pub fn emit_rec_delisted(env: &Env, rec_id: u64, owner: Address) {
    env.events().publish(
        (symbol_short!("rec_dlist"), rec_id),
        (owner,),
    );
}

pub fn emit_rec_purchased(
    env: &Env,
    rec_id: u64,
    seller: Address,
    buyer: Address,
    price: i128,
    fee: i128,
) {
    env.events().publish(
        (symbol_short!("rec_buy"), rec_id),
        (seller, buyer, price, fee),
    );
}

pub fn emit_rec_retired(
    env: &Env,
    rec_id: u64,
    owner: Address,
    mwh_amount: u64,
    beneficiary: String,
    reason: String,
) {
    env.events().publish(
        (symbol_short!("rec_retir"), rec_id),
        (owner, mwh_amount, beneficiary, reason),
    );
}

pub fn emit_rec_transferred(env: &Env, rec_id: u64, from: Address, to: Address) {
    env.events().publish(
        (symbol_short!("rec_xfer"), rec_id),
        (from, to),
    );
}

pub fn emit_role_granted(env: &Env, account: Address, role: Role) {
    env.events().publish(
        (symbol_short!("role_add"),),
        (account, role),
    );
}

pub fn emit_role_revoked(env: &Env, account: Address, role: Role) {
    env.events().publish(
        (symbol_short!("role_rem"),),
        (account, role),
    );
}
