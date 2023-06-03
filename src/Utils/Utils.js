import { ethers } from "ethers"

export const ContractAddress = "0xBB359119e293d8aBbc8530e9a56300665F97d885"
export const TokenAddress = "0x863aa21721D42B59CCA2a49213780DEc5837D7f1"

export const BigNoToUSDT = (bigno)=>{
    console.log(bigno);
    let amount = bigno.div(10 ** 6 + "")
    amount = parseInt(amount._hex, 16)
    return amount
}

export const stringToUSDT = (_amount) => {
    let amount = parseInt(_amount)
    amount = ethers.BigNumber.from(amount)
    amount = amount.mul(10 ** 6 + "")
    return amount
}

export const getRankfromUser = (_user)=>{
    if (_user) return 
    return 0
}

export function shortenAddress(address, startChars = 6, endChars = 4) {
    if (!address) return '';
    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}