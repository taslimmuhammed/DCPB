import { ethers } from "ethers"

export const ContractAddress = "0xd7646DFad53A9E02Cb40A8dB029151698C11f330" 
export const USDTAddress = "0x863aa21721D42B59CCA2a49213780DEc5837D7f1"
export const NFTReleaseAddres = "0x38E3eB34345d1823DafcCFaF0F41E0891b154FC2"
export const NFTStakingAddress = "0x61A6b879424C32D13f098FEfAD4353CAD2B3401d"
export const DCTokenAddress = "0x8aCbC8607B859Bc2e8c41336E67D695C877E2876"
export const DCManagerAddress = "0x67b21B991a1709000cE837Eb9342dBde25057725"
export const NFTAddress = "0x17A4370CBB1c2F1c1a53532d672AA4967d134735"
export const refContract = "0x6cd476aB88BCfe28B2a92B12E4f612a7fb3dD971"
export const BigNoToUSDT = (bigno) => {
    try {
        let amount = bigno.div(10 ** 5 + "")
        amount = parseInt(amount._hex, 16)
        amount /= 10;
        return amount
    } catch (e) {
        return 0
    }

}
export const BigNoToInt = (bigno) => {
    try {
        let amount = parseInt(bigno._hex, 16)
        return amount
    } catch (e) {
        console.log(e);
        return 0
    }
}
export const BigNoToDC = (bigno) => {
    try {
        let amount = bigno.div(10 ** 18 + "")
        amount = parseInt(amount._hex, 16)
        return amount
    } catch (e) {
        console.log(e);
        return 0
    }
}
export const stringToUSDT = (_amount) => {
    try {
        let amount = parseInt(_amount)
        amount = ethers.BigNumber.from(amount)
        amount = amount.mul(10 ** 6 + "")
        return amount._hex
    } catch (e) {
        console.log(e);
        return 0
    }

}
export const stringToBigInt = (_amount) => {
    try {
        let amount = parseInt(_amount)
        amount = ethers.BigNumber.from(amount)
        return amount
    } catch (e) {
        console.log(e);
        return 0
    }

}
export const getRankfromUser = (_user) => {
    if (_user) return
    return 0
}

export function shortenAddress(address, startChars = 6, endChars = 4) {
    if (!address) return '';
    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

export function HexToDateString(timestamp) {
    try {
        let date = parseInt(timestamp._hex, 16) * 1000
        date = new Date(date)
        return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
    } catch (e) {
        console.log(e);
        return ''
    }
}  
export const hexTimeToUnix = (hexTime) => {
    try {
        let date = parseInt(hexTime._hex, 16) * 1000
        date = new Date(date)
        return date.getTime()
    } catch (e) {
        console.log(e);
        return 0
    }
}
//1 - 0xd0cc32348E98f148E769f034A9C79b1C5a0e2A78
//2 - 0x8FC715eF0A42940aD52bA6E52460CCbcAb8776E7
//3 - 0xB79aE39d8eFd1210fe6302FbFA337b5F7b9B3204
//4 - 0xbdA06E37fb0266D9F29f05265C34efd885874443
//5 - 0xc966233a657C94016ef87dca320204E89D81B1C7


