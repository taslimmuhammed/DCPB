// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// @title NFT Staking 
/// @author Karan J Goraniya
/// @notice You can use this contract for only the most basic simulation
/// @dev All function calls are currently implemented without side effects

contract Staking is ERC1155Holder {

    IERC1155 public NFTItem;
    using SafeERC20 for IERC20;
    IERC20 private token;
    uint256 decimals = 10**18;    
    struct StakeStruct{
        uint256 amount;
        uint256 timestamp;
    }
    struct User{
        StakeStruct[] stakes;
        uint256 id;
    }
    mapping(address => User) public users;

    constructor(address _token,address _NFTItem) {
        token = IERC20(_token);
        NFTItem = IERC1155(_NFTItem);
    }

    event Stake(address indexed owner, uint256 id, uint256 amount, uint256 time);


    // @notice It will calculate the rate of the token reward
    // @dev It will block.timestamp to track the time.
    // @return Return the reward rate %




    // @notice It will give user to stake the NFT.
    // @dev It will confirm the you have enough NFT to stake.
    // @param It will take Token Id of NFT & Amount.

    function stakeNFT( uint256 _amount) public {
        require(NFTItem.balanceOf(msg.sender, 0) >= _amount,"you dont have enough balance");
        NFTItem.safeTransferFrom(msg.sender, address(this), 0, _amount, "0x00");
        users[msg.sender].stakes.push(StakeStruct( _amount, block.timestamp));
        emit Stake (msg.sender, 0, _amount, block.timestamp);
    }
 
    function getDCToken() public {
        uint256 reward = calculateReward(msg.sender);
        handleTimestamps();
        token.safeTransfer( msg.sender, reward);
    }
    function calculateReward(address _user) public  view returns(uint256) {
        uint256 reward;
        StakeStruct[] memory array = users[_user].stakes;
        if(array.length == 0) return 0;
        for (uint i = 0; i < array.length; i++) {
            uint256 timeDiff = block.timestamp - array[i].timestamp;
            timeDiff = timeDiff / 2 days;
            reward +=array[i].amount*timeDiff;
        }
        return reward;
    }
    function handleTimestamps() internal {
        if(users[msg.sender].stakes.length == 0) return;
        for (uint i = 0; i < users[msg.sender].stakes.length; i++) {
            users[msg.sender].stakes[i].timestamp = block.timestamp;
        }
    }
    function unStakeNFT() public {
        StakeStruct[] memory array = users[msg.sender].stakes;
        if(users[msg.sender].stakes.length == 0) return;
        for (uint i = 0; i < array.length; i++) {
                NFTItem.safeTransferFrom(address(this), msg.sender, 0, array[i].amount, "0x00");
        }
        delete users[msg.sender].stakes;
    }

}