// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface RefContract {
    struct RankBonus{
        uint256 start;
        uint256 end;
        uint8 multiplier;
        uint256 reward;
        address referer;
    }
    struct RelationStruct {
        uint256 reward;
        uint256 timestamp;
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
    function upgradeUser(address _user) external ;
    function getUser(address _user) external view returns(TeamUserStruct memory);
    function getUserDownReferrals(address _user, uint8 _level) external view returns(address[] memory);
    function getRelationBonus( address _user) external view returns(RelationStruct[] memory);
    function getRankBonus( address _user) external view returns(RankBonus[] memory);
    function getTotalStake(address _user) external view returns(uint256);
    function getTotalRefStake(address _user) external view returns(uint256);
    function getRank(address _user) external view returns(uint8);
    function getReferer(address _user) external view returns(address);
    function checkUpgradablity(address _user) external view returns (bool);
    function getRefsWithRank(uint8 _rank,address _user) external view returns (uint256) ;
    function getReferralRanks( address _user) external view returns (uint256[7] memory);
    function  testFunc() external;
}

contract StakingContract  {
    mapping(address => bool) public Active;
    uint256 decimals = 10 ** 6;
    IERC20 public token;
    address owner = 0xd0cc32348E98f148E769f034A9C79b1C5a0e2A78;
    address AWallet = 0x584C5ab8e595c0C2a1aA0cD23a1aEa56a35B9698;
    address BWallet = 0x1F4de95BbE47FeE6DDA4ace073cc07eF858A2e94;
    address CWallet = 0xF4fC364851D03A7Fc567362967D555a4d843647d;
    address public DCTokenAddress = 0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8;
    uint256 public totalDeposite;
    uint256 public totalUsers;
    RefContract private refContract;
    mapping(address => UserStruct) internal Users;

    struct RankBonus{
        uint256 start;
        uint256 end;
        uint8 multiplier;
        uint256 reward;
        address referer;
    }
    struct RelationStruct {
        uint256 reward;
        uint256 timestamp;
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

    struct StakeStruct {
        uint256 reward;
        uint256 staticClaimed;
        uint256 dynamicClaimed;
        uint256 timestamp;
        uint256 directBonus;
    }
    struct UserStruct {
        StakeStruct[] stakes;
        uint256 dynamicLimit;
        uint256 staticLimit;
    }
    struct RewardStruct {
        uint256 staticReward;
        uint256 dynamicReward;
        uint256 available;
    }

    constructor(address _usdt, address _dcmanager, address _refContract) {
        token = IERC20(_usdt);
        DCTokenAddress = _dcmanager;
        refContract = RefContract(_refContract);
    }

    modifier signedIn() {
        require(Active[msg.sender], "sign in befpre using this function");
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

    function calculateAllReward(
        address _user
    ) public view returns (RewardStruct[] memory) {
        uint256 baseTime = Users[_user].stakes[0].timestamp;
        uint256 currentTime = block.timestamp;
        StakeStruct[] memory stakes = Users[_user].stakes;
        RefContract.RelationStruct[] memory relationBonuses = refContract.getRelationBonus(_user);
        RefContract.RankBonus[] memory rankBonuses =  refContract.getRankBonus(_user);

        RewardStruct[] memory rewardStructs = new RewardStruct[](stakes.length);
        uint256[] memory availableArray = new uint256[](stakes.length);
        if (Users[_user].stakes.length == 0) {
            return rewardStructs;
        }
        for (uint256 i = 0; i < stakes.length; i++)
            availableArray[i] = stakes[i].reward - stakes[i].directBonus;

        //interpreting and allocating all rewards day by day
        for (uint256 i = baseTime; i < currentTime; i += 60) {
            uint256 dynamicReward = 0;
            // calculating dynamic
            for (uint256 j = 0; j < relationBonuses.length; j++) {
                if (relationBonuses[j].timestamp <= i)
                    dynamicReward += relationBonuses[j].reward;
            }
            //adding team bonus
            for (uint256 j = 0; j < rankBonuses.length; j++) {
                if (rankBonuses[j].start>i && rankBonuses[j].end <= i)
                    dynamicReward += rankBonuses[j].reward;
            }

            //calculating static
            for (uint8 j = 0; j < stakes.length; j++) {
                if (availableArray[j] != 0 && stakes[j].timestamp < i) {
                    uint256 staticReward;
                    if (stakes[j].timestamp <= i)
                        staticReward = (stakes[j].reward) / 200;
                    if (staticReward >= availableArray[j]) {
                        rewardStructs[j].staticReward += availableArray[j];
                        availableArray[j] = 0;
                    } else {
                        rewardStructs[j].staticReward += staticReward;
                        availableArray[j] -= staticReward;

                        if (availableArray[j] >= dynamicReward) {
                            availableArray[j] -= dynamicReward;
                            rewardStructs[j].dynamicReward += dynamicReward;
                            dynamicReward = 0;
                        } else {
                            rewardStructs[j].dynamicReward += availableArray[j];
                            dynamicReward -= availableArray[j];
                            availableArray[j] = 0;
                        }
                    }
                }
            }
        }

        for (uint i = 0; i < stakes.length; i++) {
            rewardStructs[i].dynamicReward += stakes[i].directBonus;
            rewardStructs[i].dynamicReward -= stakes[i].dynamicClaimed;
            rewardStructs[i].staticReward -= stakes[i].staticClaimed;
            rewardStructs[i].available = availableArray[i];
        }
        return rewardStructs;
    }

    function signIn(address _friend) external nonReentrant {
        require(msg.sender != _friend, "user cant be same as referer");
        require(!Active[msg.sender], "already signed in");
        require(
            ((Active[_friend]) || (_friend == address(0))),
            "Invalid ref id"
        );
        Active[msg.sender] = true;
        refContract.signIn(msg.sender, _friend);
        Users[msg.sender].dynamicLimit = 2 * decimals;
        Users[msg.sender].staticLimit = 1 * decimals;
        totalUsers++;
    }

    function stake(uint256 _amount) external signedIn {
        require(_amount >= 1 * decimals, ">100usdt");
        _stake(_amount);
        distributeStakeMoney(_amount);
        handleDirectBonus(_amount);
        refContract.stake(msg.sender, _amount);
    }

    function _stake(uint256 _amount) internal {
        StakeStruct memory newStake = StakeStruct(
            _amount * 2,
            0,
            0,
            block.timestamp,
            0
        );
        require(token.transferFrom(msg.sender, address(this), _amount));
        Users[msg.sender].stakes.push(newStake);
        totalDeposite += _amount;
    }

    function distributeStakeMoney(uint256 _amount) internal {
        token.transfer(DCTokenAddress, (_amount * 5) / 100);
        token.transfer(AWallet, (_amount * 14) / 100);
        token.transfer(BWallet, (_amount * 14) / 100);
        token.transfer(CWallet, (_amount * 2) / 100);
    }

    function handleDirectBonus(uint256 _amount) internal {
        address _friend = refContract.getReferer(msg.sender);
        if (_friend == address(0) || Users[_friend].stakes.length == 0) return;
        uint256 total = (_amount * 20) / 100;
        RewardStruct[] memory rewardArr = calculateAllReward(_friend);
        StakeStruct[] memory stakes = Users[_friend].stakes;
        for (uint i = 0; i < stakes.length; i++) {
            if (rewardArr[i].available >= total) {
                Users[_friend].stakes[i].directBonus += total;
                return;
            } else {
                total -= rewardArr[i].available;
                Users[_friend].stakes[i].directBonus += rewardArr[i].available;
            }
        }
    }

    function getTotalRewards(
        address _user
    ) public view returns (RewardStruct memory) {
        uint256 staticReward = 0;
        uint256 dynamicReward = 0;
        RewardStruct[] memory arr = calculateAllReward(_user);
        for (uint256 i = 0; i < arr.length; i++) {
            staticReward += arr[i].staticReward;
            dynamicReward += arr[i].dynamicReward;
        }
        return RewardStruct(staticReward, dynamicReward, 0);
    }

    function claimStaticReward(uint256 _amount) external nonReentrant {
        RewardStruct memory totalReward = getTotalRewards(msg.sender);
        require(_amount <= totalReward.staticReward);
        require(_amount >= Users[msg.sender].staticLimit);
        updateStaticReward(_amount);
        token.transfer(msg.sender, _amount);
        Users[msg.sender].staticLimit *= 2;
    }

    function updateStaticReward(uint256 _amount) internal {
        StakeStruct[] memory stakes = Users[msg.sender].stakes;
        uint256 total = _amount;
        RewardStruct[] memory rewardArr = calculateAllReward(msg.sender);
        for (uint256 i = 0; i < stakes.length; i++) {
            if (total <= rewardArr[i].staticReward) {
                Users[msg.sender].stakes[i].staticClaimed += total;
                return;
            } else {
                total -= rewardArr[i].staticReward;
                Users[msg.sender].stakes[i].staticClaimed += rewardArr[i]
                    .staticReward;
            }
            Users[msg.sender].stakes[i].staticClaimed += rewardArr[i]
                .staticReward;
        }
    }

    function claimDynamicReward(uint256 _amount) public nonReentrant {
        RewardStruct memory totalReward = getTotalRewards(msg.sender);
        require(_amount <= totalReward.dynamicReward);
        require(_amount >= Users[msg.sender].dynamicLimit);
        updateDynamicStakes(_amount);
        token.transfer(msg.sender, _amount);
        Users[msg.sender].dynamicLimit *= 2;
    }

    function updateDynamicStakes(uint256 _amount) internal {
        RewardStruct[] memory allocArray = calculateAllReward(msg.sender);
        StakeStruct[] memory stakes = Users[msg.sender].stakes;
        uint256 total = _amount;
        for (uint256 i = 0; i < stakes.length; i++) {
            if (total > allocArray[i].dynamicReward) {
                Users[msg.sender].stakes[i].dynamicClaimed += allocArray[i]
                    .dynamicReward;
                total -= allocArray[i].dynamicReward;
            } else {
                Users[msg.sender].stakes[i].dynamicClaimed += total;
                return;
            }
            if (total > stakes[i].directBonus) {
                Users[msg.sender].stakes[i].dynamicClaimed += stakes[i]
                    .directBonus;
                total -= stakes[i].directBonus;
                Users[msg.sender].stakes[i].directBonus = 0;
            } else {
                Users[msg.sender].stakes[i].dynamicClaimed += total;
                Users[msg.sender].stakes[i].directBonus -= total;
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
    
    function callTest() external nonReentrant{
        refContract.testFunc();
    }
    //Reading functions
    function getStakes(
        address _user
    ) external view returns (StakeStruct[] memory) {
        StakeStruct[] memory stakes = Users[_user].stakes;
        RewardStruct[] memory rewardArr = calculateAllReward(_user);
        for (uint i = 0; i < stakes.length; i++) {
            stakes[i].dynamicClaimed = rewardArr[i].dynamicReward;
            stakes[i].staticClaimed = rewardArr[i].staticReward;
        }
        return stakes;
    }

    function getStakeUser(
        address _user
    ) public view returns (UserStruct memory) {
        return Users[_user];
    }
    
    function getTeamUser(address _user) external view returns (RefContract.TeamUserStruct memory) {
        return refContract.getUser(_user);
    }
    
    function checkUpgradablity(address _user) external view returns (bool) {
        return refContract.checkUpgradablity(_user);
    }
    function getRefsWithRank(address _user, uint8 index)  external view returns (uint256) {
        return refContract.getRefsWithRank(index,_user);
    }

    function getReferralRanks(address _user)  external view returns (uint256[7] memory) {
        return refContract.getReferralRanks(_user);
    }
    // Admin Functions:- Only to be used in case of emergencies
    function transferOwnership(address newOwner) public onlyOwner nonReentrant {
        owner = newOwner;
    }

    function withDrawTokens(
        address _token,
        uint256 amount
    ) public onlyOwner nonReentrant {
        IERC20(_token).transfer(owner, amount);
    }

    function changeDCTokenAddress(address newAddr) public onlyOwner nonReentrant {
        DCTokenAddress = newAddr;
    }
    function changeRefContract(address _refContract) public onlyOwner nonReentrant{
        refContract = RefContract(_refContract);
    }
    
}
