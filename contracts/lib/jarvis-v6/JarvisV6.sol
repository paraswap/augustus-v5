// SPDX-License-Identifier: ISC

pragma solidity 0.7.5;
pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../Utils.sol";

interface IJarvisPool {
    struct MintParams {
        // Minimum amount of synthetic tokens that a user wants to mint using collateral (anti-slippage)
        uint256 minNumTokens;
        // Amount of collateral that a user wants to spend for minting
        uint256 collateralAmount;
        // Expiration time of the transaction
        uint256 expiration;
        // Address to which send synthetic tokens minted
        address recipient;
    }

    struct RedeemParams {
        // Amount of synthetic tokens that user wants to use for redeeming
        uint256 numTokens;
        // Minimium amount of collateral that user wants to redeem (anti-slippage)
        uint256 minCollateral;
        // Expiration time of the transaction
        uint256 expiration;
        // Address to which send collateral tokens redeemed
        address recipient;
    }

    function mint(MintParams memory mintParams) external returns (uint256 syntheticTokensMinted, uint256 feePaid);

    function redeem(RedeemParams memory redeemParams) external returns (uint256 collateralRedeemed, uint256 feePaid);
}

contract JarvisV6 {
    enum MethodType {
        mint,
        redeem
    }

    struct JarvisV6Data {
        uint256 opType;
        uint128 expiration;
    }

    function swapOnJarvisV6(
        IERC20 fromToken,
        IERC20 toToken,
        uint256 fromAmount,
        address exchange,
        bytes calldata payload
    ) internal {
        JarvisV6Data memory data = abi.decode(payload, (JarvisV6Data));
        Utils.approve(exchange, address(fromToken), fromAmount);

        if (data.opType == uint256(MethodType.mint)) {
            IJarvisPool.MintParams memory mintParam = IJarvisPool.MintParams(
                1,
                fromAmount,
                data.expiration,
                address(this)
            );

            IJarvisPool(exchange).mint(mintParam);
        } else if (data.opType == uint256(MethodType.redeem)) {
            IJarvisPool.RedeemParams memory redeemParam = IJarvisPool.RedeemParams(
                fromAmount,
                1,
                data.expiration,
                address(this)
            );

            IJarvisPool(exchange).redeem(redeemParam);
        } else {
            revert("Invalid opType");
        }
    }
}
