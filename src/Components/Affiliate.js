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
        L0,
        contract,
        NFTStaking,
        DCManager,
        handleNFTClaim,
        handleDCClaim,
        handleUpgrade,
        handleNFTStake,
        handleDCSell,
        NFTRelease } = useContext(EthersContext)
    const [isLoading, setisLoading] = useState(false)
    const [NFTClaimable, setNFTClaimable] = useState(false)
    const [DCclaimable, setDCclaimable] = useState(false)
    const [Total, setTotal] = useState("0")
    const [Refs, setRefs] = useState(null)
    const [NFTCount, setNFTCount] = useState(0)
    const [NFTBalance, setNFTBalance] = useState(0)
    const [StakedNFTs, setStakedNFTs] = useState(0)
    const [DCUser, setDCUser] = useState(null)
    const [DCclaimed, setDCclaimed] = useState(0)
    const [DCinput, setDCinput] = useState("0")
    const [NFTinput, setNFTinput] = useState("0")
    const { data: Upgradable, isLoading: L3 } = useContractRead(contract, "checkUpgradablity", [address])
    const { data: User, isLoading: L4 } = useContractRead(contract, "getUser", [address])
    const { data: RefRanks} = useContractRead(contract, "getReferralRanks", [address])
    const { data: _count} = useContractRead(NFTRelease, "count", [address])
    const { data: _nftClaimable} = useContractRead(NFTRelease, "getcount", [address])
    const { data: _nftBalance} = useContractRead(NFTRelease, "getBalance", [address])
    const { data: _stakedNFTs} = useContractRead(NFTStaking, "getTotalStake", [address])
    const { data: _DCReward} = useContractRead(NFTStaking, "calculateReward", [address])
    const { data: StakeUser } = useContractRead(NFTStaking, "users", [address])
    const { data: _DCUser } = useContractRead(DCManager, "Users", [address])
    const { data: Balance } = useBalance(DCTokenAddress);
    
    useEffect(() => {
        let total = 0;
        let tempArr = []
        if (RefRanks) {
            for (let i = 0; i < RefRanks.length; i++) {
                let temp = BigNoToInt(RefRanks[i])
                total += temp
                tempArr.push(temp)
            }
            setTotal(total)
            setRefs(tempArr)
        }
    }, [RefRanks])
    useEffect(() => {
        console.log({ _count, _nftBalance, _stakedNFTs, _DCUser, StakeUser, _nftClaimable });
        try {
            if(_count)setNFTCount(BigNoToInt(_count))
            if(_nftBalance) setNFTBalance(BigNoToInt(_nftBalance))
            if(_stakedNFTs) setStakedNFTs(BigNoToInt(_stakedNFTs))
           if (_DCUser) {
                setDCUser({
                    profit: BigNoToInt(_DCUser.profit),
                    totalCoins: BigNoToInt(_DCUser.totalCoins),
                    balance: BigNoToInt(_DCUser.balance)
                })
            }
            if (StakeUser) {
                setDCclaimed(BigNoToDC(StakeUser.claimed))
            }
            if (_nftClaimable && BigNoToInt(_nftClaimable)>=1) {
                setNFTClaimable(true)
            }
            if(_DCReward && BigNoToDC(_DCReward)>1){
                setDCclaimable(true)
            }
        } catch (error) {
            console.log(error);
        }

    }, [_count, _nftBalance, _stakedNFTs, _DCUser, StakeUser,_nftClaimable])
   useEffect(() => {
     console.log(Upgradable);
   }, [Upgradable])
   
    if (isLoading || L3 || L4 || L0 ) return <Loader />
    else return (
        <div className='text-white'>
            <div className='ml-5 my-10'>
                <div >Rank Status</div>
                <div className='border border-yellow-300 border-2 w-80 p-4 flex mt-1'>
                    <img src={graph} className='w-10' />
                    <div className='text-yellow-500 text-2xl ml-5 mt-1 mr-5'> V{User ? User.rank : "0"}</div>
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

            <div class="buttons">
                <a className={NFTClaimable ? "button":"button disabled"} href="#" onClick={handleNFTClaim}>Claim NFT</a>
                <a className={DCclaimable ? "button" : "button disabled"} href="#" onClick={handleDCClaim}>Claim DC</a>
            </div>
            {/*Bottom Box  */}
            <div className='p-3 my-5 border border-yellow-300 border-2'>
                <div className='flex justify-between'>
                    <div className=''>NFT Reward:</div>
                    <div>{NFTCount && NFTCount}NFT</div>
                </div>
                <div className='flex justify-between'>
                    <div className=''>NFT Staking:</div>
                    <div>{StakedNFTs && StakedNFTs} NFT</div>
                </div>
                <div className='flex justify-between'>
                    <div className=''>Staking Profit:</div>
                    <div>{DCclaimed && DCclaimed} DC</div>
                </div>
                <div className='flex justify-between'>
                    <div className=''>DC Coin Sell:</div>
                    <div>{DCUser && DCUser.totalCoins} DC</div>
                </div>
                <div className='flex justify-between'>
                    <div className=''>DC Coin Profit</div>
                    <div>{DCUser && DCUser.profit} <span className='text-yellow-300 '>USDT</span></div>
                </div>
            </div>


            {/*  */}
            <div className='flex w-full justify-center'>
                <div>
                    <div className='flex mt-6'>
                        <input className='bg-stone-700 w-32 py-2 px-3 mr-10' placeholder='0' onChange={(e) => setNFTinput(e.target.value)} />
                        <div className='border border-yellow-300 border-2 p-2 hover:bg-yellow-600' onClick={()=>handleNFTStake(NFTinput)}>
                            NFT Staking
                        </div>
                    </div>
                    <div className='text-xs text-stone-300'> Available: {NFTBalance && NFTBalance} NFT</div>


                    <div className='flex mt-6'>
                        <input className='bg-stone-700 w-32 py-2 px-3 mr-10' placeholder='0' onChange={(e)=>setDCinput(e.target.value)}/>
                        <div className='border border-yellow-300 border-2 p-2 hover:bg-yellow-600 px-6' onClick={() => handleDCSell(DCinput)}>
                            DC Sell
                        </div>
                    </div>
                    <div className='text-xs text-stone-300'> Available: {Balance && Balance.displayValue} DC</div>
                </div>
            </div>
            <div className='mb-32'></div>
        </div>
    )
}

export default Affiliate