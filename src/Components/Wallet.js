import React, { useContext, useState, useEffect } from 'react'
import { EthersContext } from '../Contexts/EthersContext'
import { BigNoToInt, BigNoToUSDT, stringToBigInt, stringToUSDT } from '../Utils/Utils'
import { useContractRead, useContractWrite } from '@thirdweb-dev/react'
import { toast } from 'react-toastify'
import Loader from './Loader'
import withdraw from '../Assets/withdraw.png'
import USDTlogo from '../Assets/usdt.png'
import DClogo from '../Assets/DClogo.jpg'
function Wallet() {
    const { contract, DCManager, address, handleDCSell } = useContext(EthersContext)
    // const address = "0x1c206F49C462ED3af40a5c368dbbd793278FCaa8"
    const [isLoading, setisLoading] = useState(false)
    const [StaticInput, setStaticInput] = useState("0")
    const [DynamicInput, setDynamicInput] = useState("0")
    const [DCInput, setDCInput] = useState(0)
    const [tokenPrice, settokenPrice] = useState(0)
    const { data: _tokenPrice } = useContractRead(DCManager, "tokenPrice", [])
    const { data: _reward, isLoading: L4 } = useContractRead(contract, "getStakes", [address])
    const { mutateAsync: claimDynamicReward } = useContractWrite(contract, "claimDynamicReward")
    const { mutateAsync: claimStaticReward } = useContractWrite(contract, "claimStaticReward")
    const [Rewards, setRewards] = useState([0, 0])
    const [DCinUSDT, setDCinUSDT] = useState(0)
    const handleStatic = async () => {
        setisLoading(true)
        try {
            let amount = stringToUSDT(StaticInput)
            if (amount < 10) return toast.error("Minimum amount is 10 USDT")
            const tx = await claimStaticReward({ args: [amount] });
            toast.success("Transaction succeful")
        } catch (e) {
            console.log(e);
            if (e?.data?.message) toast.error(e.data.message)
            else toast.error("transaction failed")
        }
        setisLoading(false)
    }
    const handleDynamic = async () => {
        setisLoading(true)
        try {
            let amount = stringToUSDT(DynamicInput)
            if (amount < 10) return toast.error("Minimum amount is 10 USDT")
            const tx = await claimDynamicReward({ args: [amount] });
            toast.success("Transaction succeful")
        } catch (e) {
            console.log(e);
            if (e?.data?.message) toast.error(e.data.message)
            else toast.error("transaction failed")
        }
        setisLoading(false)
    }
    const handleDCReward = async () => {
        if (DCInput==0 || DCInput==="0" || DCInput===undefined) return toast.error("Minimum amount is 10 DC")
        setisLoading(true)
        await handleDCSell(DCInput)
        setisLoading(false)
    }
    const setMax = (index) => {
        if (index === 0) {
            setStaticInput(Rewards ? Rewards[2] : "0")
        } else{
            setDynamicInput(Rewards ? Rewards[3] : "0")
        }
        //  else {
        //     setDCInput(DCUser.balance)
        // }
    }
    useEffect(() => {
        if (_tokenPrice) {
            settokenPrice(BigNoToInt(_tokenPrice) / 100)
        }
    }, [ _tokenPrice])

    useEffect(() => {
      
    }, [tokenPrice, DCInput])
    useEffect(() => {
        
    }, [tokenPrice, DCinUSDT])
    useEffect(() => {
        if (_reward) {
            let stT = 0;
            let dyT = 0;
            let dyC = 0;
            let stC = 0;
            for (let index = 0; index < _reward.length; index++) {
                stT += BigNoToUSDT(_reward[index].staticClaimed);
                dyT += BigNoToUSDT(_reward[index].dynamicClaimed);
                stC += BigNoToUSDT(_reward[index].staticReward);
                dyC += BigNoToUSDT(_reward[index].dynamicReward);
            }
            setRewards([stT, dyT, stC, dyC])
        }
    }, [_reward])


    if (isLoading || L4 ) return <Loader />
    else
    return (
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
                    <div className='text-xs text-stone-100 mb-2 mt-1 flex justify-between'>
                        <div>
                            <span className='text-stone-500'>Available:</span>  {Rewards ? Rewards[2] : "0"} USDT
                        </div>
                        <div>
                            <span className='text-stone-500'>Min:</span> 10 USDT
                        </div>
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
                    <div className='text-xs text-stone-100 mb-2 mt-1 flex justify-between'>
                        <div>
                            <span className='text-stone-500'>Available:</span>  {Rewards ? Rewards[3] : "0"} USDT
                        </div>
                        <div>
                            <span className='text-stone-500'>Min:</span> 10 USDT
                        </div>
                    </div>
                </div>
                <div className='flex flex-col justify-center' onClick={handleDynamic}>
                    <img src={withdraw} className='w-14 hover:w-12' />
                </div>
            </div>
            {/* DC profit */}
            {/* <div className='flex w-full justify-between mt-5'>
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
                        <span className='text-stone-500'>Available:</span>{DCUser.balance} DC
                    </div>

                </div>
                <div className='flex flex-col justify-center' onClick={handleDCReward}>
                    <img src={withdraw} className='w-14 hover:w-12' />
                </div>
            </div> */}

            {/* mid-bottom box */}
            <div className='flex w-full justify-center mt-10'>
                <div className='border border-yellow-300 border-2 p-2 w-96'>
                    <div className='flex justify-between'>
                        <div>Total Claimed Interest Value</div>
                        <div>{_reward ? Rewards[0] : "0"} USDT</div>
                    </div>
                    <div className='flex justify-between'>
                        <div>Total Claimed Booster Value</div>
                        <div>{Rewards ? Rewards[1] : "0"} USDT</div>
                    </div>
                </div>
            </div>

            {/* Exchange start */}
            <div className='m-5 mt-20'>
                <div className='flex justify-between '>
                    <div className='mt-5 text-stone-400 font-semibold text-xl'>EXCHANGE</div>
                    <div className='border border-yellow-300 border-1  text-center py-2 px-5 '>
                        <div> DC/USDT: </div>
                        <div>{tokenPrice && tokenPrice}</div>
                    </div>
                </div>
                {/* DC PART */}
                <div className='mx-7 mt-5'>
                    <label className="text-sm text-stone-400 " >From: </label>
                    <div className='flex justify-between '>
                        <div className='mt-3 ml-3 flex'>
                            <img src={DClogo} className='w-5 h-5 mt-0.5 mx-1'></img>
                            DC
                        </div>
                        <div>
                            <input className='w-32 bg-stone-500 px-3 py-3 pl-10' type='number' value={DCInput} onChange={(e) => { setDCInput(e.target.value); setDCinUSDT(parseInt(tokenPrice * parseInt(e.target.value))) }} />
                            <div className='text-xs text-stone-300 text-center mt-1'> Available: 0 DC</div>
                        </div>
                    </div>
                </div>

                <div className='text-center text-3xl m-2'>🔃</div>
                {/* USDT PART */}
                <div className='mx-7'>
                    <label className="text-sm text-stone-400 " >To: </label>
                    <div className='flex justify-between '>
                        <div className='mt-3 ml-3 flex'>
                            <img src={USDTlogo} className='w-5 h-5 mt-0.5 mx-1'></img>
                            USDT
                        </div>
                        <div>
                            <input className='w-32 bg-stone-500 px-3 py-3 pl-10' type='number' value={DCinUSDT} onChange={(e) => { setDCinUSDT(e.target.value); setDCInput(parseInt(parseInt(e.target.value) / tokenPrice)) }}></input>
                        </div>
                    </div>
                </div>
                <div className='flex justify-center mt-7'>
                <div className='text-center bg-blue-500 px-10 py-2 rounded-md hover:bg-blue-700'
                onClick={handleDCReward}
                >
                    Confirm
                </div>
                </div>
            </div>
        </div>
    )
}

export default Wallet