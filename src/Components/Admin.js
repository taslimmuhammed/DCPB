import React, { useContext, useEffect, useState } from 'react'
import { EthersContext } from '../Contexts/EthersContext'
import { BigNoToInt, BigNoToUSDT, ContractAddress } from '../Utils/Utils'
import Loader from './Loader'
import { useBalance, useContractRead } from '@thirdweb-dev/react'
import { useNavigate } from 'react-router-dom'

function Admin() {
    const navigate = useNavigate()
    const { address,
        L0,
        USDTContract,
        contract,
        NFTStaking,
        DCManager,
        handleStakingWithdraw,
        handleDCWithdraw,
        NFTRelease } = useContext(EthersContext)
        const [isLoading, setisLoading] = useState(false)
        const [TotalDeposite, setTotalDeposite] = useState(0)
        const [NFTReleased, setNFTReleased] = useState(0)
        const [DCSold, setDCSold] = useState(0)
        const [totalClaimed, settotalClaimed] = useState(0)
        const [StakedNFTs, setStakedNFTs] = useState(0)
        const [StakingUSDTBalance, setStakingUSDTBalance] = useState(0)
        const [totalUsers, settotalUsers] = useState(0)
        const [totalReleased, settotalReleased] = useState(0)
        const [StakingWithdrawInput, setStakingWithdrawInput] = useState('0')
        const [DCWithdrawInput, setDCWithdrawInput] = useState('0')
    const { data: _totalDeposite } = useContractRead(contract, "totalDeposite", [])
    const { data: _nftRelease } = useContractRead(NFTRelease, "totalReleased", [])
    const { data: _totalDCSold } = useContractRead(DCManager, "getTotalSold", [])
    const { data: _totalClaimed } = useContractRead(DCManager, "totalClaimed", [])
    const { data: _StakedNFTs } = useContractRead(NFTStaking, "totalStaked", [])
    const { data: _totalUsers } = useContractRead(contract, "totalUsers", [])
    const { data: _totalReleased } = useContractRead(NFTStaking, "totalReleased", [])
    const { data: _StakingusdtBalance } = useContractRead(USDTContract, "balanceOf", [ContractAddress]) 

    useEffect(() => {
       if (address && address != "0x6B851e5B220438396ac5ee74779DDe1a54f795A9"){navigate('/') }
       if(_totalDeposite) setTotalDeposite(BigNoToUSDT(_totalDeposite))
       if(_nftRelease) setNFTReleased(BigNoToInt(_nftRelease))
       if(_totalDCSold) setDCSold(BigNoToInt(_totalDCSold))
       if(_totalClaimed) settotalClaimed(BigNoToInt(_totalClaimed))
       if(_StakedNFTs) setStakedNFTs(BigNoToInt(_StakedNFTs))
       if(_StakingusdtBalance) setStakingUSDTBalance(BigNoToUSDT(_StakingusdtBalance))
       if (_totalUsers) settotalUsers(BigNoToInt(_totalUsers))
       console.log(NFTReleased);
    }, [_nftRelease, _totalDeposite, _totalDCSold, _totalClaimed, _StakedNFTs, _StakingusdtBalance, _totalUsers, _totalReleased])
    
    if (isLoading || L0) return <Loader />
    else return (
            <div className='text-white p-5 mb-32'>
            <div className='flex w-full justify-between'>
                <div className='py-2 text-lg'> Total Deposite</div>
                <div className='bg-stone-700 w-32 py-2 px-2'>{TotalDeposite && TotalDeposite} USDT</div>
            </div>
            <div className='flex w-full justify-between mt-6'>
                <div className='py-2 text-lg'>Staking Contract Balance</div>
                <div className='bg-stone-700 w-32 py-2 px-2'>{StakingUSDTBalance && StakingUSDTBalance}</div>
            </div>
            <div className='flex w-full justify-between mt-6'>
                <div className='py-2 text-lg'> Total StakingUser</div>
                <div className='bg-stone-700 w-32 py-2 px-2'>{totalUsers && totalUsers}</div>
            </div>
            <div className='flex w-full justify-between mt-6'>
                <div className='py-2 text-lg'> Total NFT Release</div>
                <div className='bg-stone-700 w-32 py-2 px-2'>{NFTReleased && NFTReleased} NFT</div>
            </div>
            <div className='flex w-full justify-between mt-6'>
                <div className='py-2 text-lg'> Total DC Release</div>
                <div className='bg-stone-700 w-32 py-2 px-2'>{totalReleased && totalReleased}</div>
            </div>
            <div className='flex w-full justify-between mt-6'>
                <div className='py-2 text-lg'> Total NFT Staking</div>
                <div className='bg-stone-700 w-32 py-2 px-2'>{StakedNFTs && StakedNFTs}</div>
            </div>
            <div className='flex w-full justify-between mt-6'>
                <div className='py-2 text-lg'> Total DC on sales</div>
                <div className='bg-stone-700 w-32 py-2 px-2'>{DCSold && DCSold} DC</div>
            </div>
            <div className='flex w-full justify-between mt-6'>
                <div className='py-2 text-lg'> Total DC Buy in</div>
                <div className='bg-stone-700 w-32 py-2 px-2'>{totalClaimed && totalClaimed} USDT</div>
            </div>


            <div className='flex mt-10'>
                <input className='bg-stone-700 w-32 py-2 px-3 mr-10' placeholder='0' onChange={(e)=>setStakingWithdrawInput(e.target.value)}/>
                <div className='border border-yellow-300 border-2 py-2 px-5  hover:bg-yellow-600' onClick={() => handleStakingWithdraw(StakingWithdrawInput)}>
                    Withdraw
                </div>
            </div>
            <div className='text-xs text-stone-300  m-1'> Staking Fund withdraw</div>


            <div className='flex mt-10'>
                <input className='bg-stone-700 w-32 py-2 px-3 mr-10' placeholder='0' onChange={(e)=>setDCWithdrawInput(e.target.value)}/>
                <div className='border border-yellow-300 border-2 py-2 px-5 hover:bg-yellow-600' onClick={()=>handleDCWithdraw(DCWithdrawInput)}>
                    Withdraw
                </div>
            </div>
            <div className='text-xs text-stone-300 m-1'> DC Fund withdraw</div>
        </div>
    )
}

export default Admin