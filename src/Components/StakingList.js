import React, { useContext } from 'react'
import { EthersContext } from '../Contexts/EthersContext'
import Loader from './Loader'
import { useContractRead } from '@thirdweb-dev/react'

function StakingList() {
    const { tokenContract,contract, address } = useContext(EthersContext)
    const { data: stakingList, isLoading } = useContractRead(contract, "getStakes", [address])
    if (isLoading) return (<Loader />)
    else return (<div className='p-3 mb-10'>
          <div className='w-full bg-stone-800 p-5 text-white font-semibold text-sm'>
            {
                  stakingList.map((stake, index) =>{
                    let amount = stake.reward.div(2*10**6+"")
                    amount = parseInt(amount._hex,16)
                    let date = parseInt(stake.timestamp._hex, 16) *1000
                    date = new Date(date)
                      let dyReward = stake.staticClaimed.div(10 ** 6 + "")
                      dyReward = parseInt(dyReward._hex, 16)
                      let stReward = stake.dynamicClaimed.div(10 ** 6 + "")
                      stReward = parseInt(stReward._hex, 16)
                    return (
                  <div className='bg-stone-700 p-3 mb-3' key={index}>
                      <div className='flex justify-between'>
                          <div className=''>Staking Date:</div>
                                <div>{date.getFullYear()}/{date.getMonth()+1}/{date.getDate()}</div>
                      </div>
                      <div className='flex justify-between'>
                          <div className=''>Staking Amount:</div>
                          <div>{amount} USDT </div>
                      </div>
                      <div className='flex justify-between'>
                          <div className=''>Staking Intrest:</div>
                                <div>{amount/100} USDT/day</div>
                      </div>
                      <div className='flex justify-between'>
                          <div className=''>Total Profit</div>
                              <div>{stReward+dyReward} | {amount*2} <span className='text-yellow-300 font-normal'>Max</span></div>
                      </div>
                  </div>)})
            }

            {
                (!stakingList || stakingList.length === 0) && <div className='flex flex-col w-full h-screen justify-center text-white text-center text-xl'>No stakes available</div>
            }
            
        </div>
    </div>
)
}

export default StakingList