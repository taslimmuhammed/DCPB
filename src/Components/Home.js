import React, { useContext } from 'react'
import copy from '../Assets/copy.svg'
import { EthersContext } from '../Contexts/EthersContext'
import VideoPlayer from './VideoPlayer'
import logo from '../Assets/logo.jpg'
function Home() {
  const { tokenContract, contract } = useContext(EthersContext)
  return (
    <div className='p-2 home'>
      <div className='flex justify-between  py-3'>
        {/* <div className='golden-gradient py-2 px-4 rounded-sm font-semibold text-xl'> DCPB</div> */}
        <img src={logo} className='h-12'/>

        <div className='bg-stone-700  py-2 px-4 rounded-sm font-semibold flex text-xl'>
          ID = 0x12345...46897
          <img onClick={() => { navigator.clipboard.writeText("0x7y987429487ddsjfjbdsbjd4") }} src={copy} className='w-8 h-8'></img>
        </div>
      </div>
      <div className='text-xs'>
        <p className='py-2 '> DCPB Platform - Start the Low-Risk, High-Reward DDMM Staking Program with 1% Daily Interest Distribution!
        </p><p className='py-2'> Hello there! The DCPB platform takes great pride in its experienced market makers who have achieved considerable profits through market-making transactions on decentralized exchanges (DEX) and centralized exchanges (CEX). We have now developed a low-risk, highyield DDMM staking program for everyone to participate in, where users involved will enjoy a 1% daily interest distribution.
        </p><p className='py-2'> As a participant, you can secure stable returns by staking your funds in the DDMM program. We understand the importance of risk control, and thus, we are committed to providing you with the lowest possible risk level while ensuring substantial returns. Meanwhile, to foster community development and growth, DCPB has minted 3 million shareholder equity NFTs as rewards for individuals actively engaged in community building and promotion. These unique and valuable digital assets will bring additional benefits and privileges to their holders.
        </p>
        <div className='w-full flex justify-center'>
          <VideoPlayer/>
        </div>
        <p className='py-2'> Additionally, DCPB is actively promoting the adoption of cryptocurrency payments worldwide and planning to develop its own public blockchain. This initiative will create extensive use cases and provide users with more opportunities to participate in and benefit from the development of blockchain technology. To support the operation and transactions on the public blockchain, we will also introduce DC Coin as a form of fuel consumption. As the application scenarios for DCPB's public chain expand, the value of DC Coin is expected to rise.
        </p><p className='py-2'> Finally, it's worth emphasizing that holders of DCPB shareholder equity NFTs will be the greatest beneficiaries. In the early stages, DC Coin will only be released to those who possess the NFTs, providing holders with unique advantages and more opportunities. Therefore, join the DCPB platform, participate in our DDMM staking program, and enjoy a 1% daily interest distribution. Also, actively engage in community building to have a chance of acquiring the valuable shareholder equity NFTs and become the prime beneficiaries in DCPB's future development.
        </p><p className='py-2'> Let's stride towards the future and create a broader cryptocurrency world!
        </p>
      </div>
    </div>
  )
}

export default Home