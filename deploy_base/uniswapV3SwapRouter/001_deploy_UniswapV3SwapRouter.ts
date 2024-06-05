import hre from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { waitforme } from "../../helpers/utils";
import { getConfig } from "../../config";

const func: DeployFunction = async ({ getNamedAccounts, deployments, getChainId }: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const artifact = await deployments.getArtifact("UniswapV3Router");
  const chainId = await getChainId();
  const config = getConfig(chainId);
  const networkName = hre.network.name;
  const args = [config.UNISWAP_V3_FACTORY, config.WETH];

  const result = await deploy("UniswapV3Router", {
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
    const uniswapRouter = await deployments.get("UniswapV3Router");

    if (networkName === "tenderly") {
      await hre.tenderly.verify({
        name: "UniswapV3Router",
        address: uniswapRouter.address,
      });
    } else if (!["31337"].includes(chainId)) {
      await waitforme(20000);

      await hre.run("verify:verify", {
        address: uniswapRouter.address,
        constructorArguments: args,
      });
    }
  }
};
export default func;
func.tags = ["UniswapV3Router"];
