// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract StakingContract is Ownable {
    IERC20 public stakingToken;
    IERC1155 public nftContract;
    uint256 public stakeThreshold;
    uint256 public nextTokenId;
    
    mapping(address => uint256) public stakes;
    
    event Staked(address indexed user, uint256 amount);
    event NFTClaimed(address indexed user, uint256 tokenId);

    constructor(address _stakingToken, address _nftContract, uint256 _stakeThreshold) {
        stakingToken = IERC20(_stakingToken);
        nftContract = IERC1155(_nftContract);
        stakeThreshold = _stakeThreshold;
        nextTokenId = 1;
    }

    function stake(uint256 _amount) external {
        require(_amount > 0, "Amount must be greater than zero");
        require(stakingToken.balanceOf(msg.sender) >= _amount, "Insufficient staking token balance");
        
        stakingToken.transferFrom(msg.sender, address(this), _amount);
        stakes[msg.sender] += _amount;
        
        emit Staked(msg.sender, _amount);
        
        if (stakes[msg.sender] >= stakeThreshold) {
            uint256 numNFTsToClaim = stakes[msg.sender] / stakeThreshold;
            
            for (uint256 i = 0; i < numNFTsToClaim; i++) {
                nftContract.mint(msg.sender, nextTokenId, 1, "");
                emit NFTClaimed(msg.sender, nextTokenId);
                nextTokenId++;
            }
            
            stakes[msg.sender] %= stakeThreshold;
        }
    }
}
