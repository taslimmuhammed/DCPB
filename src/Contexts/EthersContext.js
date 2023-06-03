import { createContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import { toast } from 'react-toastify';
import { useContract, useContractWrite, useContractRead } from "@thirdweb-dev/react";
import { ThirdwebSDK } from "@thirdweb-dev/sdk/evm";
import { useAddress, useBalance } from "@thirdweb-dev/react";
import { ContractAddress, TokenAddress } from "../Utils/Utils";
import { StakingABI } from "../Utils/StakingABI";

export const EthersContext = createContext(null);
export default function Ethers({ children }) {
    const { contract, isLoading:L1 } = useContract(ContractAddress, StakingABI);
    const { contract: tokenContract } = useContract(TokenAddress);
    const address = useAddress();
    const { data:SignedIn, isLoading:L2 } = useContractRead(contract, "Active", [address])

    return (
        <EthersContext.Provider value={{
            address,
            L1,
            L2,
            SignedIn,
            tokenContract,
            contract
        }}>
            {children}
        </EthersContext.Provider>
    )
}
