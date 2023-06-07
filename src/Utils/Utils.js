import { ethers } from "ethers"

export const ContractAddress = "0x79805624FC27439efB4f10f664769e51DEffE9F2"
export const TokenAddress = "0x863aa21721D42B59CCA2a49213780DEc5837D7f1"

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