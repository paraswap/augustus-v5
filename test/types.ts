import type { Fixture } from "ethereum-waffle";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signers";
import { Deployment } from "hardhat-deploy/dist/types";
import {
  ERC20,
  AugustusSwapper,
  SimpleSwap,
  ProtectedSimpleSwap,
  MultiPath,
  ProtectedMultiPath,
  TokenTransferProxy,
  IParaswap,
  FeeModel,
  FeeClaimer,
  TestSimpleSwapUtils,
  IUniswapV2Router01,
} from "../src/types/";

declare module "mocha" {
  export interface Context {
    loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
    signers: Signers;
    MultiPath: MultiPath;
    AugustusSwapper: AugustusSwapper;
    tokens: string[];
    augustusSwapper: AugustusSwapper;
    simpleSwap: SimpleSwap;
    protectedSimpleSwap: ProtectedSimpleSwap;
    multiPath: MultiPath;
    protectedMultiPath: ProtectedMultiPath;
    tokenTransferProxy: TokenTransferProxy;
    iParaswap: IParaswap;
    feeModel: FeeModel;
    feeClaimer: FeeClaimer;
    testSimpleSwapUtils: TestSimpleSwapUtils;
    uniswapV2Router01: IUniswapV2Router01;
    erc20: ERC20;
    usdc: ERC20;
    weth: ERC20;
  }
}

export interface Signers {
  admin: SignerWithAddress;
  main: SignerWithAddress;
  signer: SignerWithAddress;
  deployer: SignerWithAddress;
  maker: SignerWithAddress;
  alice: SignerWithAddress;
  bob: SignerWithAddress;
  charlie: SignerWithAddress;
  augustusSwapperSigner: SignerWithAddress;
}

export type curvePoolsType = {
  [token: string]: curvePoolType;
};

export type curvePoolType = {
  underlying: string[];
  coins: string[];
  name: string;
};

export interface Deployments {
  adapter01: Deployment;
  adapter02: Deployment;
}

export type AdapterExchangeType = {
  adapter01: {
    [key: number]: string;
  };
  adapter02: {
    [key: number]: string;
  };
};

export interface Tokens {
  [key: string]: {
    symbol: string;
    tokenType: string;
  };
}

export type PriceRouteType = {
  adapter: string;
  percent: string;
  data: {
    tokenFrom: string;
    tokenTo: string;
    networkFee?: string;
  };
  route: RouteType[];
};

export type RouteType = {
  index: string;
  adapter: string;
  percent: string;
  networkFee?: string;
  data: {
    [key: string]: any;
  };
};

export type EventParamType = {
  name: string;
  type: string;
  value: string;
};

export type DecodedLogType = {
  name: string;
  events: EventParamType[];
  address: string;
};
