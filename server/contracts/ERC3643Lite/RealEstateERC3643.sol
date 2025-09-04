// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20, ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {AccessControl}        from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable}             from "@openzeppelin/contracts/utils/Pausable.sol";
import {IIdentityRegistry}    from "../interfaces/IIdentityRegistry.sol";
import {ICompliance}          from "../interfaces/ICompliance.sol";

/// @title RealEstateERC3643
/// @notice ERC-20 compatible token implementing ERC-3643 token interface behaviors:
/// - enforces IdentityRegistry.isVerified() and Compliance.canTransfer() on all flows
/// - exposes admin/agent ops common in ERC-3643 tokens (pause, forcedTransfer, freeze flags)
/// This is a *lite* implementation for Plume dev/test; swap with the official T-REX later.
contract RealEstateERC3643 is ERC20, AccessControl, Pausable {
    bytes32 public constant AGENT_ROLE = keccak256("AGENT_ROLE");
    bytes32 public constant OWNER_ROLE = 0x00; // DEFAULT_ADMIN_ROLE

    IIdentityRegistry public identityRegistry;
    ICompliance public compliance;

    // Property-specific metadata
    string public propertyName;
    string public propertyLocation;
    uint256 public propertyValue;
    uint256 public totalTokenSupply;
    uint256 public pricePerToken;
    
    mapping(address => bool) public frozen;
    mapping(address => uint256) public frozenAmount;

    event IdentityRegistryAdded(address indexed registry);
    event ComplianceAdded(address indexed compliance);
    event AddressFrozen(address indexed user, bool isFrozen, address indexed by);
    event TokensFrozen(address indexed user, uint256 amount);
    event TokensUnfrozen(address indexed user, uint256 amount);
    event RecoverySuccess(address indexed lost, address indexed replacement, address indexed investorOnchainID);

    constructor(
        string memory name_,
        string memory symbol_,
        address owner_,
        address identityRegistry_,
        address compliance_,
        string memory propertyName_,
        string memory propertyLocation_,
        uint256 propertyValue_,
        uint256 totalTokenSupply_,
        uint256 pricePerToken_
    ) ERC20(name_, symbol_) {
        _grantRole(OWNER_ROLE, owner_);
        _grantRole(AGENT_ROLE, owner_);

        identityRegistry = IIdentityRegistry(identityRegistry_);
        compliance       = ICompliance(compliance_);

        // Property metadata
        propertyName = propertyName_;
        propertyLocation = propertyLocation_;
        propertyValue = propertyValue_;
        totalTokenSupply = totalTokenSupply_;
        pricePerToken = pricePerToken_;

        // bind token to compliance controller
        ICompliance(compliance_).bindToken(address(this));
        emit IdentityRegistryAdded(identityRegistry_);
        emit ComplianceAdded(compliance_);
    }

    /* -------------------------- ERC-3643 admin surface -------------------------- */

    function setIdentityRegistry(address newReg) external onlyRole(OWNER_ROLE) {
        identityRegistry = IIdentityRegistry(newReg);
        emit IdentityRegistryAdded(newReg);
    }

    function setCompliance(address newCompliance) external onlyRole(OWNER_ROLE) {
        compliance = ICompliance(newCompliance);
        ICompliance(newCompliance).bindToken(address(this));
        emit ComplianceAdded(newCompliance);
    }

    function pause() external onlyRole(AGENT_ROLE) { _pause(); }
    function unpause() external onlyRole(AGENT_ROLE) { _unpause(); }

    function setAddressFrozen(address user, bool freeze_) external onlyRole(AGENT_ROLE) {
        frozen[user] = freeze_;
        emit AddressFrozen(user, freeze_, msg.sender);
    }

    function freezePartialTokens(address user, uint256 amt) external onlyRole(AGENT_ROLE) {
        require(balanceOf(user) >= frozenAmount[user] + amt, "exceeds bal");
        frozenAmount[user] += amt;
        emit TokensFrozen(user, amt);
    }

    function unfreezePartialTokens(address user, uint256 amt) external onlyRole(AGENT_ROLE) {
        require(frozenAmount[user] >= amt, "exceeds frozen");
        frozenAmount[user] -= amt;
        emit TokensUnfrozen(user, amt);
    }

    /// @notice Agent remediation tool (ERC-3643: forced transfer)
    function forcedTransfer(address from, address to, uint256 amount)
        external
        onlyRole(AGENT_ROLE)
        returns (bool)
    {
        _beforeCheck(from, to, amount, true);
        _update(from, to, amount);
        compliance.transferred(from, to, amount);
        return true;
    }

    /// @notice Agent mint (to a verified address)
    function mint(address to, uint256 amount) external onlyRole(AGENT_ROLE) {
        _beforeCheck(address(0), to, amount, false);
        _update(address(0), to, amount);
        compliance.created(to, amount);
    }

    /// @notice Agent burn from an address
    function burn(address from, uint256 amount) external onlyRole(AGENT_ROLE) {
        _update(from, address(0), amount);
        compliance.destroyed(from, amount);
    }

    /// @notice Recovery from lost wallet to a new wallet (simplified)
    function recoveryAddress(address lost, address replacement, address investorOnchainID)
        external
        onlyRole(AGENT_ROLE)
        returns (bool)
    {
        uint256 bal = balanceOf(lost);
        if (bal > 0) {
            _beforeCheck(lost, replacement, bal, true);
            _update(lost, replacement, bal);
            compliance.transferred(lost, replacement, bal);
        }
        emit RecoverySuccess(lost, replacement, investorOnchainID);
        return true;
    }

    /* ---------------------------- Core transfer checks --------------------------- */
    function _beforeCheck(address from, address to, uint256 amount, bool bypassAllowlist) internal view {
        require(!paused(), "paused");
        if (from != address(0)) {
            require(!frozen[from], "from frozen");
            require(balanceOf(from) - frozenAmount[from] >= amount, "frozen portion");
            require(identityRegistry.isVerified(from) || bypassAllowlist, "from not verified");
        }
        if (to != address(0)) {
            require(!frozen[to], "to frozen");
            require(identityRegistry.isVerified(to) || bypassAllowlist, "to not verified");
            require(compliance.canTransfer(from, to, amount), "compliance blocked");
        }
    }

    function _update(address from, address to, uint256 value)
        internal
        override
        whenNotPaused
    {
        _beforeCheck(from, to, value, false);
        super._update(from, to, value);
        if (from != address(0) && to != address(0)) compliance.transferred(from, to, value);
        else if (from == address(0)) compliance.created(to, value);
        else if (to == address(0)) compliance.destroyed(from, value);
    }

    /* ---------------------------- Property Info Getters -------------------------- */
    function getPropertyInfo() external view returns (
        string memory name,
        string memory location,
        uint256 value,
        uint256 tokenSupply,
        uint256 tokenPrice
    ) {
        return (propertyName, propertyLocation, propertyValue, totalTokenSupply, pricePerToken);
    }
}