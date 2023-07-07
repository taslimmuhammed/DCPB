import React, { useContext, useEffect } from 'react'
import { EthersContext } from '../Contexts/EthersContext'
import Loader from './Loader'
import { useContractRead } from '@thirdweb-dev/react'
import { BigNoToUSDT, HexToDateString } from '../Utils/Utils'

function StakingList() {
    const {contract, address } = useContext(EthersContext)
    const { data: stakingList, isLoading, error } = useContractRead(contract, "getStakes", [address])
    
    if (isLoading) return (<Loader />)
    else return (<div className='p-3 mb-10'>
          <div className='w-full bg-stone-800 p-5 text-white font-semibold text-sm'>
            {
                  stakingList && stakingList.map((stake, index) =>{
                    console.log(stake);
                    const amount = BigNoToUSDT(stake?.reward)/2
                    const dyReward = BigNoToUSDT(stake?.dynamicBonus)
                    const stReward = BigNoToUSDT(stake?.staticBonus)
                    const staticClaimed = BigNoToUSDT(stake?.staticClaimed)
                    const dynamicClaimed = BigNoToUSDT(stake?.dynamicClaimed)
                    const timeStamp = HexToDateString(stake?.timestamp)
                    return (
                  <div className='bg-stone-700 p-3 mb-3' key={index}>
                      <div className='flex justify-between'>
                          <div className=''>Staking Date:</div>
                                <div>{timeStamp}</div>
                      </div>
                      <div className='flex justify-between'>
                          <div className=''>Staking Amount:</div>
                          <div>{amount} USDT </div>
                      </div>
                      <div className='flex justify-between'>
                          <div className=''>Staking Intrest:</div>
                                <div>{stReward} USDT</div>
                      </div>
                            <div className='flex justify-between'>
                                <div className=''>Booster Value:</div>
                                <div>{dyReward} USDT</div>
                            </div>
                      <div className='flex justify-between'>
                          <div className=''>Total Profit</div>
                                <div>{staticClaimed + dynamicClaimed} | {amount*2} <span className='text-yellow-300 font-normal'>Max</span></div>
                      </div>
                  </div>)})
            }

            {
                (error || !stakingList || stakingList.length === 0) && <div className='flex flex-col w-full h-screen justify-center text-white text-center text-xl'>No stakes available</div>
            }
            
        </div>
    </div>
)
}

export default StakingList