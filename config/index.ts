import polygon from "./polygon.json";
import mainnet from "./mainnet.json";
import bsc from "./bsc.json";
import ropsten from "./ropsten.json";
import avalanche from "./avalanche.json";
import fantom from "./fantom.json";
import arbitrum from "./arbitrum.json";
import optimism from "./optimism.json";
import polygonZkEvm from "./polygonZkEvm.json";
import base from "./base.json";

export type DATA_OBJECT = {
  [name: string]: {
    [name: string]: string | number;
  };
};

const configs: DATA_OBJECT = {
  "137": polygon,
  "1": mainnet,
  "3": ropsten,
  "4": mainnet,
  "31337": mainnet,
  "56": bsc,
  "43114": avalanche,
  "250": fantom,
  "42161": arbitrum,
  "10": optimism,
  "1101": polygonZkEvm,
  "8453": base,
};

export const getConfig = (network: string) => {
  return configs[network];
};
