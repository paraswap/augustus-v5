import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import hre from "hardhat";
import { waitforme } from "../helpers/utils";

const func: DeployFunction = async ({ getNamedAccounts, deployments, getChainId }: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const artifact = await deployments.getArtifact("FeeClaimer");
  const augustus = await deployments.get("AugustusSwapper");
  const chainId = await getChainId();
  const networkName = hre.network.name;
  const result = await deploy("FeeClaimer", {
    from: deployer,
    contract: {
      abi: artifact.abi,
      bytecode: artifact.bytecode,
      deployedBytecode: artifact.deployedBytecode,
    },
    args: [augustus.address],
    log: true,
    skipIfAlreadyDeployed: true,
  });

  if (result.newlyDeployed) {
    const feeClaimer = await deployments.get("FeeClaimer");

    if (networkName === "tenderly") {
      await hre.tenderly.verify({
        name: "FeeClaimer",
        address: feeClaimer.address,
      });
    } else if (!["31337"].includes(chainId)) {
      await waitforme(20000);

      await hre.run("verify:verify", {
        address: feeClaimer.address,
        constructorArguments: [augustus.address],
      });
    }
  }
};
export default func;
func.tags = ["FeeClaimer"];
