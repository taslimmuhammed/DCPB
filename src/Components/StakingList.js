import React, { useContext, useEffect } from 'react'
import { EthersContext } from '../Contexts/EthersContext'
import Loader from './Loader'
import { useContractRead } from '@thirdweb-dev/react'
import { BigNoToUSDT, HexToDateString } from '../Utils/Utils'
import { LangArray } from '../Utils/Language'

function StakingList() {
    const { contract, address, Chinese } = useContext(EthersContext)
    const { data: stakingList, isLoading, error } = useContractRead(contract, "getStakes", [address])
    
    if (isLoading) return (<Loader />)
    else return (<div className='p-3 mb-10'>
          <div className='w-full bg-stone-800 p-5 text-white font-semibold text-sm'>
            {
                  stakingList && stakingList.map((stake, index) =>{
                      const amount = BigNoToUSDT(stake.reward)/2
                      const dyReward = BigNoToUSDT(stake.dynamicReward)
                      const stReward = BigNoToUSDT(stake.staticReward)
                      const staticClaimed = BigNoToUSDT(stake.staticClaimed)
                      const dynamicClaimed = BigNoToUSDT(stake.dynamicClaimed)
                    return (
                  <div className='bg-stone-700 p-3 mb-3' key={index}>
                      <div className='flex justify-between'>
                                <div className=''>{Chinese ? LangArray[43] : LangArray[42]}</div>
                                <div>{HexToDateString(stake?.timestamp)}</div>
                      </div>
                      <div className='flex justify-between'>
                                <div className=''>{Chinese ? LangArray[45] : LangArray[44]}</div>
                          <div>{amount} USDT </div>
                      </div>
                      <div className='flex justify-between'>
                                <div className=''>{Chinese ? LangArray[47] : LangArray[46]}</div>
                                <div>{stReward+ staticClaimed} USDT</div>
                      </div>
                            <div className='flex justify-between'>
                                <div className=''>{Chinese ? LangArray[49] : LangArray[48]}</div>
                                <div>{dyReward+ dynamicClaimed} USDT</div>
                            </div>
                      <div className='flex justify-between'>
                                <div className=''>{Chinese ? LangArray[51] : LangArray[50]}</div>
                                <div>{dyReward + stReward + staticClaimed + dynamicClaimed} | {amount * 2} <span className='text-yellow-300 font-normal'>{Chinese ? LangArray[53] : LangArray[52]}</span></div>
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