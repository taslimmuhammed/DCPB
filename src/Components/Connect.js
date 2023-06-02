import { ConnectWallet } from '@thirdweb-dev/react'
import React from 'react'
import Footer from './Footer'

function Connect() {
  return (
    <div className='flex flex-col w-full h-screen justify-center text-white'>
       <ConnectWallet/>
      <Footer />
    </div>
  )
}

export default Connect