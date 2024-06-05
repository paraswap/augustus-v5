import hre from "hardhat";
import web3Coder from "web3-eth-abi";
import axios from "axios";
import { BigNumberish } from "ethers";
import curvePools from "./curvePools.json";
import targetExchanges from "./targetExchanges.json";
import {
  AdapterExchangeType,
  curvePoolsType,
  curvePoolType,
  Deployments,
  PriceRouteType,
  RouteType,
  Tokens,
} from "./types";
import adapterExchanges from "./adapters.json";
import kyberStorageABI from "./kyberStorage.json";
import kyberHintABI from "./kyberHint.json";
import { PathStruct, SellDataStruct } from "../src/types/MultiPath";

const kyberStorageAddress = "0xC8fb12402cB16970F3C5F4b48Ff68Eb9D1289301";
const kyberHintAddress = "0xa1C0Fa73c39CFBcC11ec9Eb1Afc665aba9996E2C";

// const kyberStorage = new web3.eth.Contract(kyberStorageABI, kyberStorageAddress);
// const kyberHint = new web3.eth.Contract(kyberHintABI, kyberHintAddress);

const LENDING_DEXES = ["compound", "Fulcrum", "idle"];

const tokens = {} as Tokens;

const adapters = {} as Deployments;

export const setupAdapters = async () => {
  const adapter01 = await hre.deployments.get("Adapter01");
  //const adapter02 = await deployments.get('Adapter02');
  adapters["adapter01"] = adapter01;
  //adapters['adapter02'] = adapter02;
};

export const setupTokens = async () => {
  const tokensURL = `https://api.paraswap.io/v2/tokens/ps/1`;
  const { data } = await axios.get(tokensURL);
  if (data.tokens) {
    for (let i = 0; i < data.tokens.length; i++) {
      tokens[data.tokens[i]["address"].toLowerCase()] = data.tokens[i];
    }
  }
};

export const getToken = (address: string) => {
  return tokens[address.toLowerCase()];
};

const getCurvePool = (srcToken: string, destToken: string): curvePoolType | undefined => {
  const curvePoolsTyped = curvePools as curvePoolsType;
  const pool = Object.keys(curvePools).find(
    p =>
      (curvePoolsTyped[p].underlying.includes(srcToken) && curvePoolsTyped[p].underlying.includes(destToken)) ||
      (curvePoolsTyped[p].coins.includes(srcToken) && curvePoolsTyped[p].coins.includes(destToken)),
  );
  return curvePoolsTyped[pool as string];
};

const getCurveSwapIndexes = (srcToken: string, destToken: string) => {
  const pool = getCurvePool(srcToken, destToken);

  if (!pool) {
    return [-1, -1, -1];
  }

  const isUnderlyingSwap = pool.underlying.includes(srcToken) && pool.underlying.includes(destToken);

  const fromIndex = isUnderlyingSwap ? pool.underlying.indexOf(srcToken) : pool.coins.indexOf(srcToken);

  const toIndex = isUnderlyingSwap ? pool.underlying.indexOf(destToken) : pool.coins.indexOf(destToken);

  return [fromIndex, toIndex, isUnderlyingSwap];
};

export const getPath = (
  srcToken: string,
  destToken: string,
  priceRoutes: PriceRouteType[],
  gasPrice: string,
  isMultiPath: boolean = false,
): any => {
  if (isMultiPath) {
    return priceRoutes.map(_routes => {
      const { tokenFrom, tokenTo } = _routes.data;
      const routes = _routes.route.map(route => getAdapterParams(tokenFrom, tokenTo, route));
      let totalNetworkFee = 0;
      for (let i = 0; i < routes.length; i++) {
        totalNetworkFee = totalNetworkFee + Number(routes[i].networkFee);
      }
      return {
        to: tokenTo,
        totalNetworkFee,
        adapters: routes,
      };
    });
  } else {
    return priceRoutes.map(route => ({
      to: destToken,
      totalNetworkFee: route.data.networkFee ? route.data.networkFee : 0,
      adapters: [getAdapterParams(srcToken, destToken, route)],
    }));
  }
};

const getAdapterParams = (srcToken: string, destToken: string, route: RouteType | PriceRouteType) => {
  const adapterName: "adapter01" | "adapter02" = route.adapter.toLowerCase() as "adapter01" | "adapter02";

  const networkFee = route.data.networkFee ? route.data.networkFee : 0;
  const payload = "0x";
  const finalRoute = getAdapterRoute(srcToken, destToken, adapterName, (route as PriceRouteType).route);

  return {
    adapter: getAdapterAddress(adapterName),
    percent: Number(route.percent) * 100,
    payload,
    networkFee,
    route: finalRoute,
  };
};

const getAdapterRoute = (
  srcToken: string,
  destToken: string,
  adapterName: "adapter01" | "adapter02",
  routes: RouteType[],
) => {
  const finalRoute = [];
  for (let i = 0; i < routes.length; i++) {
    const routeInfo = routes[i];
    const index = routeInfo.index;
    const networkFee = routeInfo.networkFee ? routeInfo.networkFee : 0;
    const exchangeName = getExchangeName(adapterName, parseInt(index));

    const targetExchange = getTargetExchange(srcToken, exchangeName, routeInfo.data.exchange as string);
    const payload = getPayLoad(srcToken, destToken, exchangeName, routeInfo.data);
    finalRoute.push({
      index: index,
      targetExchange,
      percent: Number(routeInfo.percent) * 100,
      payload,
      networkFee,
    });
  }
  return finalRoute;
};

const getTargetExchange = (tokenFrom: string, exchangeName: string, exchangeAddress: string): string => {
  if (LENDING_DEXES.find(d => d.toString().toLowerCase() === exchangeName.toLowerCase())) {
    return tokenFrom;
  }

  if (exchangeName.toLowerCase() === "curve") {
    return exchangeAddress;
  }
  const tartgetExchangesType = targetExchanges as { [key: string]: string };

  return tartgetExchangesType[exchangeName];
};

const getExchangeName = (adapterName: "adapter01" | "adapter02", exchangeIndex: number) => {
  const AdapterExchangesTyped = adapterExchanges as AdapterExchangeType;
  return AdapterExchangesTyped[adapterName][exchangeIndex];
};

export const buildSellTransaction = (
  fromToken: string,
  fromAmount: BigNumberish,
  toAmount: BigNumberish,
  expectedAmount: BigNumberish,
  beneficiary: string,
  path: PathStruct[],
  partner: string,
  feePercent: BigNumberish,
  permit: string,
  deadline: string,
  uuid: string,
): SellDataStruct => {
  return {
    fromToken,
    fromAmount,
    toAmount,
    expectedAmount,
    beneficiary,
    path,
    partner,
    feePercent,
    permit,
    deadline,
    uuid,
  };
  /**return web3Coder.encodeParameter(
          {
            "ParentStruct": {
              "fromToken": "address",
              "fromAmount": "uint256",
              "toAmount": "uint256",
              "expectedAmount": "uint256",
              "beneficiary": "address",
              "path[]": {
                "to": "address",
                "totalNetworkFee": "uint256",
                "adapters[]": {
                  "adapter": "address",
                  "percent": "uint256",
                  "payload": "bytes",
                  "networkFee": "uint256",
                  "route[]": {
                    "index": "uint256",
                    "targetExchange": "address",
                    "percent": "uint256",
                    "payload": "bytes",
                    "networkFee": "uint256"
                  }
                }
              },
              "partner": "address",
              "feePercent": "uint256",
              "permit": "bytes",
              "deadline": "uint256"
              
            }
          },
          {
            fromToken,
            fromAmount,
            toAmount,
            expectedAmount,
            beneficiary,
            path,
            partner,
            feePercent,
            permit,
            deadline
          }
        );*/
};

const getAdapterAddress = (exchange: string) => {
  switch (exchange.toLowerCase()) {
    case "adapter01":
      return adapters["adapter01"].address;
    case "adapter02":
      return adapters["adapter02"].address;
    default:
      return "0x0000000000000000000000000000000000000000";
  }
};

export const getKyberReservesToExclude = async (tokenAddress: string, isSrc: boolean) => {
  const reserveIds = [];
  const kyberStorage = await hre.ethers.getContractAt(kyberStorageABI, kyberStorageAddress);
  if (isSrc) {
    const srcTokenReserveIds = await kyberStorage.getReserveIdsPerTokenSrc(tokenAddress);
    for (let i = 0; i < srcTokenReserveIds.length; i++) {
      if (srcTokenReserveIds[i].substring(0, 4) === "0xbb") {
        reserveIds.push(srcTokenReserveIds[i]);
      }
    }
  } else {
    const destTokenReserveIds = await kyberStorage.getReserveIdsPerTokenDest(tokenAddress);
    for (let i = 0; i < destTokenReserveIds.length; i++) {
      if (destTokenReserveIds[i].substring(0, 4) === "0xbb") {
        reserveIds.push(destTokenReserveIds[i]);
      }
    }
  }
  return reserveIds;
};

export const buildKyberHint = async (
  srcToken: string,
  srcExcludeReserves: string[],
  tradeType: string,
  destToken: string,
  destExcludeReserves: string[],
) => {
  let hint;
  const kyberHint = await hre.ethers.getContractAt(kyberHintABI, kyberHintAddress);
  if (tradeType === "ethtotoken") {
    hint = await kyberHint.buildEthToTokenHint(destToken, 2, destExcludeReserves, []);
  } else if (tradeType === "tokentoeth") {
    hint = await kyberHint.buildTokenToEthHint(srcToken, 2, srcExcludeReserves, []);
  } else {
    hint = await kyberHint.buildTokenToTokenHint(
      srcToken,
      2,
      srcExcludeReserves,
      [],
      destToken,
      2,
      destExcludeReserves,
      [],
    );
  }
  return hint;
};

const getPayLoad = (fromToken: string, toToken: string, exchange: string, data: { [key: string]: string }) => {
  switch (exchange.toLowerCase()) {
    case "balancer": {
      const { swaps } = data;

      return new web3Coder.AbiCoder().encodeParameter(
        {
          ParentStruct: {
            "swaps[]": {
              pool: "address",
              tokenInParam: "uint256",
              tokenOutParam: "uint256",
              maxPrice: "uint256",
            },
          },
        },
        {
          swaps: swaps,
        },
      );
    }
    case "0x": {
      const { v3orders, v3signatures, networkFee } = data;

      return new web3Coder.AbiCoder().encodeParameter(
        {
          ParentStruct: {
            "orders[]": {
              makerAddress: "address", // Address that created the order.
              takerAddress: "address", // Address that is allowed to fill the order. If set to 0, any address is allowed to fill the order.
              feeRecipientAddress: "address", // Address that will recieve fees when order is filled.
              senderAddress: "address", // Address that is allowed to call Exchange contract methods that affect this order. If set to 0, any address is allowed to call these methods.
              makerAssetAmount: "uint256", // Amount of makerAsset being offered by maker. Must be greater than 0.
              takerAssetAmount: "uint256", // Amount of takerAsset being bid on by maker. Must be greater than 0.
              makerFee: "uint256", // Fee paid to feeRecipient by maker when order is filled.
              takerFee: "uint256", // Fee paid to feeRecipient by taker when order is filled.
              expirationTimeSeconds: "uint256", // Timestamp in seconds at which order expires.
              salt: "uint256", // Arbitrary number to facilitate uniqueness of the order's hash.
              makerAssetData: "bytes", // Encoded data that can be decoded by a specified proxy contract when transferring makerAsset. The leading bytes4 references the id of the asset proxy.
              takerAssetData: "bytes", // Encoded data that can be decoded by a specified proxy contract when transferring takerAsset. The leading bytes4 references the id of the asset proxy.
              makerFeeAssetData: "bytes", // Encoded data that can be decoded by a specified proxy contract when transferring makerFeeAsset. The leading bytes4 references the id of the asset proxy.
              takerFeeAssetData: "bytes",
            },
            signatures: "bytes[]",
            networkFee: "uint256",
          },
        },
        {
          orders: v3orders,
          signatures: v3signatures,
          networkFee,
        },
      );
    }
    case "paraswappool": {
      const { orders, signatures } = data;

      return new web3Coder.AbiCoder().encodeParameter(
        {
          ParentStruct: {
            "orders[]": {
              makerAddress: "address", // Address that created the order.
              takerAddress: "address", // Address that is allowed to fill the order. If set to 0, any address is allowed to fill the order.
              feeRecipientAddress: "address", // Address that will recieve fees when order is filled.
              senderAddress: "address", // Address that is allowed to call Exchange contract methods that affect this order. If set to 0, any address is allowed to call these methods.
              makerAssetAmount: "uint256", // Amount of makerAsset being offered by maker. Must be greater than 0.
              takerAssetAmount: "uint256", // Amount of takerAsset being bid on by maker. Must be greater than 0.
              makerFee: "uint256", // Fee paid to feeRecipient by maker when order is filled.
              takerFee: "uint256", // Fee paid to feeRecipient by taker when order is filled.
              expirationTimeSeconds: "uint256", // Timestamp in seconds at which order expires.
              salt: "uint256", // Arbitrary number to facilitate uniqueness of the order's hash.
              makerAssetData: "bytes", // Encoded data that can be decoded by a specified proxy contract when transferring makerAsset. The leading bytes4 references the id of the asset proxy.
              takerAssetData: "bytes",
            },
            signatures: "bytes[]",
          },
        },
        {
          orders,
          signatures,
        },
      );
    }

    case "kyber": {
      const { hint } = data;
      const minConversionRateForBuy = 11111111;
      return new web3Coder.AbiCoder().encodeParameter(
        {
          ParentStruct: {
            minConversionRateForBuy: "uint256",
            hint: "bytes",
          },
        },
        { minConversionRateForBuy, hint },
      );
    }

    case "oasis": {
      return new web3Coder.AbiCoder().encodeParameter(
        {
          ParentStruct: {
            otc: "address",
            weth: "address",
            factory: "address",
          },
        },
        {
          otc: "0x794e6e91555438aFc3ccF1c5076A74F42133d08D",
          weth: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
          factory: "0x4678f0a6958e4d2bc4f1baf7bc52e8f3564f3fe4",
        },
      );
    }

    case "bancor": {
      const { path } = data;
      return new web3Coder.AbiCoder().encodeParameter(
        {
          ParentStruct: {
            path: "address[]",
          },
        },
        { path },
      );
    }
    case "uniswapv2": {
      const { path } = data;
      return new web3Coder.AbiCoder().encodeParameter(
        {
          ParentStruct: {
            path: "address[]",
          },
        },
        { path },
      );
    }

    case "uniswapv2forks": {
      const { path, fee, feeFactor, factory, initCode } = data;
      return new web3Coder.AbiCoder().encodeParameter(
        {
          ParentStruct: {
            path: "address[]",
            fee: "uint256",
            feeFactor: "uint256",
            factory: "address",
            initCode: "bytes32",
          },
        },
        { path, fee, feeFactor, factory, initCode },
      );
    }

    case "compound": {
      let { cToken } = data;

      if (!cToken) {
        cToken = tokens[data.tokenFrom.toLowerCase()]["tokenType"] === "cToken" ? data.tokenFrom : data.tokenTo;
      }

      return new web3Coder.AbiCoder().encodeParameter(
        {
          ParentStruct: {
            cToken: "address",
          },
        },
        { cToken },
      );
    }
    case "aavee": {
      let { aToken } = data;
      if (!aToken) {
        aToken = tokens[data.tokenFrom.toLowerCase()]["tokenType"] === "aToken" ? data.tokenFrom : data.tokenTo;
      }
      //.log(aToken);
      return new web3Coder.AbiCoder().encodeParameter(
        {
          ParentStruct: {
            aToken: "address",
          },
        },
        { aToken },
      );
    }
    case "aave2": {
      let { aToken } = data;
      if (!aToken) {
        aToken = tokens[data.tokenFrom.toLowerCase()]["tokenType"] === "aToken" ? data.tokenFrom : data.tokenTo;
      }
      //.log(aToken);
      return new web3Coder.AbiCoder().encodeParameter(
        {
          ParentStruct: {
            aToken: "address",
          },
        },
        { aToken },
      );
    }
    case "aave": {
      let { aToken } = data;
      if (!aToken) {
        aToken = tokens[data.tokenFrom.toLowerCase()]["tokenType"] === "aToken" ? data.tokenFrom : data.tokenTo;
      }
      //.log(aToken);
      return new web3Coder.AbiCoder().encodeParameter(
        {
          ParentStruct: {
            aToken: "address",
          },
        },
        { aToken },
      );
    }

    case "idle": {
      let { idleToken } = data;
      if (!idleToken) {
        idleToken = tokens[data.tokenFrom.toLowerCase()]["tokenType"] === "idleToken" ? data.tokenFrom : data.tokenTo;
      }
      return new web3Coder.AbiCoder().encodeParameter(
        {
          ParentStruct: {
            idleToken: "address",
          },
        },
        { idleToken },
      );
    }
    case "fulcrum": {
      let { iToken } = data;
      if (!iToken) {
        iToken = tokens[data.tokenFrom.toLowerCase()]["tokenType"] === "iToken" ? data.tokenFrom : data.tokenTo;
      }
      return new web3Coder.AbiCoder().encodeParameter(
        {
          ParentStruct: {
            iToken: "address",
          },
        },
        { iToken },
      );
    }
    case "curve":
      try {
        let { srcSymbol, destSymbol } = data;
        if (!srcSymbol || srcSymbol === "") {
          srcSymbol = tokens[data.tokenFrom.toLowerCase()]["symbol"];
        }
        if (!destSymbol || destSymbol === "") {
          destSymbol = tokens[data.tokenTo.toLowerCase()]["symbol"];
        }
        const [i, j, underlyingSwap] = getCurveSwapIndexes(srcSymbol, destSymbol);
        const deadline = data.deadline;
        return new web3Coder.AbiCoder().encodeParameter(
          {
            ParentStruct: {
              i: "int128",
              j: "int128",
              deadline: "uint256",
              underlyingSwap: "bool",
            },
          },
          { i, j, deadline, underlyingSwap },
        );
      } catch (e) {
        console.error("Curve Error", e);
        return "0x";
      }

    default:
      return "0x";
  }
};
