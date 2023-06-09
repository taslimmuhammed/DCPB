import { ethers } from "ethers"

export const ContractAddress = "0x3a94707c30dB97cE766416414c7b24Ed84C16f64"
export const TokenAddress = "0x863aa21721D42B59CCA2a49213780DEc5837D7f1"
export const NFTReleaseAddres = "0xcB32A9D43CAcCa98B281e9239fb1C1907b864210"
export const NFTStakingAddress = "0x2D319D136f580306917096eCF3304D623dec27D6"
export const DCTokenAddress = "0x370bCeA9d726B2d9f6456f90fe832260B9d5e508"
export const DCManagerAddress = "0x7Beac3a11d6292efdCb0Ed1F137A61d61102c4Ff"
export const BigNoToUSDT = (bigno)=>{
    try{
    let amount = bigno.div(10 ** 5 + "")
    amount = parseInt(amount._hex, 16)
    amount/=10;
    return amount
    }catch(e){
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
export const stringToUSDT = (_amount) => {
    try {
let amount = parseInt(_amount)
    amount = ethers.BigNumber.from(amount)
    amount = amount.mul(10 ** 6 + "")
    return amount
    } catch (e) {
        console.log(e);
        return 0
    }
    
}

export const getRankfromUser = (_user)=>{
    if (_user) return 
    return 0
}

export function shortenAddress(address, startChars = 6, endChars = 4) {
    if (!address) return '';
    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

export function HexToDateString(timestamp){
    try {
let date = parseInt(timestamp._hex, 16) *1000
    date = new Date(date)
    return `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}`
    } catch (e) {
        console.log(e);
        return ''
    }
}    