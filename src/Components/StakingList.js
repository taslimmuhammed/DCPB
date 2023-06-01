import React from 'react'

function StakingList() {
    const stakingList = ["", "", "", "", "",]
  return (
    <div className='p-3 mb-10'>
          <div className='w-full bg-stone-800 p-5 text-white font-semibold text-sm'>
            {
                  stakingList.map(stake => (
                  <div className='bg-stone-700 p-3 mb-3'>
                      <div className='flex justify-between'>
                          <div className=''>Staking Date:</div>
                          <div>2023/05/28</div>
                      </div>
                      <div className='flex justify-between'>
                          <div className=''>Staking Amount:</div>
                          <div>1000 USDT</div>
                      </div>
                      <div className='flex justify-between'>
                          <div className=''>Staking Intrest:</div>
                          <div>30 USDT</div>
                      </div>
                      <div className='flex justify-between'>
                          <div className=''>Total Profit</div>
                              <div>130 | 2000 <span className='text-yellow-300 font-normal'>Max</span></div>
                      </div>
                  </div>))
            }
            
        </div>
    </div>
  )
}

export default StakingList