/**
 * ABI for GenomicVerifier smart contract
 * Based on Compact contract interface
 */

export const GenomicVerifierABI = [
  {
    "inputs": [
      {
        "name": "genomeCommitment",
        "type": "bytes32"
      },
      {
        "name": "mutationPresent",
        "type": "bool"
      },
      {
        "name": "proof",
        "type": "bytes"
      }
    ],
    "name": "verifyBRCA1Mutation",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "name": "genomeCommitment",
        "type": "bytes32"
      },
      {
        "name": "mutationPresent",
        "type": "bool"
      },
      {
        "name": "proof",
        "type": "bytes"
      }
    ],
    "name": "verifyBRCA2Mutation",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "name": "genomeCommitment", 
        "type": "bytes32"
      },
      {
        "name": "metabolizerStatus",
        "type": "uint8"
      },
      {
        "name": "proof",
        "type": "bytes"
      }
    ],
    "name": "verifyCYP2D6Status",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "patient",
        "type": "address"
      },
      {
        "indexed": true,
        "name": "traitType",
        "type": "string"
      },
      {
        "indexed": false,
        "name": "verificationResult",
        "type": "bool"
      },
      {
        "indexed": false,
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "TraitVerified",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "patient",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "commitmentHash",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "GenomeCommitted",
    "type": "event"
  }
] as const;
