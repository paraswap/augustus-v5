import { config as dotEnvConfig } from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotEnvConfig();
import "@nomiclabs/hardhat-waffle";
import "solidity-coverage";
import "hardhat-gas-reporter";
import "hardhat-contract-sizer";
import "@nomiclabs/hardhat-etherscan";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
import "hardhat-deploy";
import * as tdly from "@tenderly/hardhat-tenderly";
//tdly.setup({ automaticVerifications: false });

import "./tasks/accounts";
import "./tasks/produce_activate_router_proposal";
import "./tasks/verify_tenderly";
import "./tasks/deploy_verify_tenderly";

import { HardhatUserConfig } from "hardhat/config";
import { NetworkUserConfig } from "hardhat/types";

const chainIds = {
  goerli: 5,
  hardhat: 31337,
  kovan: 42,
  mainnet: 1,
  rinkeby: 4,
  ropsten: 3,
  avalanche: 43114,
  bsc: 56,
  bsctestnet: 97,
  polygon: 137,
  polygonZkEvm: 1101,
  mumbai: 80001,
  fantom: 250,
  arbitrum: 42161,
  optimism: 10,
  base: 8453,
};

// Ensure that we have all the environment variables we need.
const mnemonic: string | undefined = process.env.MNEMONIC;
if (!mnemonic) {
  throw new Error("Please set your MNEMONIC in a .env file");
}

const alchemyApiKey: string | undefined = process.env.ALCHEMY_API_KEY;
if (!alchemyApiKey) {
  throw new Error("Please set your ALCHEMY_API_KEY in a .env file");
}

function getChainConfig(
  network: keyof typeof chainIds,
  url: string,
  gasPrice: number | "auto" = "auto",
): NetworkUserConfig {
  return {
    accounts: process.env.PK?.split(","),
    chainId: chainIds[network],
    url,
    gasPrice,
    deploy: ["deploy", `deploy_${network}`],
  };
}

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  gasReporter: {
    currency: "USD",
    enabled: process.env.REPORT_GAS ? true : false,
    excludeContracts: [],
    src: "./contracts",
    outputFile: "gas-report.txt",
  },
  namedAccounts: {
    deployer: 0,
    main: 1,
    maker: 2,
  },
  networks: {
    hardhat: {
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${alchemyApiKey}`,
        blockNumber: 16519700,
      },
      deploy: ["deploy", "deploy_mainnet"],
      // loggingEnabled: true,
      accounts: {
        count: 10,
        mnemonic,
        path: "m/44'/60'/0'/0",
      },
      chainId: chainIds.hardhat,
    },
    local: {
      url: "http://127.0.0.1:8545",
    },
    tenderly: {
      url: `https://rpc.tenderly.co/fork/${process.env.TENDERLY_FORK_ID}`,
    },
    ropsten: getChainConfig("ropsten", "https://ropsten.infura.io/v3/<your_token>", 3000000000),
    rinkeby: getChainConfig("rinkeby", "https://rinkeby.infura.io/v3/<your_token>"),
    mainnet: getChainConfig("mainnet", "https://mainnet.infura.io/v3/<your_token>", 56000000000),
    bscTestnet: getChainConfig("bsctestnet", "https://data-seed-prebsc-1-s1.binance.org:8545", 20000000000),
    bsc: getChainConfig("bsc", "https://bsc-dataseed1.defibit.io/", 3000000000),
    polygonTestnet: getChainConfig("mumbai", "https://rpc-mumbai.maticvigil.com", 20000000000),
    polygon: getChainConfig("polygon", "https://polygon-rpc.com/", 201000000000),
    polygonZkEvm: getChainConfig("polygonZkEvm", "https://zkevm-rpc.com", 10 * 1e9),
    avalanche: getChainConfig("avalanche", "https://api.avax.network/ext/bc/C/rpc", 37000000000),
    fantom: getChainConfig("fantom", "https://rpc.ftm.tools/", 55000000000),
    arbitrum: getChainConfig("arbitrum", "https://arb1.arbitrum.io/rpc", 100000000),
    optimism: getChainConfig("optimism", "https://rpc.ankr.com/optimism", 100000000),
    base: getChainConfig("base", "https://mainnet.base.org", 113305745),
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  },
  solidity: {
    version: "0.7.5",
    settings: {
      metadata: {
        bytecodeHash: "none",
      },
      // Disable the optimizer when debugging
      // https://hardhat.org/hardhat-network/#solidity-optimizer-support
      optimizer: {
        enabled: true,
        runs: 1000000,
      },
    },
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: false,
    disambiguatePaths: false,
  },
  tenderly: {
    username: process.env.TENDERLY_USERNAME as string,
    project: process.env.TENDERLY_PROJECT as string,
    privateVerification: false,
  },
  typechain: {
    outDir: "src/types",
    target: "ethers-v5",
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY as string,
      ropsten: process.env.ETHERSCAN_API_KEY as string,
      bsc: process.env.BSCSCAN_API_KEY as string,
      polygon: process.env.POLYGONSCAN_API_KEY as string,
      polygonZkEvm: process.env.POLYGON_ZKEVEM_ETHERESCAN_API_KEY as string,
      base: process.env.BASESCAN_API_KEY as string,
      opera: process.env.FTMSCAN_API_KEY as string,
      avalanche: process.env.SNOWTRACE_API_KEY as string,
      arbitrumOne: process.env.ARBISCAN_API_KEY as string,
      optimisticEthereum: process.env.OPTIMISM_API_KEY as string,
    },
    customChains: [
      {
        chainId: 1101,
        network: "polygonZkEvm",
        urls: {
          apiURL: "https://api-zkevm.polygonscan.com/api",
          browserURL: "https://zkevm.polygonscan.com",
        },
      },
      {
        chainId: 8453,
        network: "base",
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org/",
        },
      },
    ],
  },
};

export default config;
