// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

// @title NFT Staking 
/// @author Karan J Goraniya
/// @notice You can use this contract for only the most basic simulation
/// @dev All function calls are currently implemented without side effects
 interface Staking {
     function getTotalStakes(address _user) external  view returns (uint256) ;
 }
contract NFTRelease is ERC1155Holder {

    IERC1155 public NFTItem;
    address public  owner;
    address public  stakingContract;
    mapping(address => uint256) public count;

    constructor(address _NFTItem, address _contract) {
        NFTItem = IERC1155(_NFTItem);
        stakingContract = _contract;
        owner = msg.sender;
    }
    
        modifier onlyOwner() {
        require(
            (msg.sender == owner),
            "you are not allowed to utilise this function"
        );
        _;
    }

    bool private locked;
    modifier nonReentrant() {
        require(!locked, "ReentrancyGuard: reentrant call");
        locked = true;
        _;
        locked = false;
    }

    
    function claimNFT() public nonReentrant{
        uint256 total = Staking(stakingContract).getTotalStakes(msg.sender)/(2*10**9);
        uint256 _amount  =  total -  count[msg.sender];
        require(count[msg.sender]>0,"stake more to claim more NFTs");
        NFTItem.safeTransferFrom( address(this), msg.sender, 0, _amount, "0x00");
        count[msg.sender]  = total;
    }

    function getcount(address _user) public view returns(uint256){
        return Staking(stakingContract).getTotalStakes(_user)/(2*10**9) -  count[_user];
    }

     // admin functions
    function changeStakingContract(address _newc) public onlyOwner nonReentrant{
         stakingContract = _newc;
    }
    
    function changeNFTContract(address _NFTItem) public onlyOwner nonReentrant{
         NFTItem = IERC1155(_NFTItem);
    }
    function transferOwnership(address newOwner) public onlyOwner nonReentrant {
        owner = newOwner;
    }
    function withdrawNFTS(address _addr) public onlyOwner nonReentrant{
        NFTItem.safeTransferFrom( address(this),_addr , 0, NFTItem.balanceOf(address(this), 0), "0x00");
    }
}