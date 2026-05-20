// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract KrushiChainProof {
    struct Proof {
        string farmerIdHash;
        string landHash;
        string ipfsHash;
        string action;
        uint256 timestamp;
        address storedBy;
        uint256 blockNumber;
    }

    mapping(uint256 => Proof) public proofs;
    uint256 public proofCount;

    event ProofStored(uint256 indexed proofId, string farmerIdHash, string action, uint256 timestamp);

    function storeProof(
        string memory _farmerIdHash,
        string memory _landHash,
        string memory _ipfsHash,
        string memory _action,
        uint256 _timestamp
    ) public returns (uint256) {
        proofCount++;
        proofs[proofCount] = Proof({
            farmerIdHash: _farmerIdHash,
            landHash: _landHash,
            ipfsHash: _ipfsHash,
            action: _action,
            timestamp: _timestamp,
            storedBy: msg.sender,
            blockNumber: block.number
        });
        emit ProofStored(proofCount, _farmerIdHash, _action, _timestamp);
        return proofCount;
    }

    function getProof(uint256 _proofId) public view returns (
        string memory, string memory, string memory, string memory, uint256, address, uint256
    ) {
        Proof memory p = proofs[_proofId];
        return (p.farmerIdHash, p.landHash, p.ipfsHash, p.action, p.timestamp, p.storedBy, p.blockNumber);
    }

    function getProofCount() public view returns (uint256) {
        return proofCount;
    }
}