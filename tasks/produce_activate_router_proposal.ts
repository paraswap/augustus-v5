import { task } from "hardhat/config";
import { TransactionRequest } from "@ethersproject/providers";
import { writeFile } from "fs/promises";
import path from "path";

type Transaction = TransactionRequest;

export interface SafeProposalConfig {
  version: string;
  chainId: string;
  createdAt: number;
  meta: Meta;
  transactions: Transaction[];
}

export interface Meta {
  name: string;
  txBuilderVersion: string;
  createdFromSafeAddress: string;
  checksum: string;
}

export const generateSafeProposal = (safeAddress: string, chainId: number, txs: Transaction[]): SafeProposalConfig => {
  return {
    version: "1.0",
    chainId: String(chainId),
    createdAt: Date.now(),
    meta: {
      name: "Transactions Batch",
      txBuilderVersion: "1.14.1",
      createdFromSafeAddress: safeAddress,
      checksum: "",
    },
    transactions: txs.map(tx => {
      const { to, value, data } = tx;
      return {
        to,
        data,
        value: value || "0",
      };
    }),
  };
};

const ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
const ROUTER_ROLE = "0x7a05a596cb0ce7fdea8a1e1ec73be300bdb35097c944ce1897202f7a13122eb2";

const contractsToRoutingMethods = {
  DirectSwap: [
    "directUniV3Swap",
    "directUniV3Buy",

    "directCurveV1Swap",
    "directCurveV2Swap",

    "directBalancerV2GivenInSwap",
    "directBalancerV2GivenOutSwap",
  ],
  SimpleSwap: ["simpleSwap", "simpleBuy"],
  ProtectedSimpleSwap: ["protectedSimpleSwap", "protectedSimpleBuy"],
  SimpleSwapNFT: ["simpleBuyNFT"],
  MultiPath: ["multiSwap", "megaSwap", "buy"],
  ProtectedMultiPath: ["protectedMultiSwap", "protectedMegaSwap"],
};

task("produce_activate_router_proposal", "Produce bulk setImplementation proposals", async (_taskArgs, hre) => {
  const chainId = await hre.getChainId();
  const augustusArtifact = await hre.deployments.getArtifact("AugustusSwapper");
  const augustusDeployment = await hre.deployments.get("AugustusSwapper");
  const augustusAddress = augustusDeployment.address;
  const augustusInstance = await hre.ethers.getContractAt(augustusArtifact.abi, augustusAddress);
  const augustusAdminAccount = await augustusInstance.callStatic.getRoleMember(ADMIN_ROLE, 0);

  const txs: TransactionRequest[] = [];

  for (const [contract, contractMethods] of Object.entries(contractsToRoutingMethods)) {
    const contractArtificat = await hre.deployments.getArtifact(contract);
    const contractDeployment = await hre.deployments.get(contract);
    const contractInstance = await hre.ethers.getContractAt(contractArtificat.abi, contractDeployment.address);

    txs.push({
      from: augustusAdminAccount,
      to: augustusAddress,
      data: augustusInstance.interface.encodeFunctionData("grantRole", [ROUTER_ROLE, contractDeployment.address]),
    });

    for (const contractMethod of contractMethods) {
      const contractMethodSigHash = contractInstance.interface.getSighash(contractMethod);
      txs.push({
        from: augustusAdminAccount,
        to: augustusAddress,
        data: augustusInstance.interface.encodeFunctionData("setImplementation", [
          contractMethodSigHash,
          contractDeployment.address,
        ]),
      });
    }
  }

  const proposals = generateSafeProposal(augustusAdminAccount, +chainId, txs);

  await writeFile(path.join(__dirname, `activate-router-chain-${chainId}.json`), JSON.stringify(proposals));
});
