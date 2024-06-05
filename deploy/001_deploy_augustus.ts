import hre, { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getConfig } from "../config";
import { waitforme } from "../helpers/utils";

const name = "AugustusSwapper";
const func: DeployFunction = async ({ deployments, getNamedAccounts, getChainId }: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const artifact = await deployments.getArtifact(name);
  const chainId = await getChainId();
  const networkName = hre.network.name;
  const config = getConfig(chainId);

  const result = await deploy(name, {
    from: deployer,
    contract: {
      abi: artifact.abi,
      bytecode: artifact.bytecode,
      deployedBytecode: artifact.deployedBytecode,
    },
    args: [config.FEE_WALLET],
    log: true,
    skipIfAlreadyDeployed: true,
  });

  if (result.newlyDeployed) {
    const augustus = await deployments.get(name);

    const contractInstance = await ethers.getContractFactory(name);

    const contract = contractInstance.attach(result.address);

    const transferProxyAddress = await contract.getTokenTransferProxy();
    if (networkName === "tenderly") {
      await Promise.all([
        hre.tenderly.verify({
          name,
          address: augustus.address,
        }),
        hre.tenderly.verify({
          name: "TokenTransferProxy",
          address: transferProxyAddress,
        }),
      ]);
    } else if (!["31337"].includes(chainId)) {
      await waitforme(20000);

      await Promise.all([
        hre.run("verify:verify", {
          address: augustus.address,
          constructorArguments: [config.FEE_WALLET],
        }),
        hre.run("verify:verify", {
          address: transferProxyAddress,
          constructorArguments: [],
        }),
      ]);
    }
  }
};
export default func;
func.tags = [name];
