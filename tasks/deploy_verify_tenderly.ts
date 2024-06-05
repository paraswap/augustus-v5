import { config as dotEnvConfig } from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotEnvConfig();
import { task } from "hardhat/config";
import { getConfig } from "../config";

task("deploy_verify_tenderly", "Deploy and verify arbitrary contract on Tenderly", async (_, hre) => {
  const chainId = process.env.TENDERLY_FORK_CHAIN_ID;
  if (!chainId) {
    throw new Error("Missing Tenderly fork chain id");
  }
  const contractName = process.env.TENDERLY_VERIFY_CONTRACT_NAME;
  if (!contractName) {
    throw new Error("Missing Tenderly verify contract name");
  }

  // Comma separated list of args for contract
  const rawArgs = process.env.TENDERLY_VERIFY_CONTRACT_ARGS;
  if (!rawArgs) {
    throw new Error("Missing Tenderly verify contract args");
  }
  const config = getConfig(chainId);

  const args = rawArgs.split(",").map(key => {
    if (config[key] !== undefined) {
      return config[key];
    }
    return key;
  });

  const deployFactory = await hre.ethers.getContractFactory(contractName);
  const contract = await deployFactory.deploy(...args);

  await contract.deployed();
});
