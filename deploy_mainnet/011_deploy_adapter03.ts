import hre from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getConfig } from "../config";
import { waitforme } from "../helpers/utils";
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
  const artifact = await deployments.getArtifact("Adapter03");
  const augustus = await deployments.get("AugustusSwapper");
  const augustusArtifact = await deployments.getArtifact("AugustusSwapper");
  const augustusInstance = await ethers.getContractAt(augustusArtifact.abi, augustus.address);
  const augustusAdmin = SKIP_ADMIN_TX ? augustusFake : augustusWrapper(augustusInstance);
  const chainId = await getChainId();
  const config = getConfig(chainId);

  const networkName = hre.network.name;
  const args = [
    config.AAVEE_AFFILIATE_CODE,
    config.AAVEE_SPENDER,
    config.UNISWAPV1_FACTORY,
    config.CHAI,
    config.DAI,
    config.WETH,
    config.STETH,
    config.AAVE_V3_REF_CODE,
    config.AAVE_V3_POOL,
    config.AAVE_V3_WETH_GATEWAY,
  ];

  const result = await deploy("Adapter03", {
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
    const adapter03 = await deployments.get("Adapter03");
    const role = await augustusInstance.WHITELISTED_ROLE();
    const tx = await augustusAdmin.grantRole(role, adapter03.address);
    await tx.wait();
    if (networkName === "tenderly") {
      await hre.tenderly.verify({
        name: "Adapter03",
        address: adapter03.address,
      });
    } else if (!["31337"].includes(chainId)) {
      await waitforme(20000);
      await hre.run("verify:verify", {
        address: adapter03.address,
        constructorArguments: args,
      });
    }
  }
};
export default func;
func.tags = ["Adapter03"];
