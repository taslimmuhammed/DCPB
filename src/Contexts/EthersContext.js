import { createContext, useState, useEffect } from "react";
import { ABI } from "../Utils/abi";
import { useNavigate } from 'react-router-dom';
import { ethers } from "ethers";
export const EthersContext = createContext(null);

const { ethereum } = window
export default function Ethers({ children }) {
    const navigate = useNavigate()
    const contractAddress = "0xED83E280CA2c0dAd10B7C0146FB97d90cD337F44"
    const [currentAccount, setCurrentAccount] = useState(null);
    const [isBought, setisBought] = useState(false)
    const [isLoading, setisLoading] = useState(false)
    const [tokenPrice, settokenPrice] = useState(0)
    const [Supply, setSupply] = useState(0)
    const [myBalance, setmyBalance] = useState(0)
    const [Polygon, setPolygon] = useState(false)
    const checkIfWalletIsConnect = async () => {
        setisLoading(true)
        try {
            if (!ethereum) return alert("Please install MetaMask.");

            const accounts = await ethereum.request({ method: "eth_accounts" });

            if (accounts.length) {
                setCurrentAccount(accounts[0]);
            } else {
                console.log("No accounts found");
            }
        } catch (error) {
            console.log(error);
        }
        setisLoading(false)
    };

    const connectWallet = async () => {
        setisLoading(true)
        try {
            if (!ethereum) return alert("Please install MetaMask.");

            const accounts = await ethereum.request({ method: "eth_requestAccounts", });

            setCurrentAccount(accounts[0]);
            window.location.reload();
        } catch (error) {
            console.log(error);
            throw new Error("No ethereum object");
        }
        setisLoading(false)
    };


    const buyToken = async () => {
        setisLoading(true)
        try {
            const { ethereum } = window
            const provider = new ethers.providers.Web3Provider(ethereum)
            const signer = provider.getSigner()
            const contract = new ethers.Contract(contractAddress, ABI, signer)
            let pr = tokenPrice + ""
            let overrides = {
                value: ethers.utils.parseEther(pr),
                gasLimit: 300000
            };
            const tx = await contract.deliverToken(overrides)
            tx ? alert("Buying Succeful") : alert('Oh no, something went wrong')
            setisBought(true)
        }
        catch (e) {
            console.log(e)
        }
        setisLoading(false)
    }

    const checkAvailablity = async () => {
        setisLoading(true)
        try {
            const { ethereum } = window
            const provider = new ethers.providers.Web3Provider(ethereum)
            const signer = provider.getSigner()
            const contract = new ethers.Contract(contractAddress, ABI, signer)
            const accounts = await ethereum.request({ method: "eth_requestAccounts", });
            const account = accounts[0]
            const tx = await contract.balanceOf(account)
            const yourNumber = parseInt(tx, 16);
            console.log(yourNumber)
            setmyBalance(yourNumber)
            if (yourNumber >= 1) {
                setisBought(true)
                return true;
            }
            else return false
        }
        catch (e) {
            console.log(e)
        }
        setisLoading(false)
    }


    const getTotalSupply = async () => {

        try {
            // console.log("checking balance")
            const { ethereum } = window
            const provider = new ethers.providers.Web3Provider(ethereum)
            const signer = provider.getSigner()
            const contract = new ethers.Contract(contractAddress, ABI, signer)
            const tx = await contract.totalSupply()
            const yourNumber = parseInt(tx, 16);
            setSupply(yourNumber)
            return yourNumber
        }
        catch (e) {
            console.log(e)
        }

    }

    const checkOwner = async () => {
        setisLoading(true)
        try {
            const { ethereum } = window
            const provider = new ethers.providers.Web3Provider(ethereum)
            const signer = provider.getSigner()
            const contract = new ethers.Contract(contractAddress, ABI, signer)
            const accounts = await ethereum.request({ method: "eth_requestAccounts", });
            let account = accounts[0]
            let tx = await contract.owner()
            if (tx.toUpperCase() === account.toUpperCase() && tx != null) {
                console.log("Verified")
                setisLoading(false)
                return true
            }
            else {
                navigate('/')
                setisLoading(false)
                return false
            }
        } catch (e) {
            console.log(e)
        }
        setisLoading(false)
    }
    const mint = async (num) => {
        setisLoading(true)
        try {
            const { ethereum } = window
            const provider = new ethers.providers.Web3Provider(ethereum)
            const signer = provider.getSigner()
            const contract = new ethers.Contract(contractAddress, ABI, signer)
            const accounts = await ethereum.request({ method: "eth_requestAccounts", });
            let account = accounts[0]
            let number = 4579;
            let n = parseInt(num)
            let hexStr = n.toString(16);
            let tx = await contract.mint(account, hexStr)
            alert("Minting Succeful")
        } catch (e) {
            console.log(e)
        }
        setisLoading(false)
    }

    const transferOwnership = async (address) => {
        setisLoading(true)
        try {
            const { ethereum } = window
            const provider = new ethers.providers.Web3Provider(ethereum)
            const signer = provider.getSigner()
            const contract = new ethers.Contract(contractAddress, ABI, signer)
            const accounts = await ethereum.request({ method: "eth_requestAccounts", });
            let account = accounts[0]
            let tx = await contract.transferOwnership(address)

            alert("Ownership transfered succefully")
            console.log(tx, account);
        } catch (e) {
            console.log(e)
        }
        setisLoading(false)
    }

    const changePrice = async (num) => {
        setisLoading(true)
        try {
            const { ethereum } = window
            const provider = new ethers.providers.Web3Provider(ethereum)
            const signer = provider.getSigner()
            const contract = new ethers.Contract(contractAddress, ABI, signer)
            const accounts = await ethereum.request({ method: "eth_requestAccounts", });
            let account = accounts[0]
            let tx = await contract.increaseMintPrice(num)
            alert(`price succefully changed`)
            console.log(tx, account);
        } catch (e) {
            console.log(e)
        }
        setisLoading(false)
    }

    const getTokenPrice = async () => {
        try {
            const { ethereum } = window
            const provider = new ethers.providers.Web3Provider(ethereum)
            const signer = provider.getSigner()
            const contract = new ethers.Contract(contractAddress, ABI, signer)
            const accounts = await ethereum.request({ method: "eth_requestAccounts", });
            let account = accounts[0]
            let tx = await contract.mintPrice()
            console.log(tx)
            if (tx) {
                tx = tx + ""
                return tx / 1000000000000000000
            }

            alert()
            console.log(tx, account);
        } catch (e) {
            console.log(e)
        }
        return 0;
    }

    const checkNetwork = async () => {
        try {
            const { ethereum } = window
            if (ethereum) {
                const chainId = await ethereum.request({ method: 'eth_chainId' });
                const chain = chainId + ""
                if (chain == "0x89") {
                    setPolygon(true)
                }
            }

        } catch (e) {
            console.log(e)
        }
    }

    const getN = async () => {
        const chainId = 137 // Polygon Mainnet

        if (window.ethereum.networkVersion !== chainId) {
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: "0x89" }]
                });
            } catch (err) {
                // This error code indicates that the chain has not been added to MetaMask
                if (err.code === 4902) {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [
                            {
                                chainName: 'Polygon Mainnet',
                                chainId: "0x89",
                                nativeCurrency: { name: 'MATIC', decimals: 18, symbol: 'MATIC' },
                                rpcUrls: ['https://polygon-rpc.com/']
                            }
                        ]
                    });
                    window.location.reload()
                }
            }
        }
    }
    useEffect(() => {
        checkIfWalletIsConnect();
        getN()
        checkAvailablity();
        getTotalSupply()
        checkNetwork()
        getTokenPrice().then(e => {
            console.log(e)
            settokenPrice(e)
        })
    }, []);


    return (
        <EthersContext.Provider value={{
            connectWallet,
            currentAccount,
            checkIfWalletIsConnect,
            buyToken,
            getTotalSupply,
            checkAvailablity,
            isBought,
            checkOwner,
            isLoading,
            setisLoading,
            mint,
            transferOwnership,
            changePrice,
            getTokenPrice,
            tokenPrice,
            myBalance,
            Supply,
            Polygon
        }}>
            {children}
        </EthersContext.Provider>
    )
}
