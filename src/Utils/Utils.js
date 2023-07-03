import { ethers } from "ethers"

export const ContractAddress = "0x4793Ee5f9935dBE27d22fc81B526b0C9949aEfb7" 
export const USDTAddress = "0x863aa21721D42B59CCA2a49213780DEc5837D7f1"
export const NFTReleaseAddres = "0xd7dA7B62dC5087BD883271459F2eE9c5C7A7b3cd"
export const NFTStakingAddress = "0x3E18d347237C2061d2fd2c782317F1eb6B79E91b"
export const DCTokenAddress = "0x8aCbC8607B859Bc2e8c41336E67D695C877E2876"
export const DCManagerAddress = "0xBC80A66a20E1D51FD410d0b5c54f4C8D35d9Ba23"
export const NFTAddress = "0x17A4370CBB1c2F1c1a53532d672AA4967d134735"
export const refContract = "0xc5d68C3228a211066197585AF5166aF8e4562A88"
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