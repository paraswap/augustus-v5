# Paraswap-SmartContracts

This repository contains all Paraswap smart contracts

## Usage

### Pre Requisites

Before running any command, you need to create a .env file and set a BIP-39 compatible mnemonic as an environment variable. Follow the example in .env.example. If you don't already have a mnemonic, use this [website](https://iancoleman.io/bip39/) to generate one.

Clone Paraswap-SmartContracts

```sh
git clone https://github.com/paraswap/paraswap-contracts.git
cd paraswap-contracts
yarn
```

## Compile and Deploy

### Compile all contracts to obtain ABI and bytecode:

```bash
yarn compile
```

### Migrate all contracts required for the basic framework onto network associated with RPC provider:

```bash
yarn deploy
```

## Network Artifacts

## Testing

### Run all tests (requires Node version >=8 for `async/await`, and will automatically run TestRPC in the background):

```bash
yarn test
```

## Test Coverage

### Get test coverage stats(requires Node version >=8 for `async/await`, and will automatically run TestRPC in the background):

```bash
yarn coverage
```

## Deploy in Tenderly

I created new task, so we can deploy any contract and verify it for certain fork in order to test it. In order to use it, set appropriate envs and run:

```
npx hardhat deploy_verify_tenderly --network tenderly
```
