// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ERC-3643 Compliance Interface (minimal)
/// @notice Mirrors the official ICompliance surface: bind/unbind, canTransfer, and transfer hooks.
/// Ref: docs.erc3643.org Compliance Interface
interface ICompliance {
    event TokenBound(address _token);
    event TokenUnbound(address _token);

    function bindToken(address _token) external;
    function unbindToken(address _token) external;

    function transferred(address from, address to, uint256 amount) external;
    function created(address to, uint256 amount) external;
    function destroyed(address from, uint256 amount) external;

    function isTokenAgent(address agent) external view returns (bool);
    function isTokenBound(address token) external view returns (bool);

    function canTransfer(address from, address to, uint256 amount) external view returns (bool);
}