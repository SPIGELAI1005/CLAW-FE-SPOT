// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title CertificationRegistry
 * @notice Minimal on-chain registry for CLAW:FE SPOT certification fingerprints.
 *
 * Stores only bytes32 fingerprints (SHA-256 hashes of canonical certification
 * packages). No PII, prompts, chat logs, or user content is ever stored on-chain.
 *
 * Features:
 *  - Register/Anchor: Store a unique fingerprint with Valid status
 *  - Revoke: Transition a Valid fingerprint to Revoked
 *  - Supersede: Atomically transition old cert to Superseded and anchor new one
 *  - Verify/getCertificate: Free read, returns the full CertRecord
 *  - isValid: Convenience boolean check
 *
 * Access control:
 *  - Owner: Can add/remove issuers and revokers, transfer ownership
 *  - Issuers (ISSUER role): Can register/anchor and supersede
 *  - Revokers (REVOKER role): Can revoke certifications
 *  - An address can hold both roles simultaneously
 *
 * All state transitions emit events for full auditability.
 */
contract CertificationRegistry {
    // ── Types ──────────────────────────────────────────────────────

    enum Status {
        None,       // 0: not registered
        Valid,      // 1: active certification
        Revoked,    // 2: revoked by issuer or revoker
        Superseded  // 3: replaced by a newer certification
    }

    struct CertRecord {
        address issuer;
        uint64 timestamp;
        Status status;
        bytes32 supersededBy;
    }

    // ── State ──────────────────────────────────────────────────────

    address public owner;
    mapping(bytes32 => CertRecord) public records;
    mapping(address => bool) public authorizedIssuers;
    mapping(address => bool) public authorizedRevokers;

    // ── Events ─────────────────────────────────────────────────────

    event CertRegistered(bytes32 indexed certHash, address issuer, uint64 timestamp);
    event CertRevoked(bytes32 indexed certHash, address revoker, string reasonCode);
    event CertSuperseded(bytes32 indexed oldCertHash, bytes32 indexed newCertHash);
    event IssuerAdded(address indexed account);
    event IssuerRemoved(address indexed account);
    event RevokerAdded(address indexed account);
    event RevokerRemoved(address indexed account);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // ── Modifiers ──────────────────────────────────────────────────

    modifier onlyOwner() {
        require(msg.sender == owner, "CertRegistry: caller is not the owner");
        _;
    }

    modifier onlyIssuer() {
        require(authorizedIssuers[msg.sender], "CertRegistry: caller is not an authorized issuer");
        _;
    }

    modifier onlyRevoker() {
        require(authorizedRevokers[msg.sender], "CertRegistry: caller is not an authorized revoker");
        _;
    }

    // ── Constructor ────────────────────────────────────────────────

    constructor(address _initialIssuer) {
        owner = msg.sender;
        if (_initialIssuer != address(0)) {
            authorizedIssuers[_initialIssuer] = true;
            authorizedRevokers[_initialIssuer] = true;
            emit IssuerAdded(_initialIssuer);
            emit RevokerAdded(_initialIssuer);
        }
    }

    // ── Write Functions ────────────────────────────────────────────

    /**
     * @notice Register a new certification fingerprint on-chain.
     * @param certHash The SHA-256 fingerprint of the certification package.
     * @dev Reverts if the fingerprint has already been registered.
     *      Timestamp is captured from block.timestamp (tamper-resistant).
     */
    function register(bytes32 certHash) external onlyIssuer {
        require(records[certHash].status == Status.None, "CertRegistry: hash already registered");

        uint64 ts = uint64(block.timestamp);
        records[certHash] = CertRecord({
            issuer: msg.sender,
            timestamp: ts,
            status: Status.Valid,
            supersededBy: bytes32(0)
        });

        emit CertRegistered(certHash, msg.sender, ts);
    }

    /**
     * @notice Alias for register(). Kept for backward compatibility.
     */
    function anchor(bytes32 certHash) external onlyIssuer {
        require(records[certHash].status == Status.None, "CertRegistry: hash already registered");

        uint64 ts = uint64(block.timestamp);
        records[certHash] = CertRecord({
            issuer: msg.sender,
            timestamp: ts,
            status: Status.Valid,
            supersededBy: bytes32(0)
        });

        emit CertRegistered(certHash, msg.sender, ts);
    }

    /**
     * @notice Revoke a valid certification.
     * @param certHash The fingerprint to revoke.
     * @param reasonCode Human-readable reason for revocation (stored in event only).
     * @dev Only authorized revokers can call. Reverts for unknown or already non-valid certs.
     */
    function revoke(bytes32 certHash, string calldata reasonCode) external onlyRevoker {
        require(records[certHash].status == Status.Valid, "CertRegistry: can only revoke valid certs");

        records[certHash].status = Status.Revoked;

        emit CertRevoked(certHash, msg.sender, reasonCode);
    }

    /**
     * @notice Supersede an old certification with a new one.
     * @param oldCertHash The fingerprint being superseded.
     * @param newCertHash The fingerprint of the replacement certification.
     * @dev Atomically: old -> Superseded, new -> Valid.
     *      Reverts if old is not Valid or new is already registered.
     */
    function supersede(bytes32 oldCertHash, bytes32 newCertHash) external onlyIssuer {
        require(records[oldCertHash].status == Status.Valid, "CertRegistry: old cert must be valid");
        require(records[newCertHash].status == Status.None, "CertRegistry: new hash already registered");

        // Mark old as superseded
        records[oldCertHash].status = Status.Superseded;
        records[oldCertHash].supersededBy = newCertHash;

        // Register new as valid
        uint64 ts = uint64(block.timestamp);
        records[newCertHash] = CertRecord({
            issuer: msg.sender,
            timestamp: ts,
            status: Status.Valid,
            supersededBy: bytes32(0)
        });

        emit CertSuperseded(oldCertHash, newCertHash);
        emit CertRegistered(newCertHash, msg.sender, ts);
    }

    // ── Read Functions ─────────────────────────────────────────────

    /**
     * @notice Get the full CertRecord for a fingerprint. Free read (no gas).
     * @param certHash The fingerprint to look up.
     * @return record The full CertRecord (issuer, timestamp, status, supersededBy).
     */
    function getCertificate(bytes32 certHash) external view returns (CertRecord memory record) {
        return records[certHash];
    }

    /**
     * @notice Alias for getCertificate(). Kept for backward compatibility.
     */
    function verify(bytes32 certHash) external view returns (CertRecord memory) {
        return records[certHash];
    }

    /**
     * @notice Check whether a fingerprint is currently valid.
     * @param certHash The fingerprint to check.
     * @return True if the certificate exists and has Valid status.
     */
    function isValid(bytes32 certHash) external view returns (bool) {
        return records[certHash].status == Status.Valid;
    }

    // ── Admin Functions ────────────────────────────────────────────

    function addIssuer(address account) external onlyOwner {
        require(account != address(0), "CertRegistry: zero address");
        require(!authorizedIssuers[account], "CertRegistry: already an issuer");
        authorizedIssuers[account] = true;
        emit IssuerAdded(account);
    }

    function removeIssuer(address account) external onlyOwner {
        require(authorizedIssuers[account], "CertRegistry: not an issuer");
        authorizedIssuers[account] = false;
        emit IssuerRemoved(account);
    }

    function addRevoker(address account) external onlyOwner {
        require(account != address(0), "CertRegistry: zero address");
        require(!authorizedRevokers[account], "CertRegistry: already a revoker");
        authorizedRevokers[account] = true;
        emit RevokerAdded(account);
    }

    function removeRevoker(address account) external onlyOwner {
        require(authorizedRevokers[account], "CertRegistry: not a revoker");
        authorizedRevokers[account] = false;
        emit RevokerRemoved(account);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "CertRegistry: zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
