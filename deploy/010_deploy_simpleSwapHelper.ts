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
  const artifact = await deployments.getArtifact("SimpleSwapHelper");
  const augustus = await deployments.get("AugustusSwapper");
  const augustusArtifact = await deployments.getArtifact("AugustusSwapper");
  const augustusAdmin = SKIP_ADMIN_TX
    ? augustusFake
    : augustusWrapper(await ethers.getContractAt(augustusArtifact.abi, augustus.address));
  const chainId = await getChainId();
  const networkName = hre.network.name;
  const result = await deploy("SimpleSwapHelper", {
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
    const simpleSwapHelper = await deployments.get("SimpleSwapHelper");
    const simpleSwapHelperInstance = await ethers.getContractAt(artifact.abi, simpleSwapHelper.address);
    const role = "0x7a05a596cb0ce7fdea8a1e1ec73be300bdb35097c944ce1897202f7a13122eb2"; // Assigning router role to the helpers as well
    let tx = await augustusAdmin.grantRole(role, simpleSwapHelper.address);
    await tx.wait();
    tx = await augustusAdmin.setImplementation(
      simpleSwapHelperInstance.interface.getSighash("approve"),
      simpleSwapHelper.address,
    );
    await tx.wait();
    tx = await augustusAdmin.setImplementation(
      simpleSwapHelperInstance.interface.getSighash("withdrawAllWETH"),
      simpleSwapHelper.address,
    );
    await tx.wait();

    if (networkName === "tenderly") {
      await hre.tenderly.verify({
        name: "SimpleSwapHelper",
        address: simpleSwapHelper.address,
      });
    } else if (!["31337"].includes(chainId)) {
      await waitforme(20000);

      await hre.run("verify:verify", {
        address: simpleSwapHelper.address,
      });
    }
  }
};
export default func;
func.tags = ["SimpleSwapHelper"];
