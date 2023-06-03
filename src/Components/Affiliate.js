import React, { useContext } from 'react'
import { EthersContext } from '../Contexts/EthersContext'

function Affiliate() {
    const { tokenContract, contract } = useContext(EthersContext)
    return (
        <div className='text-white'>

            {/* seprator */}
            <div className='mt-6 px-3 w-full h-px bg-stone-500' />

            <div className='flex w-full justify-evenly mt-3 text-2xl text-stone-400'>
                <div className='bg-stone-500 w-24 h-10 p-1'>V6</div>
                <div className='bg-stone-500 w-24 h-10 p-1'>V5</div>
                <div className='bg-stone-500 w-24 h-10 p-1'>V4</div>
            </div>

            <div className='flex w-full justify-evenly mt-3 text-2xl text-stone-400'>
                <div className='bg-stone-500 w-24 h-10 p-1'>V3</div>
                <div className='bg-stone-500 w-24 h-10 p-1'>V2</div>
                <div className='bg-stone-500 w-24 h-10 p-1'>V1</div>
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