import { createContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import { toast } from 'react-toastify';
import { useContract, useContractWrite, useContractRead } from "@thirdweb-dev/react";
import { ThirdwebSDK } from "@thirdweb-dev/sdk/evm";
import { useAddress, useBalance } from "@thirdweb-dev/react";
import { ContractAddress, DCManagerAddress, NFTReleaseAddres, NFTStakingAddress, TokenAddress } from "../Utils/Utils";
import { StakingABI } from "../Utils/StakingABI";
import { NFTstakingABI } from "../Utils/NFTStakingABI";
import { DCManagerABI } from "../Utils/DCManagerABI";
import { NFTReleaseABI } from "../Utils/NFTReleaseABI";
export const EthersContext = createContext(null);
export default function Ethers({ children }) {
    const [L0, setL0] = useState(false)
    const { contract, isLoading:L1 } = useContract(ContractAddress, StakingABI);
    const { contract: tokenContract } = useContract(TokenAddress);
    const { contract:NFTStaking, isLoading: L13 } = useContract(NFTStakingAddress, NFTstakingABI);
    const { contract:DCManager, isLoading: L14 } = useContract(DCManagerAddress, DCManagerABI);
    const { contract: NFTRelease, isLoading: L15 } = useContract(NFTReleaseAddres, NFTReleaseABI);
    const address = useAddress();
    const { mutateAsync: upgradeLevel } = useContractWrite(contract, "upgradeLevel")
    const { data:SignedIn, isLoading:L2 } = useContractRead(contract, "Active", [address])
    const { mutateAsync: claimNFT } = useContractWrite(NFTRelease, "claimNFT")
    const handleClaim = async () => {
        setL0(true)
        try {
            await claimNFT({args:[]})
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
    const testFunc = async () => {
        setL0(true)
        try {

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
            handleClaim,
            handleUpgrade
        }}>
            {children}
        </EthersContext.Provider>
    )
}
