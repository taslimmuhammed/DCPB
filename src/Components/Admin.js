import React, { useContext, useEffect, useState } from 'react'
import { EthersContext } from '../Contexts/EthersContext'
import { BigNoToInt, BigNoToUSDT } from '../Utils/Utils'
import Loader from './Loader'
import { useContractRead } from '@thirdweb-dev/react'

function Admin() {
    const { address,
        L0,
        contract,
        NFTStaking,
        DCManager,
        NFTRelease } = useContext(EthersContext)
        const [isLoading, setisLoading] = useState(false)
        const [TotalDeposite, setTotalDeposite] = useState(0)
        const [NFTReleased, setNFTReleased] = useState(0)
        const [DCSold, setDCSold] = useState(0)
        const [totalClaimed, settotalClaimed] = useState(0)
    const { data: _totalDeposite } = useContractRead(contract, "totalDeposite", [])
    const { data: _nftRelease } = useContractRead(NFTRelease, "totalReleased", [])
    const { data: _totalDCSold } = useContractRead(DCManager, "getTotalSold", [])
    const { data: _totalClaimed } = useContractRead(DCManager, "totalClaimed", [])
    useEffect(() => {
       if(_totalDeposite) setTotalDeposite(BigNoToUSDT(_totalDeposite))
       if(_nftRelease) setNFTReleased(BigNoToInt(_nftRelease))
       if(_totalDCSold) setDCSold(BigNoToInt(_totalDCSold))
       if(_totalClaimed) settotalClaimed(BigNoToInt(_totalClaimed))
    }, [_nftRelease, _totalDeposite, _totalDCSold, _totalClaimed])
    
    if (isLoading || L0) return <Loader />
    else return (
            <div className='text-white p-5 mb-32'>
            <div className='flex w-full justify-between'>
                <div className='py-2 text-lg'> Total Deposite</div>
                <div className='bg-stone-700 w-32 py-2 px-2'>{TotalDeposite && TotalDeposite} USDT</div>
            </div>
            <div className='flex w-full justify-between mt-6'>
                <div className='py-2 text-lg'> Total Payout</div>
                <div className='bg-stone-700 w-32 py-2 px-2'></div>
            </div>
            <div className='flex w-full justify-between mt-6'>
                <div className='py-2 text-lg'> Total StakingUser</div>
                <div className='bg-stone-700 w-32 py-2 px-2'></div>
            </div>
            <div className='flex w-full justify-between mt-6'>
                <div className='py-2 text-lg'> Total NFT Release</div>
                <div className='bg-stone-700 w-32 py-2 px-2'></div>
            </div>
            <div className='flex w-full justify-between mt-6'>
                <div className='py-2 text-lg'> Total DC Release</div>
                <div className='bg-stone-700 w-32 py-2 px-2'></div>
            </div>
            <div className='flex w-full justify-between mt-6'>
                <div className='py-2 text-lg'> Total NFT Staking</div>
                <div className='bg-stone-700 w-32 py-2 px-2'></div>
            </div>
            <div className='flex w-full justify-between mt-6'>
                <div className='py-2 text-lg'> Total DC on sales</div>
                <div className='bg-stone-700 w-32 py-2 px-2'>{DCSold && DCSold} DC</div>
            </div>
            <div className='flex w-full justify-between mt-6'>
                <div className='py-2 text-lg'> Total DC Buy in</div>
                <div className='bg-stone-700 w-32 py-2 px-2'>{totalClaimed && totalClaimed} USDT</div>
            </div>


            <div className='flex mt-10'>
                <input className='bg-stone-700 w-32 py-2 px-3 mr-10' placeholder='0' />
                <div className='border border-yellow-300 border-2 py-2 px-5  hover:bg-yellow-600'>
                    Withdraw
                </div>
            </div>
            <div className='text-xs text-stone-300  m-1'> Staking Fund withdraw</div>


            <div className='flex mt-10'>
                <input className='bg-stone-700 w-32 py-2 px-3 mr-10' placeholder='0' />
                <div className='border border-yellow-300 border-2 py-2 px-5 hover:bg-yellow-600'>
                    Withdraw
                </div>
            </div>
            <div className='text-xs text-stone-300 m-1'> DC Fund withdraw</div>
        </div>
    )
}

export default Admin