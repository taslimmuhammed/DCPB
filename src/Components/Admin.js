import React from 'react'

function Admin() {
    
    return (
        <div className='text-white p-5 mb-32'>
            <div className='flex w-full justify-between'>
                <div className='py-2 text-lg'> Total Deposite</div>
                <div className='bg-stone-700 w-32 py-2 px-2'></div>
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
                <div className='bg-stone-700 w-32 py-2 px-2'></div>
            </div>
            <div className='flex w-full justify-between mt-6'>
                <div className='py-2 text-lg'> Total DC Buy in</div>
                <div className='bg-stone-700 w-32 py-2 px-2'></div>
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