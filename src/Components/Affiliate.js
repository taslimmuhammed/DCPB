import React, { useContext, useEffect, useState } from 'react'
import { EthersContext } from '../Contexts/EthersContext'
import { useContractRead, useContractWrite } from '@thirdweb-dev/react'
import { toast } from 'react-toastify'
import Loader from './Loader'
import { getRankfromUser } from '../Utils/Utils'

function Affiliate() {
    const { tokenContract, contract, address } = useContext(EthersContext)
    const [isLoading, setisLoading] = useState(false)
    const [Rank, setRank] = useState(0)
    const { data : Upgradable, isLoading:L3 } = useContractRead(contract, "checkUpgradablity", [address])
    const { mutateAsync: upgradeLevel } = useContractWrite(contract, "upgradeLevel")
    const { data:User, isLoading:L4 } = useContractRead(contract, "Users", [address])
    const handleUpgrade = async () => {
        setisLoading(true)
        try {
            const tx = await upgradeLevel({ args: [] });
            toast.success("Transaction succeful")
            window.location.reload()
        } catch (e) {
            console.log(e);
            toast.error("transaction failed")
        }
        setisLoading(false)
    }
    useEffect(() => {
        setRank(User? User.rank: 0)
    }, [User])
    const getClass = (index)=>{
        if (index === Rank) return "bg-yellow-500 w-24 h-10 p-1 text-center text-white"
        else return "bg-stone-500 w-24 h-10 p-1 text-center"
    }
    if (isLoading || L3 || L4) return <Loader />
    else return (
        <div className='text-white'>
            <div className='flex w-full justify-center p-5'>
                <div className='bg-stone-700 px-5 py-2 font-semibold'>
                    DC/USDT
                    <span className='bg-black ml-32 px-4 py-1'>0.10</span>
                </div>
            </div>
            {/* seprator */}
            <div className='mt-6 px-3 w-full h-px bg-stone-500' />

            <div className='flex w-full justify-evenly mt-3 text-2xl text-stone-400'>
                <div className={getClass(6)}>V6</div>
                <div className={getClass(5)}>V5</div>
                <div className={getClass(4)}>V4</div>
            </div>

            <div className='flex w-full justify-evenly mt-3 text-2xl text-stone-400'>
                <div className={getClass(3)}>V3</div>
                <div className={getClass(2)}>V2</div>
                <div className={getClass(1)}>V1</div>
            </div>
            
            <div className='w-full flex justify-center my-10'>
            {
                    Upgradable && <button className="button-85" role="button" onClick={handleUpgrade}>Upgrade Level</button>
            }
            </div>
            {/* seprator */}
            <div className='mt-3 px-3 w-full h-px bg-stone-500' />
            
             {/*Bottom Box  */}
            <div className='bg-stone-700 px-3 py-1 my-2'>
                <div className='flex justify-between'>
                    <div className=''>NFT Reward:</div>
                    <div>100NFT</div>
                </div>
                <div className='flex justify-between'>
                    <div className=''>NFT Staking:</div>
                    <div>50 USDT</div>
                </div>
                <div className='flex justify-between'>
                    <div className=''>Staking Profit:</div>
                    <div>20 DC</div>
                </div>
                <div className='flex justify-between'>
                    <div className=''>DC Coin Sell:</div>
                    <div>15 DC</div>
                </div>
                <div className='flex justify-between'>
                    <div className=''>DC Coin Profit</div>
                    <div>5 <span className='text-yellow-300 '>USDT</span></div>
                </div>
            </div>

            {/*  */}
            <div className='flex mt-6'>
                <input className='bg-stone-700 w-32 py-2 px-3 mr-10' placeholder='0' />
                <div className='border border-yellow-300 border-2 p-2 hover:bg-yellow-600'>
                    NFT Staking
                </div>
            </div>
            <div className='text-xs text-stone-300'> Available: 0 NFT</div>


            <div className='flex mt-6'>
                <input className='bg-stone-700 w-32 py-2 px-3 mr-10' placeholder='0' />
                <div className='border border-yellow-300 border-2 p-2 hover:bg-yellow-600 px-6'>
                    DC Sell
                </div>
            </div>
            <div className='text-xs text-stone-300'> Available: 0 NFT</div>
            
            <div className='mb-32'></div>
        </div>
    )
}

export default Affiliate