import { BigNoToUSDT, hexTimeToUnix } from "./Utils";


export const calculateAllReward = (StakeUser, teamUser) => {
    if (!StakeUser || !teamUser) return console.log("Not ready");
    let baseTime = hexTimeToUnix(StakeUser.stakes[0].timestamp);
    baseTime = baseTime - (baseTime % 60000);
    baseTime += 60000;
    let currentTime = new Date().getTime();
    let stakes = StakeUser.stakes;
    let relationBonuses = teamUser.relationBonus;
    let rankBonuses = teamUser.rankBonus;

    let rewardStructs = [];
    for (let i = 0; i < stakes.length; i++) {
        rewardStructs[i] = {
            staticReward: 0,
            dynamicReward: 0,
            available: 0
        }
    }
    let availableArray = [];
    if (StakeUser.stakes.length == 0) {
        return rewardStructs;
    }
    for (let i = 0; i < stakes.length; i++)
        availableArray[i] = BigNoToUSDT(stakes[i].reward) - BigNoToUSDT(stakes[i].directBonus) - BigNoToUSDT(stakes[i].directClaimed);
    let staticBonus = [];
    for (let i = 0; i < stakes.length; i++)
        staticBonus[i] = BigNoToUSDT(stakes[i].reward) / 200;

    console.log("staticBonus: ", staticBonus);
    //interpreting and allocating all rewards day by day
    for (let i = baseTime; i < currentTime; i += 60000) {
        let dynamicReward = 0;
        // calculating dynamic
        for (let j = 0; j < relationBonuses.length; j++) {
            if (i > relationBonuses[j].start && i <= relationBonuses[j].end)
                dynamicReward += relationBonuses[j].reward;
        }
        //adding team bonus
        for (let j = 0; j < rankBonuses.length; j++) {
            if (i > rankBonuses[j].start && i <= rankBonuses[j].end)
                dynamicReward += rankBonuses[j].reward * rankBonuses[j].multiplier;
        }
        for (let j = 0; j < stakes.length; j++) {
            if (availableArray[j] != 0 && stakes[j].timestamp < i) {
                console.log(availableArray);
                if (availableArray[j] <= staticBonus[j]) {
                    rewardStructs[j].staticReward += availableArray[j];
                    availableArray[j] = 0;
                    console.log("Set ", j, "As zero", rewardStructs[j]);
                    console.log("directBonus: ", BigNoToUSDT(stakes[j].directBonus), " + ", BigNoToUSDT(stakes[j].directClaimed));
                } else {
                    rewardStructs[j].staticReward += staticBonus[j];
                    availableArray[j] -= staticBonus[j];
                    //subtrating dynamic reward
                    if (availableArray[j] <= dynamicReward) {
                        rewardStructs[j].dynamicReward += availableArray[j];
                        availableArray[j] = 0;
                        console.log("Set ", j, "As zeror ", rewardStructs[j]);
                    } else {
                        rewardStructs[j].dynamicReward += dynamicReward;
                        availableArray[j] -= dynamicReward;
                        console.log("Subtracting dynamic reward", dynamicReward);
                    }
                }
            }
        }
    }
    // console.log(rewardStructs[0], availableArray[0]);
    console.log("Final Reward");
    for (let i = 0; i < stakes.length; i++) {
        rewardStructs[i].dynamicReward += BigNoToUSDT(stakes[i].directBonus);
        rewardStructs[i].dynamicReward -= BigNoToUSDT(stakes[i].dynamicClaimed);
        rewardStructs[i].staticReward -= BigNoToUSDT(stakes[i].staticClaimed);
        rewardStructs[i].available = availableArray[i];
        console.log("directBonus: ", BigNoToUSDT(stakes[i].directBonus), " + ", BigNoToUSDT(stakes[i].directClaimed));
        console.log("dynamicClaimed", rewardStructs[i].dynamicReward, " + ", BigNoToUSDT(stakes[i].dynamicClaimed));
        console.log("staticClaimed", rewardStructs[i].staticReward, " + ", BigNoToUSDT(stakes[i].staticClaimed));
    }
    return rewardStructs;
}