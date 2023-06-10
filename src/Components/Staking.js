import React, { useContext, useEffect, useState } from 'react'
import USDT from '../Assets/usdt.png'
import verify from '../Assets/verify.svg'
import { useBalance, useContract, useContractRead } from "@thirdweb-dev/react";
import { EthersContext } from '../Contexts/EthersContext';
import { ContractAddress, USDTAddress, stringToUSDT } from '../Utils/Utils';
import { ethers } from 'ethers';
import { useContractWrite } from "@thirdweb-dev/react";
import { toast } from 'react-toastify';
import Loader from './Loader';

function Staking() {
  const [TokenInput, setTokenInput] = useState('1000')
  const [isLoading, setisLoading] = useState(false)
  const { tokenContract, contract, address } = useContext(EthersContext)
  const { mutateAsync: increaseAllowance } = useContractWrite(tokenContract, "increaseAllowance")
  const { mutateAsync: stake } = useContractWrite(contract, "stake")
  const { data: Balance } = useBalance(USDTAddress);
  const handleBuy = async () => {
    setisLoading(true)
    alert("You must approve 2 upcoming transactions for staking")
    try {
      let amount = stringToUSDT(TokenInput)
      const data = await increaseAllowance({ args: [ContractAddress, amount] });
      const tx = await stake({ args: [amount] });
      toast.success("Transaction succeful")
    } catch (e) {
      console.log(e);
      toast.error("transaction failed")
    }
    setisLoading(false)
  }

  if (isLoading ) return <Loader />
  else
    return (
      <div className='text-white font-mono'>
        <div className="flex flex-col relative mt-10">
          <label className="text-sm text-stone-500 mb-2" >
            Staking Amount
          </label>
          <input
            className=" px-3 py-4 pl-10 bg-stone-800"
            placeholder="USDT"
            type="number"
            value={TokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
          />
          {/* ETH icon */}
          <div className="absolute top-1/2 right-3 transform -translate-y-1 flex">
            <img className='w-9' src={USDT} />
            <span className=' mt-2 px-3'>USDT</span>
          </div>
        </div>
        <div className='text-sm text-stone-100 mb-2 mt-1'>
          <span className='text-stone-500'>Available:</span>  {Balance && Balance.displayValue} USDT
        </div>

        <div className='text-stone-500 mt-6'>
          Staking Amount limit
        </div>
        <div className='text-sm text-stone-100 mb-2 mt-1'>
          <span className='text-stone-500'>Min Staking Amount:</span>  100 USDT
        </div>
        <div className='text-sm text-stone-100 mb-2 mt-1'>
          <span className='text-stone-500'>Max Staking Amount:</span>  Unlimited
        </div>
        {/* seperator */}
        <div className='mt-6 px-3 w-full h-px bg-stone-500' />

        {/* Bottom */}
        <div className='py-10 px-5'>
          <div className='w-full bg-stone-800 px-4 py-3'>
            <div className='flex w-full justify-between'>
              <div>Daily Intrest</div>
              <div>1.0%</div>
            </div>
            {/* seperator */}
            <div className='my-8 px-3 w-full h-px bg-stone-500' />

            <div className='flex w-full justify-between'>
              <img className='w-8 h-8 mr-1' src={verify}></img>
              <p className='text-xs'>
                I have read and agreed to the DDMM staking Service Agreement, investing in the cryptocurrency market fluctuates grealty, and participants must self-assess thier risks and carefully choose the amount of investment.
              </p>
            </div>
          </div>

          <div className='mt-5 w-full text-center bg-stone-600 text-yellow-400 font-bold text-2xl p-2 hover:bg-stone-700'
            onClick={handleBuy}>
            Confirm
          </div>


        </div>
      </div>
    )
}

export default Staking