import React from 'react'
import { ConnectWallet } from "@thirdweb-dev/react";

function Navbar({heading}) {
  return (
    <div className='flex justify-between text-white p-3  '>
      <div className='pt-3 text-3xl'>{heading}</div>
      <ConnectWallet/>
    </div>
  )
}

export default Navbar