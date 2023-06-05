// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract StakingContract {
    mapping(address => bool) public Active;
    IERC20 public token;
    uint256 public decimals = 10 ** 6;
    address public owner = 0x6B851e5B220438396ac5ee74779DDe1a54f795A9;
    address public AWallet = 0x584C5ab8e595c0C2a1aA0cD23a1aEa56a35B9698;
    address public BWallet = 0x1F4de95BbE47FeE6DDA4ace073cc07eF858A2e94;
    address CWallet = 0xF4fC364851D03A7Fc567362967D555a4d843647d;
    address public DCTokenAddress = 0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8;
    mapping(address => UserStruct) public Users;
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
    }
    struct UserStruct {
        StakeStruct[] stakes;
        address[6] upReferals;
        address[][] downReferrals;
        DynamicStruct[] dynamicPerDay;
        uint256 directBonus;
        uint8 rank;
        uint256 dynamicLimit;
        uint256 staticLimit;
    }

    constructor(address _token) {
        token = IERC20(_token);
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

    function signIn(address _friend) public nonReentrant {
        require(msg.sender != _friend);
        require(!Active[msg.sender], "Already signed in");
        require(
            ((Active[_friend]) || (_friend == address(0))),
            "Invalid referal id"
        );
        Active[msg.sender] = true;
        handleUpReferals(_friend);
        handleDownReferals();
        Users[msg.sender].dynamicLimit = 2 * decimals;
        Users[msg.sender].staticLimit = 1 * decimals;
    }

    function handleUpReferals(address _friend) internal {
        address[6] memory upReferals = Users[_friend].upReferals;
        for (uint8 i = 5; i > 0; i--) upReferals[i] = upReferals[i - 1];
        upReferals[0] = _friend;
        Users[msg.sender].upReferals = upReferals;
    }

    function handleDownReferals() internal {
        for (uint8 i = 0; i < 3; i++) Users[msg.sender].downReferrals.push();
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
        require(_amount >= 1 * decimals, "Min staking amount is 100USDT");
        _stake(_amount);
        distributeStakeMoney(_amount);
        handleDirectBonus(_amount);
        handleRelationBonus(_amount);
        handleTeamBonus(_amount);
        handleSameRankBonus(_amount);
    }

    function _stake(uint256 _amount) internal {
        StakeStruct memory newStake = StakeStruct(
            _amount * 2,
            0,
            0,
            block.timestamp
        );
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
        Users[_friend].directBonus += (_amount * 20) / 100;
    }

    function handleRelationBonus(uint256 _amount) internal {
        address[6] memory upRefererals = Users[msg.sender].upReferals;
        uint256 reward = (_amount * 5) / 10000;
        for (uint8 i = 0; i < 6; i++) {
            if (upRefererals[i] == address(0)) break;
            if (Users[upRefererals[i]].downReferrals[0].length > i)
                Users[upRefererals[i]].dynamicPerDay.push(
                    DynamicStruct(msg.sender, reward, block.timestamp)
                );
        }

        address[][] memory downReferrals = Users[msg.sender].downReferrals;
        for (uint8 i = 0; i < downReferrals.length; i++) {
            for (uint8 j = 0; j < downReferrals[i].length; j++) {
                address referer = downReferrals[i][j];
                if (referer == address(0)) break;
                else {
                    if (Users[referer].downReferrals[0].length > i)
                        Users[upRefererals[i]].dynamicPerDay.push(
                            DynamicStruct(msg.sender, reward, block.timestamp)
                        );
                }
            }
        }
    }

    function handleTeamBonus(uint256 _amount) internal {
        uint256 multiple = _amount / 10000;
        address friend = msg.sender;
        uint256 total = multiple * 60;
        uint8 rank = Users[friend].rank;
        while (friend != address(0)) {
            uint8 friendRank = Users[friend].rank;
            if (friendRank > rank) {
                uint256 _bonus = (friendRank - rank) * 10 * multiple;
                if (total <= _bonus) {
                    Users[friend].dynamicPerDay.push(
                    DynamicStruct(msg.sender, total, block.timestamp)
                );
                    break;
                } else {
                    Users[friend].dynamicPerDay.push(
                    DynamicStruct(msg.sender, _bonus, block.timestamp)
                );
                    total -= _bonus;
                }
                rank = friendRank;
            }
            friend = Users[friend].upReferals[0];
        }
    }

    function handleSameRankBonus(uint256 _amount) internal {
        address friend = msg.sender;
        uint256 reward = _amount / 1000;
        uint8 rank = Users[msg.sender].rank;
        while (true) {
            friend = Users[friend].upReferals[0];
            if (friend == address(0) || Users[friend].rank != rank) break;
            else Users[friend].dynamicPerDay.push(
                    DynamicStruct(msg.sender, reward, block.timestamp)
                );
        }
    }

    function getTotalDynamicRewards(
        address _user
    ) public view returns (uint256) {
        uint256 total = 0;
        DynamicStruct[] memory list = Users[_user].dynamicPerDay;
        for (uint256 i = 0; i < list.length; i++) {
            uint256 timeDiff = block.timestamp - list[i].timestamp;
            timeDiff = timeDiff / 60;
            total += timeDiff * list[i].reward;
        }
        total += Users[_user].directBonus;
        return total;
    }
    function getReferralRanks(address _user) public view returns(uint256[7] memory){
        uint256[7] memory rankSet;
        getRankNos(_user, rankSet);
        return rankSet;
    }

    function getRankNos(address _user, uint256[7] memory rankSet) public view  {
        //count rank of each user
        rankSet[Users[_user].rank]++;
        address[] memory downReferrals = Users[_user].downReferrals[0];
        for (uint256 i = 0; i < downReferrals.length; i++) {
            if (downReferrals[i] == address(0)) break;
            else {
                getRankNos(downReferrals[i], rankSet);
            }
        }
    }

    function getTotalStaticRewards(
        address _user
    ) public view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < Users[_user].stakes.length; i++) {
            uint256 r1 = getIndividualStaticReward(_user, i);
            total += r1;
        }
        return total;
    }

    function getIndividualDynamicAlloc(
        address _user
    ) public view returns (uint256[] memory) {
        StakeStruct[] memory stakes = Users[_user].stakes;
        uint256 total = getTotalDynamicRewards(_user);
        uint256[] memory allocArray = new uint256[](stakes.length);
        for (uint256 i = 0; i < stakes.length; i++) {
            uint256 available = stakes[i].reward -
                stakes[i].staticClaimed -
                stakes[i].dynamicClaimed;
            available = available - getIndividualStaticReward(_user, i);
            if (total <= available) {
                allocArray[i] = total;
                total = 0;
            } else {
                total -= available;
                allocArray[i] = available;
            }
        }
        return allocArray;
    }

    function claimableDynamicReward(
        address _user
    ) public view returns (uint256) {
        uint256[] memory allocArray = getIndividualDynamicAlloc(_user);
        uint256 total = 0;
        for (uint i = 0; i < allocArray.length; i++) total += allocArray[i];
        return total;
    }

    function claimStaticReward(uint256 _amount) public nonReentrant {
        uint256 totalReward = getTotalStaticRewards(msg.sender);
        require(
            _amount <= totalReward,
            "The amount should be less than the totals rewards"
        );
        require(
            _amount >= Users[msg.sender].staticLimit,
            "The amount less than the allowed limit"
        );
        updateTotalStaticReward(_amount);
        token.transfer(msg.sender, _amount);
        Users[msg.sender].staticLimit *=2;
    }

    function updateTotalStaticReward(uint256 _amount) internal {
        StakeStruct[] memory stakes = Users[msg.sender].stakes;
        uint256 total = _amount;

        for (uint256 i = 0; i < stakes.length; i++) {
            uint256 r1 = getIndividualStaticReward(msg.sender, i);
            if (total <= r1) {
                Users[msg.sender].stakes[i].staticClaimed += total;
                break;
            } else {
                Users[msg.sender].stakes[i].staticClaimed += r1;
                total -= r1;
            }
        }
    }

    function claimDynamicReward(uint256 _amount) public nonReentrant {
        uint256 total = claimableDynamicReward(msg.sender);
        require(
            _amount <= total,
            "The amount should be less than what vailable"
        );
        require(
            _amount >= Users[msg.sender].dynamicLimit,
            "The amount less than the allowed limit"
        );
        updateDynamicStakes(_amount);
        updatedDynamicPerDay();
        token.transfer(msg.sender, _amount);
        Users[msg.sender].dynamicLimit *=2 ;
    }

    function updateDynamicStakes(uint256 _amount) internal {
        uint256[] memory allocArray = getIndividualDynamicAlloc(msg.sender);
        uint256 reward = _amount;
        uint256 directBonus = Users[msg.sender].directBonus;
        if (reward <= directBonus) Users[msg.sender].directBonus -= reward;
        else {
            reward -= directBonus;
            Users[msg.sender].directBonus = 0;
            for (uint256 i = 0; i < allocArray.length; i++) {
                uint256 available = allocArray[i];
                if (reward <= available) {
                    Users[msg.sender].stakes[i].dynamicClaimed += reward;
                    break;
                } else {
                    Users[msg.sender].stakes[i].dynamicClaimed += available;
                    reward -= available;
                }
            }
        }
    }

    function updatedDynamicPerDay() internal {
        for (uint i = 0; i < Users[msg.sender].dynamicPerDay.length; i++) {
            Users[msg.sender].dynamicPerDay[i].timestamp %= 60;
        }
    }

    function checkUpgradablity(address _user) public view returns (bool) {
        UserStruct memory user = Users[_user];
        if (user.rank == 0) {
            if (getTotalStakes(_user) >= 40 * decimals) return true;
            else return false;
        } else if (user.rank == 1) {
            if (getRefsWithRank(1, _user) >= 3) return true;
            else return false;
        } else if (user.rank == 2) {
            if (getRefsWithRank(2, _user) >= 3) return true;
            else return false;
        } else if (user.rank == 3) {
            if (getRefsWithRank(3, _user) >= 3) return true;
            else return false;
        } else if (user.rank == 4) {
            if (getRefsWithRank(4, _user) >= 3) return true;
            else return false;
        } else if (user.rank == 5) {
            if (getRefsWithRank(5, _user) >= 3) return true;
            else return false;
        } else {
            return false;
        }
    }

    function getTotalStakes(address _user) public view returns (uint256) {
        StakeStruct[] memory stakes = Users[_user].stakes;
        uint256 total = 0;
        for (uint256 i = 0; i < stakes.length; i++) total += stakes[i].reward;
        return total;
    }

    function getRefsWithRank(
        uint8 _rank,
        address _user
    ) public view returns (uint256) {
        address[] memory refs = Users[_user].downReferrals[0];
        uint256 total = 0;
        for (uint256 i = 0; i < refs.length; i++) {
            if (Users[refs[i]].rank == _rank) total++;
        }
        return total;
    }

    function upgradeLevel() public nonReentrant {
        require(
            checkUpgradablity(msg.sender),
            "You cant upgrade untill next goal is fulfilled"
        );
        Users[msg.sender].rank += 1;
    }

    //Reading functions
    function getStakes(
        address _user
    ) public view returns (StakeStruct[] memory) {
        StakeStruct[] memory stakes = Users[_user].stakes;
        uint256[] memory dynamicAlloc = getIndividualDynamicAlloc(_user);
        for (uint i = 0; i < stakes.length; i++) {
            stakes[i].dynamicClaimed = dynamicAlloc[i];
            stakes[i].staticClaimed = getIndividualStaticReward(_user, i);
        }
        return stakes;
    }

    function getIndividualStaticReward(
        address _user,
        uint256 index
    ) public view returns (uint256) {
        StakeStruct memory Stake = Users[_user].stakes[index];
        uint256 available = Stake.reward -
            Stake.staticClaimed -
            Stake.dynamicClaimed;
        uint256 timeDiff = block.timestamp - Stake.timestamp;
        timeDiff = timeDiff / 60;
        uint256 total = (timeDiff * Stake.reward) / 200;
        total = total - Stake.staticClaimed;
        if (total > available) total = available;
        return total;
    }

    function getUser(address _user)
        public
        view
        returns (UserStruct memory){
        return Users[_user];
        }

    // Admin Functions:- Only to be used in case of emergencies
    function transferOwnership(address newOwner) public onlyOwner nonReentrant {
        owner = newOwner;
    }

    function withDrawTokens(
        address _token,
        address withdrawalAddress
    ) public onlyOwner nonReentrant {
        IERC20 _tokenContract = IERC20(_token);
        _tokenContract.transfer(
            withdrawalAddress,
            token.balanceOf(address(this))
        );
    }

    function changeDCTokenAddress(address newAddr) public onlyOwner {
        DCTokenAddress = newAddr;
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
    // 0x0000000000000000000000000000000000000000
    // 0x17F6AD8Ef982297579C203069C1DbfFE4348c372
    // 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4
    // 0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2
    // 0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db
    // stake - 0x9d83e140330758a8fFD07F8Bd73e86ebcA8a5692
    // token -0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8
    // 100000000
}
