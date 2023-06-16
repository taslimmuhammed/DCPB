// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract RefContract {
    uint256 decimals = 10 ** 6;
    struct TeamBonus {
        uint256 bonus;
        uint256 startDate;
        uint256 endDate;
    }
    struct TeamUserStruct {
        uint256 totalRefStake;
        TeamBonus[] bonuses;
        address referer;
        address[][] downReferrals;
        uint8 rank;
    }
    mapping(address => TeamUserStruct) public teamUsers;

    function createNewTeamBonus() internal {
        if (teamUsers[msg.sender].bonuses.length == 0) {
            teamUsers[msg.sender].bonuses.push(
                TeamBonus(
                    teamUsers[msg.sender].totalRefStake / 1000,
                    block.timestamp,
                    block.timestamp + 365 days
                )
            );
        } else if (teamUsers[msg.sender].bonuses.length < 6) {
            TeamBonus[] memory bonuses = teamUsers[msg.sender].bonuses;
            uint256 totalBonus = 0;
            for (uint i = 0; i < bonuses.length; i++) {
                totalBonus += bonuses[i].bonus;
            }
            teamUsers[msg.sender]
                .bonuses[bonuses.length - 1]
                .endDate = block.timestamp;
            teamUsers[msg.sender].bonuses.push(
                TeamBonus(
                    (teamUsers[msg.sender].totalRefStake-totalBonus) / 1000,
                    block.timestamp,
                    block.timestamp + 1000 days
                )
            );
        } else {
            return;
        }
    }

    function _signForteam(address referer) internal {
        teamUsers[msg.sender].referer = referer;
    }

    function handleStakeAdditions(uint256 _amount) internal {
        address friend = teamUsers[msg.sender].referer;
        while (friend != address(0)) {
            teamUsers[friend].totalRefStake += _amount;
            friend = teamUsers[friend].referer;
        }
    }
    
    function findTeamBonusForDay(address _user, uint256 _day) public view returns (uint256) {
        for (uint i = 0; i < teamUsers[_user].bonuses.length; i++) {
            if (teamUsers[_user].bonuses[i].startDate <= _day && teamUsers[_user].bonuses[i].endDate >= _day) {
                return teamUsers[_user].bonuses[i].bonus;
            }
        }
        return 0;
    }
    
    function handleDownReferals() internal {
        for (uint8 i = 0; i < 6; i++) teamUsers[msg.sender].downReferrals.push();
        address friend = msg.sender;
        for (uint8 i = 0; i < 6; i++) {
            friend = teamUsers[friend].referer;
            if (friend == address(0)) break;
            teamUsers[friend].downReferrals[i].push(msg.sender);
        }
    }

    function getSameRankList(
        address _user
    ) public view returns (address[] memory) {
        address[] memory sameRankUsers = new address[](10);
        uint256 count = 0;
        uint8 rank = teamUsers[_user].rank;
        address friend = teamUsers[msg.sender].referer;
        while (friend != address(0) && count < 10) {
            if (teamUsers[friend].rank == rank) {
                sameRankUsers[count] = friend;
                count++;
            }
            friend = teamUsers[friend].referer;
        }
        return sameRankUsers;
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
    mapping(address => UserStruct) Users;
    struct DynamicStruct {
        address referer;
        uint256 reward;
        uint256 timestamp;
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
        DynamicStruct[] dynamicPerDay;
        uint256 indirectStakes;
        uint256 dynamicLimit;
        uint256 staticLimit;
    }
    struct RewardStruct {
        uint256 staticReward;
        uint256 dynamicReward;
        uint256 available;
    }

    constructor(address _token, address _dcaddress) {
        token = IERC20(_token);
        DCTokenAddress = _dcaddress;
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

    function calculateAllReward(
        address _user
    ) public view returns (RewardStruct[] memory) {
        uint256 baseTime = Users[_user].stakes[0].timestamp;
        uint256 currentTime = block.timestamp;
        StakeStruct[] memory stakes = Users[_user].stakes;
        DynamicStruct[] memory dynamicPerDay = Users[_user].dynamicPerDay;
        RewardStruct[] memory rewardStructs = new RewardStruct[](stakes.length);
        uint256[] memory availableArray = new uint256[](stakes.length);
        if (Users[_user].stakes.length == 0) {
            return rewardStructs;
        }
        for (uint i = 0; i < stakes.length; i++)
            availableArray[i] = stakes[i].reward - stakes[i].directBonus;
        
        for (uint256 i = baseTime; i < currentTime; i += 60) {
            uint256 dynamicReward = 0;
            // calculating dynamic
            for (uint8 j = 0; j < dynamicPerDay.length; j++) {
                if (dynamicPerDay[j].timestamp <= i) {
                    dynamicReward += dynamicPerDay[j].reward;
                }
            }
            dynamicReward += findTeamBonusForDay(_user, i);
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
        require(!Active[msg.sender], "Already signed in");
        require(
            ((Active[_friend]) || (_friend == address(0))),
            "Invalid referal id"
        );
        Active[msg.sender] = true;
        handleDownReferals();
        _signForteam(_friend);
        Users[msg.sender].dynamicLimit = 2 * decimals;
        Users[msg.sender].staticLimit = 1 * decimals;
        totalUsers++;
    }



    function stake(uint256 _amount) external signedIn {
        require(_amount >= 1 * decimals, "Min staking amount is 100USDT");
        _stake(_amount);
        distributeStakeMoney(_amount);
        handleDirectBonus(_amount);
        handleRelationBonus(_amount);
        handleSameRankBonus(_amount);
        address referer = teamUsers[msg.sender].referer;
        if (referer != address(0)) {
            Users[referer].indirectStakes += _amount;
        }
    }

    function _stake(uint256 _amount) internal {
        StakeStruct memory newStake = StakeStruct(
            _amount * 2,
            0,
            0,
            block.timestamp,
            0
        );
        require(
            token.transferFrom(msg.sender, address(this), _amount),
            "Please increase the allowance to the contract"
        );
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
        address _friend = teamUsers[msg.sender].referer;
        if (_friend == address(0) || Users[_friend].stakes.length==0) return;
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
                        Users[referer].dynamicPerDay.push(
                            DynamicStruct(msg.sender, reward, block.timestamp)
                        );
                }
            }
        }
    }

    function handleSameRankBonus(uint256 _amount) internal {
        uint256 reward = _amount / 1000;
        address[] memory list = getSameRankList(msg.sender);
        for (uint8 i = 0; i < 10; i++) {
            if (list[i] == address(0)) break;
            Users[list[i]].dynamicPerDay.push(
                DynamicStruct(msg.sender, reward, block.timestamp)
            );
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
        require(
            _amount <= totalReward.staticReward,
            "The amount should be less than the totals rewards"
        );
        require(
            _amount >= Users[msg.sender].staticLimit,
            "The amount less than the allowed limit"
        );
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
        require(
            _amount <= totalReward.dynamicReward,
            "The amount should be less than the totals rewards"
        );
        require(
            _amount >= Users[msg.sender].dynamicLimit,
            "The amount less than the allowed limit"
        );
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
                Users[msg.sender].stakes.length > 0
            ) return true;
            else return false;
        } else if (rank > 0 && rank < 6) {
            if (getRefsWithRank(rank, _user) >= 1) return true;
            else return false;
        } else {
            return false;
        }
    }

    function upgradeLevel() external nonReentrant {
        require(checkUpgradablity(msg.sender));
        teamUsers[msg.sender].rank += 1;
        createNewTeamBonus();
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

    function getUser(address _user) public view returns (UserStruct memory) {
        return Users[_user];
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

    function changeDCTokenAddress(address newAddr) public onlyOwner {
        DCTokenAddress = newAddr;
    }
}
