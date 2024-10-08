// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface Staking {
    function getTotalStakes(address _user) external view returns (uint256);
}

contract NFTRelease is ERC1155Holder {
    IERC1155 public NFTItem;
    address public owner;
    address public stakingContract;
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

    function claimNFT() public nonReentrant {
        uint256 total = getcount(msg.sender);
        require(total > 0, "stake more to claim more NFTs");
        NFTItem.safeTransferFrom(address(this), msg.sender, 0, total, "0x00");
        count[msg.sender] = total;
    }

    function getcount(address _user) public view returns (uint256) {
        return
            Staking(stakingContract).getTotalStakes(_user) /
            (2 * 10 ** 9) -
            count[_user];
    }

    function getBalance(address _user) public view returns (uint256) {
        return NFTItem.balanceOf(_user, 0);
    }

    // admin functions
    function changeStakingContract(
        address _newc
    ) public onlyOwner nonReentrant {
        stakingContract = _newc;
    }

    function changeNFTContract(address _NFTItem) public onlyOwner nonReentrant {
        NFTItem = IERC1155(_NFTItem);
    }

    function transferOwnership(address newOwner) public onlyOwner nonReentrant {
        owner = newOwner;
    }

    function withdrawNFTS(address _addr) public onlyOwner nonReentrant {
        NFTItem.safeTransferFrom(
            address(this),
            _addr,
            0,
            NFTItem.balanceOf(address(this), 0),
            "0x00"
        );
    }
}

contract NFTStaking is ERC1155Holder {
    IERC1155 public NFTItem;
    using SafeERC20 for IERC20;
    IERC20 private token;
    uint256 decimals = 10 ** 18;
    address public owner;
    uint256 public totalStaked;
    uint256 public totalReleased;
    struct StakeStruct {
        uint256 amount;
        uint256 timestamp;
    }
    struct User {
        StakeStruct[] stakes;
        uint256 claimed;
    }
    mapping(address => User) public users;

    constructor(address _token, address _NFTItem) {
        token = IERC20(_token);
        NFTItem = IERC1155(_NFTItem);
        owner = msg.sender;
    }

    event Stake(
        address indexed owner,
        uint256 id,
        uint256 amount,
        uint256 time
    );

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

    function stakeNFT(uint256 _amount) public nonReentrant {
        require(
            NFTItem.balanceOf(msg.sender, 0) >= _amount,
            "you dont have enough balance"
        );
        NFTItem.safeTransferFrom(msg.sender, address(this), 0, _amount, "0x00");
        users[msg.sender].stakes.push(StakeStruct(_amount, block.timestamp));
        emit Stake(msg.sender, 0, _amount, block.timestamp);
        totalStaked += _amount;
    }

    function getDCToken() public nonReentrant {
        uint256 availReward = calculateReward(msg.sender) -
            users[msg.sender].claimed;

        require(availReward > 0, "no reward available");
        handleTimestamps();
        users[msg.sender].claimed += availReward;
        token.safeTransfer(msg.sender, availReward);
        totalReleased += availReward;
    }

    function getTotalStake(address _user) public view returns (uint256) {
        uint256 total;
        StakeStruct[] memory array = users[_user].stakes;
        if (array.length == 0) return 0;
        for (uint i = 0; i < array.length; i++) {
            total += array[i].amount;
        }
        return total;
    }

    function calculateReward(address _user) public view returns (uint256) {
        uint256 reward;
        StakeStruct[] memory array = users[_user].stakes;
        if (array.length == 0) return 0;
        uint256 totalCount = 0;
        for (uint i = 0; i < array.length; i++) {
            uint256 timeDiff = block.timestamp - array[i].timestamp;
            timeDiff = timeDiff / 60;
            reward += array[i].amount * timeDiff * 2;
            totalCount += array[i].amount;
        }
        if (reward > (100 * totalCount)) return 100 * totalCount * decimals;
        return reward * decimals;
    }

    function handleTimestamps() internal {
        if (users[msg.sender].stakes.length == 0) return;
        for (uint i = 0; i < users[msg.sender].stakes.length; i++) {
            users[msg.sender].stakes[i].timestamp = block.timestamp;
        }
    }

    function unStakeNFT() public nonReentrant {
        NFTItem.setApprovalForAll(address(this), true);
        if (users[msg.sender].stakes.length == 0) return;
        uint256 total = getTotalStake(msg.sender);
        NFTItem.safeTransferFrom(address(this), msg.sender, 0, total, "0x00");
        delete users[msg.sender].stakes;
    }

    function transferOwnership(address newOwner) public onlyOwner nonReentrant {
        owner = newOwner;
    }

    function withDrawNFT(address addr) public onlyOwner nonReentrant {
        NFTItem.setApprovalForAll(address(this), true);
        NFTItem.safeTransferFrom(
            address(this),
            addr,
            0,
            NFTItem.balanceOf(address(this), 0),
            "0x00"
        );
    }

    function withDrawTokens(address addr) public onlyOwner nonReentrant {
        token.transfer(addr, token.balanceOf(address(this)));
    }
}
