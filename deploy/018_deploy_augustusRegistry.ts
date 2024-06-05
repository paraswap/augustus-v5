import hre from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { waitforme } from "../helpers/utils";

const name = "AugustusRegistry";

const func: DeployFunction = async ({ deployments, getNamedAccounts, getChainId }: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const artifact = await deployments.getArtifact(name);
  const chainId = await getChainId();
  const networkName = hre.network.name;

  const result = await deploy(name, {
    from: deployer,
    contract: {
      abi: artifact.abi,
      bytecode: artifact.bytecode,
      deployedBytecode: artifact.deployedBytecode,
    },
    args: [],
    log: true,
    skipIfAlreadyDeployed: true,
  });

  if (result.newlyDeployed) {
    const contract = await deployments.get(name);

    if (networkName === "tenderly") {
      await hre.tenderly.verify({
        name,
        address: contract.address,
      });
    } else if (!["31337"].includes(chainId)) {
      await waitforme(20000);

      await  hre.run("verify:verify", {
        address: contract.address,
        constructorArguments: [],
      });
    }
  }
};

export default func;

func.tags = [name];
