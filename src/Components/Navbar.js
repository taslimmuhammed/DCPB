import React from 'react'
import { ConnectWallet } from "@thirdweb-dev/react";

function Navbar({heading}) {
  return (
    <div className='flex justify-between text-white p-3 text-2xl '>
      <div className='pt-1'>{heading}</div>
      <ConnectWallet/>
    </div>
  )
}

export default Navbar