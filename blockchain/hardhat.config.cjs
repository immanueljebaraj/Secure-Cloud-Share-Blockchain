require("@nomiclabs/hardhat-ethers");

/**
 * Hardhat config - CommonJS (works with Hardhat v2)
 */
module.exports = {
  solidity: "0.8.19",
  networks: {
    ganache: {
      url: "http://127.0.0.1:8545",
      // If your Ganache requires a specific account you can add accounts: [ "0x..." ]
    }
  }
};
