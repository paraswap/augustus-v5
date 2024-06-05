import { ethers } from "hardhat";
import { Contract } from "ethers";
import { swapV3 } from "./directSwapsHelpers";

import { WETH_TOKEN, USDC_TOKEN, UNI_TOKEN, DAI_TOKEN, PSP_TOKEN } from "./directSwapsConstants";

let augustusSwapper: Contract;
let directSwap: Contract;
let deployer: any;

describe("Direct UniV3 Swaps", function () {
  it("Deploy AugustusSwapper", async function () {
    deployer = (await ethers.getSigners())[0];
    const AugustusSwapper = await ethers.getContractFactory("AugustusSwapper");
    augustusSwapper = await AugustusSwapper.deploy(deployer.address);
    const FeeClaimer = await ethers.getContractFactory("FeeClaimer");
    const feeClaimer = await FeeClaimer.deploy(augustusSwapper.address);
    const DirectSwap = await ethers.getContractFactory("DirectSwap");
    directSwap = await DirectSwap.deploy(WETH_TOKEN.address, 8500, 500, 5000, 10000, feeClaimer.address);
    const iface = directSwap.interface;
    const selectorUniV3Sell = iface.getSighash("directUniV3Swap");
    const selectorUniV3Buy = iface.getSighash("directUniV3Buy");
    const selectorCurveV1 = iface.getSighash("directCurveV1Swap");
    const selectorCurveV2 = iface.getSighash("directCurveV2Swap");
    const selectorBalV2GivenIn = iface.getSighash("directBalancerV2GivenInSwap");
    const selectorBalV2GivenOut = iface.getSighash("directBalancerV2GivenOutSwap");
    await augustusSwapper.grantRole(await augustusSwapper.ROUTER_ROLE(), directSwap.address);
    await augustusSwapper.setImplementation(selectorUniV3Sell, directSwap.address);
    await augustusSwapper.setImplementation(selectorUniV3Buy, directSwap.address);
    await augustusSwapper.setImplementation(selectorCurveV1, directSwap.address);
    await augustusSwapper.setImplementation(selectorCurveV2, directSwap.address);
    await augustusSwapper.setImplementation(selectorBalV2GivenIn, directSwap.address);
    await augustusSwapper.setImplementation(selectorBalV2GivenOut, directSwap.address);
    directSwap = await ethers.getContractAt("DirectSwap", augustusSwapper.address);
  });
  it("Swap ERC20 for ERC20 (no WETH no fee no PS)", async function () {
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x3CC936b795A188F0e246cBB2D74C5Bd190aeCF18",
      PSP_TOKEN,
      USDC_TOKEN,
      ethers.utils.parseUnits("10", PSP_TOKEN.decimals),
      false,
      false,
      "sell",
    );
  });
  it("Swap ERC20 for WETH (no fee no PS)", async function () {
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x3CC936b795A188F0e246cBB2D74C5Bd190aeCF18",
      DAI_TOKEN,
      WETH_TOKEN,
      ethers.utils.parseUnits("10", USDC_TOKEN.decimals),
      false,
      false,
      "sell",
    );
  });
  it("Swap WETH for ERC20 (no fee no PS)", async function () {
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x8EB8a3b98659Cce290402893d0123abb75E3ab28",
      WETH_TOKEN,
      UNI_TOKEN,
      ethers.utils.parseUnits("10", USDC_TOKEN.decimals),
      false,
      false,
      "sell",
    );
  });
  it("Swap ERC20 for ETH (no fee no PS)", async function () {
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x3CC936b795A188F0e246cBB2D74C5Bd190aeCF18",
      DAI_TOKEN,
      WETH_TOKEN,
      ethers.utils.parseUnits("10", DAI_TOKEN.decimals),
      false,
      true,
      "sell",
    );
  });
  it("Swap ETH for ERC20 (no fee no PS)", async function () {
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x3CC936b795A188F0e246cBB2D74C5Bd190aeCF18",
      WETH_TOKEN,
      USDC_TOKEN,
      ethers.utils.parseEther("1"),
      true,
      false,
      "sell",
    );
  });
  it("Buy ERC20 for ERC20 (no WETH no fee no PS)", async function () {
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x47173B170C64d16393a52e6C480b3Ad8c302ba1e",
      UNI_TOKEN,
      USDC_TOKEN,
      ethers.utils.parseUnits("1", USDC_TOKEN.decimals),
      false,
      false,
      "buy",
    );
  });
  it("Buy ETH for ERC20 (no fee no PS)", async function () {
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x47173B170C64d16393a52e6C480b3Ad8c302ba1e",
      UNI_TOKEN,
      WETH_TOKEN,
      ethers.utils.parseUnits("10", WETH_TOKEN.decimals),
      false,
      true,
      "buy",
    );
  });
  it("Buy ERC20 for ETH (no fee no PS)", async function () {
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x8EB8a3b98659Cce290402893d0123abb75E3ab28",
      WETH_TOKEN,
      USDC_TOKEN,
      ethers.utils.parseUnits("10000", USDC_TOKEN.decimals),
      true,
      false,
      "buy",
    );
  });
  it("Buy ERC20 for WETH (no fee no PS)", async function () {
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x8EB8a3b98659Cce290402893d0123abb75E3ab28",
      WETH_TOKEN,
      USDC_TOKEN,
      ethers.utils.parseUnits("10000", USDC_TOKEN.decimals),
      false,
      false,
      "buy",
    );
  });
  it("Buy WETH for ERC20 (no fee no PS)", async function () {
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x3CC936b795A188F0e246cBB2D74C5Bd190aeCF18",
      DAI_TOKEN,
      WETH_TOKEN,
      ethers.utils.parseUnits("10", WETH_TOKEN.decimals),
      false,
      false,
      "buy",
    );
  });
  it("Swap ERC20 for ERC20 (no WETH with fee take toToken no PS)", async function () {
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x3CC936b795A188F0e246cBB2D74C5Bd190aeCF18",
      PSP_TOKEN,
      USDC_TOKEN,
      ethers.utils.parseUnits("10", PSP_TOKEN.decimals),
      false,
      false,
      "sell",
      300,
    );
  });
  it("Swap ERC20 for WETH (with fee take toToken no PS)", async function () {
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x3CC936b795A188F0e246cBB2D74C5Bd190aeCF18",
      DAI_TOKEN,
      WETH_TOKEN,
      ethers.utils.parseUnits("10", USDC_TOKEN.decimals),
      false,
      false,
      "sell",
      300,
    );
  });
  it("Swap WETH for ERC20 (with fee take toToken no PS)", async function () {
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x8EB8a3b98659Cce290402893d0123abb75E3ab28",
      WETH_TOKEN,
      UNI_TOKEN,
      ethers.utils.parseUnits("10", USDC_TOKEN.decimals),
      false,
      false,
      "sell",
      300,
    );
  });
  it("Swap ERC20 for ETH (with fee take toToken no PS)", async function () {
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x3CC936b795A188F0e246cBB2D74C5Bd190aeCF18",
      DAI_TOKEN,
      WETH_TOKEN,
      ethers.utils.parseUnits("10", DAI_TOKEN.decimals),
      false,
      true,
      "sell",
      300,
    );
  });
  it("Swap ETH for ERC20 (with fee take toToken no PS)", async function () {
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x3CC936b795A188F0e246cBB2D74C5Bd190aeCF18",
      WETH_TOKEN,
      USDC_TOKEN,
      ethers.utils.parseEther("1"),
      true,
      false,
      "sell",
      300,
    );
  });
  it("Buy ERC20 for ERC20 (no WETH with fee take toToken no PS)", async function () {
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x47173B170C64d16393a52e6C480b3Ad8c302ba1e",
      UNI_TOKEN,
      USDC_TOKEN,
      ethers.utils.parseUnits("10", USDC_TOKEN.decimals),
      false,
      false,
      "buy",
      300,
    );
  });
  it("Buy ETH for ERC20 (with fee take toToken no PS)", async function () {
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x47173B170C64d16393a52e6C480b3Ad8c302ba1e",
      UNI_TOKEN,
      WETH_TOKEN,
      ethers.utils.parseUnits("10", WETH_TOKEN.decimals),
      false,
      true,
      "buy",
      300,
    );
  });
  it("Buy ERC20 for ETH (with fee take toToken no PS)", async function () {
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x8EB8a3b98659Cce290402893d0123abb75E3ab28",
      WETH_TOKEN,
      USDC_TOKEN,
      ethers.utils.parseUnits("10000", USDC_TOKEN.decimals),
      true,
      false,
      "buy",
      300,
    );
  });
  it("Buy ERC20 for WETH (with fee take toToken no PS)", async function () {
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x8EB8a3b98659Cce290402893d0123abb75E3ab28",
      WETH_TOKEN,
      USDC_TOKEN,
      ethers.utils.parseUnits("10000", USDC_TOKEN.decimals),
      false,
      false,
      "buy",
      300,
    );
  });
  it("Buy WETH for ERC20 (with fee take toToken no PS)", async function () {
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x3CC936b795A188F0e246cBB2D74C5Bd190aeCF18",
      DAI_TOKEN,
      WETH_TOKEN,
      ethers.utils.parseUnits("10", WETH_TOKEN.decimals),
      false,
      false,
      "buy",
      300,
    );
  });
  it("Swap ERC20 for ERC20 (no WETH with fee take fromToken no PS)", async function () {
    // feePercent packed structure, basis points 100, take fee from fromToken
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(14))
      .add(ethers.BigNumber.from(2).pow(15))
      .add(300);
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x3CC936b795A188F0e246cBB2D74C5Bd190aeCF18",
      PSP_TOKEN,
      USDC_TOKEN,
      ethers.utils.parseUnits("10", PSP_TOKEN.decimals),
      false,
      false,
      "sell",
      300,
      feePercentPacked,
      "from",
    );
  });
  it("Swap ERC20 for WETH (with fee take fromToken no PS)", async function () {
    // feePercent packed structure, basis points 100, take fee from fromToken
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(14))
      .add(ethers.BigNumber.from(2).pow(15))
      .add(300);
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x3CC936b795A188F0e246cBB2D74C5Bd190aeCF18",
      DAI_TOKEN,
      WETH_TOKEN,
      ethers.utils.parseUnits("10", USDC_TOKEN.decimals),
      false,
      false,
      "sell",
      300,
      feePercentPacked,
      "from",
    );
  });
  it("Swap WETH for ERC20 (with fee take fromToken no PS)", async function () {
    // feePercent packed structure, basis points 100, take fee from fromToken
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(14))
      .add(ethers.BigNumber.from(2).pow(15))
      .add(300);
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x8EB8a3b98659Cce290402893d0123abb75E3ab28",
      WETH_TOKEN,
      UNI_TOKEN,
      ethers.utils.parseUnits("10", USDC_TOKEN.decimals),
      false,
      false,
      "sell",
      300,
      feePercentPacked,
      "from",
    );
  });
  it("Swap ERC20 for ETH (with fee take fromToken no PS)", async function () {
    // feePercent packed structure, basis points 100, take fee from fromToken
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(14))
      .add(ethers.BigNumber.from(2).pow(15))
      .add(300);
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x3CC936b795A188F0e246cBB2D74C5Bd190aeCF18",
      DAI_TOKEN,
      WETH_TOKEN,
      ethers.utils.parseUnits("10", DAI_TOKEN.decimals),
      false,
      true,
      "sell",
      300,
      feePercentPacked,
      "from",
    );
  });
  it("Swap ETH for ERC20 (with fee take fromToken no PS)", async function () {
    // feePercent packed structure, basis points 100, take fee from fromToken
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(14))
      .add(ethers.BigNumber.from(2).pow(15))
      .add(300);
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x3CC936b795A188F0e246cBB2D74C5Bd190aeCF18",
      WETH_TOKEN,
      USDC_TOKEN,
      ethers.utils.parseEther("1"),
      true,
      false,
      "sell",
      300,
      feePercentPacked,
      "from",
    );
  });
  it("Buy ERC20 for ERC20 (no WETH with fee take fromToken no PS)", async function () {
    // feePercent packed structure, basis points 100, take fee from fromToken
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(14))
      .add(ethers.BigNumber.from(2).pow(15))
      .add(300);
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x3CC936b795A188F0e246cBB2D74C5Bd190aeCF18",
      PSP_TOKEN,
      USDC_TOKEN,
      ethers.utils.parseUnits("10", USDC_TOKEN.decimals),
      false,
      false,
      "buy",
      300,
      feePercentPacked,
      "from",
    );
  });
  it("Buy ERC20 for WETH (with fee take fromToken no PS)", async function () {
    // feePercent packed structure, basis points 100, take fee from fromToken
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(14))
      .add(ethers.BigNumber.from(2).pow(15))
      .add(300);
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x3CC936b795A188F0e246cBB2D74C5Bd190aeCF18",
      DAI_TOKEN,
      WETH_TOKEN,
      ethers.utils.parseUnits("10", WETH_TOKEN.decimals),
      false,
      false,
      "buy",
      300,
      feePercentPacked,
      "from",
    );
  });
  it("Buy WETH for ERC20 (with fee take fromToken no PS)", async function () {
    // feePercent packed structure, basis points 100, take fee from fromToken
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(14))
      .add(ethers.BigNumber.from(2).pow(15))
      .add(300);
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x8EB8a3b98659Cce290402893d0123abb75E3ab28",
      WETH_TOKEN,
      UNI_TOKEN,
      ethers.utils.parseUnits("10", UNI_TOKEN.decimals),
      false,
      false,
      "buy",
      300,
      feePercentPacked,
      "from",
    );
  });
  it("Buy ERC20 for ETH (with fee take fromToken no PS)", async function () {
    // feePercent packed structure, basis points 100, take fee from fromToken
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(14))
      .add(ethers.BigNumber.from(2).pow(15))
      .add(300);
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x3CC936b795A188F0e246cBB2D74C5Bd190aeCF18",
      DAI_TOKEN,
      WETH_TOKEN,
      ethers.utils.parseUnits("10", WETH_TOKEN.decimals),
      false,
      true,
      "buy",
      300,
      feePercentPacked,
      "from",
    );
  });
  it("Buy ETH for ERC20 (with fee take fromToken no PS)", async function () {
    // feePercent packed structure, basis points 100, take fee from fromToken
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(14))
      .add(ethers.BigNumber.from(2).pow(15))
      .add(300);
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x3CC936b795A188F0e246cBB2D74C5Bd190aeCF18",
      WETH_TOKEN,
      USDC_TOKEN,
      ethers.utils.parseUnits("1", USDC_TOKEN.decimals),
      true,
      false,
      "buy",
      300,
      feePercentPacked,
      "from",
    );
  });
  it("Swap ERC20 for ERC20 (no WETH no fee with PS)", async function () {
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(16))
      .add(ethers.BigNumber.from(5000));
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x3CC936b795A188F0e246cBB2D74C5Bd190aeCF18",
      PSP_TOKEN,
      USDC_TOKEN,
      ethers.utils.parseUnits("10", PSP_TOKEN.decimals),
      false,
      false,
      "sell",
      0,
      feePercentPacked,
      "",
      true,
    );
  });
  it("Swap ERC20 for WETH (no fee with PS)", async function () {
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(16))
      .add(ethers.BigNumber.from(5000));
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x3CC936b795A188F0e246cBB2D74C5Bd190aeCF18",
      DAI_TOKEN,
      WETH_TOKEN,
      ethers.utils.parseUnits("20", USDC_TOKEN.decimals),
      false,
      false,
      "sell",
      0,
      feePercentPacked,
      "",
      true,
    );
  });
  it("Swap WETH for ERC20 (no fee with PS)", async function () {
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(16))
      .add(ethers.BigNumber.from(5000));
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x8EB8a3b98659Cce290402893d0123abb75E3ab28",
      WETH_TOKEN,
      UNI_TOKEN,
      ethers.utils.parseUnits("1", USDC_TOKEN.decimals),
      false,
      false,
      "sell",
      0,
      feePercentPacked,
      "",
      true,
    );
  });
  it("Swap ERC20 for ETH (no fee with PS)", async function () {
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(16))
      .add(ethers.BigNumber.from(5000));
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x3CC936b795A188F0e246cBB2D74C5Bd190aeCF18",
      DAI_TOKEN,
      WETH_TOKEN,
      ethers.utils.parseUnits("10", DAI_TOKEN.decimals),
      false,
      true,
      "sell",
      0,
      feePercentPacked,
      "",
      true,
    );
  });
  it("Swap ETH for ERC20 (no fee with PS)", async function () {
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(16))
      .add(ethers.BigNumber.from(5000));
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x3CC936b795A188F0e246cBB2D74C5Bd190aeCF18",
      WETH_TOKEN,
      USDC_TOKEN,
      ethers.utils.parseEther("1"),
      true,
      false,
      "sell",
      0,
      feePercentPacked,
      "",
      true,
    );
  });
  it("Buy ERC20 for ERC20 (no WETH no fee with PS)", async function () {
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(16))
      .add(ethers.BigNumber.from(5000));
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x47173B170C64d16393a52e6C480b3Ad8c302ba1e",
      UNI_TOKEN,
      USDC_TOKEN,
      ethers.utils.parseUnits("10", USDC_TOKEN.decimals),
      false,
      false,
      "buy",
      0,
      feePercentPacked,
      "",
      true,
    );
  });
  it("Buy ETH for ERC20 (no fee with PS)", async function () {
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(16))
      .add(ethers.BigNumber.from(5000));
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x47173B170C64d16393a52e6C480b3Ad8c302ba1e",
      UNI_TOKEN,
      WETH_TOKEN,
      ethers.utils.parseUnits("10", WETH_TOKEN.decimals),
      false,
      true,
      "buy",
      0,
      feePercentPacked,
      "",
      true,
    );
  });
  it("Buy ERC20 for ETH (no fee with PS)", async function () {
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(16))
      .add(ethers.BigNumber.from(5000));
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x8EB8a3b98659Cce290402893d0123abb75E3ab28",
      WETH_TOKEN,
      USDC_TOKEN,
      ethers.utils.parseUnits("20", USDC_TOKEN.decimals),
      true,
      false,
      "buy",
      0,
      feePercentPacked,
      "",
      true,
    );
  });
  it("Buy ERC20 for WETH (no fee with PS)", async function () {
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(16))
      .add(ethers.BigNumber.from(5000));
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x8EB8a3b98659Cce290402893d0123abb75E3ab28",
      WETH_TOKEN,
      USDC_TOKEN,
      ethers.utils.parseUnits("100", USDC_TOKEN.decimals),
      false,
      false,
      "buy",
      0,
      feePercentPacked,
      "",
      true,
    );
  });
  it("Buy WETH for ERC20 (no fee with PS)", async function () {
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(16))
      .add(ethers.BigNumber.from(5000));
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x3CC936b795A188F0e246cBB2D74C5Bd190aeCF18",
      DAI_TOKEN,
      WETH_TOKEN,
      ethers.utils.parseUnits("30", WETH_TOKEN.decimals),
      false,
      false,
      "buy",
      0,
      feePercentPacked,
      "",
      true,
    );
  });
  it("Swap ERC20 for ERC20 (no WETH fee take toToken with PS)", async function () {
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x3CC936b795A188F0e246cBB2D74C5Bd190aeCF18",
      PSP_TOKEN,
      USDC_TOKEN,
      ethers.utils.parseUnits("10", PSP_TOKEN.decimals),
      false,
      false,
      "sell",
      100,
      0,
      "",
      true,
    );
  });
  it("Swap ERC20 for WETH (fee take toToken with PS)", async function () {
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x3CC936b795A188F0e246cBB2D74C5Bd190aeCF18",
      DAI_TOKEN,
      WETH_TOKEN,
      ethers.utils.parseUnits("10", USDC_TOKEN.decimals),
      false,
      false,
      "sell",
      100,
      0,
      "",
      true,
    );
  });
  it("Swap WETH for ERC20 (fee take toToken with PS)", async function () {
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x8EB8a3b98659Cce290402893d0123abb75E3ab28",
      WETH_TOKEN,
      UNI_TOKEN,
      ethers.utils.parseUnits("10", USDC_TOKEN.decimals),
      false,
      false,
      "sell",
      100,
      0,
      "",
      true,
    );
  });
  it("Swap ERC20 for ETH (fee take toToken with PS)", async function () {
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x3CC936b795A188F0e246cBB2D74C5Bd190aeCF18",
      DAI_TOKEN,
      WETH_TOKEN,
      ethers.utils.parseUnits("10", DAI_TOKEN.decimals),
      false,
      true,
      "sell",
      100,
      0,
      "",
      true,
    );
  });
  it("Swap ETH for ERC20 (fee take toToken with PS)", async function () {
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x3CC936b795A188F0e246cBB2D74C5Bd190aeCF18",
      WETH_TOKEN,
      USDC_TOKEN,
      ethers.utils.parseEther("1"),
      true,
      false,
      "sell",
      100,
      0,
      "",
      true,
    );
  });
  it("Buy ERC20 for ERC20 (no WETH with fee take toToken with PS)", async function () {
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x47173B170C64d16393a52e6C480b3Ad8c302ba1e",
      UNI_TOKEN,
      USDC_TOKEN,
      ethers.utils.parseUnits("10", USDC_TOKEN.decimals),
      false,
      false,
      "buy",
      300,
      0,
      "",
      true,
    );
  });
  it("Buy ETH for ERC20 (with fee take toToken with PS)", async function () {
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x47173B170C64d16393a52e6C480b3Ad8c302ba1e",
      UNI_TOKEN,
      WETH_TOKEN,
      ethers.utils.parseUnits("10", WETH_TOKEN.decimals),
      false,
      true,
      "buy",
      300,
      0,
      "",
      true,
    );
  });
  it("Buy ERC20 for ETH (with fee take toToken with PS)", async function () {
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x8EB8a3b98659Cce290402893d0123abb75E3ab28",
      WETH_TOKEN,
      USDC_TOKEN,
      ethers.utils.parseUnits("10000", USDC_TOKEN.decimals),
      true,
      false,
      "buy",
      300,
      0,
      "",
      true,
    );
  });
  it("Buy ERC20 for WETH (with fee take toToken with PS)", async function () {
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x8EB8a3b98659Cce290402893d0123abb75E3ab28",
      WETH_TOKEN,
      USDC_TOKEN,
      ethers.utils.parseUnits("10000", USDC_TOKEN.decimals),
      false,
      false,
      "buy",
      300,
      0,
      "",
      true,
    );
  });
  it("Buy WETH for ERC20 (with fee take toToken with PS)", async function () {
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x3CC936b795A188F0e246cBB2D74C5Bd190aeCF18",
      DAI_TOKEN,
      WETH_TOKEN,
      ethers.utils.parseUnits("10", WETH_TOKEN.decimals),
      false,
      false,
      "buy",
      300,
      0,
      "",
      true,
    );
  });
  it("Swap ERC20 for ERC20 (no WETH with fee take fromToken with PS)", async function () {
    // feePercent packed structure, basis points 100, take fee from fromToken
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(14))
      .add(ethers.BigNumber.from(2).pow(15))
      .add(300);
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x3CC936b795A188F0e246cBB2D74C5Bd190aeCF18",
      PSP_TOKEN,
      USDC_TOKEN,
      ethers.utils.parseUnits("10", PSP_TOKEN.decimals),
      false,
      false,
      "sell",
      300,
      feePercentPacked,
      "from",
      true,
    );
  });
  it("Swap ERC20 for WETH (with fee take fromToken with PS)", async function () {
    // feePercent packed structure, basis points 100, take fee from fromToken
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(14))
      .add(ethers.BigNumber.from(2).pow(15))
      .add(300);
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x3CC936b795A188F0e246cBB2D74C5Bd190aeCF18",
      DAI_TOKEN,
      WETH_TOKEN,
      ethers.utils.parseUnits("10", USDC_TOKEN.decimals),
      false,
      false,
      "sell",
      300,
      feePercentPacked,
      "from",
      true,
    );
  });
  it("Swap WETH for ERC20 (with fee take fromToken with PS)", async function () {
    // feePercent packed structure, basis points 100, take fee from fromToken
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(14))
      .add(ethers.BigNumber.from(2).pow(15))
      .add(300);
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x8EB8a3b98659Cce290402893d0123abb75E3ab28",
      WETH_TOKEN,
      UNI_TOKEN,
      ethers.utils.parseUnits("10", USDC_TOKEN.decimals),
      false,
      false,
      "sell",
      300,
      feePercentPacked,
      "from",
      true,
    );
  });
  it("Swap ERC20 for ETH (with fee take fromToken with PS)", async function () {
    // feePercent packed structure, basis points 100, take fee from fromToken
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(14))
      .add(ethers.BigNumber.from(2).pow(15))
      .add(300);
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x3CC936b795A188F0e246cBB2D74C5Bd190aeCF18",
      DAI_TOKEN,
      WETH_TOKEN,
      ethers.utils.parseUnits("10", DAI_TOKEN.decimals),
      false,
      true,
      "sell",
      300,
      feePercentPacked,
      "from",
      true,
    );
  });
  it("Swap ETH for ERC20 (with fee take fromToken with PS)", async function () {
    // feePercent packed structure, basis points 100, take fee from fromToken
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(14))
      .add(ethers.BigNumber.from(2).pow(15))
      .add(300);
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x3CC936b795A188F0e246cBB2D74C5Bd190aeCF18",
      WETH_TOKEN,
      USDC_TOKEN,
      ethers.utils.parseEther("1"),
      true,
      false,
      "sell",
      300,
      feePercentPacked,
      "from",
      true,
    );
  });
  it("Buy ERC20 for ERC20 (no WETH with fee take fromToken with PS)", async function () {
    // feePercent packed structure, basis points 100, take fee from fromToken
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(14))
      .add(ethers.BigNumber.from(2).pow(15))
      .add(300);
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x3CC936b795A188F0e246cBB2D74C5Bd190aeCF18",
      PSP_TOKEN,
      USDC_TOKEN,
      ethers.utils.parseUnits("10", USDC_TOKEN.decimals),
      false,
      false,
      "buy",
      300,
      feePercentPacked,
      "from",
      true,
    );
  });
  it("Buy ERC20 for WETH (with fee take fromToken with PS)", async function () {
    // feePercent packed structure, basis points 100, take fee from fromToken
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(14))
      .add(ethers.BigNumber.from(2).pow(15))
      .add(300);
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x3CC936b795A188F0e246cBB2D74C5Bd190aeCF18",
      DAI_TOKEN,
      WETH_TOKEN,
      ethers.utils.parseUnits("10", WETH_TOKEN.decimals),
      false,
      false,
      "buy",
      300,
      feePercentPacked,
      "from",
      true,
    );
  });
  it("Buy WETH for ERC20 (with fee take fromToken with PS)", async function () {
    // feePercent packed structure, basis points 100, take fee from fromToken
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(14))
      .add(ethers.BigNumber.from(2).pow(15))
      .add(300);
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x8EB8a3b98659Cce290402893d0123abb75E3ab28",
      WETH_TOKEN,
      UNI_TOKEN,
      ethers.utils.parseUnits("10", UNI_TOKEN.decimals),
      false,
      false,
      "buy",
      300,
      feePercentPacked,
      "from",
      true,
    );
  });
  it("Buy ERC20 for ETH (with fee take fromToken with PS)", async function () {
    // feePercent packed structure, basis points 100, take fee from fromToken
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(14))
      .add(ethers.BigNumber.from(2).pow(15))
      .add(300);
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x3CC936b795A188F0e246cBB2D74C5Bd190aeCF18",
      DAI_TOKEN,
      WETH_TOKEN,
      ethers.utils.parseUnits("10", WETH_TOKEN.decimals),
      false,
      true,
      "sell",
      300,
      feePercentPacked,
      "from",
      true,
    );
  });
  it("Buy ETH for ERC20 (with fee take fromToken with PS)", async function () {
    // feePercent packed structure, basis points 100, take fee from fromToken
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(14))
      .add(ethers.BigNumber.from(2).pow(15))
      .add(300);
    await swapV3(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x3CC936b795A188F0e246cBB2D74C5Bd190aeCF18",
      WETH_TOKEN,
      USDC_TOKEN,
      ethers.utils.parseUnits("1", USDC_TOKEN.decimals),
      true,
      false,
      "buy",
      300,
      feePercentPacked,
      "from",
      true,
    );
  });
});
