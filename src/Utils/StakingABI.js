export const StakingABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_usdt",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_dcmanager",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_refContract",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "Active",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "DCTokenAddress",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_user",
                "type": "address"
            }
        ],
        "name": "calculateAllReward",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "staticReward",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "dynamicReward",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "available",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct StakingContract.RewardStruct[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "callTest",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newAddr",
                "type": "address"
            }
        ],
        "name": "changeDCTokenAddress",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_refContract",
                "type": "address"
            }
        ],
        "name": "changeRefContract",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_user",
                "type": "address"
            }
        ],
        "name": "checkUpgradablity",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_amount",
                "type": "uint256"
            }
        ],
        "name": "claimDynamicReward",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_amount",
                "type": "uint256"
            }
        ],
        "name": "claimStaticReward",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_user",
                "type": "address"
            }
        ],
        "name": "getReferralRanks",
        "outputs": [
            {
                "internalType": "uint256[7]",
                "name": "",
                "type": "uint256[7]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_user",
                "type": "address"
            },
            {
                "internalType": "uint8",
                "name": "index",
                "type": "uint8"
            }
        ],
        "name": "getRefsWithRank",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_user",
                "type": "address"
            }
        ],
        "name": "getStakeUser",
        "outputs": [
            {
                "components": [
                    {
                        "components": [
                            {
                                "internalType": "uint256",
                                "name": "reward",
                                "type": "uint256"
                            },
                            {
                                "internalType": "uint256",
                                "name": "staticClaimed",
                                "type": "uint256"
                            },
                            {
                                "internalType": "uint256",
                                "name": "dynamicClaimed",
                                "type": "uint256"
                            },
                            {
                                "internalType": "uint256",
                                "name": "timestamp",
                                "type": "uint256"
                            },
                            {
                                "internalType": "uint256",
                                "name": "directBonus",
                                "type": "uint256"
                            },
                            {
                                "internalType": "uint256",
                                "name": "directClaimed",
                                "type": "uint256"
                            }
                        ],
                        "internalType": "struct StakingContract.StakeStruct[]",
                        "name": "stakes",
                        "type": "tuple[]"
                    },
                    {
                        "internalType": "uint256",
                        "name": "dynamicLimit",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "staticLimit",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct StakingContract.UserStruct",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_user",
                "type": "address"
            }
        ],
        "name": "getStakes",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "reward",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "staticClaimed",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "dynamicClaimed",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "timestamp",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "directBonus",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "directClaimed",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct StakingContract.StakeStruct[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_user",
                "type": "address"
            }
        ],
        "name": "getTeamUser",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "totalRefStake",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "totalStake",
                        "type": "uint256"
                    },
                    {
                        "components": [
                            {
                                "internalType": "uint256",
                                "name": "start",
                                "type": "uint256"
                            },
                            {
                                "internalType": "uint256",
                                "name": "end",
                                "type": "uint256"
                            },
                            {
                                "internalType": "uint8",
                                "name": "multiplier",
                                "type": "uint8"
                            },
                            {
                                "internalType": "uint256",
                                "name": "reward",
                                "type": "uint256"
                            },
                            {
                                "internalType": "address",
                                "name": "referer",
                                "type": "address"
                            }
                        ],
                        "internalType": "struct RefContract.RankBonus[]",
                        "name": "rankBonus",
                        "type": "tuple[]"
                    },
                    {
                        "internalType": "address",
                        "name": "referer",
                        "type": "address"
                    },
                    {
                        "internalType": "address[][]",
                        "name": "downReferrals",
                        "type": "address[][]"
                    },
                    {
                        "internalType": "uint8",
                        "name": "rank",
                        "type": "uint8"
                    },
                    {
                        "components": [
                            {
                                "internalType": "uint256",
                                "name": "reward",
                                "type": "uint256"
                            },
                            {
                                "internalType": "uint256",
                                "name": "timestamp",
                                "type": "uint256"
                            }
                        ],
                        "internalType": "struct RefContract.RelationStruct[]",
                        "name": "relationBonus",
                        "type": "tuple[]"
                    }
                ],
                "internalType": "struct RefContract.TeamUserStruct",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_user",
                "type": "address"
            }
        ],
        "name": "getTotalRewards",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "staticReward",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "dynamicReward",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "available",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct StakingContract.RewardStruct",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_user",
                "type": "address"
            }
        ],
        "name": "getTotalStakes",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_friend",
                "type": "address"
            }
        ],
        "name": "signIn",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_amount",
                "type": "uint256"
            }
        ],
        "name": "stake",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "token",
        "outputs": [
            {
                "internalType": "contract IERC20",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalDeposite",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalUsers",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "upgradeLevel",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_token",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "withDrawTokens",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]