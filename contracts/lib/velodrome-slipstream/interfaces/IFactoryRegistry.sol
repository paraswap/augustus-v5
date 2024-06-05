// SPDX-License-Identifier: ISC
pragma solidity 0.7.5;
pragma abicoder v2;

interface IFactoryRegistry {
    function approve(
        address poolFactory,
        address votingRewardsFactory,
        address gaugeFactory
    ) external;

    function isPoolFactoryApproved(address poolFactory) external returns (bool);

    function factoriesToPoolFactory(address poolFactory)
        external
        returns (address votingRewardsFactory, address gaugeFactory);
}
