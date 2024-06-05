import { SOR, SwapInfo, SwapTypes } from "@balancer-labs/sor";
import { JsonRpcProvider } from "@ethersproject/providers";
import { BigNumber, BigNumberish, formatFixed } from "@ethersproject/bignumber";

export async function getSwap(
  provider: JsonRpcProvider,
  networkId: number,
  poolsSource: string,
  queryOnChain: boolean,
  tokenIn: { symbol: string; address: string; decimals: number },
  tokenOut: { symbol: string; address: string; decimals: number },
  swapType: SwapTypes,
  swapAmount: BigNumberish,
): Promise<SwapInfo> {
  const sor = new SOR(provider, networkId, poolsSource);

  // Will get onChain data for pools list
  await sor.fetchPools([], queryOnChain);

  // gasPrice is used by SOR as a factor to determine how many pools to swap against.
  // i.e. higher cost means more costly to trade against lots of different pools.
  const gasPrice = BigNumber.from("40000000000");
  // This determines the max no of pools the SOR will use to swap.
  const maxPools = 4;

  // This calculates the cost to make a swap which is used as an input to sor to allow it to make gas efficient recommendations.
  // Note - tokenOut for SwapExactIn, tokenIn for SwapExactOut
  const outputToken = swapType === SwapTypes.SwapExactOut ? tokenIn : tokenOut;
  const cost = await sor.getCostOfSwapInToken(
    outputToken.address,
    outputToken.decimals,
    gasPrice,
    BigNumber.from("35000"),
  );
  const swapInfo: SwapInfo = await sor.getSwaps(tokenIn.address, tokenOut.address, swapType, swapAmount, {
    gasPrice,
    maxPools,
  });

  const amtInScaled =
    swapType === SwapTypes.SwapExactIn
      ? formatFixed(swapAmount, tokenIn.decimals)
      : formatFixed(swapInfo.returnAmount, tokenIn.decimals);
  const amtOutScaled =
    swapType === SwapTypes.SwapExactIn
      ? formatFixed(swapInfo.returnAmount, tokenOut.decimals)
      : formatFixed(swapAmount, tokenOut.decimals);

  const returnDecimals = swapType === SwapTypes.SwapExactIn ? tokenOut.decimals : tokenIn.decimals;

  const returnWithFeesScaled = formatFixed(swapInfo.returnAmountConsideringFees, returnDecimals);

  const costToSwapScaled = formatFixed(cost, returnDecimals);

  const swapTypeStr = swapType === SwapTypes.SwapExactIn ? "SwapExactIn" : "SwapExactOut";
  console.log(swapTypeStr);
  console.log(`Token In: ${tokenIn.symbol}, Amt: ${amtInScaled.toString()}`);
  console.log(`Token Out: ${tokenOut.symbol}, Amt: ${amtOutScaled.toString()}`);
  console.log(`Cost to swap: ${costToSwapScaled.toString()}`);
  console.log(`Return Considering Fees: ${returnWithFeesScaled.toString()}`);
  console.log(`Swaps:`);
  console.log(swapInfo.swaps);
  console.log(swapInfo.tokenAddresses);

  return swapInfo;
}
