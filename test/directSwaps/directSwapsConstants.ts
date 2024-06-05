import { SupportedChainId, Token } from "@uniswap/sdk-core";
import { curve3PoolAbi, curve3CryptoAbi, curveCompoundAbi, curveStEthAbi, curveGenericZap } from "./curveAbi";

export const POOL_FACTORY_CONTRACT_ADDRESS = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
export const QUOTER_CONTRACT_ADDRESS = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6";
export const UNIV3_ROUTER = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
export const CURVE_3POOL = "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7";
export const CURVE_3CRYPTO = "0xD51a44d3FaE010294C616388b506AcdA1bfAAE46";
export const CURVE_STETH = "0xDC24316b9AE028F1497c275EB9192a3Ea0f67022";
export const CURVE_COMPOUND = "0xA2B47E3D5c44877cca798226B7B8118F9BFb7A56";
export const CURVE_GENERIC_ZAP = "0x5De4EF4879F4fe3bBADF2227D2aC5d0E2D76C895";
export const CURVE_SDT_FRAXUSDC = "0x3e3C6c7db23cdDEF80B694679aaF1bCd9517D0Ae";
export const BALV2_VAULT = "0xBA12222222228d8Ba445958a75a0704d566BF2C8";
export const BALV2_OHM_DAI_ID = "0x76fcf0e8c7ff37a47a799fa2cd4c13cde0d981c90002000000000000000003d2";
export const BALV2_BAL_WETH_ID = "0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014";
export const BALV2_OHM_WETH_ID = "0xd1ec5e215e8148d76f4460e4097fd3d5ae0a35580002000000000000000003d3";
export const ETH = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

export const WETH_TOKEN = new Token(
  SupportedChainId.MAINNET,
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  18,
  "WETH",
  "Wrapped Ether",
);
export const USDC_TOKEN = new Token(
  SupportedChainId.MAINNET,
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  6,
  "USDC",
  "USD//C",
);
export const UNI_TOKEN = new Token(
  SupportedChainId.MAINNET,
  "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
  18,
  "UNI",
  "Uniswap",
);
export const DAI_TOKEN = new Token(
  SupportedChainId.MAINNET,
  "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  18,
  "DAI",
  "Dai Stablecoin",
);
export const PSP_TOKEN = new Token(
  SupportedChainId.MAINNET,
  "0xcafe001067cdef266afb7eb5a286dcfd277f3de5",
  18,
  "PSP",
  "ParaSwap",
);

export const GENERIC_ZAP_ADDRESSES = {
  0: "0x73968b9a57c6E53d41345FD57a6E6ae27d6CDB2F",
  1: "0x853d955aCEf822Db058eb8505911ED77F175b99e",
  2: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
};

export const CURVE_POOLS = {
  [CURVE_3POOL]: curve3PoolAbi,
  [CURVE_3CRYPTO]: curve3CryptoAbi,
  [CURVE_STETH]: curveStEthAbi,
  [CURVE_COMPOUND]: curveCompoundAbi,
  [CURVE_GENERIC_ZAP]: curveGenericZap,
};
