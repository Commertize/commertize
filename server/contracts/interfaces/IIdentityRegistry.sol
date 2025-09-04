// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ERC-3643 Identity Registry Interface (minimal)
/// @notice Aligns with ERC-3643 docs: must expose isVerified(address) view. 
/// Ref: docs.erc3643.org Identity Registry Interface
interface IIdentityRegistry {
    function isVerified(address user) external view returns (bool);

    // Optional mgmt helpers (not part of the minimal ERC-3643 surface your dapp needs)
    function registerIdentity(address user, uint16 country, bytes32 hash) external;
    function updateIdentity(address user, uint16 country, bytes32 hash) external;
    function deleteIdentity(address user) external;
}