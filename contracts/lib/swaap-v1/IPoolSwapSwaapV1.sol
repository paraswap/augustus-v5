pragma solidity 0.7.5;
pragma abicoder v2;

/**
 * @title Contains the useful methods to a trader
 */
interface IPoolSwapSwaapV1 {
    /**
     * @notice Swap two tokens given the exact amount of token in
     * @param tokenIn The address of the input token
     * @param tokenAmountIn The exact amount of tokenIn to be swapped
     * @param tokenOut The address of the received token
     * @param minAmountOut The minimum accepted amount of tokenOut to be received
     * @param maxPrice The maximum spot price accepted before the swap
     * @return tokenAmountOut The token amount out received
     * @return spotPriceAfter The spot price of tokenOut in terms of tokenIn after the swap
     */
    function swapExactAmountInMMM(
        address tokenIn,
        uint256 tokenAmountIn,
        address tokenOut,
        uint256 minAmountOut,
        uint256 maxPrice
    ) external returns (uint256 tokenAmountOut, uint256 spotPriceAfter);

    /**
     * @notice Swap two tokens given the exact amount of token out
     * @param tokenIn The address of the input token
     * @param maxAmountIn The maximum amount of tokenIn that can be swapped
     * @param tokenOut The address of the received token
     * @param tokenAmountOut The exact amount of tokenOut to be received
     * @param maxPrice The maximum spot price accepted before the swap
     * @return tokenAmountIn The amount of tokenIn added to the pool
     * @return spotPriceAfter The spot price of token out in terms of token in after the swap
     */
    function swapExactAmountOutMMM(
        address tokenIn,
        uint256 maxAmountIn,
        address tokenOut,
        uint256 tokenAmountOut,
        uint256 maxPrice
    ) external returns (uint256 tokenAmountIn, uint256 spotPriceAfter);
}
