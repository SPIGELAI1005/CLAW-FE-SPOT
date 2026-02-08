import { expect } from "chai";
import { ethers } from "hardhat";
import { CertificationRegistry } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("CertificationRegistry", function () {
  let registry: CertificationRegistry;
  let owner: HardhatEthersSigner;
  let issuer: HardhatEthersSigner;
  let revoker: HardhatEthersSigner;
  let stranger: HardhatEthersSigner;

  const CERT_HASH_1 = ethers.keccak256(ethers.toUtf8Bytes("cert-1"));
  const CERT_HASH_2 = ethers.keccak256(ethers.toUtf8Bytes("cert-2"));
  const CERT_HASH_3 = ethers.keccak256(ethers.toUtf8Bytes("cert-3"));

  // Status enum values
  const STATUS_NONE = 0;
  const STATUS_VALID = 1;
  const STATUS_REVOKED = 2;
  const STATUS_SUPERSEDED = 3;

  beforeEach(async function () {
    [owner, issuer, revoker, stranger] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("CertificationRegistry");
    registry = await Factory.deploy(issuer.address);
    await registry.waitForDeployment();

    // Add a separate revoker (issuer already has both roles from constructor)
    await registry.connect(owner).addRevoker(revoker.address);
  });

  // ── Deployment ──────────────────────────────────────────────────

  describe("Deployment", function () {
    it("sets the deployer as owner", async function () {
      expect(await registry.owner()).to.equal(owner.address);
    });

    it("grants the initial issuer both ISSUER and REVOKER roles", async function () {
      expect(await registry.authorizedIssuers(issuer.address)).to.be.true;
      expect(await registry.authorizedRevokers(issuer.address)).to.be.true;
    });

    it("does not grant roles to the owner by default", async function () {
      expect(await registry.authorizedIssuers(owner.address)).to.be.false;
    });
  });

  // ── Register (happy path) ──────────────────────────────────────

  describe("register", function () {
    it("registers a new cert hash and emits CertRegistered", async function () {
      const tx = registry.connect(issuer).register(CERT_HASH_1);
      await expect(tx)
        .to.emit(registry, "CertRegistered")
        .withArgs(CERT_HASH_1, issuer.address, (ts: bigint) => ts > 0n);
    });

    it("stores the correct record", async function () {
      await registry.connect(issuer).register(CERT_HASH_1);
      const record = await registry.getCertificate(CERT_HASH_1);

      expect(record.issuer).to.equal(issuer.address);
      expect(record.timestamp).to.be.greaterThan(0n);
      expect(record.status).to.equal(STATUS_VALID);
    });

    it("isValid returns true after registration", async function () {
      await registry.connect(issuer).register(CERT_HASH_1);
      expect(await registry.isValid(CERT_HASH_1)).to.be.true;
    });
  });

  // ── anchor (backward compat alias) ─────────────────────────────

  describe("anchor (alias)", function () {
    it("works identically to register", async function () {
      const tx = registry.connect(issuer).anchor(CERT_HASH_1);
      await expect(tx)
        .to.emit(registry, "CertRegistered")
        .withArgs(CERT_HASH_1, issuer.address, (ts: bigint) => ts > 0n);

      expect(await registry.isValid(CERT_HASH_1)).to.be.true;
    });
  });

  // ── Duplicate registration ─────────────────────────────────────

  describe("duplicate registration", function () {
    it("reverts when registering the same hash twice", async function () {
      await registry.connect(issuer).register(CERT_HASH_1);
      await expect(
        registry.connect(issuer).register(CERT_HASH_1),
      ).to.be.revertedWith("CertRegistry: hash already registered");
    });

    it("reverts anchor on duplicate too", async function () {
      await registry.connect(issuer).anchor(CERT_HASH_1);
      await expect(
        registry.connect(issuer).anchor(CERT_HASH_1),
      ).to.be.revertedWith("CertRegistry: hash already registered");
    });
  });

  // ── Revoke ─────────────────────────────────────────────────────

  describe("revoke", function () {
    beforeEach(async function () {
      await registry.connect(issuer).register(CERT_HASH_1);
    });

    it("changes status to Revoked and emits CertRevoked", async function () {
      const tx = registry.connect(revoker).revoke(CERT_HASH_1, "compliance-violation");
      await expect(tx)
        .to.emit(registry, "CertRevoked")
        .withArgs(CERT_HASH_1, revoker.address, "compliance-violation");

      const record = await registry.getCertificate(CERT_HASH_1);
      expect(record.status).to.equal(STATUS_REVOKED);
    });

    it("isValid returns false after revocation", async function () {
      await registry.connect(revoker).revoke(CERT_HASH_1, "test");
      expect(await registry.isValid(CERT_HASH_1)).to.be.false;
    });

    it("issuer with revoker role can also revoke", async function () {
      // issuer was granted revoker role in constructor
      await expect(
        registry.connect(issuer).revoke(CERT_HASH_1, "issuer-revoking"),
      ).to.emit(registry, "CertRevoked");
    });

    it("reverts when revoking an unknown cert", async function () {
      await expect(
        registry.connect(revoker).revoke(CERT_HASH_2, "unknown"),
      ).to.be.revertedWith("CertRegistry: can only revoke valid certs");
    });

    it("reverts when revoking an already revoked cert", async function () {
      await registry.connect(revoker).revoke(CERT_HASH_1, "first");
      await expect(
        registry.connect(revoker).revoke(CERT_HASH_1, "second"),
      ).to.be.revertedWith("CertRegistry: can only revoke valid certs");
    });
  });

  // ── Supersede ──────────────────────────────────────────────────

  describe("supersede", function () {
    beforeEach(async function () {
      await registry.connect(issuer).register(CERT_HASH_1);
    });

    it("sets old to Superseded, new to Valid, emits both events", async function () {
      const tx = registry.connect(issuer).supersede(CERT_HASH_1, CERT_HASH_2);
      await expect(tx)
        .to.emit(registry, "CertSuperseded")
        .withArgs(CERT_HASH_1, CERT_HASH_2);
      await expect(tx)
        .to.emit(registry, "CertRegistered")
        .withArgs(CERT_HASH_2, issuer.address, (ts: bigint) => ts > 0n);

      const oldRecord = await registry.getCertificate(CERT_HASH_1);
      expect(oldRecord.status).to.equal(STATUS_SUPERSEDED);
      expect(oldRecord.supersededBy).to.equal(CERT_HASH_2);

      const newRecord = await registry.getCertificate(CERT_HASH_2);
      expect(newRecord.status).to.equal(STATUS_VALID);
    });

    it("isValid returns false for old and true for new", async function () {
      await registry.connect(issuer).supersede(CERT_HASH_1, CERT_HASH_2);
      expect(await registry.isValid(CERT_HASH_1)).to.be.false;
      expect(await registry.isValid(CERT_HASH_2)).to.be.true;
    });

    it("reverts when superseding a revoked cert", async function () {
      await registry.connect(issuer).revoke(CERT_HASH_1, "revoked");
      await expect(
        registry.connect(issuer).supersede(CERT_HASH_1, CERT_HASH_2),
      ).to.be.revertedWith("CertRegistry: old cert must be valid");
    });

    it("reverts when new hash is already registered", async function () {
      await registry.connect(issuer).register(CERT_HASH_2);
      await expect(
        registry.connect(issuer).supersede(CERT_HASH_1, CERT_HASH_2),
      ).to.be.revertedWith("CertRegistry: new hash already registered");
    });

    it("reverts when superseding a non-existent cert", async function () {
      await expect(
        registry.connect(issuer).supersede(CERT_HASH_3, CERT_HASH_2),
      ).to.be.revertedWith("CertRegistry: old cert must be valid");
    });
  });

  // ── Read functions ─────────────────────────────────────────────

  describe("read functions", function () {
    it("getCertificate returns zero record for unregistered hash", async function () {
      const record = await registry.getCertificate(CERT_HASH_1);
      expect(record.status).to.equal(STATUS_NONE);
      expect(record.issuer).to.equal(ethers.ZeroAddress);
    });

    it("verify (alias) returns same as getCertificate", async function () {
      await registry.connect(issuer).register(CERT_HASH_1);
      const a = await registry.getCertificate(CERT_HASH_1);
      const b = await registry.verify(CERT_HASH_1);
      expect(a.issuer).to.equal(b.issuer);
      expect(a.timestamp).to.equal(b.timestamp);
      expect(a.status).to.equal(b.status);
    });

    it("isValid returns false for unregistered hash", async function () {
      expect(await registry.isValid(CERT_HASH_1)).to.be.false;
    });
  });

  // ── Access control ─────────────────────────────────────────────

  describe("access control", function () {
    it("stranger cannot register", async function () {
      await expect(
        registry.connect(stranger).register(CERT_HASH_1),
      ).to.be.revertedWith("CertRegistry: caller is not an authorized issuer");
    });

    it("stranger cannot anchor", async function () {
      await expect(
        registry.connect(stranger).anchor(CERT_HASH_1),
      ).to.be.revertedWith("CertRegistry: caller is not an authorized issuer");
    });

    it("stranger cannot revoke", async function () {
      await registry.connect(issuer).register(CERT_HASH_1);
      await expect(
        registry.connect(stranger).revoke(CERT_HASH_1, "nope"),
      ).to.be.revertedWith("CertRegistry: caller is not an authorized revoker");
    });

    it("stranger cannot supersede", async function () {
      await registry.connect(issuer).register(CERT_HASH_1);
      await expect(
        registry.connect(stranger).supersede(CERT_HASH_1, CERT_HASH_2),
      ).to.be.revertedWith("CertRegistry: caller is not an authorized issuer");
    });

    it("only owner can add/remove issuers", async function () {
      await expect(
        registry.connect(stranger).addIssuer(stranger.address),
      ).to.be.revertedWith("CertRegistry: caller is not the owner");

      await expect(
        registry.connect(stranger).removeIssuer(issuer.address),
      ).to.be.revertedWith("CertRegistry: caller is not the owner");
    });

    it("only owner can add/remove revokers", async function () {
      await expect(
        registry.connect(stranger).addRevoker(stranger.address),
      ).to.be.revertedWith("CertRegistry: caller is not the owner");

      await expect(
        registry.connect(stranger).removeRevoker(revoker.address),
      ).to.be.revertedWith("CertRegistry: caller is not the owner");
    });

    it("revoker-only address cannot register", async function () {
      // revoker is only a revoker, not an issuer
      expect(await registry.authorizedIssuers(revoker.address)).to.be.false;
      await expect(
        registry.connect(revoker).register(CERT_HASH_1),
      ).to.be.revertedWith("CertRegistry: caller is not an authorized issuer");
    });
  });

  // ── Admin: role management ─────────────────────────────────────

  describe("role management", function () {
    it("owner can add and remove an issuer", async function () {
      await expect(registry.connect(owner).addIssuer(stranger.address))
        .to.emit(registry, "IssuerAdded")
        .withArgs(stranger.address);

      expect(await registry.authorizedIssuers(stranger.address)).to.be.true;

      await expect(registry.connect(owner).removeIssuer(stranger.address))
        .to.emit(registry, "IssuerRemoved")
        .withArgs(stranger.address);

      expect(await registry.authorizedIssuers(stranger.address)).to.be.false;
    });

    it("owner can add and remove a revoker", async function () {
      await expect(registry.connect(owner).addRevoker(stranger.address))
        .to.emit(registry, "RevokerAdded")
        .withArgs(stranger.address);

      expect(await registry.authorizedRevokers(stranger.address)).to.be.true;

      await expect(registry.connect(owner).removeRevoker(stranger.address))
        .to.emit(registry, "RevokerRemoved")
        .withArgs(stranger.address);

      expect(await registry.authorizedRevokers(stranger.address)).to.be.false;
    });

    it("cannot add zero address as issuer", async function () {
      await expect(
        registry.connect(owner).addIssuer(ethers.ZeroAddress),
      ).to.be.revertedWith("CertRegistry: zero address");
    });

    it("cannot add duplicate issuer", async function () {
      await expect(
        registry.connect(owner).addIssuer(issuer.address),
      ).to.be.revertedWith("CertRegistry: already an issuer");
    });

    it("cannot remove non-issuer", async function () {
      await expect(
        registry.connect(owner).removeIssuer(stranger.address),
      ).to.be.revertedWith("CertRegistry: not an issuer");
    });
  });

  // ── Ownership transfer ────────────────────────────────────────

  describe("ownership transfer", function () {
    it("transfers ownership and emits event", async function () {
      await expect(registry.connect(owner).transferOwnership(stranger.address))
        .to.emit(registry, "OwnershipTransferred")
        .withArgs(owner.address, stranger.address);

      expect(await registry.owner()).to.equal(stranger.address);
    });

    it("new owner can manage roles, old owner cannot", async function () {
      await registry.connect(owner).transferOwnership(stranger.address);

      // Old owner fails
      await expect(
        registry.connect(owner).addIssuer(owner.address),
      ).to.be.revertedWith("CertRegistry: caller is not the owner");

      // New owner succeeds
      await expect(
        registry.connect(stranger).addIssuer(owner.address),
      ).to.emit(registry, "IssuerAdded");
    });

    it("cannot transfer to zero address", async function () {
      await expect(
        registry.connect(owner).transferOwnership(ethers.ZeroAddress),
      ).to.be.revertedWith("CertRegistry: zero address");
    });
  });

  // ── Invalid state transitions ─────────────────────────────────

  describe("invalid state transitions", function () {
    it("cannot supersede a superseded cert", async function () {
      await registry.connect(issuer).register(CERT_HASH_1);
      await registry.connect(issuer).supersede(CERT_HASH_1, CERT_HASH_2);

      await expect(
        registry.connect(issuer).supersede(CERT_HASH_1, CERT_HASH_3),
      ).to.be.revertedWith("CertRegistry: old cert must be valid");
    });

    it("cannot revoke a superseded cert", async function () {
      await registry.connect(issuer).register(CERT_HASH_1);
      await registry.connect(issuer).supersede(CERT_HASH_1, CERT_HASH_2);

      await expect(
        registry.connect(issuer).revoke(CERT_HASH_1, "too late"),
      ).to.be.revertedWith("CertRegistry: can only revoke valid certs");
    });
  });
});
