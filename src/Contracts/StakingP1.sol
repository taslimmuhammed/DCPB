// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract RefContract {
    uint256 decimals = 10 ** 6;
    address public owner;
    address public admin_contract;

    modifier onlyOwner() {
        require((msg.sender == owner),"The function is reserved for owner");
        _;
    }
    modifier onlyAdmin() {
        require((msg.sender == admin_contract), "The function is reserved for admin");
        _;
    }
    bool private locked;
    modifier nonReentrant() {
        require(!locked, "say no to reentrance attacks");
        locked = true;
        _;
        locked = false;
    }


    function changeAdmin(address _newadmin) external onlyOwner nonReentrant{
        admin_contract = _newadmin;
    }

    function changeOwner(address _newowner) external onlyOwner nonReentrant{
        owner = _newowner;
    }

    struct RankBonus{
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
    
    struct TeamUserStruct{
        uint256 totalRefStake;
        uint256 totalStake;
        RankBonus[] rankBonus;
        address referer;
        address[][] downReferrals;
        uint8 rank;
        RelationStruct[] relationBonus;
        Stake[] stakes;
    }
    
    struct Stake{
        uint256 start;
        uint256 end;
        uint256 amount;
    }

    mapping(address => TeamUserStruct) private teamUsers;
    
    constructor(){
        owner = msg.sender;
    }

    
    function signIn(address _user, address _referer) external  onlyAdmin nonReentrant{
        teamUsers[_user].referer = _referer;
        handleDownReferals(_user);
    }

    function handleDownReferals(address _user) private {
        for (uint8 i = 0; i < 6; i++)
            teamUsers[_user].downReferrals.push();
        address friend = _user;
        for (uint8 i = 0; i < 6; i++) {
            friend = teamUsers[friend].referer;
            if (friend == address(0)) break;
            teamUsers[friend].downReferrals[i].push(_user);
        }
    }

    function stake(address _user, uint256 _amount) external onlyAdmin nonReentrant{
        teamUsers[_user].totalStake += _amount;
        handleStakeAddtions(_user, _amount);
        distributeUp(_user, _amount);
        distributeDirectBonus(_user, _amount);
        teamUsers[_user].stakes.push(Stake(block.timestamp, block.timestamp + 60*200, _amount));
    } 

    function handleStakeAddtions(address _user, uint256 _amount) private {
        address friend = teamUsers[_user].referer;
        while (friend != address(0) ) {
            teamUsers[friend].totalRefStake += _amount;
            friend = teamUsers[friend].referer;
        }
    }

    function distributeUp(address _user, uint256 _amount) private {
        address friend = teamUsers[_user].referer;
        uint256 reward = _amount/10000;
        uint8 tempRank = teamUsers[_user].rank;
        address referer = _user;
        bool sameRank = true;
        while (friend != address(0) ) {
            if(teamUsers[friend].rank>tempRank){
                teamUsers[friend].rankBonus.push(RankBonus(block.timestamp, block.timestamp + 200*60, teamUsers[friend].rank*3, reward, referer));
            }else if(sameRank && teamUsers[friend].rank !=0 && teamUsers[friend].rank==tempRank){
                uint256 multiplier = 500*teamUsers[referer].rank/10;
                teamUsers[friend].rankBonus.push(RankBonus(block.timestamp, block.timestamp + 200*60, multiplier, reward, referer));
            }
            sameRank = false;
            referer = friend;
            tempRank = teamUsers[friend].rank;
            friend = teamUsers[friend].referer;
        }
    }

    function distributeDirectBonus(address _user, uint256 _amount) private {
        uint256 reward = (_amount * 5) / 10_000;
        address[][] memory downReferrals = teamUsers[_user].downReferrals;

        for (uint256 i = 0; i < 6; i++) {
            if (downReferrals[i].length == 0) break;
            for (uint256 j = 0; j < downReferrals[i].length; j++) {
                address referer = downReferrals[i][j];
                if (referer == address(0)) break;
                else {
                    if (teamUsers[referer].downReferrals[0].length > i)
                        teamUsers[referer].relationBonus.push(RelationStruct(reward, block.timestamp, block.timestamp + 200*60));
                }
            }
        }
    }
 
    function upgradeUser(address _user) external onlyAdmin nonReentrant{
       require(checkUpgradablity(_user), "User is not upgradable");
       teamUsers[_user].rank++;
       stopRankBonuses(_user);
       getFromDown(_user);
       pushUp(_user);
    }

    function stopRankBonuses(address _user) private{
        address friend = teamUsers[_user].referer;
        uint8 rank = teamUsers[_user].rank;
        endUserRankBonuses(_user);
        if(friend !=address(0) && teamUsers[friend].rank<=rank)
            reduceRankBonus(friend, _user);
    }

    function endUserRankBonuses(address _user) private{
        RankBonus[] memory rankBonus = teamUsers[_user].rankBonus;
        uint256 currentTime = block.timestamp;
        for (uint256 i = 0; i < rankBonus.length; i++) if(rankBonus[i].end > currentTime){
            teamUsers[_user].rankBonus[i].end = currentTime;
        }
    }

    function reduceRankBonus(address _user, address referer) private{
        RankBonus[] memory rankBonus = teamUsers[_user].rankBonus;
        uint256 currentTime = block.timestamp;
        for (uint256 i = 0; i < rankBonus.length; i++) if(rankBonus[i].end > currentTime && referer == rankBonus[i].referer){
            teamUsers[_user].rankBonus[i].end = currentTime;
        }
    }

    function getFromDown(address _user) private {
            address[] memory downReferrals = teamUsers[_user].downReferrals[0];
            for (uint i = 0; i < downReferrals.length; i++) {
                if(teamUsers[downReferrals[i]].rank < teamUsers[_user].rank){
                    Stake[] memory stakes = teamUsers[downReferrals[i]].stakes;
                    for (uint j = 0; j < stakes.length; j++) {
                        if (stakes[j].end>block.timestamp) {
                            teamUsers[_user].rankBonus.push(RankBonus(block.timestamp, stakes[i].end, teamUsers[_user].rank*3, stakes[i].amount/10000, downReferrals[i]));
                        }
                    }
                    getValidStakes(_user, downReferrals[i], downReferrals[i], teamUsers[_user].rank*3);
                }else if(teamUsers[downReferrals[i]].rank == teamUsers[_user].rank){
                    uint256 multiplier = 500*teamUsers[_user].rank/10;
                    Stake[] memory stakes = teamUsers[downReferrals[i]].stakes;
                    for (uint j = 0; j < stakes.length; j++) {
                        if (stakes[j].end>block.timestamp) {
                            teamUsers[_user].rankBonus.push(RankBonus(block.timestamp, stakes[i].end, multiplier, stakes[i].amount/10000, downReferrals[i]));
                        }
                    }
                }
            }
    }
    
    function getValidStakes(address intitiator,address _user, address referer, uint256 multiplier) private{
        for(uint256 i=0; i<teamUsers[_user].downReferrals[0].length; i++){ 
            address friend = teamUsers[_user].downReferrals[0][i];
            Stake[] memory stakes = teamUsers[friend].stakes;
            for (uint j = 0; j < stakes.length; j++) {
                if(stakes[j].end>block.timestamp){
                    teamUsers[intitiator].rankBonus.push(RankBonus(block.timestamp, stakes[j].end, multiplier, stakes[j].amount/10000, referer));
                }
            }
            getValidStakes(intitiator, friend, referer, multiplier);
        }
    }

    function pushUp(address _user) private{
        address referer = teamUsers[_user].referer;
        uint256 multiplier = 500*teamUsers[referer].rank/10;
        if(referer!=address(0) && teamUsers[referer].rank==teamUsers[_user].rank){
            Stake[] memory stakes = teamUsers[_user].stakes;
            for (uint i = 0; i < stakes.length; i++) {
                if(stakes[i].end>block.timestamp){
                    teamUsers[referer].rankBonus.push(RankBonus(block.timestamp, stakes[i].end,multiplier, stakes[i].amount/10000, _user));
                }
            }
        }
    }
    
    //read functions
    function getUser(address _user) external view returns(TeamUserStruct memory){
        return teamUsers[_user];
    }

    function getUserDownReferrals(address _user, uint8 _level) external view returns(address[] memory){
        return teamUsers[_user].downReferrals[_level];
    }
    
    function getRelationBonus( address _user) external view returns(RelationStruct[] memory){
        return teamUsers[_user].relationBonus;
    }
        
    function getRankBonus( address _user) external view returns(RankBonus[] memory){
        return teamUsers[_user].rankBonus;
    }

    function getTotalStake(address _user) external view returns(uint256){
        return teamUsers[_user].totalStake;
    }

    function getTotalRefStake(address _user) external view returns(uint256){
        return teamUsers[_user].totalRefStake;
    }

    function getRank(address _user) external view returns(uint8){
        return teamUsers[_user].rank;
    }
    
    function getReferer(address _user) external view returns(address){
        return teamUsers[_user].referer;
    }
    function checkUpgradablity(address _user) public view returns (bool) {
        uint8 rank = teamUsers[_user].rank;
        if (rank == 0) {
            if (
                teamUsers[_user].totalRefStake >= 10 * decimals &&
                teamUsers[_user].totalStake > 0
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
     
    function getRefsWithRank(uint8 _rank,address _user) public view returns (uint256) {
        address[] memory refs = teamUsers[_user].downReferrals[0];
        uint256 total = 0;
        for (uint256 i = 0; i < refs.length; i++) {
            if (teamUsers[refs[i]].rank >= _rank) total++;
        }
        return total;
    }

    function getReferralRanks( address _user) external view returns (uint256[7] memory) {
        uint256[7] memory rankSet;
        getRankNos(_user, rankSet);
        return rankSet;
    }

    function getRankNos(address _user,uint256[7] memory rankSet) private view {
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
