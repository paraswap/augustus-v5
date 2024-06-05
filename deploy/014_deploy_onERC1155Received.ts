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
  const artifact = await deployments.getArtifact("OnERC1155Received");
  const augustus = await deployments.get("AugustusSwapper");
  const augustusArtifact = await deployments.getArtifact("AugustusSwapper");
  const augustusAdmin = SKIP_ADMIN_TX
    ? augustusFake
    : augustusWrapper(await ethers.getContractAt(augustusArtifact.abi, augustus.address));
  const chainId = await getChainId();
  const networkName = hre.network.name;
  const result = await deploy("OnERC1155Received", {
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
    const erc1155Receiver = await deployments.get("OnERC1155Received");
    const erc1155ReceiverInstance = await ethers.getContractAt(artifact.abi, erc1155Receiver.address);
    const role = "0x7a05a596cb0ce7fdea8a1e1ec73be300bdb35097c944ce1897202f7a13122eb2"; // Assigning router role to the helpers as well
    let tx = await augustusAdmin.grantRole(role, erc1155Receiver.address);
    await tx.wait();
    tx = await augustusAdmin.setImplementation(
      erc1155ReceiverInstance.interface.getSighash("onERC1155Received"),
      erc1155Receiver.address,
    );
    await tx.wait();
    tx = await augustusAdmin.setImplementation(
      erc1155ReceiverInstance.interface.getSighash("onERC1155BatchReceived"),
      erc1155Receiver.address,
    );
    await tx.wait();

    if (networkName === "tenderly") {
      await hre.tenderly.verify({
        name: "OnERC1155Received",
        address: erc1155Receiver.address,
      });
    } else if (!["31337"].includes(chainId)) {
      await waitforme(20000);

      await hre.run("verify:verify", {
        address: erc1155Receiver.address,
      });
    }
  }
};
export default func;
func.tags = ["OnERC1155Received"];
