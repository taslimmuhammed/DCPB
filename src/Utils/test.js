import { BigNoToUSDT, hexTimeToUnix } from "./Utils";


export const calculateAllReward = (Users, relationBonus, rankBonus) => {

    let baseTime = hexTimeToUnix(Users.stakes[0].timestamp);
    baseTime = baseTime - (baseTime % 60000);
    let currentTime = new Date().getTime();
    let stakes = Users.stakes;
    let relationBonuses = relationBonus;
    let rankBonuses = rankBonus;

    let rewardStructs = [];
    for (let i = 0; i < stakes.length; i++) {
        rewardStructs[i] = {
            staticReward: 0,
            dynamicReward: 0,
            available: 0
        }
    }
    let availableArray = [];
    if (Users.stakes.length == 0) {
        return rewardStructs;
    }
    for (let i = 0; i < stakes.length; i++)
        availableArray[i] = BigNoToUSDT(stakes[i].reward) - BigNoToUSDT(stakes[i].directBonus) - BigNoToUSDT(stakes[i].directClaimed);

    //interpreting and allocating all rewards day by day
    console.log(availableArray[0]);
    for (let i = baseTime; i < currentTime; i += 60000) {
        let dynamicReward = 0;
        // calculating dynamic
        for (let j = 0; j < relationBonuses.length; j++) {
            if (i > relationBonuses[j].timestamp)
                dynamicReward += BigNoToUSDT(relationBonuses[j].reward);
        }
        //adding team bonus
        for (let j = 0; j < rankBonuses.length; j++) {
            if (i > hexTimeToUnix(rankBonuses[j].start) && i <= hexTimeToUnix(rankBonuses[j].end))
                dynamicReward += BigNoToUSDT(rankBonuses[j].reward) * rankBonuses[j].multiplier;
        }
        //calculating static
        for (let j = 0; j < stakes.length; j++) {
            if (availableArray[j] != 0 && hexTimeToUnix(stakes[j].timestamp) < i) {
                let staticReward = BigNoToUSDT(stakes[j].reward) / 200;
                if (availableArray[j] <= staticReward) {
                    console.log("Before")
                    console.log(" Rewards struct staticReward", rewardStructs[j].staticReward);
                    console.log("available", availableArray[j]);
                    rewardStructs[j].staticReward += availableArray[j];
                    availableArray[j] = 0;
                    console.log("After")
                    console.log(" Rewards struct staticReward", rewardStructs[j].staticReward);
                    console.log("available", availableArray[j]);
                }
                else {
                    rewardStructs[j].staticReward += staticReward;
                    availableArray[j] -= staticReward;
                    if (availableArray[j] > dynamicReward) {
                        rewardStructs[j].dynamicReward += dynamicReward;
                        availableArray[j] -= dynamicReward;
                    }
                    else {
                        rewardStructs[j].dynamicReward += BigNoToUSDT(availableArray[j]);
                        availableArray[j] = 0;
                    }
                }
            }
        }
       // console.log(rewardStructs[0], availableArray[0]);
    }
    console.log(availableArray[0]);
    for (let i = 0; i < stakes.length; i++) {
        console.log("directBonus",BigNoToUSDT(stakes[i].directBonus));
        console.log("dynamicClaimed", BigNoToUSDT(stakes[i].dynamicClaimed));
        console.log("staticClaimed", BigNoToUSDT(stakes[i].staticClaimed));
        rewardStructs[i].dynamicReward += BigNoToUSDT(stakes[i].directBonus);
        rewardStructs[i].dynamicReward -= BigNoToUSDT(stakes[i].dynamicClaimed);
        rewardStructs[i].staticReward -= BigNoToUSDT(stakes[i].staticClaimed);
        rewardStructs[i].available = availableArray[i];
    }
    console.log(rewardStructs[0]);
    return rewardStructs;
}