import { ethers, artifacts } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signers";
import { Artifact } from "hardhat/types";
import BN from "bignumber.js";
import type { Signers } from "./types";
import { getSwap } from "./sor";
import { buildSellTransaction, getPath, setupAdapters } from "./helper";
import { AugustusSwapper } from "../src/types/AugustusSwapper";
import { MultiPath, SellDataStruct } from "../src/types/MultiPath";
import { SwapTypes } from "@balancer-labs/sor";
import { JsonRpcProvider } from "@ethersproject/providers";
import { ADDRESSES } from "./constants";
const deadline = "1111111111111111122222222222222";
const ethAddress = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

const approveTokenProxy = async function (
  token: string,
  amount: string,
  signer: SignerWithAddress,
  tokenTransferProxy: string,
) {
  if (token !== ethAddress) {
    const ITokenArtifact: Artifact = await artifacts.readArtifact("IToken");
    const tokenContract = new ethers.Contract(token, ITokenArtifact.abi, signer);
    await tokenContract.approve(tokenTransferProxy, amount);
  }
};

const executeSwap = async (
  data: SellDataStruct,
  signer: SignerWithAddress,
  value: string,
  multipathContract: MultiPath,
) => {
  await multipathContract.connect(signer).multiSwap(data, {
    value: value,
  });
  /**const resu = await this.MultiPath.interface.encodeFunctionData(
          "multiSwap",
          [data]
        );*/
};

const getTokenBalance = async function (token: string, signer: SignerWithAddress): Promise<BN> {
  let balance;
  if (token === ethAddress) {
    balance = new BN(await (await ethers.provider.getBalance(signer.address)).toString());
  } else {
    const ITokenArtifact: Artifact = await artifacts.readArtifact("IToken");
    const tokenContract = new ethers.Contract(token, ITokenArtifact.abi, signer);
    balance = new BN(await tokenContract.balanceOf(signer.address));
  }
  return balance;
};

const executeOnUniswap = async (
  toToken: string,
  srcAmount: string,
  signer: SignerWithAddress,
  multipathContract: MultiPath,
): Promise<void> => {
  const fromToken = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

  const priceRoute = [
    {
      adapter: "Adapter01",
      percent: "100",
      data: {
        tokenFrom: fromToken,
        tokenTo: toToken,
      },
      route: [
        {
          index: "0",
          percent: "100",
          data: {
            path: ["0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", toToken],
          },
        },
      ],
    },
  ];

  const path = await getPath(fromToken, toToken, priceRoute, "0");
  const data = buildSellTransaction(
    fromToken,
    srcAmount,
    "1",
    "1",
    ethers.constants.AddressZero,
    path,
    ethers.constants.AddressZero,
    "0",
    "0x",
    deadline,
    "0x",
  );
  await executeSwap(data, signer, srcAmount, multipathContract);
};

const executeOnUniswapFork = async function (
  fromToken: string,
  toToken: string,
  srcAmount: string,
  signer: SignerWithAddress,
  _path: string,
  fee: string,
  feeFactor: string,
  factory: string,
  initCode: string,
  value: string,
  multipathContract: MultiPath,
) {
  const priceRoute = [
    {
      adapter: "Adapter01",
      percent: "100",
      data: {
        tokenFrom: fromToken,
        tokenTo: toToken,
      },
      route: [
        {
          index: "4",
          percent: "100",
          data: {
            _path,
            fee,
            feeFactor,
            factory,
            initCode,
          },
        },
      ],
    },
  ];

  const path = await getPath(fromToken, toToken, priceRoute, 0);
  const data = buildSellTransaction(
    fromToken,
    srcAmount,
    1,
    1,
    ethers.constants.AddressZero,
    path,
    ethers.constants.AddressZero,
    0,
    "0x",
    deadline,
    "0x",
  );
  await executeSwap(data, signer, value, multipathContract);
};

const executeOnCurve = async function (
  fromToken: string,
  toToken: string,
  srcAmount: string,
  signer: SignerWithAddress,
  srcSym: string,
  destSym: string,
  targetExchange: string,
  tokenTransferProxy: string,
  multipathContract: MultiPath,
) {
  srcAmount = ethers.utils.parseEther(srcAmount).toString();
  await approveTokenProxy(fromToken, srcAmount, signer, tokenTransferProxy);

  const priceRoute = [
    {
      adapter: "Adapter01",
      percent: "100",
      data: {
        tokenFrom: fromToken,
        tokenTo: toToken,
      },
      route: [
        {
          index: "3",
          percent: "100",
          data: {
            tokenFrom: fromToken,
            tokenTo: toToken,
            srcSymbol: srcSym,
            destSymbol: destSym,
            exchange: targetExchange,
            deadline: deadline,
          },
        },
      ],
    },
  ];

  const path = await getPath(fromToken, toToken, priceRoute, "0");
  const data = buildSellTransaction(
    fromToken,
    srcAmount,
    "1",
    "1",
    ethers.constants.AddressZero,
    path,
    ethers.constants.AddressZero,
    "0",
    "0x",
    deadline,
    "0x",
  );

  await executeSwap(data, signer, "0", multipathContract);
};

const executeOnBalancer = async function (
  fromToken: string,
  toToken: string,
  srcAmount: string,
  signer: SignerWithAddress,
  value: string,
  tokenTransferProxy: string,
  multipathContract: MultiPath,
) {
  const amount = ethers.utils.parseEther(srcAmount.toString());
  await approveTokenProxy(fromToken, amount.toString(), signer, tokenTransferProxy);
  const poolsSource = "https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-v2";
  const swaps = await getSwap(
    ethers.providers.getDefaultProvider() as JsonRpcProvider,
    (
      await ethers.provider.getNetwork()
    ).chainId,
    poolsSource,
    true,
    ADDRESSES[fromToken],
    ADDRESSES[toToken],
    SwapTypes.SwapExactIn,
    value,
  );
  const priceRoute = [
    {
      adapter: "Adapter01",
      percent: "100",
      data: {
        tokenFrom: fromToken,
        tokenTo: toToken,
      },
      route: [
        {
          index: "5",
          percent: "100",
          data: {
            tokenFrom: fromToken,
            tokenTo: toToken,
            swaps: swaps,
          },
        },
      ],
    },
  ];

  const path = await getPath(fromToken, toToken, priceRoute, "0");
  const data = buildSellTransaction(
    fromToken,
    amount,
    1,
    1,
    ethers.constants.AddressZero,
    path,
    ethers.constants.AddressZero,
    0,
    "0x",
    deadline,
    "0x",
  );

  await executeSwap(data, signer, value, multipathContract);
};

const executeOnAave = async function (
  fromToken: string,
  toToken: string,
  srcAmount: string,
  aToken: string,
  value: string,
  signer: SignerWithAddress,
  tokenTransferProxy: string,
  multipathContract: MultiPath,
) {
  const amount = ethers.utils.parseEther(srcAmount);
  await approveTokenProxy(fromToken, amount.toString(), signer, tokenTransferProxy);

  const priceRoute = [
    {
      adapter: "Adapter01",
      percent: "100",
      data: {
        tokenFrom: fromToken,
        tokenTo: toToken,
      },
      route: [
        {
          index: "6",
          percent: "100",
          data: {
            tokenFrom: fromToken,
            tokenTo: toToken,
            aToken: aToken,
          },
        },
      ],
    },
  ];

  const path = getPath(fromToken, toToken, priceRoute, "0");

  const data = buildSellTransaction(
    fromToken,
    amount,
    1,
    1,
    ethers.constants.AddressZero,
    path,
    ethers.constants.AddressZero,
    0,
    "0x",
    deadline,
    "0x",
  );

  await executeSwap(data, signer, value, multipathContract);
};

describe("Augustus Swapper Contract- Multipath- Adapter 01", async function () {
  before(async function () {
    this.signers = {} as Signers;
    this.AugustusSwapper = <AugustusSwapper>await ethers.getContract("AugustusSwapper");
    this.signers.main = <SignerWithAddress>await ethers.getNamedSigner("main");
    const multiPathArtifact: Artifact = await artifacts.readArtifact("MultiPath");
    this.MultiPath = <MultiPath>(
      new ethers.Contract(this.AugustusSwapper.address, multiPathArtifact.abi, this.signers.main)
    );
    this.tokenTransferProxy = await this.AugustusSwapper.getTokenTransferProxy();
    await setupAdapters();
  });

  it("Execute swap on aave token->aToken", async function () {
    const fromToken = "0x6b175474e89094c44da98b954eedeac495271d0f"; //DAI
    const toToken = "0xfC1E690f61EFd961294b3e1Ce3313fBD8aa4f85d"; //aDAI
    await executeOnUniswap(fromToken, ethers.utils.parseEther("1").toString(), this.signers.main, this.MultiPath);
    const balance = await getTokenBalance(fromToken, this.signers.main);
    await executeOnAave(
      fromToken,
      toToken,
      ethers.utils.formatEther(balance.toString()).toString(),
      toToken,
      "0",
      this.signers.main,
      this.tokenTransferProxy,
      this.MultiPath,
    );
  });

  it("Execute swap on aave aToken->token", async function () {
    const fromToken = "0xfC1E690f61EFd961294b3e1Ce3313fBD8aa4f85d"; //aDAI
    const toToken = "0x6b175474e89094c44da98b954eedeac495271d0f"; //DAI
    await executeOnUniswap(fromToken, ethers.utils.parseEther("1").toString(), this.signers.main, this.MultiPath);
    const balance = await getTokenBalance(fromToken, this.signers.main);
    await executeOnAave(
      fromToken,
      toToken,
      ethers.utils.formatEther(balance.toString()).toString(),
      fromToken,
      "0",
      this.signers.main,
      this.tokenTransferProxy,
      this.MultiPath,
    );
  });

  /**it("Execute swap on uniswapV2", async()=>{
        const amount = web3.utils.toWei("0.1", "ether");
        const toToken = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
        await executeOnUniswap(toToken, amount, main)
    });
    it("Execute swap on curve", async() => {
      const fromToken = "0x6b175474e89094c44da98b954eedeac495271d0f";//DAI
      const toToken = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";//USDC
      await executeOnUniswap(fromToken, web3.utils.toWei("0.1", "ether"), main);
      const srcAmount = await getTokenBalance(fromToken, main);
      await executeOnCurve(
        fromToken,
        toToken,
        web3.utils.fromWei(srcAmount.toString(10), "ether"),
        main,
        "DAI",
        "USDC",
        "0xA2B47E3D5c44877cca798226B7B8118F9BFb7A56"
      );
    })
    it("Execute swap on Sushiswap", async() => {
        const amount = web3.utils.toWei("0.1", "ether");
        const fromToken = ethAddress;
        const toToken = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
        const path = [
          fromToken,
          toToken
        ];
        const fee = 997
        const feeFactor = 1000
        const factory = "0xc0aee478e3658e2610c5f7a4a2e1777ce9e4f2ac"
        const initCode = "0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303"
        await executeOnUniswapFork(
          fromToken,
          toToken,
          amount,
          main,
          path,
          fee,
          feeFactor,
          factory,
          initCode,
          amount
        );
    })
    it("Execute swap on balancer", async()=>{
      const fromToken = "0x6b175474e89094c44da98b954eedeac495271d0f";
      const toToken = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";//USDC
      await executeOnUniswap(fromToken, web3.utils.toWei("1", "ether"), main);
      const balance = await getTokenBalance(fromToken, main);
      await executeOnBalancer(
        fromToken,
        toToken,
        web3.utils.fromWei(balance.toString(10), "ether"),
        main,
        0
      );
  });*/
});
