import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import hre from "hardhat";
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
  const artifact = await deployments.getArtifact("DirectSwap");
  const augustus = await deployments.get("AugustusSwapper");
  const feeClaimer = await deployments.get("FeeClaimer");
  const augustusArtifact = await deployments.getArtifact("AugustusSwapper");
  const augustusAdmin = SKIP_ADMIN_TX
    ? augustusFake
    : augustusWrapper(await ethers.getContractAt(augustusArtifact.abi, augustus.address));
  const chainId = await getChainId();
  const config = getConfig(chainId);
  const networkName = hre.network.name;
  let weth;
  switch (chainId) {
    case "137":
      weth = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";
      break;
    case "56":
      weth = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
      break;
    case "43114":
      weth = "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7";
      break;
    case "250":
      weth = "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83";
      break;
    default:
      weth = config.WETH;
  }
  const result = await deploy("DirectSwap", {
    from: deployer,
    contract: {
      abi: artifact.abi,
      bytecode: artifact.bytecode,
      deployedBytecode: artifact.deployedBytecode,
    },
    args: [
      weth,
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
    const directSwap = await deployments.get("DirectSwap");
    const directSwapInstance = await ethers.getContractAt(artifact.abi, directSwap.address);
    const role = "0x7a05a596cb0ce7fdea8a1e1ec73be300bdb35097c944ce1897202f7a13122eb2";
    let tx = await augustusAdmin.grantRole(role, directSwap.address);
    await tx.wait();
    tx = await augustusAdmin.setImplementation(
      directSwapInstance.interface.getSighash("directUniV3Swap"),
      directSwap.address,
    );
    await tx.wait();
    tx = await augustusAdmin.setImplementation(
      directSwapInstance.interface.getSighash("directUniV3Buy"),
      directSwap.address,
    );
    await tx.wait();
    tx = await augustusAdmin.setImplementation(
      directSwapInstance.interface.getSighash("directCurveV1Swap"),
      directSwap.address,
    );
    await tx.wait();
    tx = await augustusAdmin.setImplementation(
      directSwapInstance.interface.getSighash("directCurveV2Swap"),
      directSwap.address,
    );
    await tx.wait();
    tx = await augustusAdmin.setImplementation(
      directSwapInstance.interface.getSighash("directBalancerV2GivenInSwap"),
      directSwap.address,
    );
    await tx.wait();
    tx = await augustusAdmin.setImplementation(
      directSwapInstance.interface.getSighash("directBalancerV2GivenOutSwap"),
      directSwap.address,
    );
    await tx.wait();

    if (networkName === "tenderly") {
      await hre.tenderly.verify({
        name: "DirectSwap",
        address: directSwap.address,
      });
    } else if (!["31337"].includes(chainId)) {
      await waitforme(20000);

      await hre.run("verify:verify", {
        address: directSwap.address,
        constructorArguments: [
          weth,
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
func.tags = ["DirectSwap"];
