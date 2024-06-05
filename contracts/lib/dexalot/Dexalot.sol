// SPDX-License-Identifier: ISC

pragma solidity 0.7.5;
pragma abicoder v2;

import "../Utils.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IMainnetRFQ {
    struct Order {
        uint256 nonceAndMeta;
        uint128 expiry;
        address makerAsset;
        address takerAsset;
        address maker;
        address taker;
        uint256 makerAmount;
        uint256 takerAmount;
    }

    function partialSwap(
        Order calldata _order,
        bytes calldata _signature,
        uint256 _takerAmount
    ) external payable;
}

contract Dexalot {
    struct DexalotData {
        IMainnetRFQ.Order order;
        bytes signature;
    }

    function swapOnDexalot(
        IERC20 fromToken,
        IERC20 toToken,
        uint256 fromAmount,
        address exchange,
        bytes calldata payload
    ) internal {
        _swapOnDexalot(fromToken, toToken, fromAmount, exchange, payload);
    }

    function buyOnDexalot(
        IERC20 fromToken,
        IERC20 toToken,
        uint256 maxFromAmount,
        uint256 toAmount,
        address targetExchange,
        bytes calldata payload
    ) internal {
        _swapOnDexalot(fromToken, toToken, maxFromAmount, targetExchange, payload);
    }

    function _swapOnDexalot(
        IERC20 fromToken,
        IERC20 toToken,
        uint256 fromAmount,
        address targetExchange,
        bytes calldata payload
    ) internal {
        DexalotData memory data = abi.decode(payload, (DexalotData));
        if (address(fromToken) == Utils.ethAddress()) {
            IMainnetRFQ(targetExchange).partialSwap{ value: fromAmount }(
                IMainnetRFQ.Order({
                    nonceAndMeta: data.order.nonceAndMeta,
                    expiry: data.order.expiry,
                    makerAsset: data.order.makerAsset,
                    takerAsset: data.order.takerAsset,
                    maker: data.order.maker,
                    taker: msg.sender,
                    makerAmount: data.order.makerAmount,
                    takerAmount: data.order.takerAmount
                }),
                data.signature,
                fromAmount > data.order.takerAmount ? data.order.takerAmount : fromAmount
            );
        } else {
            Utils.approve(targetExchange, address(fromToken), fromAmount);
            IMainnetRFQ(targetExchange).partialSwap(
                IMainnetRFQ.Order({
                    nonceAndMeta: data.order.nonceAndMeta,
                    expiry: data.order.expiry,
                    makerAsset: data.order.makerAsset,
                    takerAsset: data.order.takerAsset,
                    maker: data.order.maker,
                    taker: msg.sender,
                    makerAmount: data.order.makerAmount,
                    takerAmount: data.order.takerAmount
                }),
                data.signature,
                fromAmount > data.order.takerAmount ? data.order.takerAmount : fromAmount
            );
        }
    }
}
