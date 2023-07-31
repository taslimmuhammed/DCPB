import React, { useContext, useEffect, useState } from 'react'
import { EthersContext } from '../Contexts/EthersContext'
import Loader from './Loader'
import { useContractRead, useContractWrite } from '@thirdweb-dev/react'
import { BigNoToUSDT, HexToDateString } from '../Utils/Utils'
import { LangArray } from '../Utils/Language'
import { toast } from 'react-toastify'

function StakingList() {
    const { contract, address, Chinese } = useContext(EthersContext)
    const { data: stakingList, isLoading:L10, error } = useContractRead(contract, "getStakes", [address])
    const { mutateAsync: refresh } = useContractWrite(contract, "refreshRewards")
    const [isLoading, setisLoading] = useState(false)
    const handleRefresh = async () => {
        setisLoading(true)
        try {
            const tx = await refresh({ args: [] });
            toast.success("Succefully refreshed")
        } catch (e) {
            if (e?.data?.message) toast.error(e.data.message)
            else toast.error("transaction failed, please re-try after few minutes")
        }
        setisLoading(false)
    }
    useEffect(() => {
      console.log({ stakingList })
    }, [stakingList])
    
    if (isLoading || L10) return (<Loader />)
    else return (<div className='p-3 mb-10'>
        <div className='flex justify-center w-full mb-3'>
            <div className=' py-3 px-5 bg-blue-500 text-white rounded-md' onClick={handleRefresh}>
                Refresh
            </div>
        </div>
          <div className='w-full bg-stone-800 p-5 text-white font-semibold text-sm'>
            {
                  stakingList && stakingList.map((stake, index) =>{

                      const amount = BigNoToUSDT(stake.reward)/2
                      const dyReward = BigNoToUSDT(stake.dynamicClaimable)
                      const stReward = BigNoToUSDT(stake.staticClaimable)
                      const directBonus = BigNoToUSDT(stake.directClaimable)
                      const directClaimed = BigNoToUSDT(stake.directClaimed)
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
                                <div>{dyReward+ dynamicClaimed +directBonus+directClaimed} USDT</div>
                            </div>
                      <div className='flex justify-between'>
                                <div className=''>{Chinese ? LangArray[51] : LangArray[50]}</div>
                                <div>{dyReward + stReward + staticClaimed + dynamicClaimed + directBonus + directClaimed} | {amount * 2} <span className='text-yellow-300 font-normal'>{Chinese ? LangArray[53] : LangArray[52]}</span></div>
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