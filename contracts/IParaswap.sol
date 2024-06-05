// SPDX-License-Identifier: ISC

pragma solidity 0.7.5;
pragma abicoder v2;

import "./lib/Utils.sol";
import "./lib/UtilsNFT.sol";
import "./lib/augustus-rfq/IAugustusRFQ.sol";

interface IParaswap {
    // No longer used!
    event Swapped(
        bytes16 uuid,
        address initiator,
        address indexed beneficiary,
        address indexed srcToken,
        address indexed destToken,
        uint256 srcAmount,
        uint256 receivedAmount,
        uint256 expectedAmount
    );

    // No longer used!
    event Bought(
        bytes16 uuid,
        address initiator,
        address indexed beneficiary,
        address indexed srcToken,
        address indexed destToken,
        uint256 srcAmount,
        uint256 receivedAmount
    );

    // No longer used!
    event Swapped2(
        bytes16 uuid,
        address partner,
        uint256 feePercent,
        address initiator,
        address indexed beneficiary,
        address indexed srcToken,
        address indexed destToken,
        uint256 srcAmount,
        uint256 receivedAmount,
        uint256 expectedAmount
    );

    // No longer used!
    event Bought2(
        bytes16 uuid,
        address partner,
        uint256 feePercent,
        address initiator,
        address indexed beneficiary,
        address indexed srcToken,
        address indexed destToken,
        uint256 srcAmount,
        uint256 receivedAmount
    );

    event SwappedV3(
        bytes16 uuid,
        address partner,
        uint256 feePercent,
        address initiator,
        address indexed beneficiary,
        address indexed srcToken,
        address indexed destToken,
        uint256 srcAmount,
        uint256 receivedAmount,
        uint256 expectedAmount
    );

    event BoughtV3(
        bytes16 uuid,
        address partner,
        uint256 feePercent,
        address initiator,
        address indexed beneficiary,
        address indexed srcToken,
        address indexed destToken,
        uint256 srcAmount,
        uint256 receivedAmount,
        uint256 expectedAmount
    );

    event BoughtNFTV3(
        bytes16 uuid,
        address partner,
        uint256 feePercent,
        address initiator,
        address indexed beneficiary,
        address indexed srcToken,
        UtilsNFT.ToTokenNFTDetails[] destTokenDetails,
        uint256 srcAmount,
        uint256 expectedAmount
    );

    function multiSwap(Utils.SellData calldata data) external payable returns (uint256);

    function megaSwap(Utils.MegaSwapSellData calldata data) external payable returns (uint256);

    function buy(Utils.BuyData calldata data) external payable returns (uint256);

    function protectedMultiSwap(Utils.SellData calldata data) external payable returns (uint256);

    function protectedMegaSwap(Utils.MegaSwapSellData calldata data) external payable returns (uint256);

    function protectedSimpleSwap(Utils.SimpleData calldata data) external payable returns (uint256 receivedAmount);

    function protectedSimpleBuy(Utils.SimpleData calldata data) external payable;

    function simpleSwap(Utils.SimpleData calldata data) external payable returns (uint256 receivedAmount);

    function simpleBuy(Utils.SimpleData calldata data) external payable;

    function simpleBuyNFT(UtilsNFT.SimpleBuyNFTData calldata data) external payable;

    function swapOnUniswap(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path
    ) external payable;

    function swapOnUniswapFork(
        address factory,
        bytes32 initCode,
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path
    ) external payable;

    function buyOnUniswap(
        uint256 amountInMax,
        uint256 amountOut,
        address[] calldata path
    ) external payable;

    function buyOnUniswapFork(
        address factory,
        bytes32 initCode,
        uint256 amountInMax,
        uint256 amountOut,
        address[] calldata path
    ) external payable;

    function swapOnUniswapV2Fork(
        address tokenIn,
        uint256 amountIn,
        uint256 amountOutMin,
        address weth,
        uint256[] calldata pools
    ) external payable;

    function swapOnUniswapV2ForkWithPermit(
        address tokenIn,
        uint256 amountIn,
        uint256 amountOutMin,
        address weth,
        uint256[] calldata pools,
        bytes calldata permit
    ) external payable;

    function buyOnUniswapV2Fork(
        address tokenIn,
        uint256 amountInMax,
        uint256 amountOut,
        address weth,
        uint256[] calldata pools
    ) external payable;

    function buyOnUniswapV2ForkWithPermit(
        address tokenIn,
        uint256 amountInMax,
        uint256 amountOut,
        address weth,
        uint256[] calldata pools,
        bytes calldata permit
    ) external payable;

    function swapOnZeroXv2(
        IERC20 fromToken,
        IERC20 toToken,
        uint256 fromAmount,
        uint256 amountOutMin,
        address exchange,
        bytes calldata payload
    ) external payable;

    function swapOnZeroXv2WithPermit(
        IERC20 fromToken,
        IERC20 toToken,
        uint256 fromAmount,
        uint256 amountOutMin,
        address exchange,
        bytes calldata payload,
        bytes calldata permit
    ) external payable;

    function swapOnZeroXv4(
        IERC20 fromToken,
        IERC20 toToken,
        uint256 fromAmount,
        uint256 amountOutMin,
        address exchange,
        bytes calldata payload
    ) external payable;

    function swapOnZeroXv4WithPermit(
        IERC20 fromToken,
        IERC20 toToken,
        uint256 fromAmount,
        uint256 amountOutMin,
        address exchange,
        bytes calldata payload,
        bytes calldata permit
    ) external payable;

    function swapOnAugustusRFQ(
        IAugustusRFQ.Order calldata order,
        bytes calldata signature,
        uint8 wrapETH // set 0 bit to wrap src, and 1 bit to wrap dst
    ) external payable;

    function swapOnAugustusRFQWithPermit(
        IAugustusRFQ.Order calldata order,
        bytes calldata signature,
        uint8 wrapETH, // set 0 bit to wrap src, and 1 bit to wrap dst
        bytes calldata permit
    ) external payable;

    function swapOnAugustusRFQNFT(
        IAugustusRFQ.OrderNFT calldata order,
        bytes calldata signature,
        uint8 wrapETH // set 0 bit to wrap src, and 1 bit to wrap dst
    ) external payable;

    function swapOnAugustusRFQNFTWithPermit(
        IAugustusRFQ.OrderNFT calldata order,
        bytes calldata signature,
        uint8 wrapETH, // set 0 bit to wrap src, and 1 bit to wrap dst
        bytes calldata permit
    ) external payable;

    function partialSwapOnAugustusRFQ(
        IAugustusRFQ.Order calldata order,
        bytes calldata signature,
        bytes calldata makerPermit,
        uint8 wrapETH, // set 0 bit to wrap src, and 1 bit to wrap dst
        uint256 fromAmount
    ) external payable;

    function partialSwapOnAugustusRFQWithPermit(
        IAugustusRFQ.Order calldata order,
        bytes calldata signature,
        bytes calldata makerPermit,
        uint8 wrapETH, // set 0 bit to wrap src, and 1 bit to wrap dst
        uint256 fromAmount,
        bytes calldata permit
    ) external payable;

    function partialSwapOnAugustusRFQNFT(
        IAugustusRFQ.OrderNFT calldata order,
        bytes calldata signature,
        bytes calldata makerPermit,
        uint8 wrapETH, // set 0 bit to wrap src, and 1 bit to wrap dst
        uint256 fromAmount
    ) external payable;

    function partialSwapOnAugustusRFQNFTWithPermit(
        IAugustusRFQ.OrderNFT calldata order,
        bytes calldata signature,
        bytes calldata makerPermit,
        uint8 wrapETH, // set 0 bit to wrap src, and 1 bit to wrap dst
        uint256 fromAmount,
        bytes calldata permit
    ) external payable;

    function swapOnAugustusRFQTryBatchFill(
        IAugustusRFQ.OrderInfo[] calldata orderInfos,
        uint8 wrapETH, // set 0 bit to wrap src, and 1 bit to wrap dst
        uint256 fromAmount,
        uint256 toAmountMin
    ) external payable;

    function swapOnAugustusRFQTryBatchFillWithPermit(
        IAugustusRFQ.OrderInfo[] calldata orderInfos,
        uint8 wrapETH, // set 0 bit to wrap src, and 1 bit to wrap dst
        uint256 fromAmount,
        uint256 toAmountMin,
        bytes calldata permit
    ) external payable;

    function buyOnAugustusRFQTryBatchFill(
        IAugustusRFQ.OrderInfo[] calldata orderInfos,
        uint8 wrapETH, // set 0 bit to wrap src, and 1 bit to wrap dst
        uint256 fromAmountMax,
        uint256 toAmount
    ) external payable;

    function buyOnAugustusRFQTryBatchFillWithPermit(
        IAugustusRFQ.OrderInfo[] calldata orderInfos,
        uint8 wrapETH, // set 0 bit to wrap src, and 1 bit to wrap dst
        uint256 fromAmountMax,
        uint256 toAmount,
        bytes calldata permit
    ) external payable;
}
