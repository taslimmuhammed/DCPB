import React, { useContext, useEffect, useState } from 'react'
import { EthersContext } from '../Contexts/EthersContext'
import { useContractRead, useContractWrite } from '@thirdweb-dev/react'
import { toast } from 'react-toastify'
import Loader from './Loader'
import { BigNoToInt, BigNoToUSDT, getRankfromUser } from '../Utils/Utils'
import graph from '../Assets/graph.png'
import community from '../Assets/community.png'
function Affiliate() {
    const { tokenContract, contract, address } = useContext(EthersContext)
    const [isLoading, setisLoading] = useState(false)
    const [Total, setTotal] = useState("0")
    const [Refs, setRefs] = useState(null)
    const [Rank, setRank] = useState(0)
    const { data : Upgradable, isLoading:L3 } = useContractRead(contract, "checkUpgradablity", [address])
    const { mutateAsync: upgradeLevel } = useContractWrite(contract, "upgradeLevel")
    const { data:User, isLoading:L4 } = useContractRead(contract, "Users", [address])
    const { data: RefRanks, isLoading: L5 } = useContractRead(contract, "getReferralRanks", [address])
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
    useEffect(() => {
      let total=0;
       let tempArr = []
        if(RefRanks){
            for(let i=0;i<RefRanks.length;i++){
                let temp=BigNoToInt(RefRanks[i])
                total+=temp
                tempArr.push(temp)
            }
            setTotal(total)
            setRefs(tempArr)
        }
    }, [RefRanks])
    
    if (isLoading || L3 || L4) return <Loader />
    else return (
        <div className='text-white'>
            {/* <div className='flex w-full justify-center p-5'>
                <div className='bg-stone-700 px-5 py-2 font-semibold'>
                    DC/USDT
                    <span className='bg-black ml-32 px-4 py-1'>0.10</span>
                </div>
            </div> */}
            {/* seprator */}
            {/* <div className='mt-6 px-3 w-full h-px bg-stone-500' /> */}
            <div className='ml-5 my-10'>
            <div >Rank Status</div>
            <div className='border border-yellow-300 border-2 w-80 p-4 flex mt-1'>
             <img src={graph} className='w-10'/>
             <div className='text-yellow-500 text-2xl ml-5 mt-1 mr-5'> V6</div>
                {
                    Upgradable && <button className="button-85" role="button" onClick={handleUpgrade}>Upgrade Level</button>
                }
            </div>
            </div>
            <div className='flex w-full justify-evenly mt-3 text-2xl text-stone-400 text-white'>
                <div className='bg-stone-800 w-24 h-10 p-1 px-3  flex justify-between'><span className=''>V6</span><span className='text-yellow-500'>{Refs && Refs[6]}</span></div>
                <div className='bg-stone-800 w-24 h-10 p-1 px-3  flex justify-between'><span className=''>V5</span><span className='text-yellow-500'>{Refs && Refs[5]}</span></div>
                <div className='bg-stone-800 w-24 h-10 p-1 px-3  flex justify-between'><span className=''>V4</span><span className='text-yellow-500'>{Refs && Refs[4]}</span></div>
            </div>

            <div className='flex w-full justify-evenly mt-3 text-2xl text-stone-400 text-white'>
                <div className='bg-stone-800 w-24 h-10 p-1 px-3  flex justify-between'><span className=''>V3</span><span className='text-yellow-500'>{Refs && Refs[3]}</span></div>
                <div className='bg-stone-800 w-24 h-10 p-1 px-3  flex justify-between'><span className=''>V2</span><span className='text-yellow-500'>{Refs && Refs[2]}</span></div>
                <div className='bg-stone-800 w-24 h-10 p-1 px-3  flex justify-between'><span className=''>V1</span><span className='text-yellow-500'>{Refs && Refs[1]}</span></div>
            </div>
            
            <div className=' flex p-5'>
                <img src={community} className='w-14'></img>
                <div className='bg-stone-800 w-20 h-10 p-1 px-3  flex justify-between mt-2 ml-3'>{Total && Total-1}</div>
            </div>
            {/* seprator */}
            <div className='mt-3 px-3 w-full h-px bg-stone-500' />
            
             {/*Bottom Box  */}
            <div className='p-3 my-5 border border-yellow-300 border-2'>
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
            <div className='flex w-full justify-center'>
                <div>
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
                </div>
            </div>
            <div className='mb-32'></div>
        </div>
    )
}

export default Affiliate