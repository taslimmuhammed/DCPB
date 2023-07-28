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

function Staking() {
  const [TokenInput, setTokenInput] = useState('1000')
  const [AllowanceInput, setAllowanceInput] = useState('1000')
  const [Allowance, setAllowance] = useState('0')
  const [isLoading, setisLoading] = useState(false)
  const { tokenContract, contract, address } = useContext(EthersContext)
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
      const tx = await stake({ args: [amount] });
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

  if (isLoading) return <Loader />
  else
    return (
      <div className='text-white font-mono'>
        {
          Stakablity ? <div><div className="flex flex-col relative mt-10">
            <label className="text-sm text-stone-500 mb-2" >
              Allowance Amount
            </label>
            <input
              className=" px-3 py-4 pl-10 bg-stone-800"
              placeholder="USDT"
              type="number"
              value={AllowanceInput}
              onChange={(e) => setAllowanceInput(e.target.value)}
            />
            <div className='text-sm text-stone-100 mb-2 mt-1'>
              <span className='text-stone-500'>Available:</span>  {Balance && Balance.displayValue} USDT
            </div>
            <p className='text-xs text-red-500'>! You'll need to first create allowance of required amount before staking.</p>
            <div className='mt-5 w-full text-center bg-stone-600 text-yellow-400 font-bold text-2xl p-2 hover:bg-stone-700 rounded-lg cursor-pointer '
              onClick={handleAlllowance}>
              Create Allowance
            </div>








            {/* seperator */}
            <div className='my-8 px-3 w-full h-px bg-stone-500' />

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
            <div className="absolute top-3/4 right-3 transform  translate-y-11 flex ">
              <img className='w-9' src={USDT} />
              <span className=' mt-2 px-3'>USDT</span>
            </div>
          </div>
            <div className='text-sm text-stone-100 mb-2 mt-1'>
              <span className='text-stone-500'>Allowance:</span>  {Allowance && Allowance} USDT
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
              Stake
            </div>
            {/* </div> */}
          </div> :
            <div className='flex justify-center align-center text-center h-screen mt-20'>
              <div className='bg-stone-800 text-center p-5 w-72 h-80 rounded-lg'>
                <div className='text-white text-center text-3xl'>
                  You have already staked
                </div>
                <div className='text-gray-400 text-center text-lg mt-5'>
                  You wont be able to stake again, until the current stake is over.
                </div>

                {/* Veiw stakes button */}
                <div className='mt-10 w-full text-center bg-stone-600 text-yellow-400 font-bold text-2xl p-2 hover:bg-stone-700 rounded-md cursor-pointer'
                  onClick={() => navigate('/list')}
                >
                  View Stakes
                </div>
              </div>
            </div>
        }

      </div>
    )
}

export default Staking