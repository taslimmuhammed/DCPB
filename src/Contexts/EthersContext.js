import { createContext, useState, useEffect } from "react";
import { toast } from 'react-toastify';
import { useContract, useContractWrite, useContractRead } from "@thirdweb-dev/react";
import { useAddress } from "@thirdweb-dev/react";
import { ContractAddress, DCManagerAddress, DCTokenAddress, NFTAddress, NFTReleaseAddres, NFTStakingAddress, USDTAddress, stringToBigInt, stringToUSDT } from "../Utils/Utils";
import { StakingABI } from "../Utils/StakingABI";
import { NFTstakingABI } from "../Utils/NFTStakingABI";
import { DCManagerABI } from "../Utils/DCManagerABI";
import { NFTReleaseABI } from "../Utils/NFTReleaseABI";
import { TokenABI } from "../Utils/TokenABI";
export const EthersContext = createContext(null);
export default function Ethers({ children }) {
    const [L0, setL0] = useState(false)
    const { contract, isLoading:L1 } = useContract(ContractAddress, StakingABI);
    const { contract: tokenContract } = useContract(USDTAddress);
    const { contract: DCContract } = useContract(DCTokenAddress,TokenABI);
    const { contract:NFTStaking, isLoading: L13 } = useContract(NFTStakingAddress, NFTstakingABI);
    const { contract:DCManager, isLoading: L14 } = useContract(DCManagerAddress, DCManagerABI);
    const { contract: NFTRelease, isLoading: L15 } = useContract(NFTReleaseAddres, NFTReleaseABI);
    const { contract:NFTContract, isLoading:L16 } = useContract(NFTAddress);
    const { contract: USDTContract, isLoading: L17 } = useContract(USDTAddress, TokenABI);
    const [Chinese, setChinese] = useState(false)
    const address = useAddress();
    const chinese = localStorage.getItem("chinese")
    if (chinese) setChinese(true)
    //const address = "0xA56617070bc969993b76F3531147E99d92Eae268" //c
    // const address = "0x90A09F952760579B2701467089FAB1344dEedC82" 
    //const address = "0x49CA032fe5230f8c15eE3eE221e40d88C737A125" //a
    //const address = "0xd4c97185E39fE07AD7C3e062aAC015BF028Bc850" //d
//     D wallet
//     0x39f8859e9e2B7ee617f55280595F4857E7c257dE

// E wallet
//     0xe8E1aeFA0f8006E7D60094599867D95D4130a5D0

// F wallet
//     0xB4AC65820712814deBF039BBe68A70d043d79d53
    const { data:SignedIn, isLoading:L2 } = useContractRead(contract, "Active", [address])
    const { mutateAsync: upgradeLevel } = useContractWrite(contract, "upgradeLevel")
    const { mutateAsync: _stakingWithdraw } = useContractWrite(contract, "withDrawTokens") //withdrawUSDT
    const { mutateAsync: claimNFT } = useContractWrite(NFTRelease, "claimNFT")
    const { mutateAsync: claimDC } = useContractWrite(NFTStaking, "getDCToken")
    const { mutateAsync: stakeNFT } = useContractWrite(NFTStaking, "stakeNFT")
    const { mutateAsync: increaseAllowance } = useContractWrite(DCContract, "increaseAllowance")
    const { mutateAsync: sellDC } = useContractWrite(DCManager, "sellDC")
    const { mutateAsync: _DCwithdraw } = useContractWrite(DCManager, "withdrawUSDT")
    const { mutateAsync: setApprovalForAll } = useContractWrite(NFTContract, "setApprovalForAll")
    const handleNFTClaim = async () => {
        setL0(true)
        try {
            console.log("claiming");
            await claimNFT({args:[]})
            toast.success("Transaction succeful")
        } catch (e) {
            console.log(e);
            if (e?.data?.message) toast.error(e.data.message)
            else toast.error("transaction failed")
        }
        setL0(false)
    }
    const handleDCClaim = async () => {
        setL0(true)
        try {
            await claimDC({ args: [] })
            toast.success("Transaction succeful")
        } catch (e) {
            console.log(e);
            if (e?.data?.message) toast.error(e.data.message)
            else toast.error("transaction failed")
        }
        setL0(false)
    }
    const handleUpgrade = async () => {
        setL0(true)
        try {
            const tx = await upgradeLevel({ args: [] });
            toast.success("Transaction succeful")
        } catch (e) {
            console.log(e);
            if (e?.data?.message) toast.error(e.data.message)
            else toast.error("transaction failed")
        }
        setL0(false)
    }
    const handleNFTStake = async (_amount) => {
        setL0(true)
        try {
            alert("You need to approve the contract to spend your NFTs, please sign the two upcoming transactions to stake")
            const data = await setApprovalForAll({ args: [NFTStakingAddress, true] });
            let amount = stringToBigInt(_amount+"")
            const tx = await stakeNFT({ args: [amount] });
            toast.success("Transaction succeful")
        } catch (e) {
            console.log(e);
            if (e?.data?.message) toast.error(e.data.message)
            else toast.error("transaction failed")
        }
        setL0(false)
    }
    const handleDCSell = async (_amount) => {
        setL0(true)
        try {
            let amount = stringToBigInt(_amount + "")
            let amountInDC = amount.mul(10 ** 18 + "")
            console.log(amountInDC, amount);
            const data = await increaseAllowance({ args: [DCManagerAddress, amountInDC] });
            const tx = await sellDC({ args: [amount] });
            toast.success("Transaction succeful")
            
        } catch (e) {
            console.log(e);
            if (e?.data?.message) toast.error(e.data.message)
            else toast.error("transaction failed")
        }
        setL0(false)
    }
    const handleStakingWithdraw = async (_amount) => {
        setL0(true)
        try {
            let amount = stringToUSDT(_amount + "")
            const tx = await _stakingWithdraw({ args: [USDTAddress, amount] });
            toast.success("Transaction succeful")
            
        } catch (e) {
            console.log(e);
            if (e?.data?.message) toast.error(e.data.message)
            else toast.error("transaction failed")
        }
        setL0(false)
    }
    const handleDCWithdraw = async (_amount) => {
     try {
         let amount = stringToUSDT(_amount + "")
         const tx = await _DCwithdraw({ args: [amount] });
         toast.success("Transaction succeful")
     } catch (e) {
        console.log(e);
     }
    }
    
    return (
        <EthersContext.Provider value={{
            address,
            L0, L1, L2, L13, L14, L15, L16, L17,
            SignedIn,
            tokenContract,
            contract,
            NFTStaking,
            DCManager,
            NFTRelease,
            USDTContract,
            handleNFTClaim,
            handleDCClaim,
            handleUpgrade,
            handleNFTStake,
            handleDCSell,
            handleStakingWithdraw,
            handleDCWithdraw,
            Chinese, setChinese
        }}>
            {children}
        </EthersContext.Provider>
    )
}
