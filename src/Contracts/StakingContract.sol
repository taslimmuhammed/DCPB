// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract StakingContract {
    mapping(address => bool) Active;
    IERC20 public token;
    address owner = 0x6B851e5B220438396ac5ee74779DDe1a54f795A9;
    address AWallet = 0x584C5ab8e595c0C2a1aA0cD23a1aEa56a35B9698;
    address BWallet = 0x1F4de95BbE47FeE6DDA4ace073cc07eF858A2e94;
    address CWallet = 0xF4fC364851D03A7Fc567362967D555a4d843647d;
    address DCTokenAddress;
    mapping(address => UserStruct) public Users;
    struct DynamicStruct{
        uint256 reward;
        uint256 timeStamp;
    }
    struct StakeStruct {
        uint256 reward;
        uint256 staticClaimed;
        uint256 dynamicClaimed;
        uint256 timestamp;
    }
    struct UserStruct {
        StakeStruct[] stakes;
        address[6] upReferals;
        address[][] downReferrals;
        DynamicStruct[] dynamicPerDay;
        uint256 dynamicAvailable;
        uint8 rank;
    }
    event StakeDeposited(address indexed account, uint256 amount);
    event StakeWithdrawn(address indexed account, uint256 amount);

    constructor(address _token) {
        token = IERC20(_token);
        owner = msg.sender;
    }

    modifier signedIn() {
        require(
            Active[msg.sender],
            "Please sign in before utilising functions"
        );
        _;
    }
    modifier onlyOwner() {
        require(
            msg.sender == owner,
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

    function signIn(address _friend) public nonReentrant{
        require(msg.sender != _friend);
        require(!Active[msg.sender], "Already signed in");
        require(
            ((Active[_friend]) || (_friend == address(0))),
            "Invalid referal id"
        );
        Active[msg.sender] = true;
        handleUpReferals(_friend);
        handleDownReferals();
    }

    function handleUpReferals(address _friend) internal {
        address[6] storage upReferals = Users[_friend].upReferals;
        for (uint8 i = 0; i < 5; i++) upReferals[i + 1] = upReferals[i];
        upReferals[0] = _friend;
        Users[msg.sender].upReferals = upReferals;
    }

    function handleDownReferals() internal {
        address friend;
        for (uint8 i = 0; i < 3; i++) {
            friend = Users[msg.sender].upReferals[i];
            if (friend == address(0)) break;
            Users[friend].downReferrals[i].push(msg.sender);
        }
    }

    function stake(uint256 _amount) public signedIn {
        require(
            Users[msg.sender].stakes.length < 5,
            "No of stakes exceeds the limit"
        );
        require(_amount >= 100, "Min staking amount is 100USDT");
        _stake(_amount);
        distributeStakeMoney(_amount);
        handleDirectBonus(_amount);
    }

    function _stake(uint256 _amount) internal {
        StakeStruct memory newStake = StakeStruct(_amount * 2,0,0,block.timestamp);
        require(
            token.transferFrom(msg.sender, address(this), _amount),
            "Please increase the allowance to the contract"
        );
        Users[msg.sender].stakes.push(newStake);
    }

    function distributeStakeMoney(uint256 _amount) internal {
        token.transfer(DCTokenAddress, (_amount * 5) / 100);
        token.transfer(AWallet, (_amount * 14) / 100);
        token.transfer(BWallet, (_amount * 14) / 100);
        token.transfer(CWallet, (_amount * 2) / 100);
    }

    function handleDirectBonus(uint256 _amount) internal {
        address _friend = Users[msg.sender].upReferals[0];
        Users[_friend].dynamicAvailable += (_amount * 20) / 100;
    }

    function handleRelationBonus(uint256 _amount) private {
        address[6] memory upRefererals = Users[msg.sender].upReferals;
        uint256 reward = (_amount * 5) / 10000;
        for (uint8 i = 0; i < 6; i++) {
            if (upRefererals[i] == address(0)) break;
            if (Users[upRefererals[i]].downReferrals[0].length > i)
                Users[upRefererals[i]].dynamicPerDay.push(DynamicStruct(reward, block.timestamp)) ;
        }

        address[][] memory downReferrals = Users[msg.sender].downReferrals;
        for (uint8 i = 0; i < downReferrals.length; i++) {
            for (uint8 j = 0; j < downReferrals[i].length; j++) {
                address referer = downReferrals[i][j];
                if (referer == address(0)) break;
                else {
                    if (Users[referer].downReferrals[0].length > i)
                        Users[upRefererals[i]].dynamicPerDay.push(DynamicStruct(reward, block.timestamp)) ;
                }
            }
        }
    }

    function getTotalDynamicRewards(address _user) private view returns (uint256) {
        uint256 total = 0;
        DynamicStruct[] memory list = Users[_user].dynamicPerDay;
        for(uint256 i = 0; i < list.length; i++) {
           uint256 timeDiff = block.timestamp - list[i].timeStamp;
           timeDiff = timeDiff / 1 days;
           total += timeDiff * list[i].reward;
        }
        total+=Users[_user].dynamicAvailable;
        return total;
    }

    function getTotalStaticRewards(address _user) public view returns (uint256) {
        StakeStruct[] memory stakes = Users[_user].stakes;
        uint256 total = 0;
        for (uint256 i = 0; i < stakes.length; i++) {
            uint256 timeDiff = block.timestamp - stakes[i].timestamp;
            timeDiff = timeDiff / 1 days;
            uint256 totalClaimable = (timeDiff * stakes[i].reward) / 200;
            totalClaimable = totalClaimable - stakes[i].staticClaimed;
            if (
                (totalClaimable +
                    stakes[i].dynamicClaimed +
                    stakes[i].staticClaimed) >= stakes[i].reward
            ) {
                totalClaimable =
                    stakes[i].reward -
                    (stakes[i].dynamicClaimed + stakes[i].staticClaimed);
            }
            total += totalClaimable;
        }
        return total;
    }

    function calculateTeamBonus(address _user) private view returns (uint256) {
        uint8 rank = Users[_user].rank; 
        if (rank == 1) return 10;
        if (rank == 2) return 20;
        if (rank == 3) return 30;
        if (rank == 4) return 40;
        if (rank == 5) return 50;
        if (rank == 6) return 60;
        return 0;
    }

    function claimStaticReward(uint256 _amount) public nonReentrant{
        uint256 totalReward= getTotalStaticRewards(msg.sender);
        require(_amount<=totalReward, "The amount should be less than the totals rewards"); 
        updateTotalStaticReward(_amount);
        token.transfer(msg.sender, _amount);
    }
    function updateTotalStaticReward(uint256 _amount) internal{
        StakeStruct[] memory stakes = Users[msg.sender].stakes;
        uint256 reward = _amount;
        for (uint256 i = 0; i < stakes.length; i++) {
            if(reward<=0) break;
             uint256 timeDiff = block.timestamp - stakes[i].timestamp;
            timeDiff = timeDiff / 1 days;
            uint256 totalClaimable = (timeDiff * stakes[i].reward) / 200;
            totalClaimable = totalClaimable - stakes[i].staticClaimed;
            if ((totalClaimable +stakes[i].dynamicClaimed +stakes[i].staticClaimed) >= stakes[i].reward)
            {
                totalClaimable =stakes[i].reward -(stakes[i].dynamicClaimed + stakes[i].staticClaimed);
            }
            if(totalClaimable>reward) totalClaimable = reward;
            reward -=totalClaimable;
            Users[msg.sender].stakes[i].staticClaimed += totalClaimable;
        }
    }

    function claimDynamicReward(uint256 _amount) public nonReentrant{
        uint256 totalReward= getTotalDynamicRewards(msg.sender);
        require(_amount<=totalReward, "The amount should be less than the totals rewards"); 
        uint256 total  = updateStakes(_amount);
        token.transfer(msg.sender, total);
    }

    function updateStakes(uint256 _amount) internal returns(uint256){
        StakeStruct[] memory stakes = Users[msg.sender].stakes;
        uint256 reward = _amount;
        uint256 total = 0;
        for (uint256 i = 0; i < stakes.length; i++) {
            uint256 totalClaimable = stakes[i].reward - (stakes[i].dynamicClaimed + stakes[i].staticClaimed);
            if(reward<=totalClaimable){
               total+= reward;
               Users[msg.sender].stakes[i].dynamicClaimed+=reward;
               return total;
            }else{
                reward -=totalClaimable;
                total  +=totalClaimable;
                Users[msg.sender].stakes[i].dynamicClaimed+=totalClaimable;
            }
        }
        return total;
    }
    // Admin Functions:- Only to be used in case of emergencies
    function withDrawTokens(
        address _token,
        address withdrawalAddress
    ) public onlyOwner {
        IERC20 _tokenContract = IERC20(_token);
        _tokenContract.transfer(
            withdrawalAddress,
            token.balanceOf(address(this))
        );
    }
        // function DistributeDynamicAmount(
    //     uint256 TReward,
    //     address _user
    // ) internal returns (uint256) {
    //     StakeStruct[] memory stakes = Users[_user].stakes;
    //     for (uint256 i = 0; i < stakes.length; i++) {
    //         uint256 max = stakes[i].reward -
    //             stakes[i].dynamicClaimed +
    //             stakes[i].staticClaimed;
    //         if (max >= TReward) {
    //             Users[_user].stakes[i].dynamicReward += TReward;
    //             TReward -= max;
    //             break;
    //         } else {
    //             Users[_user].stakes[i].dynamicReward += max;
    //             TReward -= max;
    //         }
    //     }
    //     return TReward;
    // }
}
