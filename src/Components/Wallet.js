import React from 'react'

function Wallet() {
  return (
      <div className='text-white'>

          <div className='flex w-full justify-center p-5'>
              <div className='bg-stone-700 px-5 py-2 font-semibold'>
                  DC/USDT
                  <span className='bg-black ml-32 px-4 py-1'>0.10</span>
              </div>
          </div>

          {/* Intrest */}
          <div className='flex w-full justify-between'>
              <div>
                  <div className='font-semibold text-lg'>Intrest Value</div>
                  <div className='text-xs text-stone-300'>min withdraw 5 USDT</div>
              </div>
              <input className='bg-stone-700 w-32 p-2 ' placeholder='0' />
              <div className='border border-yellow-300 border-2 p-2 hover:bg-yellow-600'>
                  Withdraw
              </div>
          </div>

          {/* Booster */}
          <div className='flex w-full justify-between mt-5'>
              <div>
                  <div className='font-semibold text-lg'>Booster Value</div>
                  <div className='text-xs text-stone-300'>min withdraw 20 USDT</div>
              </div>
              <input className='bg-stone-700 w-32 p-2 ' placeholder='0' />
              <div className='border border-yellow-300 border-2 p-2 hover:bg-yellow-600'>
                  Withdraw
              </div>
          </div>

          {/* DC profit */}
          <div className='flex w-full justify-between mt-5'>
              <div>
                  <div className='font-semibold text-lg'>DC Profit Value</div>
                  <div className='text-xs text-stone-300'>min withdraw 20 USDT</div>
              </div>
              <input className='bg-stone-700 w-32 p-2 ' placeholder='0' />
              <div className='border border-yellow-300 border-2 p-2 hover:bg-yellow-600'>
                  Withdraw
              </div>
          </div>
</div>
  )
}

export default Wallet