import React, { useContext, useState, useEffect } from 'react'
import { EthersContext } from '../Contexts/EthersContext'
import {  BigNoToInt, BigNoToUSDT, stringToBigInt, stringToUSDT } from '../Utils/Utils'
import {  useContractRead, useContractWrite } from '@thirdweb-dev/react'
import { toast } from 'react-toastify'
import Loader from './Loader'
import withdraw from '../Assets/withdraw.png'
function Wallet() {
    const {  contract, DCManager, address } = useContext(EthersContext)
    // const address = "0x1c206F49C462ED3af40a5c368dbbd793278FCaa8"
    const [isLoading, setisLoading] = useState(false)
    const [StaticInput, setStaticInput] = useState("0")
    const [DynamicInput, setDynamicInput] = useState("0")
    const [DCInput, setDCInput] = useState("0")
    const [DCUser, setDCUser] = useState(0)
    const { data: User } = useContractRead(contract, "getStakeUser", [address])
    const { data: _reward, isLoading: L4 } = useContractRead(contract, "calculateAllReward", [address])
    const { mutateAsync: claimDynamicReward } = useContractWrite(contract, "claimDynamicReward")
    const { mutateAsync: claimStaticReward } = useContractWrite(contract, "claimStaticReward")
    const { mutateAsync: claimUSDT } = useContractWrite(DCManager, "claimUSDT")
    const [Rewards, setRewards] = useState([0, 0])
    const { data: _DCUser } = useContractRead(DCManager, "Users", [address])
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
    const handleDCReward = async () => {
        setisLoading(true)
        try {
            let amount = stringToBigInt(DCInput)
            const tx = await claimUSDT({ args: [amount] });
            toast.success("Transaction succeful")
        } catch (e) {
            console.log(e);
            toast.error("transaction failed")
        }
        setisLoading(false)
    }
    const setMax = (index) => {
        if (index === 0) {
            setStaticInput(BigNoToUSDT(_reward.staticReward))
        } else if (index === 1) {
            setDynamicInput(BigNoToUSDT(_reward.dynamicReward))
        } else {
            setDCInput(DCUser.balance)
        }
    }
    useEffect(() => {
        if(_DCUser){
            if (_DCUser) {
                setDCUser({
                    profit: BigNoToInt(_DCUser.profit),
                    totalCoins: BigNoToInt(_DCUser.totalCoins),
                    balance: BigNoToInt(_DCUser.balance)
                })
            }
        }
    }, [_DCUser])
    useEffect(() => {
        if (_reward) {
            let stT = 0;
            let dyT = 0;
            for (let index = 0; index < _reward.length; index++) {
                let st = BigNoToUSDT(_reward[index].staticReward)
                let dy = BigNoToUSDT(_reward[index].dynamicReward)
                stT += st;
                dyT += dy;
            }
            setRewards([stT, dyT])
        }
    }, [_reward])
useEffect(() => {
  console.log(User);
}, [User])

   
    if (isLoading || L4 ) return <Loader />
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
                            <div className=' border border-yellow-300 border-2 px-2 hover:bg-yellow-600 mt-2' onClick={() => setMax(0)}>max</div>
                        </div>
                    </div>
                    <div className='text-xs text-stone-100 mb-2 mt-1'>
                        <span className='text-stone-500'>Available:</span>  {Rewards && Rewards[0]} USDT
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
                        <span className='text-stone-500'>Available:</span>  {Rewards && Rewards[1]} USDT
                    </div>
                </div>
                <div className='flex flex-col justify-center' onClick={handleDynamic}>
                    <img src={withdraw} className='w-14 hover:w-12' />
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
                            value={DCInput}
                            onChange={(e) => setDCInput(e.target.value)}
                        />
                        <div className="absolute top-1/2 right-3 transform -translate-y-1 flex">
                            <div className=' border border-yellow-300 border-2 px-2 hover:bg-yellow-600 mt-2' onClick={() => setMax(2)}>max</div>
                        </div>
                    </div>
                    <div className='text-xs text-stone-100 mb-2 mt-1'>
                        <span className='text-stone-500'>Available:</span>{DCUser.balance} USDT
                    </div>
                </div>
                <div className='flex flex-col justify-center' onClick={handleDCReward}>
                    <img src={withdraw} className='w-14 hover:w-12' />
                </div>
            </div>

            {/* bottom box */}
            <div className='flex w-full justify-center mt-20'>
                <div className='border border-yellow-300 border-2 p-2 w-96'>
                    <div className='flex justify-between'>
                        <div>Total Intrest Value</div>
                        <div>{_reward && Rewards[0]} USDT</div>
                    </div>
                    <div className='flex justify-between'>
                        <div>Claimable Booster Value</div>
                        <div>{Rewards && Rewards[1]} USDT</div>
                    </div>
                    <div className='flex justify-between'>
                        <div>Total DC Value</div>
                        <div>0 USDT</div>
                    </div>
                    <div className='flex justify-between'>
                        <div>Total Withdrawal Value</div>
                        <div>{Rewards && Rewards[0] + Rewards[1]} USDT</div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default Wallet