import { ethers } from "hardhat";
import { Contract } from "ethers";
import { swapBalV2, swapBalV2MultiHop } from "./directSwapsHelpers";

import { WETH_TOKEN, BALV2_OHM_DAI_ID, BALV2_BAL_WETH_ID, BALV2_OHM_WETH_ID } from "./directSwapsConstants";

let augustusSwapper: Contract;
let directSwap: Contract;
let deployer: any;

describe("Direct BalV2 Swaps", function () {
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
  it("OHM-DAI pool givenIn - no fee no PS", async function () {
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0xD85ec6D3d8D44d03bEA3e747522c56083a0b3E60",
      BALV2_OHM_DAI_ID,
      0,
      0,
      1,
      10,
      0,
    );
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0xD85ec6D3d8D44d03bEA3e747522c56083a0b3E60",
      BALV2_OHM_DAI_ID,
      0,
      1,
      0,
      10,
      0,
    );
  });
  it("OHM-DAI pool givenOut - no fee no PS", async function () {
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0xD85ec6D3d8D44d03bEA3e747522c56083a0b3E60",
      BALV2_OHM_DAI_ID,
      1,
      0,
      1,
      20,
      0,
    );
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x8EB8a3b98659Cce290402893d0123abb75E3ab28",
      BALV2_OHM_DAI_ID,
      1,
      1,
      0,
      10,
      0,
    );
  });
  it("OHM-DAI pool givenIn - with fee from toToken no PS", async function () {
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0xD85ec6D3d8D44d03bEA3e747522c56083a0b3E60",
      BALV2_OHM_DAI_ID,
      0,
      0,
      1,
      10,
      100,
    );
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0xD85ec6D3d8D44d03bEA3e747522c56083a0b3E60",
      BALV2_OHM_DAI_ID,
      0,
      1,
      0,
      10,
      100,
    );
  });
  it("OHM-DAI pool givenOut - with fee from toToken no PS", async function () {
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0xD85ec6D3d8D44d03bEA3e747522c56083a0b3E60",
      BALV2_OHM_DAI_ID,
      1,
      0,
      1,
      1,
      100,
    );
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x8EB8a3b98659Cce290402893d0123abb75E3ab28",
      BALV2_OHM_DAI_ID,
      1,
      1,
      0,
      1,
      100,
    );
  });
  it("OHM-DAI pool givenIn - with fee from fromToken no PS", async function () {
    // feePercent packed structure, basis points 100, take fee from fromToken
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(14))
      .add(ethers.BigNumber.from(2).pow(15))
      .add(100);
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0xD85ec6D3d8D44d03bEA3e747522c56083a0b3E60",
      BALV2_OHM_DAI_ID,
      0,
      0,
      1,
      1,
      100,
      "from",
      feePercentPacked,
    );
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0xD85ec6D3d8D44d03bEA3e747522c56083a0b3E60",
      BALV2_OHM_DAI_ID,
      0,
      1,
      0,
      1,
      100,
      "from",
      feePercentPacked,
    );
  });
  it("OHM-DAI pool givenOut - with fee from fromToken no PS", async function () {
    // feePercent packed structure, basis points 100, take fee from fromToken
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(14))
      .add(ethers.BigNumber.from(2).pow(15))
      .add(100);
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0xD85ec6D3d8D44d03bEA3e747522c56083a0b3E60",
      BALV2_OHM_DAI_ID,
      1,
      0,
      1,
      1,
      100,
      "from",
      feePercentPacked,
    );
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0xD85ec6D3d8D44d03bEA3e747522c56083a0b3E60",
      BALV2_OHM_DAI_ID,
      1,
      1,
      0,
      1,
      100,
      "from",
      feePercentPacked,
    );
  });
  it("OHM-DAI pool givenIn - no fee with PS", async function () {
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(16))
      .add(ethers.BigNumber.from(5000));
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0xD85ec6D3d8D44d03bEA3e747522c56083a0b3E60",
      BALV2_OHM_DAI_ID,
      0,
      0,
      1,
      5,
      0,
      "",
      feePercentPacked,
      true,
    );
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0xD85ec6D3d8D44d03bEA3e747522c56083a0b3E60",
      BALV2_OHM_DAI_ID,
      0,
      1,
      0,
      2,
      0,
      "",
      feePercentPacked,
      true,
    );
  });
  it("OHM-DAI pool givenOut - no fee with PS", async function () {
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(16))
      .add(ethers.BigNumber.from(5000));
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0xD85ec6D3d8D44d03bEA3e747522c56083a0b3E60",
      BALV2_OHM_DAI_ID,
      1,
      0,
      1,
      5,
      0,
      "",
      feePercentPacked,
      true,
    );
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x8EB8a3b98659Cce290402893d0123abb75E3ab28",
      BALV2_OHM_DAI_ID,
      1,
      1,
      0,
      2,
      0,
      "",
      feePercentPacked,
      true,
    );
  });
  it("OHM-DAI pool givenIn - with fee from toToken with PS", async function () {
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0xD85ec6D3d8D44d03bEA3e747522c56083a0b3E60",
      BALV2_OHM_DAI_ID,
      0,
      0,
      1,
      10,
      100,
      "to",
      0,
      true,
    );
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0xD85ec6D3d8D44d03bEA3e747522c56083a0b3E60",
      BALV2_OHM_DAI_ID,
      0,
      1,
      0,
      10,
      100,
      "to",
      0,
      true,
    );
  });
  it("OHM-DAI pool givenOut - with fee from toToken with PS", async function () {
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0xD85ec6D3d8D44d03bEA3e747522c56083a0b3E60",
      BALV2_OHM_DAI_ID,
      1,
      0,
      1,
      20,
      100,
      "",
      0,
      true,
    );
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0xD85ec6D3d8D44d03bEA3e747522c56083a0b3E60",
      BALV2_OHM_DAI_ID,
      1,
      1,
      0,
      10,
      100,
      "",
      0,
      true,
    );
  });
  it("OHM-DAI pool givenIn - with fee from fromToken with PS", async function () {
    // feePercent packed structure, basis points 100, take fee from fromToken
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(14))
      .add(ethers.BigNumber.from(2).pow(15))
      .add(100);
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0xD85ec6D3d8D44d03bEA3e747522c56083a0b3E60",
      BALV2_OHM_DAI_ID,
      0,
      0,
      1,
      10,
      100,
      "from",
      feePercentPacked,
      true,
    );
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0xD85ec6D3d8D44d03bEA3e747522c56083a0b3E60",
      BALV2_OHM_DAI_ID,
      0,
      1,
      0,
      10,
      100,
      "from",
      feePercentPacked,
      true,
    );
  });
  it("OHM-DAI pool givenOut - with fee from fromToken with PS", async function () {
    // feePercent packed structure, basis points 100, take fee from fromToken
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(14))
      .add(ethers.BigNumber.from(2).pow(15))
      .add(100);
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0xD85ec6D3d8D44d03bEA3e747522c56083a0b3E60",
      BALV2_OHM_DAI_ID,
      1,
      0,
      1,
      1,
      100,
      "from",
      feePercentPacked,
      true,
    );
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0xD85ec6D3d8D44d03bEA3e747522c56083a0b3E60",
      BALV2_OHM_DAI_ID,
      1,
      1,
      0,
      1,
      100,
      "from",
      feePercentPacked,
      true,
    );
  });
  it("BAL-WETH native ETH pool givenIn - no fee no PS", async function () {
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      0,
      0,
      1,
      10,
      0,
      "",
      0,
      false,
      false,
      true,
    );
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      0,
      1,
      0,
      1,
      0,
      "",
      0,
      false,
      true,
      false,
    );
  });
  it("BAL-WETH native ETH pool givenOut - no fee no PS", async function () {
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      1,
      0,
      1,
      10,
      0,
      "",
      0,
      false,
      false,
      true,
    );
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      1,
      1,
      0,
      1,
      0,
      "",
      0,
      false,
      true,
      false,
    );
  });
  it("BAL-WETH native ETH pool givenIn - with fee from toToken no PS", async function () {
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      0,
      0,
      1,
      10,
      100,
      "",
      0,
      false,
      false,
      true,
    );
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      0,
      1,
      0,
      1,
      100,
      "",
      0,
      false,
      true,
      false,
    );
  });
  it("BAL-WETH native ETH pool givenOut - with fee from toToken no PS", async function () {
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      1,
      0,
      1,
      10,
      100,
      "",
      0,
      false,
      false,
      true,
    );
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      1,
      1,
      0,
      1,
      100,
      "",
      0,
      false,
      true,
      false,
    );
  });
  it("BAL-WETH native ETH pool givenIn - with fee from fromToken no PS", async function () {
    // feePercent packed structure, basis points 100, take fee from fromToken
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(14))
      .add(ethers.BigNumber.from(2).pow(15))
      .add(100);
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      0,
      0,
      1,
      10,
      100,
      "from",
      feePercentPacked,
      false,
      false,
      true,
    );
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      0,
      1,
      0,
      10,
      100,
      "from",
      feePercentPacked,
      false,
      true,
      false,
    );
  });
  it("BAL-WETH native ETH pool givenOut - with fee from fromToken no PS", async function () {
    // feePercent packed structure, basis points 100, take fee from fromToken
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(14))
      .add(ethers.BigNumber.from(2).pow(15))
      .add(100);
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      1,
      0,
      1,
      10,
      100,
      "from",
      feePercentPacked,
      false,
      false,
      true,
    );
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      1,
      1,
      0,
      10,
      100,
      "from",
      feePercentPacked,
      false,
      true,
      false,
    );
  });
  it("BAL-WETH native ETH pool givenIn - no fee with PS", async function () {
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(16))
      .add(ethers.BigNumber.from(5000));
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      0,
      0,
      1,
      1,
      0,
      "",
      feePercentPacked,
      true,
      false,
      true,
    );
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      0,
      1,
      0,
      1,
      0,
      "",
      feePercentPacked,
      true,
      true,
      false,
    );
  });
  it("BAL-WETH native ETH pool givenOut - no fee with PS", async function () {
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(16))
      .add(ethers.BigNumber.from(5000));
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      1,
      0,
      1,
      5,
      0,
      "",
      feePercentPacked,
      true,
      false,
      true,
    );
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      1,
      1,
      0,
      2,
      0,
      "",
      feePercentPacked,
      true,
      true,
      false,
    );
  });
  it("BAL-WETH native ETH pool givenIn - with fee from toToken with PS", async function () {
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      0,
      0,
      1,
      10,
      100,
      "",
      0,
      true,
      false,
      true,
    );
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      0,
      1,
      0,
      1,
      100,
      "",
      0,
      true,
      true,
      false,
    );
  });
  it("BAL-WETH native ETH pool givenOut - with fee from toToken with PS", async function () {
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      1,
      0,
      1,
      10,
      100,
      "",
      0,
      true,
      false,
      true,
    );
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      1,
      1,
      0,
      1,
      100,
      "",
      0,
      true,
      true,
      false,
    );
  });
  it("BAL-WETH native ETH pool givenIn - with fee from fromToken with PS", async function () {
    // feePercent packed structure, basis points 100, take fee from fromToken
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(14))
      .add(ethers.BigNumber.from(2).pow(15))
      .add(100);
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      0,
      0,
      1,
      10,
      100,
      "from",
      feePercentPacked,
      true,
      false,
      true,
    );
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      0,
      1,
      0,
      10,
      100,
      "from",
      feePercentPacked,
      true,
      true,
      false,
    );
  });
  it("BAL-WETH native ETH pool givenOut - with fee from fromToken with PS", async function () {
    // feePercent packed structure, basis points 100, take fee from fromToken
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(14))
      .add(ethers.BigNumber.from(2).pow(15))
      .add(100);
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      1,
      0,
      1,
      10,
      100,
      "from",
      feePercentPacked,
      true,
      false,
      true,
    );
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      1,
      1,
      0,
      10,
      100,
      "from",
      feePercentPacked,
      true,
      true,
      false,
    );
  });
  it("BAL-WETH pool givenIn - no fee no PS", async function () {
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      0,
      0,
      1,
      10,
      0,
      "",
      0,
      false,
      false,
      false,
    );
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      0,
      1,
      0,
      1,
      0,
      "",
      0,
      false,
      false,
      false,
    );
  });
  it("BAL-WETH pool givenOut - no fee no PS", async function () {
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      1,
      0,
      1,
      10,
      0,
      "",
      0,
      false,
      false,
      false,
    );
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      1,
      1,
      0,
      1,
      0,
      "",
      0,
      false,
      false,
      false,
    );
  });
  it("BAL-WETH pool givenIn - with fee from toToken no PS", async function () {
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      0,
      0,
      1,
      10,
      100,
      "",
      0,
      false,
      false,
      false,
    );
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      0,
      1,
      0,
      1,
      100,
      "",
      0,
      false,
      false,
      false,
    );
  });
  it("BAL-WETH pool givenOut - with fee from toToken no PS", async function () {
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      1,
      0,
      1,
      10,
      100,
      "",
      0,
      false,
      false,
      false,
    );
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      1,
      1,
      0,
      1,
      100,
      "",
      0,
      false,
      false,
      false,
    );
  });
  it("BAL-WETH pool givenIn - with fee from fromToken no PS", async function () {
    // feePercent packed structure, basis points 100, take fee from fromToken
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(14))
      .add(ethers.BigNumber.from(2).pow(15))
      .add(100);
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      0,
      0,
      1,
      10,
      100,
      "from",
      feePercentPacked,
      false,
      false,
      false,
    );
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      0,
      1,
      0,
      10,
      100,
      "from",
      feePercentPacked,
      false,
      false,
      false,
    );
  });
  it("BAL-WETH pool givenOut - with fee from fromToken no PS", async function () {
    // feePercent packed structure, basis points 100, take fee from fromToken
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(14))
      .add(ethers.BigNumber.from(2).pow(15))
      .add(100);
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      1,
      0,
      1,
      10,
      100,
      "from",
      feePercentPacked,
      false,
      false,
      false,
    );
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      1,
      1,
      0,
      10,
      100,
      "from",
      feePercentPacked,
      false,
      false,
      false,
    );
  });
  it("BAL-WETH pool givenIn - no fee with PS", async function () {
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(16))
      .add(ethers.BigNumber.from(5000));
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      0,
      0,
      1,
      6,
      0,
      "",
      feePercentPacked,
      true,
      false,
      false,
    );
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      0,
      1,
      0,
      6,
      0,
      "",
      feePercentPacked,
      true,
      false,
      false,
    );
  });
  it("BAL-WETH pool givenOut - no fee with PS", async function () {
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(16))
      .add(ethers.BigNumber.from(5000));
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      1,
      0,
      1,
      6,
      0,
      "",
      feePercentPacked,
      true,
      false,
      false,
    );
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      1,
      1,
      0,
      6,
      0,
      "",
      feePercentPacked,
      true,
      false,
      false,
    );
  });
  it("BAL-WETH pool givenIn - with fee from toToken with PS", async function () {
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      0,
      0,
      1,
      10,
      100,
      "",
      0,
      true,
      false,
      false,
    );
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      0,
      1,
      0,
      1,
      100,
      "",
      0,
      true,
      false,
      false,
    );
  });
  it("BAL-WETH pool givenOut - with fee from toToken with PS", async function () {
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      1,
      0,
      1,
      1,
      100,
      "",
      0,
      true,
      false,
      false,
    );
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      1,
      1,
      0,
      1,
      100,
      "",
      0,
      true,
      false,
      false,
    );
  });
  it("BAL-WETH pool givenIn - with fee from fromToken with PS", async function () {
    // feePercent packed structure, basis points 100, take fee from fromToken
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(14))
      .add(ethers.BigNumber.from(2).pow(15))
      .add(100);
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      0,
      0,
      1,
      10,
      100,
      "from",
      feePercentPacked,
      true,
      false,
      false,
    );
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      0,
      1,
      0,
      10,
      100,
      "from",
      feePercentPacked,
      true,
      false,
      false,
    );
  });
  it("BAL-WETH pool givenOut - with fee from fromToken with PS", async function () {
    // feePercent packed structure, basis points 100, take fee from fromToken
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(14))
      .add(ethers.BigNumber.from(2).pow(15))
      .add(100);
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      1,
      0,
      1,
      1,
      100,
      "from",
      feePercentPacked,
      true,
      false,
      false,
    );
    await swapBalV2(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      1,
      1,
      0,
      1,
      100,
      "from",
      feePercentPacked,
      true,
      false,
      false,
    );
  });
  it("BAL-WETH-OHM multihop givenIn - no fee no PS", async function () {
    await swapBalV2MultiHop(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      BALV2_OHM_WETH_ID,
      0,
      0,
      1,
      1,
      2,
      1,
      0,
    );
    await swapBalV2MultiHop(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      BALV2_OHM_WETH_ID,
      0,
      2,
      1,
      1,
      0,
      1,
      0,
    );
  });
  it("BAL-WETH-OHM multihop givenOut - no fee no PS", async function () {
    await swapBalV2MultiHop(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_OHM_WETH_ID,
      BALV2_BAL_WETH_ID,
      1,
      1,
      2,
      0,
      1,
      1,
      0,
    );
    await swapBalV2MultiHop(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      BALV2_OHM_WETH_ID,
      1,
      1,
      2,
      0,
      1,
      1,
      0,
    );
  });
  it("BAL-WETH-OHM multihop givenIn - with fee from toToken no PS", async function () {
    await swapBalV2MultiHop(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      BALV2_OHM_WETH_ID,
      0,
      0,
      1,
      1,
      2,
      1,
      100,
    );
    await swapBalV2MultiHop(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      BALV2_OHM_WETH_ID,
      0,
      2,
      1,
      1,
      0,
      1,
      100,
    );
  });
  it("BAL-WETH-OHM multihop givenOut - with fee from toToken no PS", async function () {
    await swapBalV2MultiHop(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_OHM_WETH_ID,
      BALV2_BAL_WETH_ID,
      1,
      1,
      2,
      0,
      1,
      1,
      100,
    );
    await swapBalV2MultiHop(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      BALV2_OHM_WETH_ID,
      1,
      1,
      2,
      0,
      1,
      1,
      100,
    );
  });
  it("BAL-WETH-OHM multihop givenIn - with fee from fromToken no PS", async function () {
    // feePercent packed structure, basis points 100, take fee from fromToken
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(14))
      .add(ethers.BigNumber.from(2).pow(15))
      .add(100);
    await swapBalV2MultiHop(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      BALV2_OHM_WETH_ID,
      0,
      0,
      1,
      1,
      2,
      1,
      100,
      "from",
      feePercentPacked,
    );
    await swapBalV2MultiHop(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      BALV2_OHM_WETH_ID,
      0,
      2,
      1,
      1,
      0,
      1,
      100,
      "from",
      feePercentPacked,
    );
  });
  it("BAL-WETH-OHM multihop givenOut - with fee from fromToken no PS", async function () {
    // feePercent packed structure, basis points 100, take fee from fromToken
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(14))
      .add(ethers.BigNumber.from(2).pow(15))
      .add(100);
    await swapBalV2MultiHop(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_OHM_WETH_ID,
      BALV2_BAL_WETH_ID,
      1,
      1,
      2,
      0,
      1,
      1,
      100,
      "from",
      feePercentPacked,
    );
    await swapBalV2MultiHop(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      BALV2_OHM_WETH_ID,
      1,
      1,
      2,
      0,
      1,
      1,
      100,
      "from",
      feePercentPacked,
    );
  });
  it("BAL-WETH-OHM multihop givenIn - no fee with PS", async function () {
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(16))
      .add(ethers.BigNumber.from(5000));
    await swapBalV2MultiHop(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      BALV2_OHM_WETH_ID,
      0,
      0,
      1,
      1,
      2,
      6,
      0,
      "",
      feePercentPacked,
      true,
      false,
      false,
    );
    await swapBalV2MultiHop(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      BALV2_OHM_WETH_ID,
      0,
      2,
      1,
      1,
      0,
      3,
      0,
      "",
      feePercentPacked,
      true,
      false,
      false,
    );
  });
  it("BAL-WETH-OHM multihop givenOut - no fee with PS", async function () {
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(16))
      .add(ethers.BigNumber.from(5000));
    await swapBalV2MultiHop(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_OHM_WETH_ID,
      BALV2_BAL_WETH_ID,
      1,
      1,
      2,
      0,
      1,
      20,
      0,
      "",
      feePercentPacked,
      true,
      false,
      false,
    );
    await swapBalV2MultiHop(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      BALV2_OHM_WETH_ID,
      1,
      1,
      2,
      0,
      1,
      20,
      0,
      "",
      feePercentPacked,
      true,
      false,
      false,
    );
  });
  it("BAL-WETH-OHM multihop givenIn - with fee from toToken with PS", async function () {
    await swapBalV2MultiHop(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      BALV2_OHM_WETH_ID,
      0,
      0,
      1,
      1,
      2,
      1,
      100,
      "",
      0,
      true,
    );
    await swapBalV2MultiHop(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      BALV2_OHM_WETH_ID,
      0,
      2,
      1,
      1,
      0,
      1,
      100,
      "",
      0,
      true,
    );
  });
  it("BAL-WETH-OHM multihop givenOut - with fee from toToken with PS", async function () {
    await swapBalV2MultiHop(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_OHM_WETH_ID,
      BALV2_BAL_WETH_ID,
      1,
      1,
      2,
      0,
      1,
      1,
      100,
      "",
      0,
      true,
    );
    await swapBalV2MultiHop(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      BALV2_OHM_WETH_ID,
      1,
      1,
      2,
      0,
      1,
      1,
      100,
      "",
      0,
      true,
    );
  });
  it("BAL-WETH-OHM multihop givenIn - with fee from fromToken with PS", async function () {
    // feePercent packed structure, basis points 100, take fee from fromToken
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(14))
      .add(ethers.BigNumber.from(2).pow(15))
      .add(100);
    await swapBalV2MultiHop(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      BALV2_OHM_WETH_ID,
      0,
      0,
      1,
      1,
      2,
      1,
      100,
      "from",
      feePercentPacked,
      true,
    );
    await swapBalV2MultiHop(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      BALV2_OHM_WETH_ID,
      0,
      2,
      1,
      1,
      0,
      1,
      100,
      "from",
      feePercentPacked,
      true,
    );
  });
  it("BAL-WETH-OHM multihop givenOut - with fee from fromToken with PS", async function () {
    // feePercent packed structure, basis points 100, take fee from fromToken
    const feePercentPacked = ethers.BigNumber.from(2)
      .pow(248)
      .add(ethers.BigNumber.from(2).pow(14))
      .add(ethers.BigNumber.from(2).pow(15))
      .add(100);
    await swapBalV2MultiHop(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_OHM_WETH_ID,
      BALV2_BAL_WETH_ID,
      1,
      1,
      2,
      0,
      1,
      1,
      100,
      "from",
      feePercentPacked,
      true,
    );
    await swapBalV2MultiHop(
      augustusSwapper,
      directSwap,
      deployer.address,
      "0x28C6c06298d514Db089934071355E5743bf21d60",
      BALV2_BAL_WETH_ID,
      BALV2_OHM_WETH_ID,
      1,
      1,
      2,
      0,
      1,
      1,
      100,
      "from",
      feePercentPacked,
      true,
    );
  });
});
