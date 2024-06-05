import hre from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { waitforme } from "../helpers/utils";

const func: DeployFunction = async ({ getNamedAccounts, deployments, getChainId }: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const artifact = await deployments.getArtifact("RamsesV2StateMulticall");
  const chainId = await getChainId();
  const networkName = hre.network.name;
  const args: [] = [];

  const result = await deploy("RamsesV2StateMulticall", {
    from: deployer,
    contract: {
      abi: artifact.abi,
      bytecode: artifact.bytecode,
      deployedBytecode: artifact.deployedBytecode,
    },
    args,
    log: true,
    skipIfAlreadyDeployed: true,
  });

  if (result.newlyDeployed) {
    const multicall = await deployments.get("RamsesV2StateMulticall");

    if (networkName === "tenderly") {
      await hre.tenderly.verify({
        name: "RamsesV2StateMulticall",
        address: multicall.address,
      });
    } else if (!["31337"].includes(chainId)) {
      await waitforme(20000);

      await hre.run("verify:verify", {
        address: multicall.address,
        constructorArguments: args,
      });
    }
  }
};
export default func;
func.tags = ["RamsesV2StateMulticall"];
