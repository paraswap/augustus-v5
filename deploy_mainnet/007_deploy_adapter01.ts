import hre from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { waitforme } from "../helpers/utils";
import { getConfig } from "../config";
import { augustusFake } from "../src/augustus-fake";
import { augustusWrapper } from "../src/augustus-wrapper";

const SKIP_ADMIN_TX = process.env.SKIP_ADMIN_TX === "true";
const func: DeployFunction = async ({
  getNamedAccounts,
  deployments,
  getChainId,
  ethers,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const artifact = await deployments.getArtifact("Adapter01");
  const augustus = await deployments.get("AugustusSwapper");
  const augustusArtifact = await deployments.getArtifact("AugustusSwapper");
  const augustusInstance = await ethers.getContractAt(augustusArtifact.abi, augustus.address);
  const augustusAdmin = SKIP_ADMIN_TX
    ? augustusFake
    : augustusWrapper(await ethers.getContractAt(augustusArtifact.abi, augustus.address));
  const chainId = await getChainId();
  const config = getConfig(chainId);

  const networkName = hre.network.name;
  const args = [
    config.ZRX_ERC20_PROXY,
    config.AAVEE_AFFILIATE_CODE,
    config.AAVEE_LENDING_POOL,
    config.AAVEE_WETH_GATEWAY,
    config.WETH,
  ];

  const result = await deploy("Adapter01", {
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
    const adapter01 = await deployments.get("Adapter01");
    const role = await augustusInstance.WHITELISTED_ROLE();
    const tx = await augustusAdmin.grantRole(role, adapter01.address);
    await tx.wait();

    if (networkName === "tenderly") {
      await hre.tenderly.verify({
        name: "Adapter01",
        address: adapter01.address,
      });
    } else if (!["31337"].includes(chainId)) {
      await waitforme(20000);
      await hre.run("verify:verify", {
        address: adapter01.address,
        constructorArguments: args,
      });
    }
  }
};
export default func;
func.tags = ["Adapter01"];
