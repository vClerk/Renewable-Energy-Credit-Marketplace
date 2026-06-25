# REC Marketplace Soroban Deployment Script
# Usage: .\deploy.ps1 -network [local|testnet]

param (
    [Parameter(Mandatory=$false)]
    [ValidateSet("local", "testnet")]
    [string]$network = "testnet"
)

$ErrorActionPreference = "Stop"

# Configuration
$SOURCE_ACCOUNT = "admin"
$RPC_URL = if ($network -eq "testnet") { "https://soroban-testnet.stellar.org" } else { "http://localhost:8000" }
$NETWORK_PASSPHRASE = if ($network -eq "testnet") { "Test SDF Network ; September 2015" } else { "Standalone Network ; CC0" }

Write-Host "--- Deploying REC Marketplace to $network ---" -ForegroundColor Cyan

# 1. Build Contracts
Write-Host "Building contracts..." -ForegroundColor Yellow
cargo build --target wasm32-unknown-unknown --release

# 2. Install WASM
Write-Host "Installing WASM binaries..." -ForegroundColor Yellow

$MARKETPLACE_WASM_HASH = (stellar contract install --network $network --source $SOURCE_ACCOUNT --wasm .\target\wasm32-unknown-unknown\release\rec_marketplace.wasm)
Write-Host "Marketplace WASM Hash: $MARKETPLACE_WASM_HASH" -ForegroundColor Green

$REGISTRY_WASM_HASH = (stellar contract install --network $network --source $SOURCE_ACCOUNT --wasm .\target\wasm32-unknown-unknown\release\rec_registry.wasm)
Write-Host "Registry WASM Hash: $REGISTRY_WASM_HASH" -ForegroundColor Green

# 3. Deploy Contracts
Write-Host "Deploying contract instances..." -ForegroundColor Yellow

$MARKETPLACE_ID = (stellar contract deploy --network $network --source $SOURCE_ACCOUNT --wasm-hash $MARKETPLACE_WASM_HASH)
Write-Host "Marketplace Contract ID: $MARKETPLACE_ID" -ForegroundColor Green

$REGISTRY_ID = (stellar contract deploy --network $network --source $SOURCE_ACCOUNT --wasm-hash $REGISTRY_WASM_HASH)
Write-Host "Registry Contract ID: $REGISTRY_ID" -ForegroundColor Green

# 4. Initialize Contracts
Write-Host "Initializing contracts..." -ForegroundColor Yellow

# Get Admin Address
$ADMIN_ADDR = (stellar keys address $SOURCE_ACCOUNT)

# Initialize Registry
Write-Host "Initializing Registry..."
stellar contract invoke --id $REGISTRY_ID --source $SOURCE_ACCOUNT --network $network -- `
    initialize --admin $ADMIN_ADDR --marketplace_contract $MARKETPLACE_ID

# Initialize Marketplace
Write-Host "Initializing Marketplace..."
stellar contract invoke --id $MARKETPLACE_ID --source $SOURCE_ACCOUNT --network $network -- `
    initialize --admin $ADMIN_ADDR --treasury_contract $REGISTRY_ID --registry_contract $REGISTRY_ID --platform_fee_bps 250

# 5. Save Deployment Metadata
Write-Host "Saving deployment metadata..." -ForegroundColor Yellow
$metadata = @{
    network = $network
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    marketplace_id = $MARKETPLACE_ID
    registry_id = $REGISTRY_ID
    admin = $ADMIN_ADDR
} | ConvertTo-Json

$metadata | Out-File -FilePath ".\deployment-metadata.json"

# 6. Update Frontend .env.local
Write-Host "Updating frontend environment..." -ForegroundColor Yellow
$envContent = Get-Content ".\.env.local"
$envContent = $envContent -replace "NEXT_PUBLIC_MARKETPLACE_CONTRACT_ID=.*", "NEXT_PUBLIC_MARKETPLACE_CONTRACT_ID=$MARKETPLACE_ID"
$envContent = $envContent -replace "NEXT_PUBLIC_REGISTRY_CONTRACT_ID=.*", "NEXT_PUBLIC_REGISTRY_CONTRACT_ID=$REGISTRY_ID"
$envContent | Out-File -FilePath ".\.env.local" -Encoding utf8

Write-Host "Deployment Complete! 🚀" -ForegroundColor Green
Write-Host "Marketplace ID: $MARKETPLACE_ID"
Write-Host "Registry ID: $REGISTRY_ID"
