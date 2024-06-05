import hre from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { waitforme } from "../helpers/utils";
import { getConfig } from "../config";

const func: DeployFunction = async ({ getNamedAccounts, deployments, getChainId }: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const artifact = await deployments.getArtifact("VelodromeSlipstreamRouter");
  const chainId = await getChainId();
  const config = getConfig(chainId);
  const networkName = hre.network.name;

  const args = [config.VELODROME_SLIPSTREAM_FACTORY, config.WETH];

  const result = await deploy("VelodromeSlipstreamRouter", {
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
    const multicall = await deployments.get("VelodromeSlipstreamRouter");

    if (networkName === "tenderly") {
      await hre.tenderly.verify({
        name: "VelodromeSlipstreamRouter",
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
func.tags = ["VelodromeSlipstreamRouter"];
