import { ethers } from "ethers"

export const ContractAddress = "0x80403b4b7251E7CCd3D2741CA213D9A777cc71C4"
export const TokenAddress = "0x863aa21721D42B59CCA2a49213780DEc5837D7f1"

export const BigNoToUSDT = (bigno)=>{
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

export function HexToDateString(timestamp){
    let date = parseInt(timestamp._hex, 16) *1000
    date = new Date(date)
    return `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}`
}