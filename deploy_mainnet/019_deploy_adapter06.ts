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
  const artifact = await deployments.getArtifact("Adapter06");
  const augustus = await deployments.get("AugustusSwapper");
  const augustusArtifact = await deployments.getArtifact("AugustusSwapper");
  const augustusInstance = await ethers.getContractAt(augustusArtifact.abi, augustus.address);
  const augustusAdmin = SKIP_ADMIN_TX ? augustusFake : augustusWrapper(augustusInstance);
  const chainId = await getChainId();

  const networkName = hre.network.name;
  const args = undefined;

  const result = await deploy("Adapter06", {
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
    const Adapter06 = await deployments.get("Adapter06");
    const role = await augustusInstance.WHITELISTED_ROLE();
    const tx = await augustusAdmin.grantRole(role, Adapter06.address);
    await tx.wait();
    if (networkName === "tenderly") {
      await hre.tenderly.verify({
        name: "Adapter06",
        address: Adapter06.address,
      });
    } else if (!["31337"].includes(chainId)) {
      await waitforme(20000);
      await hre.run("verify:verify", {
        address: Adapter06.address,
        contract: "contracts/adapters/mainnet/Adapter06.sol:Adapter06",
        constructorArguments: args,
      });
    }
  }
};
export default func;
func.tags = ["Adapter06"];
