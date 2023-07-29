import React, { useContext } from 'react'
import copy from '../Assets/copy.svg'
import { EthersContext } from '../Contexts/EthersContext'
import VideoPlayer from './VideoPlayer'
import logo from '../Assets/logo.jpg'
import { ConnectWallet } from '@thirdweb-dev/react'
import { shortenAddress } from '../Utils/Utils'
import book from '../Assets/book.png'
import { LangArray } from '../Utils/Language'
function Home() {
  const { address, Chinese, setChinese } = useContext(EthersContext)
  return (
    <div className='p-2 home'>
      <div className='flex justify-between  py-3'>
        {/* <div className='golden-gradient py-2 px-4 rounded-sm font-semibold text-xl'> DCPB</div> */}
        <img src={logo} className='h-9'/>

        {address?<div className='bg-stone-700  py-1 px-2 font-semibold flex text-lg rounded-md'>
          ID = {shortenAddress(address)}
          <img onClick={() => { navigator.clipboard.writeText(address) }} src={copy} className='w-6 h-6 hoven:w-5 hover:h-5'></img>
        </div>:<ConnectWallet/>}
        <img className='w-10' src={book}></img>
        <div className='border border-fuchsia-600 border-2 w-12 text-center py-1 rounded-md' onClick={()=>setChinese(!Chinese)}>{Chinese?"ENG":"CHN"}</div>
      </div>
      <div className='text-xs'>
        <p className='py-2 '> {Chinese ? LangArray[1] : LangArray[0]}
        </p><p className='py-2'> {Chinese ? LangArray[3] : LangArray[2]}
        </p><p className='py-2'> {Chinese ? LangArray[5] : LangArray[4]}
        </p>
        <div className='w-full flex justify-center py-20'>
          <VideoPlayer/>
        </div>
        <p className='py-2'> {Chinese ? LangArray[7] : LangArray[6]}
        </p><p className='py-2'> {Chinese ? LangArray[9] : LangArray[8]}
        </p><p className='py-2'> {Chinese ? LangArray[11] : LangArray[10]}
        </p>
      </div>
    </div>
  )
}

export default Home