use soroban_sdk::{contracttype, Address, String};

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum RECEnergySource {
    Solar,
    Wind,
    Hydro,
    Biomass,
    Geothermal,
    Ocean,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum RECStatus {
    Pending,
    Active,
    Listed,
    Retired,
    Rejected,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct RECToken {
    pub id: u64,
    pub issuer: Address,
    pub owner: Address,
    pub energy_source: RECEnergySource,
    pub mwh_amount: u64,
    pub location: String,
    pub certification_body: String,
    pub vintage_year: u32,
    pub metadata_uri: String,
    pub status: RECStatus,
    pub issued_at: u64,
    pub updated_at: u64,
    pub price: Option<i128>,
    pub retired_at: Option<u64>,
    pub retire_beneficiary: Option<String>,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct Trade {
    pub rec_id: u64,
    pub seller: Address,
    pub buyer: Address,
    pub price: i128,
    pub fee: i128,
    pub timestamp: u64,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum Role {
    Validator,
    Producer,
    Operator,
}
