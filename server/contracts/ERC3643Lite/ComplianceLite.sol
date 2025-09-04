// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../interfaces/ICompliance.sol";

/// @notice Minimal ERC-3643 compliance controller for dev/test.
/// Adds: allowedTokens + tokenAgents; canTransfer returns true by default.
/// Extend with modules (country caps, max investors, etc.) as needed.
contract ComplianceLite is ICompliance {
    address public owner;
    mapping(address => bool) private _boundToken;
    mapping(address => bool) private _tokenAgents;

    modifier onlyOwner() { require(msg.sender == owner, "Not owner"); _; }
    modifier onlyTokenAgent() { require(_tokenAgents[msg.sender], "Not token agent"); _; }

    event AgentSet(address indexed agent, bool approved);

    constructor(address _owner) { owner = _owner; }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "zero");
        owner = newOwner;
    }

    function setTokenAgent(address agent, bool approved) external onlyOwner {
        _tokenAgents[agent] = approved;
        emit AgentSet(agent, approved);
    }

    function bindToken(address token) external override onlyOwner {
        _boundToken[token] = true;
        emit TokenBound(token);
    }

    function unbindToken(address token) external override onlyOwner {
        _boundToken[token] = false;
        emit TokenUnbound(token);
    }

    function transferred(address, address, uint256) external override {}
    function created(address, uint256)     external override {}
    function destroyed(address, uint256)   external override {}

    function isTokenAgent(address agent) external view override returns (bool) {
        return _tokenAgents[agent];
    }
    function isTokenBound(address token) external view override returns (bool) {
        return _boundToken[token];
    }

    // NOTE: In production you'd add rule checks here or plug modular add-ons.
    function canTransfer(address, address, uint256) external pure override returns (bool) {
        return true;
    }
}