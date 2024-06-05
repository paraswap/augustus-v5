import { config as dotEnvConfig } from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotEnvConfig();
import { readFileSync } from "fs";
import { task } from "hardhat/config";

// It is not working for some reason
// Don't have enough time to debug it, but I think it is something small
task("verify_tenderly", "Verify arbitrary contract on Tenderly", async (_, hre) => {
  const contractAddress = process.env.TENDERLY_VERIFY_CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error("Missing Tenderly verify contract address");
  }
  const contractName = process.env.TENDERLY_VERIFY_CONTRACT_NAME;
  if (!contractName) {
    throw new Error("Missing Tenderly verify contract name");
  }
  const contractPath = process.env.TENDERLY_VERIFY_CONTRACT_PATH + `/${contractName}.sol`;
  if (!contractPath) {
    throw new Error("Missing Tenderly verify contract path");
  }

  const tenderlyUsername = process.env.TENDERLY_USERNAME;
  const tenderlyProject = process.env.TENDERLY_PROJECT;
  const tenderlyForkId = process.env.TENDERLY_FORK_ID;

  if (!tenderlyUsername || !tenderlyProject || !tenderlyForkId) {
    throw new Error("Missing Tenderly username, project or fork id");
  }

  console.log(hre.network.config);

  await hre.tenderly.verifyForkAPI(
    {
      contracts: [
        {
          contractName: contractName,
          source: readFileSync(contractPath, "utf-8").toString(),
          sourcePath: contractPath,
          networks: {
            [tenderlyForkId]: {
              address: contractAddress,
              links: {},
            },
          },
        },
        {
          contractName: "console",
          source: readFileSync("node_modules/hardhat/console.sol", "utf-8").toString(),
          sourcePath: "hardhat/console.sol",
          networks: {},
          compiler: {
            name: "solc",
            version: "0.7.5",
          },
        },
      ],
      config: {
        compiler_version: "0.7.5",
        optimizations_used: true,
        optimizations_count: 1000000,
        evm_version: "default",
      },
      root: "",
    },
    tenderlyProject,
    tenderlyUsername,
    tenderlyForkId,
  );
});
