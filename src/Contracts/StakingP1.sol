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
    

    mapping(address => TeamUserStruct) internal teamUsers;
    
    constructor(){
        owner = msg.sender;
    }

    
    function signIn(address _user, address _referer) external  onlyAdmin nonReentrant{
        teamUsers[_user].referer = _referer;
        handleDownReferals(_user);
    }

    function handleDownReferals(address _user) internal {
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
    } 

    function handleStakeAddtions(address _user, uint256 _amount) internal {
         // incrementing total additions
        address friend = teamUsers[_user].referer;
        while (friend != address(0) ) {
            teamUsers[friend].totalRefStake += _amount;
            friend = teamUsers[friend].referer;
        }
    }

    function distributeUp(address _user, uint256 _amount) internal {
        address friend = teamUsers[_user].referer;
        uint256 reward = _amount/10000;
        uint8 tempRank = teamUsers[_user].rank;
        address referer = _user;
        bool sameRank = true;
        while (friend != address(0) ) {
            if(teamUsers[friend].rank>tempRank){
                teamUsers[friend].rankBonus.push(RankBonus(block.timestamp, block.timestamp + 8640000000, teamUsers[friend].rank*3, reward, referer));
            }else if(sameRank && teamUsers[friend].rank !=0 && teamUsers[friend].rank==tempRank){
                teamUsers[friend].rankBonus.push(RankBonus(block.timestamp, block.timestamp + 8640000000, 10, reward, referer));
            }
            sameRank = false;
            referer = friend;
            tempRank = teamUsers[friend].rank;
            friend = teamUsers[friend].referer;
        }
    }

    function distributeDirectBonus(address _user, uint256 _amount) internal{
        uint256 reward = (_amount * 5) / 10000;
        address[][] memory downReferrals = teamUsers[_user].downReferrals;

        for (uint8 i = 0; i < 6; i++) {
            if (downReferrals[i].length == 0) break;
            for (uint256 j = 0; j < downReferrals[i].length; j++) {
                address referer = downReferrals[i][j];
                if (referer == address(0)) break;
                else {
                    if (teamUsers[referer].downReferrals[0].length > i)
                        teamUsers[referer].relationBonus.push(
                            RelationStruct(reward, block.timestamp)
                        );
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

    function stopRankBonuses(address _user) internal{
        address friend = teamUsers[_user].referer;
        uint8 rank = teamUsers[_user].rank;
        uint256 totalStake = teamUsers[_user].totalStake;
       // address referer = _user;
        endUserRankBonuses(_user);
        if(friend !=address(0)) {
            if(teamUsers[friend].rank<=rank)
                reduceRankBonus(friend, _user, totalStake+teamUsers[_user].totalRefStake);
            // referer = friend;
            // friend = teamUsers[friend].referer;
            // while(friend!=address(0)){
            //     if(teamUsers[friend].rank==rank){
            //         reduceRankBonus(friend, referer, totalStake);
            //     }
            //     referer = friend;
            //     friend = teamUsers[friend].referer;
            // }
        }
    }
    function endUserRankBonuses(address _user) internal{
        RankBonus[] memory rankBonus = teamUsers[_user].rankBonus;
        uint256 currentTime = block.timestamp;
        for (uint256 i = 0; i < rankBonus.length; i++) if(rankBonus[i].end > currentTime){
            teamUsers[_user].rankBonus[i].end = currentTime;
        }
    }
    function reduceRankBonus(address _user, address referer, uint256 _amount) internal{
        _amount = _amount / 10000;
        RankBonus[] memory rankBonus = teamUsers[_user].rankBonus;
        uint256 currentTime = block.timestamp;
        for (uint256 i = 0; i < rankBonus.length; i++) if(rankBonus[i].end > currentTime && referer == rankBonus[i].referer){
            teamUsers[_user].rankBonus[i].end = currentTime;
            if(_amount>rankBonus[i].reward) _amount -= rankBonus[i].reward;
            else if(_amount==rankBonus[i].reward) break;
            else{
                uint256 reward = rankBonus[i].reward - _amount;
                teamUsers[_user].rankBonus.push(RankBonus(block.timestamp, block.timestamp + 8640000000, rankBonus[i].multiplier, reward, referer));
                break;
            }
        }
    }
    function getFromDown(address _user) internal {
            address[] memory downReferrals = teamUsers[_user].downReferrals[0];
            for (uint i = 0; i < downReferrals.length; i++) {
                if(teamUsers[downReferrals[i]].rank < teamUsers[_user].rank){
                    uint256 total = teamUsers[downReferrals[i]].totalStake+ teamUsers[downReferrals[i]].totalRefStake;
                    teamUsers[_user].rankBonus.push(RankBonus(block.timestamp, block.timestamp + 8640000000, teamUsers[_user].rank*3, total/10000, downReferrals[i]));
                }else if(teamUsers[downReferrals[i]].rank == teamUsers[_user].rank){
                    uint256 total  = teamUsers[downReferrals[i]].totalStake + findTotalSameRankBonus(downReferrals[i]);
                    teamUsers[_user].rankBonus.push(RankBonus(block.timestamp, block.timestamp + 8640000000, 10, total/10000, downReferrals[i]));
                }
            }
    }
    function findTotalSameRankBonus(address _user) internal view returns(uint256){
        uint256 totalBonus = 0;
        address[] memory downReferrals = teamUsers[_user].downReferrals[0];
        for (uint i = 0; i < downReferrals.length; i++) {
            if(teamUsers[downReferrals[i]].rank==teamUsers[_user].rank)
                totalBonus += teamUsers[downReferrals[i]].totalStake+ findTotalSameRankBonus(downReferrals[i]);
        }
        return totalBonus;
    }
    function pushUp(address _user) internal{
        address referer = teamUsers[_user].referer;
        // while(referer!=address(0) && teamUsers[referer].rank==teamUsers[_user].rank) { 
        if(referer!=address(0) && teamUsers[referer].rank==teamUsers[_user].rank){
                uint256 reward =  findTotalSameRankBonus(referer)/10000;
                teamUsers[referer].rankBonus.push(RankBonus(block.timestamp, block.timestamp + 8640000000, 10, reward, _user));
            // _user = referer;
            // referer = teamUsers[referer].referer;
        }
    }

    // function upgradeRankBonus(address _user) internal{
    //     address[] memory downReferrals = teamUsers[_user].downReferrals[0];
    //     if(downReferrals.length>0){
    //         for (uint i = 0; i <downReferrals.length; i++) {
    //             if(teamUsers[downReferrals[i]].rank==teamUsers[_user].rank){
    //                 distributeSameRankUp(downReferrals[i]);
    //             }
    //             else if(teamUsers[downReferrals[i]].rank<teamUsers[_user].rank){
    //                 distributeRankBonusUp(downReferrals[i]);
    //             }
    //         }
    //     }
    //     if(teamUsers[_user].rank==1){
    //         distributeUp(_user, teamUsers[_user].totalStake);
    //     }
    // }
    // function distributeSameRankUp(address referer) internal{
    //     address friend = teamUsers[referer].referer;
    //     uint8 rank = teamUsers[referer].rank;
    //     RankBonus[] memory rankBonus = teamUsers[referer].rankBonus;

    //     //creating a list of valid rank bonuses
    //     uint256 x;
    //     for (uint i = 0; i < rankBonus.length; i++) 
    //         if (rankBonus[i].end > block.timestamp && rankBonus[i].multiplier==10 ) x++;
    //     RankBonus[] memory validRankBonuses = new RankBonus[](x);
    //     x=0;
    //     for (uint i = 0; i < rankBonus.length; i++) 
    //         if (rankBonus[i].end > block.timestamp && rankBonus[i].multiplier==10 )
    //            {
    //              validRankBonuses[x]=rankBonus[i];
    //              x++;
    //             }

    //     while (friend != address(0) ) {
    //         if(teamUsers[friend].rank==rank) {
    //             //pushing same rank bonuses
    //             for (uint i = 0; i < validRankBonuses.length; i++) 
    //             teamUsers[friend].rankBonus.push(
    //                 RankBonus(block.timestamp, block.timestamp + 8640000000 ,10, validRankBonuses[i].reward, validRankBonuses[i].referer)
    //             );
    //         }else break;
    //         friend = teamUsers[friend].referer;
    //     }
    // }


    // function distributeRankBonusUp(address referer) internal{
    //     address friend = teamUsers[referer].referer;
    //     uint8 rank = teamUsers[referer].rank;
    //     RankBonus[] memory rankBonus = teamUsers[referer].rankBonus;

    //     //getting list of valid rank bonus from the down user
    //     uint256 x;
    //     for (uint i = 0; i < rankBonus.length; i++) 
    //         if (rankBonus[i].end > block.timestamp && rankBonus[i].multiplier==10 ) x++;
        
    //     if(teamUsers[referer].rank==0) x=1;
    //     RankBonus[] memory validRankBonuses = new RankBonus[](x);
    //     x=0;
    //     if(teamUsers[referer].rank==0) validRankBonuses[0]=RankBonus(0, 0 ,3, teamUsers[referer].totalStake/10000, referer);
    //     else
    //     for (uint i = 0; i < rankBonus.length; i++) 
    //         if (rankBonus[i].end > block.timestamp && rankBonus[i].multiplier!=10 )
    //            {
    //              validRankBonuses[x]=rankBonus[i];
    //              x++;
    //             }
    //     //distributing up
    //     while (friend != address(0) && validRankBonuses.length>0) {
    //         if(teamUsers[friend].rank>rank) {
    //             rank = teamUsers[friend].rank;
    //             //pushing same rank bonuses
    //             for (uint i = 0; i < validRankBonuses.length; i++) 
    //             teamUsers[friend].rankBonus.push(
    //                 RankBonus(block.timestamp, block.timestamp + 8640000000 ,rank*3, validRankBonuses[i].reward, validRankBonuses[i].referer)
    //             );
    //         }else break;
    //         friend = teamUsers[friend].referer;
    //     }
    // }
    
    // bool public test;
    // function  testFunc() external onlyAdmin nonReentrant{
    //    test = !test;
    // }
    
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

    function getRankNos(address _user,uint256[7] memory rankSet) internal view {
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
