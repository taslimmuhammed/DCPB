import React, { useContext, useState, useEffect } from 'react'
import { EthersContext } from '../Contexts/EthersContext'
import { BigNoToUSDT, stringToUSDT } from '../Utils/Utils'
import { useContractRead, useContractWrite } from '@thirdweb-dev/react'
import { toast } from 'react-toastify'
import Loader from './Loader'

function Wallet() {
    const { tokenContract, contract, address } = useContext(EthersContext)
    const [isLoading, setisLoading] = useState(false)
    const [StaticInput, setStaticInput] = useState("0")
    const [DynamicInput, setDynamicInput] = useState("0")
    const [DCIput, setDCIput] = useState("0")
    const { data:_dynamic, isLoading: L3 } = useContractRead(contract, "getTotalDynamicRewards", [address])
    const { data: _static, isLoading: L4 } = useContractRead(contract, "getTotalStaticRewards", [address])
    const { mutateAsync: claimDynamicReward } = useContractWrite(contract, "claimDynamicReward")
    const { mutateAsync: claimStaticReward } = useContractWrite(contract, "claimStaticReward")
     
    const handleStatic = async () => {
        setisLoading(true)
        alert("You must approve 2 upcoming transactions for staking")
        try {
            let amount = stringToUSDT(StaticInput)
            const tx = await claimStaticReward({ args: [amount] });
            toast.success("Transaction succeful")
        } catch (e) {
            console.log(e);
            toast.error("transaction failed")
        }
        setisLoading(false)
    }
    const handleDynamic = async () => {
        setisLoading(true)
        alert("You must approve 2 upcoming transactions for staking")
        try {
            let amount = stringToUSDT(DynamicInput)
            const tx = await claimDynamicReward({ args: [amount] });
            toast.success("Transaction succeful")
        } catch (e) {
            console.log(e);
            toast.error("transaction failed")
        }
        setisLoading(false)
    }
    if (isLoading || L3 || L4 ) return <Loader />
    else return(
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
                    <div className='font-semibold text-lg w-32'>Intrest Value</div>
                    <div className='text-xs text-stone-300'>Min 5USDT | Max {_static && BigNoToUSDT(_static)}</div>
                </div>
                <input className='bg-stone-700 w-32 p-2 ' placeholder='0' type='number' onChange={(e) => setStaticInput(e.target.value)} />
                <div className='border border-yellow-300 border-2 p-2 hover:bg-yellow-600' onClick={handleStatic}>
                    Withdraw
                </div>
            </div>

            {/* Booster */}
            <div className='flex w-full justify-between mt-5'>
                <div>
                    <div className='font-semibold text-lg w-32'>Booster Value</div>
                    <div className='text-xs text-stone-300'>Min 20USDT | Max {_dynamic && BigNoToUSDT(_dynamic)}</div>
                </div>
                <input className='bg-stone-700 w-32 p-2 ' placeholder='0' type='number' onChange={(e) => setDynamicInput(e.target.value)} />
                <div className='border border-yellow-300 border-2 p-2 hover:bg-yellow-600' onClick={handleDynamic}>
                    Withdraw
                </div>
            </div>

            {/* DC profit */}
            <div className='flex w-full justify-between mt-5'>
                <div>
                    <div className='font-semibold text-lg w-32'>DC Profit Value</div>
                    <div className='text-xs text-stone-300'>min withdraw 20 USDT</div>
                </div>
                <input className='bg-stone-700 w-32 p-2 ' placeholder='0' type='number' onChange={(e) => setDCIput(e.target.value)} />
                <div className='border border-yellow-300 border-2 p-2 hover:bg-yellow-600'>
                    Withdraw
                </div>
            </div>
        </div>
  )
}

export default Wallet