import React, { useContext, useState, useEffect } from 'react'
import USDT from '../Assets/usdt.png'
import verify from '../Assets/verify.svg'
import { useBalance, } from "@thirdweb-dev/react";
import { EthersContext } from '../Contexts/EthersContext';
import { ContractAddress, USDTAddress, stringToUSDT, BigNoToUSDT } from '../Utils/Utils';
import { useContractWrite, useContractRead } from "@thirdweb-dev/react";
import { toast } from 'react-toastify';
import Loader from './Loader';
import { useNavigate } from 'react-router-dom'
import { LangArray } from '../Utils/Language';

function Staking() {
  const [TokenInput, setTokenInput] = useState('1000')
  const [AllowanceInput, setAllowanceInput] = useState('1000')
  const [Allowance, setAllowance] = useState('0')
  const [isLoading, setisLoading] = useState(false)
  const { tokenContract, contract, address, Chinese } = useContext(EthersContext)
  const { data: Stakablity } = useContractRead(contract, "checkStakablity", [address])
  const { data: allowance } = useContractRead(tokenContract, "allowance", [address, ContractAddress])
  const { mutateAsync: increaseAllowance } = useContractWrite(tokenContract, "increaseAllowance")
  const { mutateAsync: stake } = useContractWrite(contract, "stake")
  const { data: Balance } = useBalance(USDTAddress);
  const navigate = useNavigate()
  const handleStake = async () => {
    if (allowance < 100) return toast.error("Please create allowance of atleast 100 USDT before staking")
    if (parseInt(TokenInput) < 100) return toast.error("Please enter amount greater than 100 USDT")
    setisLoading(true)
    try {
      let amount = stringToUSDT(TokenInput)
      const tx = await stake({ args: [amount], overrides: { gasLimit: 10000000 } });
      toast.success("Succefully staked")
      navigate('/list')
    } catch (e) {
      if (e?.data?.message) toast.error(e.data.message)
      else toast.error("transaction failed, please re-try after few minutes")
    }
    setisLoading(false)
  }

  const handleAlllowance = async () => {
    setisLoading(true)
    try {
      let amount = stringToUSDT(AllowanceInput)
      const data = await increaseAllowance({ args: [ContractAddress, amount] });
      toast.success("Succefully created allowance")
    } catch (e) {
      if (e?.data?.message) toast.error(e.data.message)
      else toast.error("transaction failed")
    }
    setisLoading(false)
  }
  useEffect(() => {
    if (allowance) setAllowance(BigNoToUSDT(allowance))
  }, [allowance])
  useEffect(() => {
    console.log({ Stakablity })
  }, [Stakablity])

  if (isLoading) return <Loader />
  else
    return (
      <div className='text-white font-mono'>
        {
          Stakablity ? <div><div className="flex flex-col relative mt-10">
            <label className="text-sm text-stone-500 mb-2" >
              {Chinese ? LangArray[15] : LangArray[14]}
            </label>
            <input
              className=" px-3 py-4 pl-10 bg-stone-800"
              placeholder="USDT"
              type="number"
              value={AllowanceInput}
              onChange={(e) => setAllowanceInput(e.target.value)}
            />
            <div className='text-sm text-stone-100 mb-2 mt-1'>
              <span className='text-stone-500'>{Chinese ? LangArray[25] : LangArray[24]}:</span>  {Balance && Balance.displayValue} USDT
            </div>
            <p className='text-xs text-red-500'>{Chinese ? LangArray[17] : LangArray[16]}</p>
            <div className='mt-5 w-full text-center bg-stone-600 text-yellow-400 font-bold text-2xl p-2 hover:bg-stone-700 rounded-lg cursor-pointer '
              onClick={handleAlllowance}>
              {Chinese ? LangArray[21] : LangArray[20]}
            </div>








            {/* seperator */}
            <div className='my-8 px-3 w-full h-px bg-stone-500' />

            <label className="text-sm text-stone-500 mb-2" >
              {Chinese ? LangArray[23] : LangArray[22]}
            </label>
            <input
              className=" px-3 py-4 pl-10 bg-stone-800"
              placeholder="USDT"
              type="number"
              value={TokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
            />
            {/* ETH icon */}
            <div className="absolute top-3/4 right-3 transform  translate-y-11 flex ">
              <img className='w-9' src={USDT} />
              <span className=' mt-2 px-3'>USDT</span>
            </div>
          </div>
            <div className='text-sm text-stone-100 mb-2 mt-1'>
              <span className='text-stone-500'>{Chinese ? LangArray[25] : LangArray[24]}:</span>  {Allowance && Allowance} USDT
            </div>

            <div className='text-stone-500 mt-6'>
              {Chinese ? LangArray[27] : LangArray[26]}
            </div>
            <div className='text-sm text-stone-100 mb-2 mt-1'>
              <span className='text-stone-500'>{Chinese ? LangArray[29] : LangArray[28]}:</span>  100 USDT
            </div>
            <div className='text-sm text-stone-100 mb-2 mt-1'>
              <span className='text-stone-500'>{Chinese ? LangArray[31] : LangArray[30]}:</span>  {Chinese ? LangArray[33] : LangArray[32]}
            </div>
            {/* Bottom */}
            {/* <div className='py-10 px-5'> */}
            {/* <div className='w-full bg-stone-800 px-4 py-3'>
                <div className='flex w-full justify-between'>
                  <div>Daily Intrest</div>
                  <div>1.0%</div>
                </div>


                <div className='flex w-full justify-between'>
                  <img className='w-8 h-8 mr-1' src={verify}></img>
                  <p className='text-xs'>
                    I have read and agreed to the DDMM staking Service Agreement, investing in the cryptocurrency market fluctuates grealty, and participants must self-assess thier risks and carefully choose the amount of investment.
                  </p>
                </div>
              </div> */}

            <div className='mt-5 w-full text-center bg-stone-600 text-yellow-400 font-bold text-2xl p-2 hover:bg-stone-700  rounded-lg cursor-pointer '
              onClick={handleStake}>
              {Chinese ? LangArray[39] : LangArray[38]}
            </div>
            {/* </div> */}
          </div> :
            <div className='flex justify-center align-center text-center h-screen mt-20'>
              <div className='bg-stone-800 text-center p-5 w-72 h-80 rounded-lg'>
                <div className='text-white text-center text-3xl'>
                  {Chinese ? LangArray[99] : LangArray[98]}
                </div>
                <div className='text-gray-400 text-center text-lg mt-5'>
                  {Chinese ? LangArray[101] : LangArray[100]}
                </div>

                {/* Veiw stakes button */}
                <div className='mt-10 w-full text-center bg-stone-600 text-yellow-400 font-bold text-2xl p-2 hover:bg-stone-700 rounded-md cursor-pointer'
                  onClick={() => navigate('/list')}
                >
                  {Chinese ? LangArray[103] : LangArray[102]}
                </div>
              </div>
            </div>
        }

      </div>
    )
}

export default Staking