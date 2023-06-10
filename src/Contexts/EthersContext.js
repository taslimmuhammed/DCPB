import { createContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import { toast } from 'react-toastify';
import { useContract, useContractWrite, useContractRead } from "@thirdweb-dev/react";
import { ThirdwebSDK } from "@thirdweb-dev/sdk/evm";
import { useAddress, useBalance } from "@thirdweb-dev/react";
import { ContractAddress, DCManagerAddress, DCTokenAddress, NFTReleaseAddres, NFTStakingAddress, USDTAddress, stringToBigInt } from "../Utils/Utils";
import { StakingABI } from "../Utils/StakingABI";
import { NFTstakingABI } from "../Utils/NFTStakingABI";
import { DCManagerABI } from "../Utils/DCManagerABI";
import { NFTReleaseABI } from "../Utils/NFTReleaseABI";
export const EthersContext = createContext(null);
export default function Ethers({ children }) {
    const [L0, setL0] = useState(false)
    const { contract, isLoading:L1 } = useContract(ContractAddress, StakingABI);
    const { contract: tokenContract } = useContract(USDTAddress);
    const { contract: DCContract } = useContract(DCTokenAddress);
    const { contract:NFTStaking, isLoading: L13 } = useContract(NFTStakingAddress, NFTstakingABI);
    const { contract:DCManager, isLoading: L14 } = useContract(DCManagerAddress, DCManagerABI);
    const { contract: NFTRelease, isLoading: L15 } = useContract(NFTReleaseAddres, NFTReleaseABI);
    const address = useAddress();
    const { mutateAsync: upgradeLevel } = useContractWrite(contract, "upgradeLevel")
    const { data:SignedIn, isLoading:L2 } = useContractRead(contract, "Active", [address])
    const { mutateAsync: claimNFT } = useContractWrite(NFTRelease, "claimNFT")
    const { mutateAsync: claimDC } = useContractWrite(NFTRelease, "getDCToken")
    const { mutateAsync: stakeNFT } = useContractWrite(NFTStaking, "stakeNFT")
    const { mutateAsync: increaseAllowance } = useContractWrite(DCContract, "increaseAllowance")
    const { mutateAsync: sellDC } = useContractWrite(DCManager, "sellTokens")
    const handleNFTClaim = async () => {
        setL0(true)
        try {
            await claimNFT({args:[]})
            toast.success("Transaction succeful")
        } catch (e) {
            console.log(e);
            toast.error("transaction failed")
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
            toast.error("transaction failed")
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
            toast.error("transaction failed")
        }
        setL0(false)
    }
    const handleNFTStake = async (_amount) => {
        setL0(true)
        try {
            let amount = stringToBigInt(_amount+"")
            const tx = await stakeNFT({ args: [amount] });
            toast.success("Transaction succeful")
        } catch (e) {
            console.log(e);
            toast.error("transaction failed")
        }
        setL0(false)
    }
    const handleDCSell = async (_amount) => {
        setL0(true)
        try {
            let amount = stringToBigInt(_amount + "")
            let amountInDC = amount.mul(10**18+"")
            const data = await increaseAllowance({ args: [ContractAddress, amountInDC] });
            const tx = await sellDC({args: [amount]});
            toast.success("Transaction succeful")
        } catch (e) {
            console.log(e);
            toast.error("transaction failed")
        }
        setL0(false)
    }
    return (
        <EthersContext.Provider value={{
            address,
            L0,L1,L2, L13, L14, L15,
            SignedIn,
            tokenContract,
            contract,
            NFTStaking,
            DCManager,
            NFTRelease,
            handleNFTClaim,
            handleDCClaim,
            handleUpgrade,
            handleNFTStake,
            handleDCSell
        }}>
            {children}
        </EthersContext.Provider>
    )
}
