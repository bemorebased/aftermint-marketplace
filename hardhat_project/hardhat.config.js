require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || 
  "0x0000000000000000000000000000000000000000000000000000000000000000";
const BASED_AI_RPC_URL = process.env.BASED_AI_RPC_URL || 
  "https://mainnet.basedaibridge.com/rpc/";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.22",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true,
      evmVersion: "paris"
    }
  },
  networks: {
    // BasedAI mainnet
    basedai: {
      url: BASED_AI_RPC_URL,
      chainId: 32323,
      accounts: [PRIVATE_KEY],
      gasPrice: 20000000000, // 20 gwei
      gas: 10000000, // Explicitly set gas limit
      timeout: 120000, // Increase timeout to 120 seconds
      blockGasLimit: 10000000, // Set block gas limit
      throwOnTransactionFailures: true,
      throwOnCallFailures: true
    },
    // Local development
    hardhat: {
      mining: {
        auto: true,
        interval: 0
      }
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 40000
  },
  // Add etherscan configuration for verification
  etherscan: {
    apiKey: {
      basedai: "apiKeyNotNeeded", // Many explorers don't need an API key
    },
    customChains: [
      {
        network: "basedai",
        chainId: 32323,
        urls: {
          apiURL: "https://explorer.bf1337.org/api", // API URL for verification
          browserURL: "https://explorer.bf1337.org", // Explorer URL for browsing
        },
      },
    ],
  }
};
