import React, { useContext, useEffect, useState } from 'react'
import { EthersContext } from '../Contexts/EthersContext'
import { useBalance, useContractRead, useContractWrite } from '@thirdweb-dev/react'
import { toast } from 'react-toastify'
import Loader from './Loader'
import { BigNoToDC, BigNoToInt, BigNoToUSDT, DCTokenAddress, NFTAddress, getRankfromUser } from '../Utils/Utils'
import graph from '../Assets/graph.png'
import community from '../Assets/community.png'
function Affiliate() {
    const { address,
        L0,L1, L2, L13, L14, L15,
        SignedIn,
        tokenContract,
        contract,
        NFTStaking,
        DCManager,
        handleClaim,
        handleUpgrade,
        NFTRelease } = useContext(EthersContext)
    const [isLoading, setisLoading] = useState(false)
    const [Claimable, setClaimable] = useState(false)
    const [Total, setTotal] = useState("0")
    const [Refs, setRefs] = useState(null)
    const [Rank, setRank] = useState(0)
    const [NFTCount, setNFTCount] = useState(0)
    const [NFTBalance, setNFTBalance] = useState(0)
    const [WithdrawableNFT, setWithdrawableNFT] = useState(0)
    const [StakedNFTs, setStakedNFTs] = useState(0)
    const [StakingReward, setStakingReward] = useState(0)
    const { data : Upgradable, isLoading:L3 } = useContractRead(contract, "checkUpgradablity", [address])
    const { data:User, isLoading:L4 } = useContractRead(contract, "getUser", [address])
    const { data: RefRanks, isLoading: L5 } = useContractRead(contract, "getReferralRanks", [address])
    const { data: _count, isLoading: L6 } = useContractRead(NFTRelease, "count", [address])
    const { data: _withdrawableNFT, isLoading: L7 } = useContractRead(NFTRelease, "getcount", [address])
    const { data: _nftBalance, isLoading: L8 } = useContractRead(NFTRelease, "getBalance", [address])
    const { data: _stakedNFTs, isLoading: L9 } = useContractRead(NFTStaking, "getTotalStake", [address])
    const { data: _StakingReward, isLoading: L10 } = useContractRead(NFTStaking, "calculateReward", [address])
    const { data: _md, isLoading: L11 } = useContractRead(NFTStaking, "getTotalStake", [address])


    useEffect(() => {
        setRank(User? User.rank: 0)
    }, [User])
    useEffect(() => {
      let total=0;
       let tempArr = []
        if(RefRanks){
            for(let i=0;i<RefRanks.length;i++){
                let temp=BigNoToInt(RefRanks[i])
                total+=temp
                tempArr.push(temp)
            }
            setTotal(total)
            setRefs(tempArr)
        }
    }, [RefRanks])
    useEffect(() => {
      if(_count){
        if(BigNoToInt(_count)>0) setClaimable(true)
        else setClaimable(false)
      }
    }, [_count])
    // useEffect(() => {
    //   setNFTCount(BigNoToInt(_count))
    //   setNFTBalance(BigNoToInt(_nftBalance))
    //   setStakedNFTs(BigNoToInt(_stakedNFTs))
    //   setWithdrawableNFT(BigNoToInt(_withdrawableNFT))
    //   setStakingReward(BigNoToDC(_StakingReward))
    // }, [_count, _nftBalance, _stakedNFTs, _withdrawableNFT, _StakingReward])
    
    if (isLoading || L3 || L4 ||L0) return <Loader />
    else return (
        <div className='text-white'>
            <div className='ml-5 my-10'>
            <div >Rank Status</div>
            <div className='border border-yellow-300 border-2 w-80 p-4 flex mt-1'>
             <img src={graph} className='w-10'/>
             <div className='text-yellow-500 text-2xl ml-5 mt-1 mr-5'> V{User? User.rank:"0"}</div>
                {
                    Upgradable && <button className="button-85" role="button" onClick={handleUpgrade}>Upgrade Level</button>
                }
            </div>
            </div>
            <div className='flex w-full justify-evenly mt-3 text-2xl text-stone-400 text-white'>
                <div className='bg-stone-800 w-24 h-10 p-1 px-3  flex justify-between'><span className=''>V6</span><span className='text-yellow-500'>{Refs && Refs[6]}</span></div>
                <div className='bg-stone-800 w-24 h-10 p-1 px-3  flex justify-between'><span className=''>V5</span><span className='text-yellow-500'>{Refs && Refs[5]}</span></div>
                <div className='bg-stone-800 w-24 h-10 p-1 px-3  flex justify-between'><span className=''>V4</span><span className='text-yellow-500'>{Refs && Refs[4]}</span></div>
            </div>

            <div className='flex w-full justify-evenly mt-3 text-2xl text-stone-400 text-white'>
                <div className='bg-stone-800 w-24 h-10 p-1 px-3  flex justify-between'><span className=''>V3</span><span className='text-yellow-500'>{Refs && Refs[3]}</span></div>
                <div className='bg-stone-800 w-24 h-10 p-1 px-3  flex justify-between'><span className=''>V2</span><span className='text-yellow-500'>{Refs && Refs[2]}</span></div>
                <div className='bg-stone-800 w-24 h-10 p-1 px-3  flex justify-between'><span className=''>V1</span><span className='text-yellow-500'>{Refs && Refs[1]}</span></div>
            </div>
            
            <div className=' flex p-5'>
                <img src={community} className='w-14'></img>
                <div className='bg-stone-800 w-20 h-10 p-1 px-3  flex justify-between mt-2 ml-3'>{Total && Total}</div>
            </div>
            {/* seprator */}
            <div className='mt-3 px-3 w-full h-px bg-stone-500' />
            
            {
                 Claimable && <div className='flex w-full justify-center mt-6'>
                    <button className="button-85" role="button" onClick={handleClaim}>claim NFT</button>
                </div>
            }
             {/*Bottom Box  */}
            <div className='p-3 my-5 border border-yellow-300 border-2'>
                <div className='flex justify-between'>
                    <div className=''>NFT Reward:</div>
                    <div>{NFTCount}NFT</div>
                </div>
                <div className='flex justify-between'>
                    <div className=''>NFT Staking:</div>
                    <div>{StakedNFTs} USDT</div>
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
            <div className='flex w-full justify-center'>
                <div>
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
                </div>
            </div>
            <div className='mb-32'></div>
        </div>
    )
}

export default Affiliate