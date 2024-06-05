import { ethers, network } from "hardhat";
import { expect } from "chai";
import { computePoolAddress, FeeAmount } from "@uniswap/v3-sdk";
import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import Quoter from "@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json";
import ERC20 from "@openzeppelin/contracts/build/contracts/ERC20.json";
import { Network } from "hardhat/types";
import { BigNumber, Contract } from "ethers";
import { Token } from "@uniswap/sdk-core";
import { getBalancerContractAbi } from "@balancer-labs/v2-deployments";

import {
  POOL_FACTORY_CONTRACT_ADDRESS,
  QUOTER_CONTRACT_ADDRESS,
  ETH,
  CURVE_POOLS,
  BALV2_VAULT,
  UNIV3_ROUTER,
  GENERIC_ZAP_ADDRESSES,
} from "./directSwapsConstants";

export const swapV3 = async (
  augustusSwapper: Contract,
  directSwap: Contract,
  deployer: string,
  trader: string,
  fromToken: Token,
  toToken: Token,
  amount: BigNumber,
  fromEth: boolean,
  toEth: boolean,
  direction: string,
  feePercent: number = 0,
  feePercentPacked: number | BigNumber = 0,
  feeTake: string = "",
  simulatePS: boolean = false,
) => {
  const currentPoolAddress = computePoolAddress({
    factoryAddress: POOL_FACTORY_CONTRACT_ADDRESS,
    tokenA: fromToken,
    tokenB: toToken,
    fee: FeeAmount.MEDIUM,
  });

  let fromContract = await ethers.getContractAt("IERC20", fromToken.address);
  let toContract = await ethers.getContractAt("IERC20", toToken.address);

  const poolContract = await ethers.getContractAt(IUniswapV3PoolABI.abi, currentPoolAddress);

  const fee = await poolContract.fee();

  const quoterContract = await ethers.getContractAt(Quoter.abi, QUOTER_CONTRACT_ADDRESS);

  let quotedAmount: any;
  let expectedAmount: any;
  let quotedAmountDeductedFromFee: any;
  let path: string = "";
  if (direction === "sell") {
    quotedAmount = await quoterContract.callStatic.quoteExactInputSingle(
      fromToken.address,
      toToken.address,
      fee,
      amount,
      0,
    );
    expectedAmount = quotedAmount.mul(99).div(100);
    if (feeTake === "from") {
      let newAmount = amount.sub(amount.mul(feePercent).div(10000));
      quotedAmountDeductedFromFee = await quoterContract.callStatic.quoteExactInputSingle(
        fromToken.address,
        toToken.address,
        fee,
        newAmount,
        0,
      );
      expectedAmount = quotedAmountDeductedFromFee.mul(99).div(100);
    }
    path = ethers.utils.solidityPack(["address", "uint24", "address"], [fromToken.address, fee, toToken.address]);
  } else if (direction === "buy") {
    quotedAmount = await quoterContract.callStatic.quoteExactOutputSingle(
      fromToken.address,
      toToken.address,
      fee,
      amount,
      0,
    );
    expectedAmount = quotedAmount;
    path = ethers.utils.solidityPack(["address", "uint24", "address"], [toToken.address, fee, fromToken.address]);
  }

  // impersonate account with fromToken balance
  fromContract = await impersonate(trader, fromContract, ethers, network);

  const tokenProxyAddress = await augustusSwapper.getTokenTransferProxy();

  await fromContract.approve(tokenProxyAddress, ethers.constants.MaxUint256);

  directSwap = await impersonate(trader, directSwap, ethers, network);

  const balanceFromTraderPre = await fromContract.balanceOf(trader);
  const balanceToTraderPre = await toContract.balanceOf(trader);
  const balanceFromAugustusPre = await fromContract.balanceOf(augustusSwapper.address);
  const balanceToAugustusPre = await toContract.balanceOf(augustusSwapper.address);
  const balanceETHTraderPre = await ethers.provider.getBalance(trader);
  const balanceETHAugustusPre = await ethers.provider.getBalance(augustusSwapper.address);

  // check if we are simulating PS
  if (simulatePS) {
    if (direction === "sell") {
      quotedAmount = quotedAmount.mul(99).div(100);
    } else if (direction === "buy") {
      amount = amount.mul(99).div(100);
    }
  }

  let ethFees = BigNumber.from(0);
  let receipt;
  if (direction === "sell") {
    const tx = await directSwap.directUniV3Swap(
      {
        fromToken: fromEth ? ETH : fromToken.address,
        toToken: toEth ? ETH : toToken.address,
        exchange: UNIV3_ROUTER,
        fromAmount: amount,
        toAmount: expectedAmount,
        expectedAmount: quotedAmountDeductedFromFee ? quotedAmountDeductedFromFee : quotedAmount,
        feePercent: feePercentPacked ? feePercentPacked : feePercent,
        deadline: 9999999999,
        partner: deployer,
        isApproved: 0,
        beneficiary: ethers.constants.AddressZero,
        path: path,
        permit: "0x",
        uuid: "0x00000000000000000000000000000000",
      },
      { value: fromEth ? amount : 0 },
    );
    receipt = await tx.wait();
    ethFees = receipt.gasUsed.mul(receipt.effectiveGasPrice);
  } else if (direction === "buy") {
    const tx = await directSwap.directUniV3Buy(
      {
        fromToken: fromEth ? ETH : fromToken.address,
        toToken: toEth ? ETH : toToken.address,
        exchange: UNIV3_ROUTER,
        fromAmount: quotedAmount,
        toAmount: amount,
        expectedAmount,
        feePercent: feePercentPacked ? feePercentPacked : feePercent,
        deadline: 9999999999,
        partner: deployer,
        isApproved: 0,
        beneficiary: ethers.constants.AddressZero,
        path: path,
        permit: "0x",
        uuid: "0x00000000000000000000000000000000",
      },
      { value: fromEth ? quotedAmount : 0 },
    );
    receipt = await tx.wait();
    ethFees = receipt.gasUsed.mul(receipt.effectiveGasPrice);
  }

  const balanceFromTraderPost = await fromContract.balanceOf(trader);
  const balanceToTraderPost = await toContract.balanceOf(trader);
  const balanceFromAugustusPost = await fromContract.balanceOf(augustusSwapper.address);
  const balanceToAugustusPost = await toContract.balanceOf(augustusSwapper.address);
  const balanceETHTraderPost = await ethers.provider.getBalance(trader);
  const balanceETHAugustusPost = await ethers.provider.getBalance(augustusSwapper.address);

  if (simulatePS && feePercent === 0 && feePercentPacked === 0) {
    if (direction === "sell") {
      let swapEvent = receipt.events.find((e: any) => e.event === "SwappedDirect");
      let slippage = swapEvent.args.receivedAmount.sub(quotedAmount).div(2);
      quotedAmount = quotedAmount.add(slippage);
    } else if (direction === "buy") {
      let swapEvent = receipt.events.find((e: any) => e.event === "SwappedDirect");
      let slippage = swapEvent.args.srcAmount.sub(quotedAmount).div(2);
      quotedAmount = quotedAmount.add(slippage);
    }
  } else if (simulatePS && (feePercent > 0 || feePercentPacked === 0)) {
    if (direction === "sell" && feeTake !== "from") {
      let swapEvent = receipt.events.find((e: any) => e.event === "SwappedDirect");
      amount = swapEvent.args.srcAmount;
      quotedAmount = swapEvent.args.receivedAmount;
    } else if (direction === "buy") {
      let swapEvent = receipt.events.find((e: any) => e.event === "SwappedDirect");
      quotedAmount = swapEvent.args.srcAmount;
    }
  }

  if (!feeTake || feeTake === "to") {
    if (direction === "sell") {
      if (!toEth && !fromEth) {
        expect(balanceFromTraderPre.sub(balanceFromTraderPost)).to.equal(amount);
        expect(balanceToTraderPost.sub(balanceToTraderPre)).to.equal(
          feePercent === 0 ? quotedAmount : quotedAmount.sub(quotedAmount.mul(feePercent).div(10000)),
        );
        expect(balanceFromAugustusPre).to.equal(0);
        expect(balanceToAugustusPre).to.equal(0);
        expect(balanceFromAugustusPost).to.equal(0);
        expect(balanceToAugustusPost).to.equal(0);
      } else if (!fromEth && toEth) {
        expect(balanceFromTraderPre.sub(balanceFromTraderPost)).to.equal(amount);
        expect(balanceETHTraderPost.sub(balanceETHTraderPre).add(ethFees)).to.equal(
          feePercent === 0 ? quotedAmount : quotedAmount.sub(quotedAmount.mul(feePercent).div(10000)),
        );
        expect(balanceFromAugustusPre).to.equal(0);
        expect(balanceToAugustusPre).to.equal(0);
        expect(balanceFromAugustusPost).to.equal(0);
        expect(balanceToAugustusPost).to.equal(0);
        expect(balanceETHAugustusPre).to.equal(0);
        expect(balanceETHAugustusPost).to.equal(0);
      } else if (fromEth && !toEth) {
        expect(balanceETHTraderPre.sub(balanceETHTraderPost).sub(ethFees)).to.equal(amount);
        expect(balanceToTraderPost.sub(balanceToTraderPre)).to.equal(
          feePercent === 0 ? quotedAmount : quotedAmount.sub(quotedAmount.mul(feePercent).div(10000)),
        );
        expect(balanceFromAugustusPre).to.equal(0);
        expect(balanceToAugustusPre).to.equal(0);
        expect(balanceFromAugustusPost).to.equal(0);
        expect(balanceToAugustusPost).to.equal(0);
        expect(balanceETHAugustusPre).to.equal(0);
        expect(balanceETHAugustusPost).to.equal(0);
      }
    } else if (direction === "buy") {
      if (!toEth && !fromEth) {
        expect(balanceFromTraderPre.sub(balanceFromTraderPost)).to.equal(quotedAmount);
        expect(balanceToTraderPost.sub(balanceToTraderPre)).to.equal(
          feePercent === 0 ? amount : amount.sub(amount.mul(feePercent).div(10000)),
        );
        expect(balanceFromAugustusPre).to.equal(0);
        expect(balanceToAugustusPre).to.equal(0);
        expect(balanceFromAugustusPost).to.equal(0);
        expect(balanceToAugustusPost).to.equal(0);
      } else if (!fromEth && toEth) {
        expect(balanceFromTraderPre.sub(balanceFromTraderPost)).to.equal(quotedAmount);
        expect(balanceETHTraderPost.sub(balanceETHTraderPre).add(ethFees)).to.equal(
          feePercent === 0 ? amount : amount.sub(amount.mul(feePercent).div(10000)),
        );
        expect(balanceFromAugustusPre).to.equal(0);
        expect(balanceToAugustusPre).to.equal(0);
        expect(balanceFromAugustusPost).to.equal(0);
        expect(balanceToAugustusPost).to.equal(0);
        expect(balanceETHAugustusPre).to.equal(0);
        expect(balanceETHAugustusPost).to.equal(0);
      } else if (fromEth && !toEth) {
        expect(balanceETHTraderPre.sub(balanceETHTraderPost).sub(ethFees)).to.equal(quotedAmount);
        expect(balanceToTraderPost.sub(balanceToTraderPre)).to.equal(
          feePercent === 0 ? amount : amount.sub(amount.mul(feePercent).div(10000)),
        );
        expect(balanceFromAugustusPre).to.equal(0);
        expect(balanceToAugustusPre).to.equal(0);
        expect(balanceFromAugustusPost).to.equal(0);
        expect(balanceToAugustusPost).to.equal(0);
        expect(balanceETHAugustusPre).to.equal(0);
        expect(balanceETHAugustusPost).to.equal(0);
      }
    }
  } else if (feeTake === "from") {
    if (direction === "sell") {
      if (!toEth && !fromEth) {
        expect(balanceFromTraderPre.sub(balanceFromTraderPost)).to.equal(amount);
        expect(balanceToTraderPost.sub(balanceToTraderPre)).to.equal(quotedAmountDeductedFromFee);
        expect(balanceFromAugustusPre).to.equal(0);
        expect(balanceToAugustusPre).to.equal(0);
        expect(balanceFromAugustusPost).to.equal(0);
        expect(balanceToAugustusPost).to.equal(0);
      } else if (!fromEth && toEth) {
        expect(balanceFromTraderPre.sub(balanceFromTraderPost)).to.equal(amount);
        expect(balanceETHTraderPost.sub(balanceETHTraderPre).add(ethFees)).to.equal(quotedAmountDeductedFromFee);
        expect(balanceFromAugustusPre).to.equal(0);
        expect(balanceToAugustusPre).to.equal(0);
        expect(balanceFromAugustusPost).to.equal(0);
        expect(balanceToAugustusPost).to.equal(0);
        expect(balanceETHAugustusPre).to.equal(0);
        expect(balanceETHAugustusPost).to.equal(0);
      } else if (fromEth && !toEth) {
        expect(balanceETHTraderPre.sub(balanceETHTraderPost).sub(ethFees)).to.equal(amount);
        expect(balanceToTraderPost.sub(balanceToTraderPre)).to.equal(quotedAmountDeductedFromFee);
        expect(balanceFromAugustusPre).to.equal(0);
        expect(balanceToAugustusPre).to.equal(0);
        expect(balanceFromAugustusPost).to.equal(0);
        expect(balanceToAugustusPost).to.equal(0);
        expect(balanceETHAugustusPre).to.equal(0);
        expect(balanceETHAugustusPost).to.equal(0);
      }
    } else if (direction === "buy") {
      if (!toEth && !fromEth) {
        expect(balanceFromTraderPre.sub(balanceFromTraderPost)).to.equal(quotedAmount);
        expect(balanceToTraderPost.sub(balanceToTraderPre)).to.equal(amount);
        expect(balanceFromAugustusPre).to.equal(0);
        expect(balanceToAugustusPre).to.equal(0);
        expect(balanceFromAugustusPost).to.equal(0);
        expect(balanceToAugustusPost).to.equal(0);
      } else if (!fromEth && toEth) {
        expect(balanceFromTraderPre.sub(balanceFromTraderPost)).to.equal(quotedAmount);
        expect(balanceETHTraderPost.sub(balanceETHTraderPre).add(ethFees)).to.equal(amount);
        expect(balanceFromAugustusPre).to.equal(0);
        expect(balanceToAugustusPre).to.equal(0);
        expect(balanceFromAugustusPost).to.equal(0);
        expect(balanceToAugustusPost).to.equal(0);
        expect(balanceETHAugustusPre).to.equal(0);
        expect(balanceETHAugustusPost).to.equal(0);
      } else if (fromEth && !toEth) {
        expect(balanceETHTraderPre.sub(balanceETHTraderPost).sub(ethFees)).to.equal(quotedAmount);
        expect(balanceToTraderPost.sub(balanceToTraderPre)).to.equal(amount);
        expect(balanceFromAugustusPre).to.equal(0);
        expect(balanceToAugustusPre).to.equal(0);
        expect(balanceFromAugustusPost).to.equal(0);
        expect(balanceToAugustusPost).to.equal(0);
        expect(balanceETHAugustusPre).to.equal(0);
        expect(balanceETHAugustusPost).to.equal(0);
      }
    }
  }

  let expectedAmount2: any;
  let quotedAmount2: any;
  let quotedAmountDeductedFromFee2: any;
  if (direction === "sell") {
    quotedAmount2 = await quoterContract.callStatic.quoteExactInputSingle(
      fromToken.address,
      toToken.address,
      fee,
      amount,
      0,
    );
    expectedAmount2 = quotedAmount2.mul(99).div(100);
    if (feeTake === "from") {
      let newAmount = amount.sub(amount.mul(feePercent).div(10000));
      quotedAmountDeductedFromFee2 = await quoterContract.callStatic.quoteExactInputSingle(
        fromToken.address,
        toToken.address,
        fee,
        newAmount,
        0,
      );
      expectedAmount2 = quotedAmountDeductedFromFee2.mul(99).div(100);
    }
  } else if (direction === "buy") {
    quotedAmount2 = await quoterContract.callStatic.quoteExactOutputSingle(
      fromToken.address,
      toToken.address,
      fee,
      amount,
      0,
    );
    expectedAmount2 = quotedAmount2;
  }
  if (direction === "sell") {
    await directSwap.directUniV3Swap(
      {
        fromToken: fromEth ? ETH : fromToken.address,
        toToken: toEth ? ETH : toToken.address,
        exchange: UNIV3_ROUTER,
        fromAmount: amount,
        toAmount: expectedAmount2,
        expectedAmount: quotedAmountDeductedFromFee2 ? quotedAmountDeductedFromFee2 : quotedAmount2,
        feePercent: feePercentPacked ? feePercentPacked : feePercent,
        deadline: 9999999999,
        partner: deployer,
        isApproved: true,
        beneficiary: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        path: path,
        permit: "0x",
        uuid: "0x00000000000000000000000000000000",
      },
      { value: fromEth ? amount : 0 },
    );
  } else if (direction === "buy") {
    await directSwap.directUniV3Buy(
      {
        fromToken: fromEth ? ETH : fromToken.address,
        toToken: toEth ? ETH : toToken.address,
        exchange: UNIV3_ROUTER,
        fromAmount: quotedAmount2,
        toAmount: amount,
        expectedAmount: expectedAmount2,
        feePercent: feePercentPacked ? feePercentPacked : feePercent,
        deadline: 9999999999,
        partner: deployer,
        isApproved: true,
        beneficiary: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        path: path,
        permit: "0x",
        uuid: "0x00000000000000000000000000000000",
      },
      { value: fromEth ? quotedAmount2 : 0 },
    );
  }
};

export const swapCurve = async (
  curveV1Swap: boolean,
  augustusSwapper: Contract,
  directSwap: Contract,
  deployer: string,
  trader: string,
  exchange: string,
  poolAddress: string,
  i: number,
  j: number,
  amount: number | BigNumber,
  fromEth: boolean,
  toEth: boolean,
  swapType: number,
  feePercent: number | BigNumber = 0,
  feeTake: string = "",
  feePercentPacked: number | BigNumber = 0,
  simulatePS: boolean = false,
  isStEth: boolean = false,
) => {
  const pool = await ethers.getContractAt(CURVE_POOLS[exchange as keyof typeof CURVE_POOLS], exchange);
  let iAddress;
  let jAddress;
  if (swapType === 2) {
    iAddress = GENERIC_ZAP_ADDRESSES[i as keyof typeof GENERIC_ZAP_ADDRESSES];
    jAddress = GENERIC_ZAP_ADDRESSES[j as keyof typeof GENERIC_ZAP_ADDRESSES];
  } else if (swapType === 1) {
    iAddress = await pool.underlying_coins(i);
    jAddress = await pool.underlying_coins(j);
  } else {
    iAddress = await pool.coins(i);
    jAddress = await pool.coins(j);
  }
  let fromContract = await ethers.getContractAt(ERC20.abi, iAddress);
  let toContract = await ethers.getContractAt(ERC20.abi, jAddress);
  let fromDecimals;
  if (iAddress !== ETH) {
    fromDecimals = await fromContract.decimals();
  }
  amount = ethers.utils.parseUnits(amount.toString(), fromDecimals);
  let quotedAmount;
  let newAmount = amount;
  if (feeTake === "from") {
    newAmount = amount.sub(amount.mul(feePercent).div(10000));
  }
  if (swapType === 2) {
    quotedAmount = await pool.get_dy(poolAddress, i, j, newAmount);
  } else if (swapType === 1) {
    quotedAmount = await pool.get_dy_underlying(i, j, newAmount);
  } else {
    quotedAmount = await pool.get_dy(i, j, newAmount);
  }
  let expectedAmount = quotedAmount;
  // sub 0.1% to quotedAmount
  let quotedAmountLessSlippage = quotedAmount.sub(quotedAmount.mul(1).div(1000));

  if (simulatePS) {
    expectedAmount = quotedAmount.sub(quotedAmount.mul(100).div(10000));
  }

  // impersonate account with fromToken balance
  fromContract = await impersonate(trader, fromContract, ethers, network);

  const tokenProxyAddress = await augustusSwapper.getTokenTransferProxy();

  let allowance;

  if (iAddress !== ETH) {
    allowance = await fromContract.allowance(trader, tokenProxyAddress);
  }

  if (allowance?.toString() === "0" && iAddress !== ETH) {
    await fromContract.approve(tokenProxyAddress, ethers.constants.MaxUint256);
  }

  let balanceFromTraderPre;
  let balanceToTraderPre;
  let balanceFromAugustusPre;
  let balanceToAugustusPre;
  if (iAddress !== ETH && jAddress !== ETH) {
    balanceFromTraderPre = await fromContract.balanceOf(trader);
    balanceToTraderPre = await toContract.balanceOf(trader);
    balanceFromAugustusPre = await fromContract.balanceOf(augustusSwapper.address);
    balanceToAugustusPre = await toContract.balanceOf(augustusSwapper.address);
  } else if (iAddress === ETH && jAddress !== ETH) {
    balanceFromTraderPre = await ethers.provider.getBalance(trader);
    balanceFromAugustusPre = await ethers.provider.getBalance(augustusSwapper.address);
    balanceToTraderPre = await toContract.balanceOf(trader);
    balanceToAugustusPre = await toContract.balanceOf(augustusSwapper.address);
  } else if (iAddress !== ETH && jAddress === ETH) {
    balanceFromTraderPre = await fromContract.balanceOf(trader);
    balanceFromAugustusPre = await fromContract.balanceOf(augustusSwapper.address);
    balanceToTraderPre = await ethers.provider.getBalance(trader);
    balanceToAugustusPre = await ethers.provider.getBalance(augustusSwapper.address);
  }
  const balanceETHTraderPre = await ethers.provider.getBalance(trader);
  const balanceETHAugustusPre = await ethers.provider.getBalance(augustusSwapper.address);

  directSwap = await impersonate(trader, directSwap, ethers, network);

  let tx;
  if (curveV1Swap) {
    tx = await directSwap.directCurveV1Swap(
      {
        fromToken: fromEth ? ETH : iAddress,
        toToken: toEth ? ETH : jAddress,
        exchange,
        fromAmount: amount,
        toAmount: quotedAmountLessSlippage,
        expectedAmount,
        feePercent: feePercentPacked ? feePercentPacked : feePercent,
        i,
        j,
        partner: deployer,
        isApproved: false,
        swapType,
        beneficiary: ethers.constants.AddressZero,
        permit: "0x",
        uuid: "0x00000000000000000000000000000000",
      },
      { value: fromEth ? amount : 0 },
    );
  } else {
    tx = await directSwap.directCurveV2Swap(
      {
        fromToken: fromEth ? ETH : iAddress,
        toToken: toEth ? ETH : jAddress,
        exchange,
        poolAddress,
        fromAmount: amount,
        toAmount: quotedAmountLessSlippage,
        expectedAmount,
        feePercent: feePercentPacked ? feePercentPacked : feePercent,
        i,
        j,
        partner: deployer,
        isApproved: false,
        swapType,
        beneficiary: ethers.constants.AddressZero,
        permit: "0x",
        uuid: "0x00000000000000000000000000000000",
      },
      { value: fromEth ? amount : 0 },
    );
  }

  let receipt = await tx.wait();
  let ethFees = receipt.gasUsed.mul(receipt.effectiveGasPrice);

  let balanceFromTraderPost;
  let balanceToTraderPost;
  let balanceFromAugustusPost;
  let balanceToAugustusPost;
  if (iAddress !== ETH && jAddress !== ETH) {
    balanceFromTraderPost = await fromContract.balanceOf(trader);
    balanceToTraderPost = await toContract.balanceOf(trader);
    balanceFromAugustusPost = await fromContract.balanceOf(augustusSwapper.address);
    balanceToAugustusPost = await toContract.balanceOf(augustusSwapper.address);
  } else if (iAddress === ETH && jAddress !== ETH) {
    balanceFromTraderPost = await ethers.provider.getBalance(trader);
    balanceFromAugustusPost = await ethers.provider.getBalance(augustusSwapper.address);
    balanceToTraderPost = await toContract.balanceOf(trader);
    balanceToAugustusPost = await toContract.balanceOf(augustusSwapper.address);
  } else if (iAddress !== ETH && jAddress === ETH) {
    balanceFromTraderPost = await fromContract.balanceOf(trader);
    balanceFromAugustusPost = await fromContract.balanceOf(augustusSwapper.address);
    balanceToTraderPost = await ethers.provider.getBalance(trader);
    balanceToAugustusPost = await ethers.provider.getBalance(augustusSwapper.address);
  }
  const balanceETHTraderPost = await ethers.provider.getBalance(trader);
  const balanceETHAugustusPost = await ethers.provider.getBalance(augustusSwapper.address);

  if (!fromEth && !toEth) {
    expect(balanceFromTraderPre.sub(balanceFromTraderPost)).to.equal(amount);
    if (!simulatePS) {
      expect(balanceToTraderPost.sub(balanceToTraderPre)).to.be.at.least(
        feePercent === 0
          ? quotedAmountLessSlippage
          : quotedAmountLessSlippage.sub(quotedAmountLessSlippage.mul(feePercent).div(10000)),
      );
    } else {
      expect(balanceToTraderPost.sub(balanceToTraderPre)).to.be.at.least(
        feePercent === 0
          ? expectedAmount
          : quotedAmountLessSlippage.sub(quotedAmountLessSlippage.mul(feePercent).div(10000)),
      );
    }

    expect(balanceToTraderPost.sub(balanceToTraderPre)).to.be.at.most(
      feePercent === 0 || feeTake === "from" ? quotedAmount : quotedAmount.sub(quotedAmount.mul(feePercent).div(10000)),
    );
    expect(balanceFromAugustusPre).to.equal(0);
    expect(balanceToAugustusPre).to.equal(0);
    expect(balanceFromAugustusPost).to.equal(0);
    expect(balanceToAugustusPost).to.equal(0);
    expect(balanceETHAugustusPre).to.equal(0);
    expect(balanceETHAugustusPost).to.equal(0);
  } else if (!fromEth && toEth) {
    if (!simulatePS) {
      expect(balanceETHTraderPost.sub(balanceETHTraderPre).add(ethFees)).to.be.at.least(
        feePercent === 0
          ? quotedAmountLessSlippage
          : quotedAmountLessSlippage.sub(quotedAmountLessSlippage.mul(feePercent).div(10000)),
      );
    } else {
      expect(balanceETHTraderPost.sub(balanceETHTraderPre).add(ethFees)).to.be.at.least(
        feePercent === 0
          ? expectedAmount
          : quotedAmountLessSlippage.sub(quotedAmountLessSlippage.mul(feePercent).div(10000)),
      );
    }

    expect(balanceETHTraderPost.sub(balanceETHTraderPre).add(ethFees)).to.be.at.most(
      feePercent === 0 || feeTake === "from" ? quotedAmount : quotedAmount.sub(quotedAmount.mul(feePercent).div(10000)),
    );
    if (!isStEth) {
      expect(balanceFromTraderPre.sub(balanceFromTraderPost)).to.equal(amount);
      expect(balanceFromAugustusPre).to.equal(0);
      expect(balanceFromAugustusPost).to.equal(0);
    } else {
      expect(balanceFromTraderPre.sub(balanceFromTraderPost)).to.be.closeTo(amount, 2);
      expect(balanceToAugustusPost).to.be.at.most(2);
      expect(balanceFromAugustusPost).to.be.at.most(2);
    }
    expect(balanceToAugustusPre).to.equal(0);
    expect(balanceToAugustusPost).to.equal(0);
    expect(balanceETHAugustusPre).to.equal(0);
    expect(balanceETHAugustusPost).to.equal(0);
  } else if (fromEth && !toEth) {
    expect(balanceETHTraderPre.sub(balanceETHTraderPost).sub(ethFees)).to.equal(amount);
    if (!simulatePS) {
      expect(balanceToTraderPost.sub(balanceToTraderPre)).to.be.at.least(
        feePercent === 0
          ? quotedAmountLessSlippage
          : quotedAmountLessSlippage.sub(quotedAmountLessSlippage.mul(feePercent).div(10000)),
      );
    } else {
      expect(balanceToTraderPost.sub(balanceToTraderPre)).to.be.at.least(
        feePercent === 0
          ? expectedAmount
          : quotedAmountLessSlippage.sub(quotedAmountLessSlippage.mul(feePercent).div(10000)),
      );
    }
    expect(balanceFromAugustusPre).to.equal(0);
    expect(balanceFromAugustusPost).to.equal(0);
    if (!isStEth) {
      expect(balanceToTraderPost.sub(balanceToTraderPre)).to.be.at.most(
        feePercent === 0 || feeTake === "from"
          ? quotedAmount
          : quotedAmount.sub(quotedAmount.mul(feePercent).div(10000)),
      );
      expect(balanceToAugustusPost).to.equal(0);
      expect(balanceToAugustusPre).to.equal(0);
    } else {
      expect(balanceToTraderPost.sub(balanceToTraderPre)).to.be.at.most(
        feePercent === 0 || feeTake === "from"
          ? quotedAmount.add(2)
          : quotedAmount.sub(quotedAmount.mul(feePercent).div(10000)).add(2),
      );
      expect(balanceToAugustusPost).to.be.at.most(2);
      expect(balanceToAugustusPre).to.be.at.most(3);
    }
    expect(balanceETHAugustusPre).to.equal(0);
    expect(balanceETHAugustusPost).to.equal(0);
  }

  if (feeTake === "from") {
    newAmount = amount.sub(amount.mul(feePercent).div(10000));
  }
  if (swapType === 2) {
    quotedAmount = await pool.get_dy(poolAddress, i, j, newAmount);
  } else if (swapType === 1) {
    quotedAmount = await pool.get_dy_underlying(i, j, newAmount);
  } else {
    quotedAmount = await pool.get_dy(i, j, newAmount);
  }
  // sub 0.1% to quotedAmount
  quotedAmountLessSlippage = quotedAmount.sub(quotedAmount.mul(1).div(1000));

  if (simulatePS) {
    quotedAmountLessSlippage = quotedAmount.sub(quotedAmount.mul(100).div(10000));
  }

  if (curveV1Swap) {
    await directSwap.directCurveV1Swap(
      {
        fromToken: fromEth ? ETH : iAddress,
        toToken: toEth ? ETH : jAddress,
        exchange,
        fromAmount: amount,
        toAmount: quotedAmountLessSlippage,
        expectedAmount,
        feePercent: feePercentPacked ? feePercentPacked : feePercent,
        i,
        j,
        partner: deployer,
        isApproved: true,
        swapType,
        beneficiary: ethers.constants.AddressZero,
        permit: "0x",
        uuid: "0x00000000000000000000000000000000",
      },
      { value: fromEth ? amount : 0 },
    );
  } else {
    await directSwap.directCurveV2Swap(
      {
        fromToken: fromEth ? ETH : iAddress,
        toToken: toEth ? ETH : jAddress,
        exchange,
        poolAddress,
        fromAmount: amount,
        toAmount: quotedAmountLessSlippage,
        expectedAmount,
        feePercent: feePercentPacked ? feePercentPacked : feePercent,
        i,
        j,
        partner: deployer,
        isApproved: true,
        swapType,
        beneficiary: ethers.constants.AddressZero,
        permit: "0x",
        uuid: "0x00000000000000000000000000000000",
      },
      { value: fromEth ? amount : 0 },
    );
  }
};

export const swapBalV2 = async (
  augustusSwapper: Contract,
  directSwap: Contract,
  deployer: string,
  trader: string,
  poolId: string,
  kind: number,
  assetInIndex: number,
  assetOutIndex: number,
  amount: number,
  feePercent: number,
  feeTake: string = "",
  feePercentPacked: number | BigNumber = 0,
  simulatePS: boolean = false,
  fromEth: boolean = false,
  toEth: boolean = false,
) => {
  const vaultAbi = await getBalancerContractAbi("20210418-vault", "Vault");
  const vault = await ethers.getContractAt(vaultAbi, BALV2_VAULT);
  const fetchAssets = (await vault.getPoolTokens(poolId)).tokens;
  let assets = [...fetchAssets];
  let inContract = await ethers.getContractAt(ERC20.abi, assets[assetInIndex]);
  let outContract = await ethers.getContractAt(ERC20.abi, assets[assetOutIndex]);
  if (fromEth) {
    assets[assetInIndex] = ethers.constants.AddressZero;
  }
  if (toEth) {
    assets[assetOutIndex] = ethers.constants.AddressZero;
  }
  const inDecimals = await inContract.decimals();
  const outDecimals = await outContract.decimals();
  let swaps = [
    {
      poolId,
      assetInIndex,
      assetOutIndex,
      amount:
        kind === 0
          ? ethers.utils.parseUnits(amount.toString(), inDecimals)
          : ethers.utils.parseUnits(amount.toString(), outDecimals),
      userData: "0x",
    },
  ];
  let swapsFeeFrom = [];
  swapsFeeFrom.push(Object.assign({}, swaps[0]));
  const funds = {
    sender: augustusSwapper.address,
    fromInternalBalance: false,
    recipient: augustusSwapper.address,
    toInternalBalance: false,
  };

  let assetsDeltas = await vault.callStatic.queryBatchSwap(kind, swaps, assets, funds);
  let assetDeltasFeeFrom;
  let expectedAmount;

  if (feeTake === "from") {
    swapsFeeFrom[0].amount = swapsFeeFrom[0].amount.sub(swapsFeeFrom[0].amount.mul(feePercent).div(10000));
    assetDeltasFeeFrom = await vault.callStatic.queryBatchSwap(kind, swapsFeeFrom, assets, funds);
  }

  let limits = [];
  if (kind === 0) {
    if (assetInIndex === 0) {
      limits[0] = assetsDeltas[assetInIndex];
      limits[1] = assetsDeltas[assetOutIndex].mul(99).div(100);
    } else {
      limits[1] = assetsDeltas[assetInIndex];
      limits[0] = assetsDeltas[assetOutIndex].mul(99).div(100);
    }
    expectedAmount = assetsDeltas[assetOutIndex].abs();
  } else if (kind === 1) {
    if (assetInIndex === 0) {
      limits[0] = assetsDeltas[assetInIndex].mul(101).div(100);
      limits[1] = assetsDeltas[assetOutIndex];
    } else {
      limits[1] = assetsDeltas[assetInIndex].mul(101).div(100);
      limits[0] = assetsDeltas[assetOutIndex];
    }
    expectedAmount = assetsDeltas[assetInIndex].abs();
  }

  const tokenProxyAddress = await augustusSwapper.getTokenTransferProxy();

  inContract = await impersonate(trader, inContract, ethers, network);

  await inContract.approve(tokenProxyAddress, ethers.constants.MaxUint256);

  directSwap = await impersonate(trader, directSwap, ethers, network);

  let balanceFromTraderPre;
  if (!fromEth) {
    balanceFromTraderPre = await inContract.balanceOf(trader);
  } else {
    balanceFromTraderPre = await ethers.provider.getBalance(trader);
  }
  let balanceToTraderPre;
  if (!toEth) {
    balanceToTraderPre = await outContract.balanceOf(trader);
  } else {
    balanceToTraderPre = await ethers.provider.getBalance(trader);
  }
  let balanceFromAugustusPre;
  if (!fromEth) {
    balanceFromAugustusPre = await inContract.balanceOf(augustusSwapper.address);
  } else {
    balanceFromAugustusPre = await ethers.provider.getBalance(augustusSwapper.address);
  }
  let balanceToAugustusPre;
  if (!toEth) {
    balanceToAugustusPre = await outContract.balanceOf(augustusSwapper.address);
  } else {
    balanceToAugustusPre = await ethers.provider.getBalance(augustusSwapper.address);
  }

  // check if we are simulating PS
  if (simulatePS) {
    if (kind === 0) {
      expectedAmount = expectedAmount.mul(99).div(100);
    } else if (kind === 1) {
      expectedAmount = expectedAmount.mul(101).div(100);
    }
  }

  let fromAmount;
  let toAmount;

  if (limits[0].gt(limits[1])) {
    fromAmount = limits[0].abs();
    toAmount = limits[1].abs();
  } else {
    fromAmount = limits[1].abs();
    toAmount = limits[0].abs();
  }

  let receipt;
  let ethFees;
  if (kind === 0) {
    const tx = await directSwap.directBalancerV2GivenInSwap(
      {
        swaps,
        assets,
        funds,
        limits,
        fromAmount,
        toAmount,
        expectedAmount,
        deadline: 9999999999,
        feePercent: feePercentPacked ? feePercentPacked : feePercent,
        vault: vault.address,
        partner: deployer,
        isApproved: false,
        beneficiary: ethers.constants.AddressZero,
        permit: "0x",
        uuid: "0x00000000000000000000000000000000",
      },
      { value: fromEth ? swaps[0].amount : 0 },
    );
    receipt = await tx.wait();
    ethFees = receipt.gasUsed.mul(receipt.effectiveGasPrice);
  } else if (kind === 1) {
    const tx = await directSwap.directBalancerV2GivenOutSwap(
      {
        swaps,
        assets,
        funds,
        limits,
        fromAmount,
        toAmount,
        expectedAmount,
        deadline: 9999999999,
        feePercent: feePercentPacked ? feePercentPacked : feePercent,
        vault: vault.address,
        partner: deployer,
        isApproved: false,
        beneficiary: ethers.constants.AddressZero,
        permit: "0x",
        uuid: "0x00000000000000000000000000000000",
      },
      { value: fromEth ? (assetInIndex === 0 ? limits[0] : limits[1]) : 0 },
    );
    receipt = await tx.wait();
    ethFees = receipt.gasUsed.mul(receipt.effectiveGasPrice);
  }

  let balanceFromTraderPost;
  if (!fromEth) {
    balanceFromTraderPost = await inContract.balanceOf(trader);
  } else {
    balanceFromTraderPost = await ethers.provider.getBalance(trader);
  }
  let balanceToTraderPost;
  if (!toEth) {
    balanceToTraderPost = await outContract.balanceOf(trader);
  } else {
    balanceToTraderPost = await ethers.provider.getBalance(trader);
  }
  let balanceFromAugustusPost;
  if (!fromEth) {
    balanceFromAugustusPost = await inContract.balanceOf(augustusSwapper.address);
  } else {
    balanceFromAugustusPost = await ethers.provider.getBalance(augustusSwapper.address);
  }
  let balanceToAugustusPost;
  if (!toEth) {
    balanceToAugustusPost = await outContract.balanceOf(augustusSwapper.address);
  } else {
    balanceToAugustusPost = await ethers.provider.getBalance(augustusSwapper.address);
  }

  if (simulatePS && feePercent === 0 && feePercentPacked === 0) {
    if (kind === 0) {
      let swapEvent = receipt.events.find((e: any) => e.event === "SwappedDirect");
      let receivedAmount = swapEvent.args.receivedAmount;
      let slippage = receivedAmount.sub(expectedAmount).div(2);
      expectedAmount = expectedAmount.add(slippage);
    } else if (kind === 1) {
      let swapEvent = receipt.events.find((e: any) => e.event === "SwappedDirect");
      let fromAmount = swapEvent.args.srcAmount;
      let slippage = fromAmount.sub(expectedAmount).div(2);
      expectedAmount = expectedAmount.add(slippage);
    }
  }

  if (kind === 0) {
    expect(
      !fromEth
        ? balanceFromTraderPre.sub(balanceFromTraderPost)
        : balanceFromTraderPre.sub(balanceFromTraderPost).sub(ethFees),
    ).to.equal(ethers.utils.parseUnits(amount.toString(), inDecimals));
    if (feeTake !== "from") {
      expect(
        !toEth ? balanceToTraderPost.sub(balanceToTraderPre) : balanceToTraderPost.sub(balanceToTraderPre).add(ethFees),
      ).to.equal(
        feePercent === 0
          ? expectedAmount
          : assetsDeltas[assetOutIndex].abs().sub(assetsDeltas[assetOutIndex].abs().mul(feePercent).div(10000)),
      );
    } else {
      expect(
        !toEth ? balanceToTraderPost.sub(balanceToTraderPre) : balanceToTraderPost.sub(balanceToTraderPre).add(ethFees),
      ).to.equal(assetDeltasFeeFrom[assetOutIndex].abs());
    }

    expect(balanceFromAugustusPre).to.equal(0);
    expect(balanceToAugustusPre).to.equal(0);
    expect(balanceFromAugustusPost).to.equal(0);
    expect(balanceToAugustusPost).to.equal(0);
  } else if (kind === 1) {
    if (!simulatePS || feePercent !== 0) {
      expect(
        !fromEth
          ? balanceFromTraderPre.sub(balanceFromTraderPost)
          : balanceFromTraderPre.sub(balanceFromTraderPost).sub(ethFees),
      ).to.equal(feeTake !== "from" ? assetsDeltas[assetInIndex] : limits[assetInIndex]);
    } else {
      expect(
        !fromEth
          ? balanceFromTraderPre.sub(balanceFromTraderPost)
          : balanceFromTraderPre.sub(balanceFromTraderPost).sub(ethFees),
      ).to.equal(expectedAmount);
    }
    if (feeTake !== "from") {
      expect(
        !toEth ? balanceToTraderPost.sub(balanceToTraderPre) : balanceToTraderPost.sub(balanceToTraderPre).add(ethFees),
      ).to.equal(
        feePercent === 0
          ? assetsDeltas[assetOutIndex].abs()
          : assetsDeltas[assetOutIndex].abs().sub(assetsDeltas[assetOutIndex].abs().mul(feePercent).div(10000)),
      );
    } else {
      expect(
        !toEth ? balanceToTraderPost.sub(balanceToTraderPre) : balanceToTraderPost.sub(balanceToTraderPre).add(ethFees),
      ).to.equal(assetsDeltas[assetOutIndex].abs());
    }

    expect(balanceFromAugustusPre).to.equal(0);
    expect(balanceToAugustusPre).to.equal(0);
    expect(balanceFromAugustusPost).to.equal(0);
    expect(balanceToAugustusPost).to.equal(0);
  }

  const assetsDeltas2 = await vault.callStatic.queryBatchSwap(kind, swaps, assets, funds);
  let expectedAmount2;
  let limits2 = [];
  if (kind === 0) {
    if (assetInIndex === 0) {
      limits2[0] = assetsDeltas2[assetInIndex];
      limits2[1] = assetsDeltas2[assetOutIndex].mul(99).div(100);
    } else {
      limits2[1] = assetsDeltas2[assetInIndex];
      limits2[0] = assetsDeltas2[assetOutIndex].mul(99).div(100);
    }
    expectedAmount2 = assetsDeltas2[assetOutIndex].abs();
  } else if (kind === 1) {
    if (assetInIndex === 0) {
      limits2[0] = assetsDeltas2[assetInIndex].mul(101).div(100);
      limits2[1] = assetsDeltas2[assetOutIndex];
    } else {
      limits2[1] = assetsDeltas2[assetInIndex].mul(101).div(100);
      limits2[0] = assetsDeltas2[assetOutIndex];
    }
    expectedAmount2 = assetsDeltas2[assetInIndex].abs();
  }

  // check if we are simulating PS
  if (simulatePS) {
    if (kind === 0) {
      expectedAmount2 = expectedAmount2.mul(99).div(100);
    } else if (kind === 1) {
      expectedAmount = expectedAmount.mul(101).div(100);
    }
  }

  let fromAmount2;
  let toAmount2;

  if (limits2[0].gt(limits2[1])) {
    fromAmount2 = limits2[0].abs();
    toAmount2 = limits2[1].abs();
  } else {
    fromAmount2 = limits2[1].abs();
    toAmount2 = limits2[0].abs();
  }

  if (kind === 0) {
    await directSwap.directBalancerV2GivenInSwap(
      {
        swaps,
        assets,
        funds,
        limits: limits2,
        fromAmount: fromAmount2,
        toAmount: toAmount2,
        expectedAmount: expectedAmount2,
        deadline: 9999999999,
        feePercent: feePercentPacked ? feePercentPacked : feePercent,
        vault: vault.address,
        partner: deployer,
        isApproved: true,
        beneficiary: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        permit: "0x",
        uuid: "0x00000000000000000000000000000000",
      },
      { value: fromEth ? swaps[0].amount : 0 },
    );
  } else if (kind === 1) {
    await directSwap.directBalancerV2GivenOutSwap(
      {
        swaps,
        assets,
        funds,
        limits: limits2,
        fromAmount: fromAmount2,
        toAmount: toAmount2,
        expectedAmount: expectedAmount2,
        deadline: 9999999999,
        feePercent: feePercentPacked ? feePercentPacked : feePercent,
        vault: vault.address,
        partner: deployer,
        isApproved: true,
        beneficiary: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        permit: "0x",
        uuid: "0x00000000000000000000000000000000",
      },
      { value: fromEth ? (assetInIndex === 0 ? limits2[0] : limits2[1]) : 0 },
    );
  }
};

export const swapBalV2MultiHop = async (
  augustusSwapper: Contract,
  directSwap: Contract,
  deployer: string,
  trader: string,
  poolId1: string,
  poolId2: string,
  kind: number,
  assetInIndex1: number,
  assetOutIndex1: number,
  assetInIndex2: number,
  assetOutIndex2: number,
  amount: number,
  feePercent: number,
  feeTake: string = "",
  feePercentPacked: number | BigNumber = 0,
  simulatePS: boolean = false,
  fromEth: boolean = false,
  toEth: boolean = false,
) => {
  const vaultAbi = await getBalancerContractAbi("20210418-vault", "Vault");
  const vault = await ethers.getContractAt(vaultAbi, BALV2_VAULT);
  const fetchAssets1 = (await vault.getPoolTokens(poolId1)).tokens;
  const fetchAssets2 = (await vault.getPoolTokens(poolId2)).tokens;
  const allAssets = [...fetchAssets1, ...fetchAssets2];
  let assets = [];
  assets[0] = allAssets[kind === 0 ? assetInIndex1 : assetOutIndex1];
  assets[1] = allAssets[kind === 0 ? assetOutIndex1 : assetInIndex1];
  assets[2] = allAssets[kind === 0 ? assetOutIndex2 : assetInIndex2];
  let inContract = await ethers.getContractAt(ERC20.abi, assets[kind === 0 ? assetInIndex1 : assetInIndex2]);
  let firstOut = await ethers.getContractAt(ERC20.abi, assets[assetOutIndex1]);
  let outContract = await ethers.getContractAt(ERC20.abi, assets[assetOutIndex2]);
  if (fromEth) {
    assets[assetInIndex1] = ethers.constants.AddressZero;
  }
  if (toEth) {
    assets[assetOutIndex2] = ethers.constants.AddressZero;
  }
  const inDecimals = await inContract.decimals();
  const outDecimals = await firstOut.decimals();

  let swaps = [
    {
      poolId: poolId1,
      assetInIndex: assetInIndex1,
      assetOutIndex: assetOutIndex1,
      amount:
        kind === 0
          ? ethers.utils.parseUnits(amount.toString(), inDecimals)
          : ethers.utils.parseUnits(amount.toString(), outDecimals),
      userData: "0x",
    },
    {
      poolId: poolId2,
      assetInIndex: assetInIndex2,
      assetOutIndex: assetOutIndex2,
      amount: ethers.constants.Zero,
      userData: "0x",
    },
  ];
  let swapsFeeFrom = [];
  for (let i = 0; i < swaps.length; i++) {
    swapsFeeFrom.push(Object.assign({}, swaps[i]));
  }
  const funds = {
    sender: augustusSwapper.address,
    fromInternalBalance: false,
    recipient: augustusSwapper.address,
    toInternalBalance: false,
  };
  let assetsDeltas = await vault.callStatic.queryBatchSwap(kind, swaps, assets, funds);
  let assetDeltasFeeFrom;
  let expectedAmount;

  if (feeTake === "from") {
    swapsFeeFrom[0].amount = swapsFeeFrom[0].amount.sub(swapsFeeFrom[0].amount.mul(feePercent).div(10000));
    assetDeltasFeeFrom = await vault.callStatic.queryBatchSwap(kind, swapsFeeFrom, assets, funds);
  }
  let limits = [];
  if (kind === 0) {
    if (assetInIndex1 === 0) {
      limits[0] = assetsDeltas[assetInIndex1];
      limits[1] = assetsDeltas[1];
      limits[2] = assetsDeltas[assetOutIndex2].mul(99).div(100);
    } else {
      limits[2] = assetsDeltas[assetInIndex1];
      limits[1] = assetsDeltas[1];
      limits[0] = assetsDeltas[assetOutIndex2].mul(99).div(100);
    }
    expectedAmount = assetsDeltas[assetOutIndex2].abs();
  } else if (kind === 1) {
    limits[0] = assetsDeltas[0].mul(101).div(100);
    limits[1] = assetsDeltas[1];
    limits[2] = assetsDeltas[2];
    expectedAmount = assetsDeltas[assetInIndex2].abs();
  }

  const tokenProxyAddress = await augustusSwapper.getTokenTransferProxy();

  inContract = await impersonate(trader, inContract, ethers, network);

  await inContract.approve(tokenProxyAddress, ethers.constants.MaxUint256);

  directSwap = await impersonate(trader, directSwap, ethers, network);

  let balanceFromTraderPre;
  if (!fromEth) {
    balanceFromTraderPre = await inContract.balanceOf(trader);
  } else {
    balanceFromTraderPre = await ethers.provider.getBalance(trader);
  }
  let balanceToTraderPre;
  if (!toEth) {
    balanceToTraderPre = await outContract.balanceOf(trader);
  } else {
    balanceToTraderPre = await ethers.provider.getBalance(trader);
  }
  let balanceFromAugustusPre;
  if (!fromEth) {
    balanceFromAugustusPre = await inContract.balanceOf(augustusSwapper.address);
  } else {
    balanceFromAugustusPre = await ethers.provider.getBalance(augustusSwapper.address);
  }
  let balanceToAugustusPre;
  if (!toEth) {
    balanceToAugustusPre = await outContract.balanceOf(augustusSwapper.address);
  } else {
    balanceToAugustusPre = await ethers.provider.getBalance(augustusSwapper.address);
  }

  // check if we are simulating PS
  if (simulatePS) {
    if (kind === 0) {
      expectedAmount = expectedAmount.mul(99).div(100);
    } else if (kind === 1) {
      expectedAmount = expectedAmount.mul(101).div(100);
    }
  }

  let fromAmount;
  let toAmount;

  if (limits[0].gt(limits[1])) {
    fromAmount = limits[0].abs();
    toAmount = limits[2].abs();
  } else {
    fromAmount = limits[2].abs();
    toAmount = limits[0].abs();
  }

  let receipt;
  let ethFees;
  if (kind === 0) {
    const tx = await directSwap.directBalancerV2GivenInSwap(
      {
        swaps,
        assets,
        funds,
        limits,
        fromAmount,
        toAmount,
        expectedAmount,
        deadline: 9999999999,
        feePercent: feePercentPacked ? feePercentPacked : feePercent,
        vault: vault.address,
        partner: deployer,
        isApproved: false,
        beneficiary: ethers.constants.AddressZero,
        permit: "0x",
        uuid: "0x00000000000000000000000000000000",
      },
      { value: fromEth ? swaps[0].amount : 0 },
    );
    receipt = await tx.wait();
    ethFees = receipt.gasUsed.mul(receipt.effectiveGasPrice);
  } else if (kind === 1) {
    const tx = await directSwap.directBalancerV2GivenOutSwap(
      {
        swaps,
        assets,
        funds,
        limits,
        fromAmount,
        toAmount,
        expectedAmount,
        deadline: 9999999999,
        feePercent: feePercentPacked ? feePercentPacked : feePercent,
        vault: vault.address,
        partner: deployer,
        isApproved: false,
        beneficiary: ethers.constants.AddressZero,
        permit: "0x",
        uuid: "0x00000000000000000000000000000000",
      },
      { value: fromEth ? (assetInIndex1 === 0 ? limits[0] : limits[1]) : 0 },
    );
    receipt = await tx.wait();
    ethFees = receipt.gasUsed.mul(receipt.effectiveGasPrice);
  }

  let balanceFromTraderPost;
  if (!fromEth) {
    balanceFromTraderPost = await inContract.balanceOf(trader);
  } else {
    balanceFromTraderPost = await ethers.provider.getBalance(trader);
  }
  let balanceToTraderPost;
  if (!toEth) {
    balanceToTraderPost = await outContract.balanceOf(trader);
  } else {
    balanceToTraderPost = await ethers.provider.getBalance(trader);
  }
  let balanceFromAugustusPost;
  if (!fromEth) {
    balanceFromAugustusPost = await inContract.balanceOf(augustusSwapper.address);
  } else {
    balanceFromAugustusPost = await ethers.provider.getBalance(augustusSwapper.address);
  }
  let balanceToAugustusPost;
  if (!toEth) {
    balanceToAugustusPost = await outContract.balanceOf(augustusSwapper.address);
  } else {
    balanceToAugustusPost = await ethers.provider.getBalance(augustusSwapper.address);
  }

  if (simulatePS && feePercent === 0 && feePercentPacked === 0) {
    if (kind === 0) {
      let swapEvent = receipt.events.find((e: any) => e.event === "SwappedDirect");
      let receivedAmount = swapEvent.args.receivedAmount;
      let slippage = receivedAmount.sub(expectedAmount).div(2);
      expectedAmount = expectedAmount.add(slippage);
    } else if (kind === 1) {
      let swapEvent = receipt.events.find((e: any) => e.event === "SwappedDirect");
      let fromAmount = swapEvent.args.srcAmount;
      let slippage = fromAmount.sub(expectedAmount).div(2);
      expectedAmount = expectedAmount.add(slippage);
    }
  }

  if (kind === 0) {
    expect(
      !fromEth
        ? balanceFromTraderPre.sub(balanceFromTraderPost)
        : balanceFromTraderPre.sub(balanceFromTraderPost).sub(ethFees),
    ).to.equal(ethers.utils.parseUnits(amount.toString(), inDecimals));
    if (feeTake !== "from") {
      expect(
        !toEth ? balanceToTraderPost.sub(balanceToTraderPre) : balanceToTraderPost.sub(balanceToTraderPre).add(ethFees),
      ).to.equal(
        feePercent === 0
          ? expectedAmount
          : assetsDeltas[assetOutIndex2].abs().sub(assetsDeltas[assetOutIndex2].abs().mul(feePercent).div(10000)),
      );
    } else {
      expect(
        !toEth ? balanceToTraderPost.sub(balanceToTraderPre) : balanceToTraderPost.sub(balanceToTraderPre).add(ethFees),
      ).to.equal(assetDeltasFeeFrom[assetOutIndex2].abs());
    }
    expect(balanceFromAugustusPre).to.equal(0);
    expect(balanceToAugustusPre).to.equal(0);
    expect(balanceFromAugustusPost).to.equal(0);
    expect(balanceToAugustusPost).to.equal(0);
  } else if (kind === 1) {
    if (!simulatePS || feePercent !== 0) {
      expect(
        !fromEth
          ? balanceFromTraderPre.sub(balanceFromTraderPost)
          : balanceFromTraderPre.sub(balanceFromTraderPost).sub(ethFees),
      ).to.equal(feeTake !== "from" ? assetsDeltas[assetInIndex2] : limits[0]);
    } else {
      expect(
        !fromEth
          ? balanceFromTraderPre.sub(balanceFromTraderPost)
          : balanceFromTraderPre.sub(balanceFromTraderPost).sub(ethFees),
      ).to.equal(expectedAmount);
    }
    expect(
      !toEth ? balanceToTraderPost.sub(balanceToTraderPre) : balanceToTraderPost.sub(balanceToTraderPre).add(ethFees),
    ).to.equal(
      feePercent === 0
        ? assetsDeltas[assetOutIndex2].abs()
        : assetsDeltas[assetOutIndex2].abs().sub(assetsDeltas[assetOutIndex2].abs().mul(feePercent).div(10000)),
    );
    expect(balanceFromAugustusPre).to.equal(0);
    expect(balanceToAugustusPre).to.equal(0);
    expect(balanceFromAugustusPost).to.equal(0);
    expect(balanceToAugustusPost).to.equal(0);
  }

  const assetsDeltas2 = await vault.callStatic.queryBatchSwap(kind, swaps, assets, funds);
  let expectedAmount2;
  let limits2 = [];
  if (kind === 0) {
    if (assetInIndex1 === 0) {
      limits2[0] = assetsDeltas2[assetInIndex1];
      limits2[1] = assetsDeltas2[1];
      limits2[2] = assetsDeltas2[assetOutIndex2].mul(99).div(100);
    } else {
      limits2[2] = assetsDeltas2[assetInIndex1];
      limits2[1] = assetsDeltas2[1];
      limits2[0] = assetsDeltas2[assetOutIndex2].mul(99).div(100);
    }
    expectedAmount2 = assetsDeltas2[assetOutIndex2].abs();
  } else if (kind === 1) {
    limits2[0] = assetsDeltas2[0].mul(101).div(100);
    limits2[1] = assetsDeltas2[1];
    limits2[2] = assetsDeltas2[2];
    expectedAmount2 = assetsDeltas2[assetInIndex1].abs();
  }

  // check if we are simulating PS
  if (simulatePS) {
    if (kind === 0) {
      expectedAmount2 = expectedAmount2.mul(99).div(100);
    } else if (kind === 1) {
      expectedAmount = expectedAmount.mul(101).div(100);
    }
  }

  let fromAmount2;
  let toAmount2;

  if (limits[0].gt(limits[1])) {
    fromAmount2 = limits2[0].abs();
    toAmount2 = limits2[2].abs();
  } else {
    fromAmount2 = limits2[2].abs();
    toAmount2 = limits2[0].abs();
  }

  if (kind === 0) {
    await directSwap.directBalancerV2GivenInSwap(
      {
        swaps,
        assets,
        funds,
        limits: limits2,
        fromAmount: fromAmount2,
        toAmount: toAmount2,
        expectedAmount: expectedAmount2,
        deadline: 9999999999,
        feePercent: feePercentPacked ? feePercentPacked : feePercent,
        vault: vault.address,
        partner: deployer,
        isApproved: true,
        beneficiary: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        permit: "0x",
        uuid: "0x00000000000000000000000000000000",
      },
      { value: fromEth ? swaps[0].amount : 0 },
    );
  } else if (kind === 1) {
    await directSwap.directBalancerV2GivenOutSwap(
      {
        swaps,
        assets,
        funds,
        limits: limits2,
        fromAmount: fromAmount2,
        toAmount: toAmount2,
        expectedAmount: expectedAmount2,
        deadline: 9999999999,
        feePercent: feePercentPacked ? feePercentPacked : feePercent,
        vault: vault.address,
        partner: deployer,
        isApproved: true,
        beneficiary: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        permit: "0x",
        uuid: "0x00000000000000000000000000000000",
      },
      { value: fromEth ? (assetInIndex1 === 0 ? limits2[0] : limits2[1]) : 0 },
    );
  }
};

async function impersonate(address: string, contract: Contract, ethers: any, network: Network) {
  await network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [address],
  });
  let signer = await ethers.getSigner(address);
  contract = contract.connect(signer);
  return contract;
}
