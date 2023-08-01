// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

interface RefContract {
    struct RankBonus {
        uint256 start;
        uint256 end;
        uint256 multiplier;
        uint256 reward;
        address referer;
    }
    struct RelationStruct {
        uint256 reward;
        uint256 start;
        uint256 end;
    }

    struct TeamUserStruct {
        uint256 totalRefStake;
        uint256 totalStake;
        RankBonus[] rankBonus;
        address referer;
        address[][] downReferrals;
        uint8 rank;
        RelationStruct[] relationBonus;
    }

    function signIn(address _user, address _referer) external;

    function stake(address _user, uint256 _amount) external;

    function upgradeUser(address _user) external;

    function getUser(address _user) external view returns (TeamUserStruct memory);

    function getUserDownReferrals(address _user,uint8 _level) external view returns (address[] memory);

    function getRelationBonus(address _user) external view returns (RelationStruct[] memory);

    function getRankBonus(address _user) external view returns (RankBonus[] memory);

    function getTotalStake(address _user) external view returns (uint256);

    function getTotalRefStake(address _user) external view returns (uint256);

    function getRank(address _user) external view returns (uint8);

    function getReferer(address _user) external view returns (address);

    function checkUpgradablity(address _user) external view returns (bool);

    function getRefsWithRank(uint8 _rank,address _user) external view returns (uint256);

    function getReferralRanks(address _user) external view returns (uint256[7] memory);

    function getValidRankBonus(address _user, uint256 baseTime) external view returns (RankBonus[] memory,uint256 length) ;

    function getValidRelationalBonus(address _user, uint256 baseTime) external view returns (RelationStruct[] memory,uint256 length);
}

contract StakingContract {
    mapping(address => bool) public Active;
    uint256 decimals = 10 ** 6;
    IERC20 public token;
    address owner = 0x6B851e5B220438396ac5ee74779DDe1a54f795A9;
    address AWallet = 0x584C5ab8e595c0C2a1aA0cD23a1aEa56a35B9698;
    address BWallet = 0x1F4de95BbE47FeE6DDA4ace073cc07eF858A2e94;
    address CWallet = 0xF4fC364851D03A7Fc567362967D555a4d843647d;
    address public DCManager;
    uint256 public totalDeposite;
    uint256 public totalUsers; 
    uint256 public totalClaimed;
    address[] public userlist;
    RefContract private refContract;
    mapping(address => UserStruct) private Users;

    struct StakeStruct {
        uint256 reward;
        uint256 staticClaimed;
        uint256 staticClaimable;
        uint256 dynamicClaimed;
        uint256 dynamicClaimable;
        uint256 directClaimed;
        uint256 directClaimable;
        uint256 staticBonus;
        uint256 timestamp;
        bool filled;
    }
    struct UserStruct {
        StakeStruct[] stakes;
        uint256 baseTime;
    }
    struct RewardStruct {
        uint256 staticReward;
        uint256 dynamicReward;
        uint256 available;
    }

    constructor(address _usdt, address _dcmanager, address _refContract) {
        token = IERC20(_usdt);
        DCManager = _dcmanager;
        refContract = RefContract(_refContract);
    }

    modifier signedIn() {
        require(Active[msg.sender], "sign in before using this function");
        _;
    }
    modifier onlyOwner() {
        require((msg.sender == owner), "Only owner can utilise this function");
        _;
    }

    bool private locked;
    modifier nonReentrant() {
        require(!locked);
        locked = true;
        _;
        locked = false;
    }

    // function calculateAllReward(address _user) public view returns (RewardStruct[] memory) {
    //     StakeStruct[] memory stakes = Users[_user].stakes;
    //     RewardStruct[] memory rewardStructs = new RewardStruct[](stakes.length);
    //     if (Users[_user].stakes.length == 0) {
    //         return rewardStructs;
    //     }
    //     uint256 baseTime = Users[_user].stakes[0].timestamp;
    //     baseTime = baseTime - (baseTime % 60);
    //     baseTime += 60;
    //     uint256 currentTime = block.timestamp;
        
    //     RefContract.RelationStruct[] memory relationBonuses = refContract.getRelationBonus(_user);
    //     RefContract.RankBonus[] memory rankBonuses = refContract.getRankBonus(_user);
    //     uint256[] memory availableArray = new uint256[](stakes.length);
    //     uint256[] memory staticBonus = new uint256[](stakes.length);

    //     for (uint256 i = 0; i < staticBonus.length; i++)
    //         staticBonus[i] =stakes[i].reward/200;

    //     for (uint256 i = 0; i < stakes.length; i++)
    //         availableArray[i] =stakes[i].reward - stakes[i].directBonus - stakes[i].directClaimed;

    //     //interpreting and allocating all rewards day by day
    //     for (uint256 i = baseTime; i < currentTime; i += 60) {
    //         uint256 dynamicReward = 0;
    //         // calculating dynamic
    //         for (uint256 j = 0; j < relationBonuses.length; j++) {
    //             if (i > relationBonuses[j].start && i<= relationBonuses[j].end)
    //                 dynamicReward += relationBonuses[j].reward;
    //         }
    //         //adding team bonus
    //         for (uint256 j = 0; j < rankBonuses.length; j++) {
    //             if (i > rankBonuses[j].start && i <= rankBonuses[j].end)
    //                 dynamicReward +=rankBonuses[j].reward*rankBonuses[j].multiplier;
    //         }

    //         //calculating static
    //         for (uint256 j = 0; j < stakes.length; j++) {
    //             if (availableArray[j] != 0 && stakes[j].timestamp < i) {
    //                 if (availableArray[j] <= staticBonus[j]) {
    //                     rewardStructs[j].staticReward += availableArray[j];
    //                     availableArray[j] = 0;
    //                 } else {
    //                     rewardStructs[j].staticReward += staticBonus[j];
    //                     availableArray[j] -= staticBonus[j];
    //                     //subtrating dynamic reward
    //                     if (availableArray[j] <= dynamicReward) {
    //                         rewardStructs[j].dynamicReward += availableArray[j];
    //                         availableArray[j] = 0;
    //                     } else {
    //                         rewardStructs[j].dynamicReward += dynamicReward;
    //                         availableArray[j] -= dynamicReward;
    //                         dynamicReward = 0;
    //                     }
    //                 }
    //             }
    //         }
    //     }

    //     for (uint i = 0; i < stakes.length; i++) {
    //         rewardStructs[i].dynamicReward += stakes[i].directBonus;
    //         rewardStructs[i].dynamicReward -= stakes[i].dynamicClaimed;
    //         rewardStructs[i].staticReward -= stakes[i].staticClaimed;
    //         rewardStructs[i].available = availableArray[i];
    //     }
    //     return rewardStructs;
    // }

    function refreshRewards() public {
        StakeStruct[] memory stakes = Users[msg.sender].stakes;
        if (stakes.length == 0) return;
        uint256 baseTime = Users[msg.sender].baseTime;
        uint256 currentTime = block.timestamp;
        require(currentTime > baseTime+60, "wait for 1 minute");
        Users[msg.sender].baseTime = currentTime;

        (RefContract.RelationStruct[] memory relationBonuses, uint256 relationLen) = refContract.getValidRelationalBonus(msg.sender, baseTime);
        (RefContract.RankBonus[] memory rankBonuses, uint256 rankLen) = refContract.getValidRankBonus(msg.sender, baseTime);

        for (uint256 i = 0; i < stakes.length; i++){ 
            stakes[i].reward -= (stakes[i].directClaimable + stakes[i].directClaimed + stakes[i].staticClaimed + stakes[i].dynamicClaimed + stakes[i].staticClaimable + stakes[i].dynamicClaimable);}

        for (uint256 time = baseTime; time < currentTime; time+=60) {
            //calculating dynamic for the day
            uint256 dynamicReward = 0;
            for (uint256 i = 0; i < relationLen; i++){
                if (time > relationBonuses[i].start && time <= relationBonuses[i].end)
                    dynamicReward += relationBonuses[i].reward;}

            for (uint256 i = 0; i < rankLen; i++){
                if (time > rankBonuses[i].start && time <= rankBonuses[i].end)
                    dynamicReward +=rankBonuses[i].reward*rankBonuses[i].multiplier;}
            
             for (uint256 i = 0; i < stakes.length; i++) {
                if (stakes[i].filled || time <= stakes[i].timestamp) continue;
                //subtracting static
                if (stakes[i].reward <= stakes[i].staticBonus) {
                    Users[msg.sender].stakes[i].staticClaimable += stakes[i].reward;
                    Users[msg.sender].stakes[i].filled = true;
                    stakes[i].filled = true;
                    stakes[i].reward = 0;
                } else {
                    Users[msg.sender].stakes[i].staticClaimable += stakes[i].staticBonus;
                    stakes[i].reward -= stakes[i].staticBonus;
                    //subtrating dynamic 
                    if(dynamicReward>0)
                        if (stakes[i].reward <= dynamicReward) {
                            Users[msg.sender].stakes[i].dynamicClaimable += stakes[i].reward;
                            dynamicReward -= stakes[i].reward; 
                            Users[msg.sender].stakes[i].filled = true;
                            stakes[i].filled = true;
                            stakes[i].reward = 0;
                        } else {
                            Users[msg.sender].stakes[i].dynamicClaimable += dynamicReward;
                            stakes[i].reward -= dynamicReward;
                            dynamicReward = 0;
                        }
                }
            }
        }
    }
    function getTotalWithdrawable(address _user) public view returns (RewardStruct memory) {
         StakeStruct[] memory stakes = Users[_user].stakes;
         RewardStruct memory rewardStruct;
         for (uint256 i = 0; i < stakes.length; i++) {
            rewardStruct.staticReward += stakes[i].staticClaimable;
            rewardStruct.dynamicReward += stakes[i].dynamicClaimable;
            rewardStruct.dynamicReward += stakes[i].directClaimable;
         }
         return rewardStruct;
    }
    function signIn(address _friend) external nonReentrant {
        require(msg.sender != _friend, "user cant be same as referer");
        require(!Active[msg.sender], "already signed in");
        require(((Active[_friend]) || (_friend == address(0))), "Invalid ref id");
        Active[msg.sender] = true;
        Users[msg.sender].baseTime = block.timestamp;
        refContract.signIn(msg.sender, _friend);
        totalUsers++;
    }
    function stake(uint256 _amount) external signedIn {
        require(_amount >= decimals, ">100usdt");
        require(checkStakablity(msg.sender));
        _stake(_amount);
        distributeStakeMoney(_amount);
        handleDirectBonus(_amount);
        refContract.stake(msg.sender, _amount);
        if (Users[msg.sender].stakes.length == 1) userlist.push(msg.sender);
    }
    function checkStakablity(address _user)public view returns(bool){
        if(Users[_user].stakes.length==0) return true;
        StakeStruct[] memory stakes = Users[_user].stakes;
        for (uint256 i = 0; i < stakes.length; i++) {
            uint256 available = stakes[i].reward - stakes[i].directClaimable - stakes[i].directClaimed - stakes[i].staticClaimed - stakes[i].dynamicClaimed - stakes[i].staticClaimable - stakes[i].dynamicClaimable;
            uint256 percent = ( available* 100) / Users[_user].stakes[i].reward;
            if(percent>20) return false;
        }
        return true;
    }
    function _stake(uint256 _amount) private {
        require(token.transferFrom(msg.sender, address(this), _amount), "increase allowance");
        StakeStruct memory newStake = StakeStruct(_amount * 2,0,0,0,0,0,0,_amount/100,block.timestamp, false);
        Users[msg.sender].stakes.push(newStake);
        totalDeposite += _amount;
    }
    function distributeStakeMoney(uint256 _amount) private {
        uint256 damount=  _amount/100;
        token.transfer(DCManager, damount * 5);
        token.transfer(AWallet, damount * 14);
        token.transfer(BWallet, damount * 14);
        token.transfer(CWallet, damount * 2);
    }

    function handleDirectBonus(uint256 _amount) private {
        address _friend = refContract.getReferer(msg.sender);
        if (_friend == address(0) || Users[_friend].stakes.length == 0) return;
        uint256 total = (_amount * 15) / 100;
        StakeStruct[] memory stakes = Users[_friend].stakes;
        for (uint256 i = 0; i < stakes.length; i++) {
            uint256 available = stakes[i].reward - stakes[i].directClaimable - stakes[i].directClaimed - stakes[i].staticClaimed - stakes[i].dynamicClaimed - stakes[i].staticClaimable - stakes[i].dynamicClaimable;
            if (available >= total) {
                Users[_friend].stakes[i].directClaimable += total;
                return;
            } else {
                total -= available;
                Users[_friend].stakes[i].directClaimable += available;
            }
        }
    }

    function claimStaticReward(uint256 _amount) external nonReentrant {
        RewardStruct memory totalReward = getTotalWithdrawable(msg.sender);
        require(_amount <= totalReward.staticReward);
        require(_amount >= 10 * decimals, "> 10 usdt");
        updateStaticReward(_amount);
        token.transfer(msg.sender, _amount);
        totalClaimed += _amount;
    }

    function updateStaticReward(uint256 _amount) private {
        StakeStruct[] memory stakes = Users[msg.sender].stakes;
        
        for (uint256 i = 0; i < stakes.length; i++) {
            if (_amount <= stakes[i].staticClaimable) {
                Users[msg.sender].stakes[i].staticClaimed += _amount;
                Users[msg.sender].stakes[i].staticClaimable -= _amount;
                break;
            } else {
                _amount -= stakes[i].staticClaimable;
                Users[msg.sender].stakes[i].staticClaimed += stakes[i].staticClaimable;
                Users[msg.sender].stakes[i].staticClaimable = 0;
            }
        }
    }

    function claimDynamicReward(uint256 _amount) public nonReentrant {
        RewardStruct memory totalReward = getTotalWithdrawable(msg.sender);
        require(_amount <= totalReward.dynamicReward);
        require(_amount >= 10 * decimals, ">10 usdt");
        updateDynamicStakes(_amount);
        token.transfer(msg.sender, _amount);
        totalClaimed += _amount;
    }

    function updateDynamicStakes(uint256 _amount) private {
        StakeStruct[] memory stakes = Users[msg.sender].stakes;
        uint256 total = _amount;
        for (uint256 i = 0; i < stakes.length; i++) {
            if (total > stakes[i].directClaimable) {
                total -= stakes[i].directClaimable;
                Users[msg.sender].stakes[i].directClaimed += stakes[i].directClaimable;
                Users[msg.sender].stakes[i].directClaimable = 0;
            } else {
                Users[msg.sender].stakes[i].directClaimed += total;
                Users[msg.sender].stakes[i].directClaimable -= total;
                return;
            }
            if (total > stakes[i].dynamicClaimable) {
                Users[msg.sender].stakes[i].dynamicClaimed += stakes[i].dynamicClaimable;
                Users[msg.sender].stakes[i].dynamicClaimable = 0;
                total -= stakes[i].dynamicClaimable;
            } else {
                Users[msg.sender].stakes[i].dynamicClaimed += total;
                Users[msg.sender].stakes[i].dynamicClaimable -= total;
                return;
            }
        }
    }

    function getTotalStakes(address _user) public view returns (uint256) {
        StakeStruct[] memory stakes = Users[_user].stakes;
        uint256 total = 0;
        for (uint256 i = 0; i < stakes.length; i++) total += stakes[i].reward;
        return total;
    }

    function upgradeLevel() external nonReentrant {
        refContract.upgradeUser(msg.sender);
    }

    //Reading functions
    function getStakes(address _user) external view returns (StakeStruct[] memory) {
        return  Users[_user].stakes;
    }

    function getStakeUser(address _user) public view returns (UserStruct memory) {
        return Users[_user];
    }

    function getTeamUser(address _user) external view returns (RefContract.TeamUserStruct memory) {
        return refContract.getUser(_user);
    }

    function checkUpgradablity(address _user) external view returns (bool) {
        return refContract.checkUpgradablity(_user);
    }

    function getRefsWithRank(address _user,uint8 index) external view returns (uint256) {
        return refContract.getRefsWithRank(index, _user);
    }

    function getReferralRanks(address _user) external view returns (uint256[7] memory) {
        return refContract.getReferralRanks(_user);
    }

    function calculateTotalClaimableReward() public view returns (RewardStruct memory){
        uint256 staticReward;
        uint256 dynamicReward;
        uint256 balance;
        for (uint256 i = 0; i < userlist.length; i++) {
            RewardStruct memory userRewards = getTotalWithdrawable(userlist[i]);
            staticReward += userRewards.staticReward;
            dynamicReward += userRewards.dynamicReward;
            balance +=  userRewards.available;
        }
        return RewardStruct(staticReward, dynamicReward, balance);
    }

    // Admin Functions:- Only to be used in case of emergencies
    function transferOwnership(address newOwner) public onlyOwner nonReentrant {
        owner = newOwner;
    }

    function withDrawTokens(address _token,uint256 amount) public onlyOwner nonReentrant {
        IERC20(_token).transfer(owner, amount);
    }

    function changeDCManager(address newAddr) public onlyOwner nonReentrant {
        DCManager = newAddr;
    }

    function changeRefContract(address _refContract) public onlyOwner nonReentrant {
        refContract = RefContract(_refContract);
    }
}
