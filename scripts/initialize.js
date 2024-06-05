const Web3 = require("web3");
var Tx = require("ethereumjs-tx");
var util = require("ethereumjs-util");
const web3Coder = require("web3-eth-abi");

var p = "https://eth-mainnet.alchemyapi.io/v2/<your_token>";

var web3 = new Web3(new Web3.providers.HttpProvider(p));
require("dotenv").config(); // Store environment-specific variable from '.env' to process.env

const augustusABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "adapter",
        type: "address",
      },
    ],
    name: "AdapterInitialized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "initiator",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "beneficiary",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "srcToken",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "destToken",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "srcAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "receivedAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "referrer",
        type: "string",
      },
    ],
    name: "Bought",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "fee",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "partnerShare",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "paraswapShare",
        type: "uint256",
      },
    ],
    name: "FeeTaken",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "initiator",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "beneficiary",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "srcToken",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "destToken",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "srcAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "receivedAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "expectedAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "referrer",
        type: "string",
      },
    ],
    name: "Swapped",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "key",
        type: "bytes32",
      },
    ],
    name: "getData",
    outputs: [
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTokenTransferProxy",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "key",
        type: "bytes32",
      },
    ],
    name: "isInitialized",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "address payable",
        name: "destination",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transferTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
  {
    inputs: [],
    name: "getTimeLock",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "whitelist",
        type: "address",
      },
      {
        internalType: "address",
        name: "reduxToken",
        type: "address",
      },
      {
        internalType: "address",
        name: "partnerRegistry",
        type: "address",
      },
      {
        internalType: "address payable",
        name: "feeWallet",
        type: "address",
      },
      {
        internalType: "address",
        name: "uniswapProxy",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "timelock",
        type: "uint256",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "adapter",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "initializeAdapter",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getPendingUniswapProxy",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getChangeRequestedBlock",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getUniswapProxy",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getVersion",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPartnerRegistry",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getWhitelistAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getFeeWallet",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "uniswapProxy",
        type: "address",
      },
    ],
    name: "changeUniswapProxy",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "confirmUniswapProxyChange",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address payable",
        name: "feeWallet",
        type: "address",
      },
    ],
    name: "setFeeWallet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "partnerRegistry",
        type: "address",
      },
    ],
    name: "setPartnerRegistry",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "whitelisted",
        type: "address",
      },
    ],
    name: "setWhitelistAddress",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amountIn",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amountOutMin",
        type: "uint256",
      },
      {
        internalType: "address[]",
        name: "path",
        type: "address[]",
      },
      {
        internalType: "uint8",
        name: "referrer",
        type: "uint8",
      },
    ],
    name: "swapOnUniswap",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amountInMax",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amountOut",
        type: "uint256",
      },
      {
        internalType: "address[]",
        name: "path",
        type: "address[]",
      },
      {
        internalType: "uint8",
        name: "referrer",
        type: "uint8",
      },
    ],
    name: "buyOnUniswap",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "factory",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "initCode",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "amountInMax",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amountOut",
        type: "uint256",
      },
      {
        internalType: "address[]",
        name: "path",
        type: "address[]",
      },
      {
        internalType: "uint8",
        name: "referrer",
        type: "uint8",
      },
    ],
    name: "buyOnUniswapFork",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "factory",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "initCode",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "amountIn",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amountOutMin",
        type: "uint256",
      },
      {
        internalType: "address[]",
        name: "path",
        type: "address[]",
      },
      {
        internalType: "uint8",
        name: "referrer",
        type: "uint8",
      },
    ],
    name: "swapOnUniswapFork",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "fromToken",
        type: "address",
      },
      {
        internalType: "address",
        name: "toToken",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "fromAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "toAmount",
        type: "uint256",
      },
      {
        internalType: "address[]",
        name: "callees",
        type: "address[]",
      },
      {
        internalType: "bytes",
        name: "exchangeData",
        type: "bytes",
      },
      {
        internalType: "uint256[]",
        name: "startIndexes",
        type: "uint256[]",
      },
      {
        internalType: "uint256[]",
        name: "values",
        type: "uint256[]",
      },
      {
        internalType: "address payable",
        name: "beneficiary",
        type: "address",
      },
      {
        internalType: "string",
        name: "referrer",
        type: "string",
      },
      {
        internalType: "bool",
        name: "useReduxToken",
        type: "bool",
      },
    ],
    name: "simplBuy",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "fromToken",
        type: "address",
      },
      {
        internalType: "address",
        name: "toToken",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "fromAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "toAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "expectedAmount",
        type: "uint256",
      },
      {
        internalType: "address[]",
        name: "callees",
        type: "address[]",
      },
      {
        internalType: "bytes",
        name: "exchangeData",
        type: "bytes",
      },
      {
        internalType: "uint256[]",
        name: "startIndexes",
        type: "uint256[]",
      },
      {
        internalType: "uint256[]",
        name: "values",
        type: "uint256[]",
      },
      {
        internalType: "address payable",
        name: "beneficiary",
        type: "address",
      },
      {
        internalType: "string",
        name: "referrer",
        type: "string",
      },
      {
        internalType: "bool",
        name: "useReduxToken",
        type: "bool",
      },
    ],
    name: "simpleSwap",
    outputs: [
      {
        internalType: "uint256",
        name: "receivedAmount",
        type: "uint256",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IWETH",
        name: "token",
        type: "address",
      },
    ],
    name: "withdrawAllWETH",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "fromToken",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "fromAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "toAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "expectedAmount",
            type: "uint256",
          },
          {
            internalType: "address payable",
            name: "beneficiary",
            type: "address",
          },
          {
            internalType: "string",
            name: "referrer",
            type: "string",
          },
          {
            internalType: "bool",
            name: "useReduxToken",
            type: "bool",
          },
          {
            components: [
              {
                internalType: "address",
                name: "to",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "totalNetworkFee",
                type: "uint256",
              },
              {
                components: [
                  {
                    internalType: "address payable",
                    name: "exchange",
                    type: "address",
                  },
                  {
                    internalType: "address",
                    name: "targetExchange",
                    type: "address",
                  },
                  {
                    internalType: "uint256",
                    name: "percent",
                    type: "uint256",
                  },
                  {
                    internalType: "bytes",
                    name: "payload",
                    type: "bytes",
                  },
                  {
                    internalType: "uint256",
                    name: "networkFee",
                    type: "uint256",
                  },
                ],
                internalType: "struct Utils.Route[]",
                name: "routes",
                type: "tuple[]",
              },
            ],
            internalType: "struct Utils.Path[]",
            name: "path",
            type: "tuple[]",
          },
        ],
        internalType: "struct Utils.SellData",
        name: "data",
        type: "tuple",
      },
    ],
    name: "multiSwap",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "fromToken",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "fromAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "toAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "expectedAmount",
            type: "uint256",
          },
          {
            internalType: "address payable",
            name: "beneficiary",
            type: "address",
          },
          {
            internalType: "string",
            name: "referrer",
            type: "string",
          },
          {
            internalType: "bool",
            name: "useReduxToken",
            type: "bool",
          },
          {
            components: [
              {
                internalType: "uint256",
                name: "fromAmountPercent",
                type: "uint256",
              },
              {
                components: [
                  {
                    internalType: "address",
                    name: "to",
                    type: "address",
                  },
                  {
                    internalType: "uint256",
                    name: "totalNetworkFee",
                    type: "uint256",
                  },
                  {
                    components: [
                      {
                        internalType: "address payable",
                        name: "exchange",
                        type: "address",
                      },
                      {
                        internalType: "address",
                        name: "targetExchange",
                        type: "address",
                      },
                      {
                        internalType: "uint256",
                        name: "percent",
                        type: "uint256",
                      },
                      {
                        internalType: "bytes",
                        name: "payload",
                        type: "bytes",
                      },
                      {
                        internalType: "uint256",
                        name: "networkFee",
                        type: "uint256",
                      },
                    ],
                    internalType: "struct Utils.Route[]",
                    name: "routes",
                    type: "tuple[]",
                  },
                ],
                internalType: "struct Utils.Path[]",
                name: "path",
                type: "tuple[]",
              },
            ],
            internalType: "struct Utils.MegaSwapPath[]",
            name: "path",
            type: "tuple[]",
          },
        ],
        internalType: "struct Utils.MegaSwapSellData",
        name: "data",
        type: "tuple",
      },
    ],
    name: "megaSwap",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "fromToken",
            type: "address",
          },
          {
            internalType: "address",
            name: "toToken",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "fromAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "toAmount",
            type: "uint256",
          },
          {
            internalType: "address payable",
            name: "beneficiary",
            type: "address",
          },
          {
            internalType: "string",
            name: "referrer",
            type: "string",
          },
          {
            internalType: "bool",
            name: "useReduxToken",
            type: "bool",
          },
          {
            components: [
              {
                internalType: "address payable",
                name: "exchange",
                type: "address",
              },
              {
                internalType: "address",
                name: "targetExchange",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "fromAmount",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "toAmount",
                type: "uint256",
              },
              {
                internalType: "bytes",
                name: "payload",
                type: "bytes",
              },
              {
                internalType: "uint256",
                name: "networkFee",
                type: "uint256",
              },
            ],
            internalType: "struct Utils.BuyRoute[]",
            name: "route",
            type: "tuple[]",
          },
        ],
        internalType: "struct Utils.BuyData",
        name: "data",
        type: "tuple",
      },
    ],
    name: "buy",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
];

const augustusAddress = "0x1bd435f3c054b6e901b7b108a0ab7617c808677b";

var adapters = [];

var privateKey = process.env.PK;

const augustusContract = new web3.eth.Contract(augustusABI, augustusAddress);

const AAVE_AFFILIATE_CODE = 1;
const AAVE_SPENDER = "0x3dfd23a6c5e8bbcfc9581d2e864a68feb6a076d3";

const FACTORY = "0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95";

const LENDING_POOL = "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9";
const WETH_GATEWAY = "0xDcD33426BA191383f1c9B431A342498fdac73488";

const CETH_ADDRESS = process.env.CETH_ADDRESS || "0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5";

const CURVE_COMPOUND = process.env.CURVE_COMPOUND || "0xA2B47E3D5c44877cca798226B7B8118F9BFb7A56";
const DAI = process.env.DAI || "0x6b175474e89094c44da98b954eedeac495271d0f";
const USDC = process.env.USDC || "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const cDAI = process.env.CDAI || "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643";
const cUSDC = process.env.CUSDC || "0x39aa39c021dfbae8fac545936693ac917d5e7563";

const KYBER_FEE_WALLET = process.env.KYBER_FEE_WALLET || "0x7f0aF2BDfCCBfDB0704DcC155F4a9453D2097289";
const KYBER_PLATFORM_FEE_BPS = process.env.KYBER_PLATFORM_FEE_BPS || 0;
const KYBER_PROXY = process.env.KYBER_PROXY || "0x9AAb3f75489902f3a48495025729a0AF77d4b11e";
const KYBER_HINT = process.env.KYBER_HINT || "0xa1c0fa73c39cfbcc11ec9eb1afc665aba9996e2c";
const BRIGED_RESERVES = [
  "0xbb4f617369730000000000000000000000000000000000000000000000000000", //OASIS
  "0xbb756e6973776170563100000000000000000000000000000000000000000000", //UNISWAP
  "0xbb756e6973776170563200000000000000000000000000000000000000000000", //UNISWAPV2
  "0xbb42414e434f5230305632000000000000000000000000000000000000000000", //BANCOR
];

const REGISTRY = process.env.BANCOR_REGISTRY || "0x52Ae12ABe5D8BD778BD5397F99cA900624CfADD4";
const PATH_FINDER = process.env_BANCOR_PATHFINDER || "0x6F0cD8C4f6F06eAB664C7E3031909452b4B72861";
const ETHER_TOKEN = process.env.BANCOR_ETHER_TOKEN || "0xc0829421C1d260BD3cB3E0F06cfE2D52db2cE315";

const ZRX_ERC20_PROXY = process.env.ZRX_ERC20_PROXY || "0x95e6f48254609a6ee006f7d493c8e5fb97094cef";

const ZRX_V2_WHITELISTED_MM = [
  "0x56178a0d5f301baf6cf3e1cd53d9863437345bf9",
  "0xAB4f75DDc6fEffbf25Ef95361170780e37C5726b",
  "0x919CbB0be55ba996A567107EA13f417Be74e477A",
  "0x61aDaF40A389761BacF76dFcCf682e9200989894",
  "0x912C43E04Bc77d5D64E234d92821b6BB52666F2C",
];

const BALANCER_REGISTRY = process.env.BALANCER_REGISTRY || "0x56B63acAc8bEe02F71BAb31ad3bfce3a77DE666A";

const initializeAdapters = async () => {
  var privateKeyBuffered = new Buffer(privateKey, "hex");
  var sender = util.privateToAddress(privateKeyBuffered);
  sender = "0x" + sender.toString("hex");

  for (var i = 0; i < adapters.length; i++) {
    var initData = generateInitData(i);
    var data = augustusContract.methods.initializeAdapter(adapters[i], initData).encodeABI();
    var gasLimit = 20000000;

    var nonce = await web3.eth.getTransactionCount(sender);

    var rawTx = {
      nonce: web3.utils.toHex(nonce),
      gasLimit: web3.utils.toHex(gasLimit),
      gasPrice: web3.utils.toHex("1000000000"),
      to: converterAddress,
      value: "0x00",
      data: data,
    };

    var tx = new Tx(rawTx);
    tx.sign(privateKeyBuffered);

    var serializedTx = tx.serialize();

    var tx = await web3.eth.sendSignedTransaction("0x" + serializedTx.toString("hex"));
  }
};

const generateInitData = i => {
  var data;
  switch (i) {
    case 0: //aave
      data = web3Coder.encodeParameter(
        {
          ParentStruct: {
            refCode: "uint16",
            spender: "address",
          },
        },
        {
          refCode: AAVE_AFFILIATE_CODE,
          spender: AAVE_SPENDER,
        },
      );
      break;
    case 1: //Uniswap
      data = web3Coder.encodeParameter(
        {
          ParentStruct: {
            factory: "address",
          },
        },
        {
          factory: FACTORY,
        },
      );
      break;

    case 2: //aave2
      data = web3Coder.encodeParameter(
        {
          ParentStruct: {
            refCode: "uint16",
            lendingPool: "address",
            wethGateway: "address",
          },
        },
        {
          refCode: AAVE_AFFILIATE_CODE,
          lendingPool: LENDING_POOL,
          wethGateway: WETH_GATEWAY,
        },
      );
      break;

    case 3: //COMPOUND
      data = web3Coder.encodeParameter(
        {
          ParentStruct: {
            ceth: "address",
          },
        },
        {
          ceth: CETH_ADDRESS,
        },
      );
      break;
    case 4: //CURVE
      data = web3Coder.encodeParameter(
        {
          ParentStruct: {
            dai: "address",
            usdc: "address",
            cDAI: "address",
            cUSDC: "address",
            curveCompoundExchange: "address",
          },
        },
        {
          dai: DAI,
          usdc: USDC,
          cDAI: cDAI,
          cUSDC: cUSDC,
          curveCompoundExchange: CURVE_COMPOUND,
        },
      );
      break;
    case 5: //KYBER
      data = web3Coder.encodeParameter(
        {
          ParentStruct: {
            feeWallet: "address",
            platformFeeBps: "uint256",
            kyberProxy: "address",
            kyberHint: "address",
            brigedReserves: "bytes32[]",
          },
        },
        {
          feeWallet: KYBER_FEE_WALLET,
          platformFeeBps: KYBER_PLATFORM_FEE_BPS,
          kyberProxy: KYBER_PROXY,
          kyberHint: KYBER_HINT,
          brigedReserves: BRIGED_RESERVES,
        },
      );
      break;
    case 6: //BANCOR
      data = web3Coder.encodeParameter(
        {
          ParentStruct: {
            affiliateAccount: "address",
            affiliateCode: "uint256",
            etherToken: "address",
            contractRegistry: "address",
            pathFinder: "address",
          },
        },
        {
          affiliateAccount: "0x0000000000000000000000000000000000000000",
          affiliateCode: 0,
          etherToken: ETHER_TOKEN,
          contractRegistry: REGISTRY,
          pathFinder: PATH_FINDER,
        },
      );
      break;
    case 7: //ZEROXV2
      data = web3Coder.encodeParameter(
        {
          ParentStruct: {
            erc20Proxy: "address",
            makerWhitelist: "address[]",
          },
        },
        {
          erc20Proxy: ZRX_ERC20_PROXY,
          makerWhitelist: ZRX_V2_WHITELISTED_MM,
        },
      );
      break;
    case 8: //ZER0XV3
      data = web3Coder.encodeParameter(
        {
          ParentStruct: {
            erc20Proxy: "address",
          },
        },
        {
          erc20Proxy: ZRX_ERC20_PROXY,
        },
      );
      break;
    case 9: //BALANCER
      data = web3Coder.encodeParameter(
        {
          ParentStruct: {
            balancerRegistry: "address",
          },
        },
        {
          balancerRegistry: BALANCER_REGISTRY,
        },
      );
      break;
    default:
      break;
  }

  return data;
};

var data = generateInitData(9);
console.log(data);
