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
  const artifact = await deployments.getArtifact("ProtectedMultiPath");
  const augustus = await deployments.get("AugustusSwapper");
  const feeClaimer = await deployments.get("FeeClaimer");
  const augustusSwapperArtifact = await deployments.getArtifact("AugustusSwapper");
  const augustusAdmin = SKIP_ADMIN_TX
    ? augustusFake
    : augustusWrapper(await ethers.getContractAt(augustusSwapperArtifact.abi, augustus.address));
  const chainId = await getChainId();
  const config = getConfig(chainId);
  const networkName = hre.network.name;
  const result = await deploy("ProtectedMultiPath", {
    from: deployer,
    contract: {
      abi: artifact.abi,
      bytecode: artifact.bytecode,
      deployedBytecode: artifact.deployedBytecode,
    },
    args: [
      config.PARTNER_SHARE_PERCENT,
      config.MAX_FEE_PERCENT,
      config.PS_REFERRAL_SHARE,
      config.PS_SLIPPAGE_SHARE,
      feeClaimer.address,
    ],
    log: true,
    skipIfAlreadyDeployed: true,
  });

  if (result.newlyDeployed) {
    const multipath = await deployments.get("ProtectedMultiPath");
    const multipathInstance = await ethers.getContractAt(artifact.abi, multipath.address);
    const role = "0x7a05a596cb0ce7fdea8a1e1ec73be300bdb35097c944ce1897202f7a13122eb2";
    let tx = await augustusAdmin.grantRole(role, multipath.address);
    await tx.wait();
    tx = await augustusAdmin.setImplementation(
      multipathInstance.interface.getSighash("protectedMultiSwap"),
      multipath.address,
    );
    await tx.wait();
    tx = await augustusAdmin.setImplementation(
      multipathInstance.interface.getSighash("protectedMegaSwap"),
      multipath.address,
    );
    await tx.wait();

    if (networkName === "tenderly") {
      await hre.tenderly.verify({
        name: "ProtectedMultiPath",
        address: multipath.address,
      });
    } else if (!["31337"].includes(chainId)) {
      await waitforme(20000);
      await hre.run("verify:verify", {
        address: multipath.address,
        constructorArguments: [
          config.PARTNER_SHARE_PERCENT,
          config.MAX_FEE_PERCENT,
          config.PS_REFERRAL_SHARE,
          config.PS_SLIPPAGE_SHARE,
          feeClaimer.address,
        ],
      });
    }
  }
};
export default func;
func.tags = ["ProtectedMultiPath"];
