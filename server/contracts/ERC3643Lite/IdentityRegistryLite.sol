// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../interfaces/IIdentityRegistry.sol";

/// @notice Minimal Identity Registry for dev/test. Stores KYC status & optional country/hash.
contract IdentityRegistryLite is IIdentityRegistry {
    address public owner;

    struct Record {
        bool verified;       // passes KYC/AML & required claims
        uint16 country;      // ISO 3166-1 numeric (optional use)
        bytes32 identityHash;// optional pointer (off-chain/ONCHAINID link)
    }
    mapping(address => Record) private _records;

    event OwnerChanged(address indexed oldOwner, address indexed newOwner);
    event IdentitySet(address indexed user, bool verified, uint16 country, bytes32 hash);
    event IdentityDeleted(address indexed user);

    modifier onlyOwner() { require(msg.sender == owner, "Not owner"); _; }

    constructor(address _owner) { owner = _owner; }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "zero");
        emit OwnerChanged(owner, newOwner);
        owner = newOwner;
    }

    function isVerified(address user) external view override returns (bool) {
        return _records[user].verified;
    }

    function registerIdentity(address user, uint16 country, bytes32 hash) external override onlyOwner {
        _records[user] = Record({verified:true, country:country, identityHash:hash});
        emit IdentitySet(user, true, country, hash);
    }

    function updateIdentity(address user, uint16 country, bytes32 hash) external override onlyOwner {
        require(_records[user].verified, "not registered");
        _records[user].country = country;
        _records[user].identityHash = hash;
        emit IdentitySet(user, true, country, hash);
    }

    function deleteIdentity(address user) external override onlyOwner {
        delete _records[user];
        emit IdentityDeleted(user);
    }
}