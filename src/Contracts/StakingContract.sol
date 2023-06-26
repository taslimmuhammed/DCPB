// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

contract RefContract {
    uint256 decimals = 10 ** 6;
    struct DynamicStruct {
        uint256 reward;
        uint256 timestamp;
    }
    struct RankBonus {
        uint256 start;
        uint256 end;
        uint256 reward;
        uint8 multiplier;
        address referer;
    }
    struct TeamUserStruct {
        uint256 totalRefStake;
        RankBonus[] rankBonus;
        address referer;
        address[][] downReferrals;
        uint8 rank;
    }

    mapping(address => TeamUserStruct) internal teamUsers;

    function _signForteam(address referer) internal {
        teamUsers[msg.sender].referer = referer;
    }

    
    function handleDownReferals() internal {
        for (uint8 i = 0; i < 6; i++)
            teamUsers[msg.sender].downReferrals.push();
        address friend = msg.sender;
        for (uint8 i = 0; i < 6; i++) {
            friend = teamUsers[friend].referer;
            if (friend == address(0)) break;
            teamUsers[friend].downReferrals[i].push(msg.sender);
        }
    }

    function getRefsWithRank(
        uint8 _rank,
        address _user
    ) public view returns (uint256) {
        address[] memory refs = teamUsers[_user].downReferrals[0];
        uint256 total = 0;
        for (uint256 i = 0; i < refs.length; i++) {
            if (teamUsers[refs[i]].rank >= _rank) total++;
        }
        return total;
    }

    function getReferralRanks(
        address _user
    ) external view returns (uint256[7] memory) {
        uint256[7] memory rankSet;
        getRankNos(_user, rankSet);
        return rankSet;
    }

    function getRankNos(
        address _user,
        uint256[7] memory rankSet
    ) internal view {
        //count rank of each user
        address[] memory downReferrals = teamUsers[_user].downReferrals[0];
        for (uint256 i = 0; i < downReferrals.length; i++) {
            if (downReferrals[i] == address(0)) break;
            else {
                rankSet[teamUsers[downReferrals[i]].rank]++;
                getRankNos(downReferrals[i], rankSet);
            }
        }
    }

    function getTeamUser(
        address _user
    ) external view returns (TeamUserStruct memory) {
        return teamUsers[_user];
    }

}

contract StakingContract is RefContract {
    mapping(address => bool) public Active;
    IERC20 public token;
    address owner = 0xd0cc32348E98f148E769f034A9C79b1C5a0e2A78;
    address AWallet = 0x584C5ab8e595c0C2a1aA0cD23a1aEa56a35B9698;
    address BWallet = 0x1F4de95BbE47FeE6DDA4ace073cc07eF858A2e94;
    address CWallet = 0xF4fC364851D03A7Fc567362967D555a4d843647d;
    address public DCTokenAddress = 0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8;
    uint256 public totalDeposite;
    uint256 public totalUsers;
    mapping(address => UserStruct) internal Users;

    struct StakeStruct {
        uint256 reward;
        uint256 staticClaimed;
        uint256 dynamicClaimed;
        uint256 timestamp;
        uint256 directBonus;
    }
    struct UserStruct {
        StakeStruct[] stakes;
        DynamicStruct[] dynamicPerDay;
        uint256 dynamicLimit;
        uint256 staticLimit;
    }
    struct RewardStruct {
        uint256 staticReward;
        uint256 dynamicReward;
        uint256 available;
    }

    constructor(address _usdt, address _dcmanager) {
        token = IERC20(_usdt);
        DCTokenAddress = _dcmanager;
    }

    modifier signedIn() {
        require(Active[msg.sender]);
        _;
    }
    modifier onlyOwner() {
        require((msg.sender == owner));
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
        DynamicStruct[] memory dynamicPerDay = Users[_user].dynamicPerDay;
        RankBonus[] memory rankBonus = teamUsers[_user].rankBonus;
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
            for (uint256 j = 0; j < dynamicPerDay.length; j++) {
                if (dynamicPerDay[j].timestamp <= i)
                    dynamicReward += dynamicPerDay[j].reward;
            }
            //adding rank bonus
            for (uint256 j = 0; j < rankBonus.length; j++)
                if (rankBonus[j].start <= i && rankBonus[j].end > i)
                    dynamicReward += rankBonus[j].reward*rankBonus[j].multiplier;

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
        require(msg.sender != _friend);
        require(!Active[msg.sender]);
        require(
            ((Active[_friend]) || (_friend == address(0))),
            "Invalid referal id"
        );
        _signForteam(_friend);
        Active[msg.sender] = true;
        handleDownReferals();
        Users[msg.sender].dynamicLimit = 2 * decimals;
        Users[msg.sender].staticLimit = 1 * decimals;
        totalUsers++;
    }

    function stake(uint256 _amount) external signedIn {
        require(_amount >= 1 * decimals);
        _stake(_amount);
        distributeStakeMoney(_amount);
        handleDirectBonus(_amount);
        handleRelationBonus(_amount);
        reRe();
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
        // handling stake additions
        address friend = teamUsers[msg.sender].referer;
        while (friend != address(0) ) {
            teamUsers[friend].totalRefStake += _amount;
            friend = teamUsers[friend].referer;
        }
    }

    function distributeStakeMoney(uint256 _amount) internal {
        token.transfer(DCTokenAddress, (_amount * 5) / 100);
        token.transfer(AWallet, (_amount * 14) / 100);
        token.transfer(BWallet, (_amount * 14) / 100);
        token.transfer(CWallet, (_amount * 2) / 100);
    }

    function handleDirectBonus(uint256 _amount) internal {
        address _friend = teamUsers[msg.sender].referer;
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

    function handleRelationBonus(uint256 _amount) internal {
        uint256 reward = (_amount * 5) / 10000;
        address[][] memory downReferrals = teamUsers[msg.sender].downReferrals;

        for (uint8 i = 0; i < 6; i++) {
            if (downReferrals[i].length == 0) break;
            for (uint256 j = 0; j < downReferrals[i].length; j++) {
                address referer = downReferrals[i][j];
                if (referer == address(0)) break;
                else {
                    if (teamUsers[referer].downReferrals[0].length > i)
                        Users[referer].dynamicPerDay.push(
                            DynamicStruct( reward, block.timestamp)
                        );
                }
            }
        }
    }

    function reRe() internal{
        address friend = teamUsers[msg.sender].referer;
        uint256 reward = getTotalStakes(msg.sender) / 20000;
        //ending all the rewards
        while(friend != address(0))
        for (uint i = 0; i < teamUsers[friend].rankBonus.length; i++)  {
            if (teamUsers[friend].rankBonus[i].referer == msg.sender && teamUsers[friend].rankBonus[i].end > block.timestamp)
            teamUsers[friend].rankBonus[i].end = block.timestamp;
        }
        // redistributing the reward
        friend = teamUsers[msg.sender].referer;
        uint8 rank = teamUsers[msg.sender].rank;
        uint8 tempRank = rank;
        while (friend != address(0) ) {
            if (teamUsers[friend].rank > tempRank) {
                teamUsers[friend].rankBonus.push(
                    RankBonus(block.timestamp, block.timestamp + 8640000000 , reward,3*teamUsers[friend].rank, msg.sender)
                );
                tempRank = teamUsers[friend].rank;
            }else if(teamUsers[friend].rank == tempRank && teamUsers[friend].rank == rank){
                if(tempRank==0) teamUsers[friend].rankBonus.push(RankBonus(block.timestamp, block.timestamp+8640000000 , reward,0, msg.sender));
                else teamUsers[friend].rankBonus.push(
                    RankBonus(block.timestamp, block.timestamp + 8640000000 , reward,10, msg.sender)
            );
            }else break;
            friend = teamUsers[friend].referer;
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

    function checkUpgradablity(address _user) public view returns (bool) {
        uint8 rank = teamUsers[_user].rank;
        if (rank == 0) {
            if (
                teamUsers[_user].totalRefStake >= 10 * decimals &&
                Users[_user].stakes.length > 0
            ) return true;
            else return false;
        } else if (rank < 6) {
            if (getRefsWithRank(rank, _user) > 0) return true;
            //change
            else return false;
        } else {
            return false;
        }
    }

    function upgradeLevel() external nonReentrant {
        require(checkUpgradablity(msg.sender));
        uint8 rank = teamUsers[msg.sender].rank + 1;
        teamUsers[msg.sender].rank  = rank;
        address _friend = teamUsers[msg.sender].referer;
        //correcting rank bonuses
        reRe();
        //correcting self rank bonuses
        RankBonus[] memory rankArr1 = teamUsers[msg.sender].rankBonus; 
        for (uint i = 0; i < rankArr1.length; i++)
            if (teamUsers[msg.sender].rankBonus[i].end > block.timestamp){
                teamUsers[msg.sender].rankBonus[i].end = block.timestamp;
                rankArr1[i].end = block.timestamp + 8640000000;
                rankArr1[i].start = block.timestamp;
                if(rank > teamUsers[rankArr1[i].referer].rank) rankArr1[i].multiplier = 3*rank;
                else if(rank==teamUsers[rankArr1[i].referer].rank) rankArr1[i].multiplier = 10;
                else rankArr1[i].multiplier = 0;
                teamUsers[msg.sender].rankBonus.push(rankArr1[i]);
                }
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

    // Admin Functions:- Only to be used in case of emergencies
    // function transferOwnership(address newOwner) public onlyOwner nonReentrant {
    //     owner = newOwner;
    // }

    function withDrawTokens(
        address _token,
        uint256 amount
    ) public onlyOwner nonReentrant {
        IERC20(_token).transfer(owner, amount);
    }

}
