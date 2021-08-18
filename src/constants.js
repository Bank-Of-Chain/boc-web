// MY INFURA_ID, SWAP IN YOURS FROM https://infura.io/dashboard/ethereum
export const INFURA_ID = "b5156ceaa4b644c49e74b1301121a6c6";

// MY ETHERSCAN_ID, SWAP IN YOURS FROM https://etherscan.io/myapikey
export const ETHERSCAN_KEY = "PSW8C433Q667DVEX5BCRMGNAH9FSGFZ7Q8";

// EXTERNAL CONTRACTS

export const VAULT_ADDRESS = "0xB0D4afd8879eD9F52b28595d31B441D079B2Ca07";

export const VAULT_ABI = [{
    "anonymous": false,
    "inputs": [{
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{
        "indexed": true,
        "internalType": "address",
        "name": "userAddress",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "Deposit",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{
        "indexed": true,
        "internalType": "address",
        "name": "strategy",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "minDebtPerHarvest",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "maxDebtPerHarvest",
        "type": "uint256"
      }
    ],
    "name": "StrategyAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{
        "indexed": false,
        "internalType": "address",
        "name": "oldVersion",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "newVersion",
        "type": "address"
      }
    ],
    "name": "StrategyMigrated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{
      "indexed": true,
      "internalType": "address",
      "name": "strategy",
      "type": "address"
    }],
    "name": "StrategyRevoked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{
        "indexed": true,
        "internalType": "address",
        "name": "userAddress",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "Withdraw",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "activation",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{
        "internalType": "address",
        "name": "strategy",
        "type": "address"
      },
      {
        "internalType": "int256",
        "name": "_apy",
        "type": "int256"
      },
      {
        "internalType": "uint256",
        "name": "_debtRatio",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_minDebtPerHarvest",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_maxDebtPerHarvest",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_profitLimitRatio",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_lossLimitRatio",
        "type": "uint256"
      }
    ],
    "name": "addStrategy",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{
      "internalType": "address",
      "name": "_target",
      "type": "address"
    }],
    "name": "addToWhiteList",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "allowance",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [{
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{
      "internalType": "address",
      "name": "account",
      "type": "address"
    }],
    "name": "balanceOf",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{
        "internalType": "address",
        "name": "strategy",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "gainValue",
        "type": "uint256"
      }
    ],
    "name": "creditAvailable",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{
      "internalType": "address",
      "name": "_strategy",
      "type": "address"
    }],
    "name": "debtOutstanding",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "debtRatio",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{
      "internalType": "uint8",
      "name": "",
      "type": "uint8"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "subtractedValue",
        "type": "uint256"
      }
    ],
    "name": "decreaseAllowance",
    "outputs": [{
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{
      "internalType": "uint256",
      "name": "_amount",
      "type": "uint256"
    }],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "emergencyShutdown",
    "outputs": [{
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{
      "internalType": "address",
      "name": "strategy",
      "type": "address"
    }],
    "name": "expectedReturn",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getStrategies",
    "outputs": [{
      "internalType": "address[]",
      "name": "",
      "type": "address[]"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{
      "internalType": "address",
      "name": "_strategy",
      "type": "address"
    }],
    "name": "getStrategyApy",
    "outputs": [{
      "internalType": "int256",
      "name": "",
      "type": "int256"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "governance",
    "outputs": [{
      "internalType": "address",
      "name": "",
      "type": "address"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "addedValue",
        "type": "uint256"
      }
    ],
    "name": "increaseAllowance",
    "outputs": [{
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{
        "internalType": "address",
        "name": "_token",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_management",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_keeper",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_rewards",
        "type": "address"
      }
    ],
    "name": "initialize",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "keeper",
    "outputs": [{
      "internalType": "address",
      "name": "",
      "type": "address"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "lastReport",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "lockedProfit",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "lockedProfitDegradation",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "management",
    "outputs": [{
      "internalType": "address",
      "name": "",
      "type": "address"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "maxInvestLimit",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "maxProtocolLimit",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "maxStrategyLimit",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{
        "internalType": "address",
        "name": "oldVersion",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "newVersion",
        "type": "address"
      }
    ],
    "name": "migrateStrategy",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "myDecimals",
    "outputs": [{
      "internalType": "uint8",
      "name": "",
      "type": "uint8"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [{
      "internalType": "string",
      "name": "",
      "type": "string"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pricePerShare",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "profitFeePercent",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{
      "internalType": "address",
      "name": "_target",
      "type": "address"
    }],
    "name": "removeFromWhiteList",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{
      "internalType": "address",
      "name": "_strategy",
      "type": "address"
    }],
    "name": "removeStrategy",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{
        "internalType": "uint256",
        "name": "gain",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "loss",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_debtPayment",
        "type": "uint256"
      }
    ],
    "name": "report",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{
      "internalType": "address",
      "name": "_strategy",
      "type": "address"
    }],
    "name": "revokeStrategy",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "rewards",
    "outputs": [{
      "internalType": "address",
      "name": "",
      "type": "address"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{
      "internalType": "bool",
      "name": "active",
      "type": "bool"
    }],
    "name": "setEmergencyShutdown",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{
      "internalType": "address",
      "name": "_governance",
      "type": "address"
    }],
    "name": "setGovernance",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{
      "internalType": "address",
      "name": "keeperAddress",
      "type": "address"
    }],
    "name": "setKeeper",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{
      "internalType": "uint256",
      "name": "degradation",
      "type": "uint256"
    }],
    "name": "setLockedProfitDegradation",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{
      "internalType": "address",
      "name": "_management",
      "type": "address"
    }],
    "name": "setManagement",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{
      "internalType": "uint256",
      "name": "_maxInvestLimit",
      "type": "uint256"
    }],
    "name": "setMaxInvestLimit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{
      "internalType": "uint256",
      "name": "_maxProtocolLimit",
      "type": "uint256"
    }],
    "name": "setMaxProtocolLimit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{
      "internalType": "uint256",
      "name": "_maxStrategyLimit",
      "type": "uint256"
    }],
    "name": "setMaxStrategyLimit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{
      "internalType": "uint256",
      "name": "_profitFeePercent",
      "type": "uint256"
    }],
    "name": "setProfitFeePercent",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{
      "internalType": "address",
      "name": "_rewards",
      "type": "address"
    }],
    "name": "setRewards",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{
        "internalType": "address",
        "name": "_strategy",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "_enabled",
        "type": "bool"
      }
    ],
    "name": "setStrategyEnforceChangeLimit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{
        "internalType": "address",
        "name": "_strategy",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_lossRatioLimit",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_profitLimitRatio",
        "type": "uint256"
      }
    ],
    "name": "setStrategySetLimitRatio",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{
      "internalType": "address",
      "name": "",
      "type": "address"
    }],
    "name": "strategies",
    "outputs": [{
        "internalType": "uint256",
        "name": "activation",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "debtRatio",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "minDebtPerHarvest",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "maxDebtPerHarvest",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "lastReport",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "originalDebt",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalAsset",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalDebt",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalGain",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalLoss",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "profitLimitRatio",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "lossLimitRatio",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{
      "internalType": "address",
      "name": "_strategy",
      "type": "address"
    }],
    "name": "strategyDebtOutstanding",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{
      "internalType": "address",
      "name": "",
      "type": "address"
    }],
    "name": "strategyEnforceChangeLimit",
    "outputs": [{
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "strategyRankedList",
    "outputs": [{
        "internalType": "uint256",
        "name": "head",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "tail",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "size",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{
      "internalType": "address",
      "name": "_token",
      "type": "address"
    }],
    "name": "sweep",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{
      "internalType": "string",
      "name": "",
      "type": "string"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "token",
    "outputs": [{
      "internalType": "contract IERC20",
      "name": "",
      "type": "address"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalAsset",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalAssets",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalOriginalAssets",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalOriginalDebt",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [{
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [{
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{
        "internalType": "address[]",
        "name": "_strategies",
        "type": "address[]"
      },
      {
        "internalType": "int256[]",
        "name": "_apys",
        "type": "int256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "_debtRatios",
        "type": "uint256[]"
      }
    ],
    "name": "updateApyDebtRadioBatch",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{
        "internalType": "address[]",
        "name": "_strategies",
        "type": "address[]"
      },
      {
        "internalType": "int256[]",
        "name": "_apys",
        "type": "int256[]"
      }
    ],
    "name": "updateStrategyApy",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{
        "internalType": "address[]",
        "name": "_strategies",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "_debtRatios",
        "type": "uint256[]"
      }
    ],
    "name": "updateStrategyDebtRatio",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{
        "internalType": "address",
        "name": "_strategy",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_maxDebtPerHarvest",
        "type": "uint256"
      }
    ],
    "name": "updateStrategyMaxDebtPerHarvest",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{
        "internalType": "address",
        "name": "_strategy",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_minDebtPerHarvest",
        "type": "uint256"
      }
    ],
    "name": "updateStrategyMinDebtPerHarvest",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{
      "internalType": "address",
      "name": "",
      "type": "address"
    }],
    "name": "userDebts",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{
      "internalType": "address",
      "name": "",
      "type": "address"
    }],
    "name": "whiteList",
    "outputs": [{
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{
        "internalType": "uint256",
        "name": "shares",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "maxLoss",
        "type": "uint256"
      }
    ],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export const STRATEGY_ABI = [
  "function name() view returns (string memory)",
  "function balanceOfLpToken() view returns (uint256)",
  "function estimatedTotalAssetsToVault() view returns (uint256)",
  "function minReturnBps() view returns (uint256)",
  "function setMinReturnBps(uint256)",
  "function harvest() external",
  "function setEmergencyExit() external",
  "function balanceOf(address) view returns (uint)",
  "function symbol() view returns (string)",
  "function transfer(address to, uint amount)",
  "function allowance(address owner, address spender) public returns (uint)",
  "function approve(address owner, uint amount)",
]

export const NETWORK = chainId => {
  for (let n in NETWORKS) {
    if (NETWORKS[n].chainId === chainId) {
      return NETWORKS[n];
    }
  }
};

export const NETWORKS = {
  localhost: {
    name: "localhost",
    color: "#666666",
    chainId: 31337,
    blockExplorer: "",
    rpcUrl: "http://" + window.location.hostname + ":8545",
  },
  dev: {
    name: "dev",
    color: "#666666",
    chainId: 31337,
    blockExplorer: "",
    rpcUrl: "http://192.168.254.27:8545",
  },
  mainnet: {
    name: "mainnet",
    color: "#ff8b9e",
    chainId: 1,
    rpcUrl: `https://mainnet.infura.io/v3/${INFURA_ID}`,
    blockExplorer: "https://etherscan.io/",
  },
  kovan: {
    name: "kovan",
    color: "#7003DD",
    chainId: 42,
    rpcUrl: `https://kovan.infura.io/v3/${INFURA_ID}`,
    blockExplorer: "https://kovan.etherscan.io/",
    faucet: "https://gitter.im/kovan-testnet/faucet", // https://faucet.kovan.network/
  },
  rinkeby: {
    name: "rinkeby",
    color: "#e0d068",
    chainId: 4,
    rpcUrl: `https://rinkeby.infura.io/v3/${INFURA_ID}`,
    faucet: "https://faucet.rinkeby.io/",
    blockExplorer: "https://rinkeby.etherscan.io/",
  },
  ropsten: {
    name: "ropsten",
    color: "#F60D09",
    chainId: 3,
    faucet: "https://faucet.ropsten.be/",
    blockExplorer: "https://ropsten.etherscan.io/",
    rpcUrl: `https://ropsten.infura.io/v3/${INFURA_ID}`,
  },
  goerli: {
    name: "goerli",
    color: "#0975F6",
    chainId: 5,
    faucet: "https://goerli-faucet.slock.it/",
    blockExplorer: "https://goerli.etherscan.io/",
    rpcUrl: `https://goerli.infura.io/v3/${INFURA_ID}`,
  },
  xdai: {
    name: "xdai",
    color: "#48a9a6",
    chainId: 100,
    price: 1,
    gasPrice: 1000000000,
    rpcUrl: "https://dai.poa.network",
    faucet: "https://xdai-faucet.top/",
    blockExplorer: "https://blockscout.com/poa/xdai/",
  },
  matic: {
    name: "matic",
    color: "#2bbdf7",
    chainId: 137,
    price: 1,
    gasPrice: 1000000000,
    rpcUrl: "https://rpc-mainnet.maticvigil.com",
    faucet: "https://faucet.matic.network/",
    blockExplorer: "https://explorer-mainnet.maticvigil.com//",
  },
  mumbai: {
    name: "mumbai",
    color: "#92D9FA",
    chainId: 80001,
    price: 1,
    gasPrice: 1000000000,
    rpcUrl: "https://rpc-mumbai.maticvigil.com",
    faucet: "https://faucet.matic.network/",
    blockExplorer: "https://mumbai-explorer.matic.today/",
  },
};