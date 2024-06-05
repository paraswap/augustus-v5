import hre, { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getConfig } from "../config";
import { waitforme } from "../helpers/utils";
import { augustusFake } from "../src/augustus-fake";
import { augustusWrapper } from "../src/augustus-wrapper";

const SKIP_ADMIN_TX = process.env.SKIP_ADMIN_TX === "true";
const func: DeployFunction = async ({ getNamedAccounts, deployments, getChainId }: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const artifact = await deployments.getArtifact("Adapter02");
  const augustus = await deployments.get("AugustusSwapper");
  const augustusArtifact = await deployments.getArtifact("AugustusSwapper");
  const augustusInstance = await ethers.getContractAt(augustusArtifact.abi, augustus.address);
  const augustusAdmin = SKIP_ADMIN_TX ? augustusFake : augustusWrapper(augustusInstance);
  const chainId = await getChainId();
  const config = getConfig(chainId);

  const networkName = hre.network.name;

  const data = {
    _bancorAffiliateAccount: config.BANCOR_AFFILIATE_ACCOUNT,
    _bancorAffiliateCode: config.BANCOR_AFFILIATE_CODE,
    _ceth: config.CETH_ADDRESS,
    _dodoErc20ApproveProxy: config.DODO_ERC_20_PROXY,
    _dodSwapLimitOverhead: config.DODO_SWAP_LIMIT_OVERHEAD,
    _kyberFeeWallet: config.KYBER_FEE_WALLET,
    _kyberPlatformFeeBps: config.KYBER_PLATFORM_FEE_BPS,
    _shellSwapLimitOverhead: config.SHELL_SWAP_LIMIT,
    _weth: config.WETH,
  };

  const result = await deploy("Adapter02", {
    from: deployer,
    contract: {
      abi: artifact.abi,
      bytecode: artifact.bytecode,
      deployedBytecode: artifact.deployedBytecode,
    },
    args: [data],
    log: true,
    skipIfAlreadyDeployed: true,
  });

  if (result.newlyDeployed) {
    const adapter02 = await deployments.get("Adapter02");
    const role = await augustusInstance.WHITELISTED_ROLE();
    const tx = await augustusAdmin.grantRole(role, adapter02.address);
    await tx.wait();

    if (networkName === "tenderly") {
      await hre.tenderly.verify({
        name: "Adapter02",
        address: adapter02.address,
      });
    } else if (!["31337"].includes(chainId)) {
      await waitforme(20000);
      await hre.run("verify:verify", {
        address: adapter02.address,
        constructorArguments: [data],
      });
    }
  }
};
export default func;
func.tags = ["Adapter02"];
