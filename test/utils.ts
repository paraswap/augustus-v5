import { BigNumber, BigNumberish } from "ethers";
import hre, { ethers, network } from "hardhat";
import { ERC20 } from "../src/types";

// Source: https://github.com/Opty-Fi/defi-adapter-kit/blob/main/test/utils.ts
const setStorageAt = (address: string, slot: string, val: string) =>
  hre.network.provider.send("hardhat_setStorageAt", [address, slot, val]);

const tokenBalancesSlot = async (token: ERC20) => {
  const val: string = "0x" + "12345".padStart(64, "0");
  const account: string = ethers.constants.AddressZero;

  for (let i = 0; i < 100; i++) {
    let slot = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(["address", "uint256"], [account, i]));
    while (slot.startsWith("0x0")) slot = "0x" + slot.slice(3);

    const prev = await hre.network.provider.send("eth_getStorageAt", [account, slot, "latest"]);
    await setStorageAt(token.address, slot, val);
    const balance = await token.balanceOf(account);
    await setStorageAt(token.address, slot, prev);
    if (balance.eq(ethers.BigNumber.from(val))) {
      return { index: i, isVyper: false };
    }
  }

  for (let i = 0; i < 100; i++) {
    let slot = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(["uint256", "address"], [i, account]));
    while (slot.startsWith("0x0")) slot = "0x" + slot.slice(3);

    const prev = await hre.network.provider.send("eth_getStorageAt", [account, slot, "latest"]);
    await setStorageAt(token.address, slot, val);
    const balance = await token.balanceOf(account);
    await setStorageAt(token.address, slot, prev);
    if (balance.eq(ethers.BigNumber.from(val))) {
      return { index: i, isVyper: true };
    }
  }
  throw "balances slot not found!";
};

export async function setTokenBalanceInStorage(token: ERC20, account: string, amount: string) {
  const balancesSlot = await tokenBalancesSlot(token);
  if (balancesSlot.isVyper) {
    return setStorageAt(
      token.address,
      ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(["uint256", "address"], [balancesSlot.index, account]),
      ),
      "0x" +
        ethers.utils
          .parseUnits(amount, await token.decimals())
          .toHexString()
          .slice(2)
          .padStart(64, "0"),
    );
  } else {
    return setStorageAt(
      token.address,
      ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(["address", "uint256"], [account, balancesSlot.index]),
      ),
      "0x" +
        ethers.utils
          .parseUnits(amount, await token.decimals())
          .toHexString()
          .slice(2)
          .padStart(64, "0"),
    );
  }
}

export function to_10powNumber_BN(decimals: BigNumberish): BigNumberish {
  return BigNumber.from(10).pow(decimals);
}

export async function resetFork(blocknumber: number) {
  await network.provider.request({
    method: "hardhat_reset",
    params: [
      {
        forking: {
          jsonRpcUrl: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
          blockNumber: blocknumber,
        },
      },
    ],
  });
}

export const getTxCost = async (txHash: string): Promise<BigNumber> => {
  const receipt = await ethers.provider.getTransactionReceipt(txHash);
  return receipt.effectiveGasPrice.mul(receipt.gasUsed);
};
