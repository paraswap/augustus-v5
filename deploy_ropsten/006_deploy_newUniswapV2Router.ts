import hre from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
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
  const artifact = await deployments.getArtifact("NewUniswapV2Router");
  const augustus = await deployments.get("AugustusSwapper");
  const augustusArtifact = await deployments.getArtifact("AugustusSwapper");
  const augustusAdmin = SKIP_ADMIN_TX
    ? augustusFake
    : augustusWrapper(await ethers.getContractAt(augustusArtifact.abi, augustus.address));
  const chainId = await getChainId();
  const networkName = hre.network.name;
  const result = await deploy("NewUniswapV2Router", {
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
    const uniswap = await deployments.get("NewUniswapV2Router");
    const uniswapInstance = await ethers.getContractAt(artifact.abi, uniswap.address);
    const role = "0x7a05a596cb0ce7fdea8a1e1ec73be300bdb35097c944ce1897202f7a13122eb2";
    let tx = await augustusAdmin.grantRole(role, uniswap.address);
    await tx.wait();
    tx = await augustusAdmin.setImplementation(
      uniswapInstance.interface.getSighash("swapOnUniswapV2Fork"),
      uniswap.address,
    );
    await tx.wait();
    tx = await augustusAdmin.setImplementation(
      uniswapInstance.interface.getSighash("buyOnUniswapV2Fork"),
      uniswap.address,
    );
    await tx.wait();
    tx = await augustusAdmin.setImplementation(
      uniswapInstance.interface.getSighash("swapOnUniswapV2ForkWithPermit"),
      uniswap.address,
    );
    await tx.wait();
    tx = await augustusAdmin.setImplementation(
      uniswapInstance.interface.getSighash("buyOnUniswapV2ForkWithPermit"),
      uniswap.address,
    );
    await tx.wait();

    if (networkName === "tenderly") {
      await hre.tenderly.verify({
        name: "NewUniswapV2Router",
        address: uniswap.address,
      });
    } else if (!["31337"].includes(chainId)) {
      await waitforme(20000);
      await hre.run("verify:verify", {
        address: uniswap.address,
        constructorArguments: [],
      });
    }
  }
};
export default func;
func.tags = ["NewUniswapV2Router"];
