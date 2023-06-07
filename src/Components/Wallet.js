import React, { useContext, useState, useEffect } from 'react'
import { EthersContext } from '../Contexts/EthersContext'
import { BigNoToUSDT, stringToUSDT } from '../Utils/Utils'
import { useContractRead, useContractWrite } from '@thirdweb-dev/react'
import { toast } from 'react-toastify'
import Loader from './Loader'
import withdraw from '../Assets/withdraw.png'
function Wallet() {
    const { tokenContract, contract, address } = useContext(EthersContext)
    const [isLoading, setisLoading] = useState(false)
    const [StaticInput, setStaticInput] = useState("0")
    const [DynamicInput, setDynamicInput] = useState("0")
    const [DCIput, setDCIput] = useState("0")
    const { data: _dynamic, isLoading: L3 } = useContractRead(contract, "getTotalDynamicRewards", [address])
    const { data: _claimableDynamic, isLoading: L6 } = useContractRead(contract, "claimableDynamicReward", [address])
    const { data: _static, isLoading: L4 } = useContractRead(contract, "getTotalStaticRewards", [address])
    const { data: User } = useContractRead(contract, "getUser", [address])
    const { mutateAsync: claimDynamicReward } = useContractWrite(contract, "claimDynamicReward")
    const { mutateAsync: claimStaticReward } = useContractWrite(contract, "claimStaticReward")

    const handleStatic = async () => {
        setisLoading(true)
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

    const setMax =(index)=>{
        if(index===0){
            setStaticInput(BigNoToUSDT(_static))
        }else if(index===1){
            setDynamicInput(_claimableDynamic)
        }else{
            setDCIput(0)
        }
    }
    useEffect(() => {
      console.log(User);
    }, [User])
    
    if (isLoading || L3 || L4 || L6) return <Loader />
    else return (
        <div className='text-white'>
            {/* Intrest */}
            <div className='flex w-full justify-between mt-5'>
                <div>
                    <div className="flex flex-col relative">
                        <label className="text-lg  mb-2" >
                            Intrest Value
                        </label>
                        <input
                            className=" px-3 py-3 pl-10 bg-stone-500 w-80"
                            placeholder="USDT"
                            type="number"
                            value={StaticInput}
                            onChange={(e) => setStaticInput(e.target.value)}
                        />
                        <div className="absolute top-1/2 right-3 transform -translate-y-1 flex">
                            <div className=' border border-yellow-300 border-2 px-2 hover:bg-yellow-600 mt-2' onClick={()=>setMax(0)}>max</div>
                        </div>
                    </div>
                    <div className='text-xs text-stone-100 mb-2 mt-1'>
                        <span className='text-stone-500'>Available:</span>  {BigNoToUSDT(_static)} USDT
                    </div>
                </div>
                <div className='flex flex-col justify-center' onClick={handleStatic}>
                    <img src={withdraw} className='w-14 hover:w-12' />
                </div>
            </div>

            {/* Booster */}
            <div className='flex w-full justify-between mt-5'>
                 <div>
                    <div className="flex flex-col relative">
                        <label className="text-lg  mb-2" >
                            Booster Value
                        </label>
                        <input
                            className=" px-3 py-3 pl-10 bg-stone-500 w-80"
                            placeholder="USDT"
                            type="number"
                            value={DynamicInput}
                            onChange={(e) => setDynamicInput(e.target.value)}
                        />
                        <div className="absolute top-1/2 right-3 transform -translate-y-1 flex">
                            <div className=' border border-yellow-300 border-2 px-2 hover:bg-yellow-600 mt-2' onClick={() => setMax(1)}>max</div>
                        </div>
                    </div>
                    <div className='text-xs text-stone-100 mb-2 mt-1'>
                        <span className='text-stone-500'>Available:</span>  {BigNoToUSDT(_claimableDynamic)} USDT
                    </div>
                 </div>
                <div className='flex flex-col justify-center' onClick={handleDynamic}>
                    <img src={withdraw } className='w-14 hover:w-12'/>
                </div>
            </div>
            {/* DC profit */}
            <div className='flex w-full justify-between mt-5'>
                <div>
                    <div className="flex flex-col relative">
                        <label className="text-lg  mb-2" >
                            DC profit Value
                        </label>
                        <input
                            className=" px-3 py-3 pl-10 bg-stone-500 w-80"
                            placeholder="USDT"
                            type="number"
                            value={DCIput}
                            onChange={(e) => setDCIput(e.target.value)}
                        />
                        <div className="absolute top-1/2 right-3 transform -translate-y-1 flex">
                            <div className=' border border-yellow-300 border-2 px-2 hover:bg-yellow-600 mt-2' onClick={() => setMax(2)}>max</div>
                        </div>
                    </div>
                    <div className='text-xs text-stone-100 mb-2 mt-1'>
                        <span className='text-stone-500'>Available:</span>  0 USDT
                    </div>
                </div>
                <div className='flex flex-col justify-center' onClick={handleDynamic}>
                    <img src={withdraw} className='w-14 hover:w-12' />
                </div>
            </div>

            {/* bottom box */}
            <div className='flex w-full justify-center mt-20'>
                <div className='border border-yellow-300 border-2 p-2 w-96'>
                    <div className='flex justify-between'>
                        <div>Total Intrest Value</div>
                        <div>{BigNoToUSDT(_static)} USDT</div>
                    </div>
                    <div className='flex justify-between'>
                        <div>Total Booster Value</div>
                        <div>{BigNoToUSDT(_dynamic)} USDT</div>
                    </div>
                    <div className='flex justify-between'>
                        <div>Claimable Booster Value</div>
                        <div>{BigNoToUSDT(_claimableDynamic)} USDT</div>
                    </div>
                    <div className='flex justify-between'>
                        <div>Total DC Value</div>
                        <div>0 USDT</div>
                    </div>
                    <div className='flex justify-between'>
                        <div>Total Withdrawal Value</div>
                        <div>{BigNoToUSDT(_claimableDynamic) +  BigNoToUSDT(_static)} USDT</div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default Wallet