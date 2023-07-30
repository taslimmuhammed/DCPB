import React, { useContext } from 'react'
import { ConnectWallet } from "@thirdweb-dev/react";
import { EthersContext } from '../Contexts/EthersContext';

function Navbar(props) {
  const {chinese} = useContext(EthersContext)
  return (
    <div className='flex justify-between text-white p-3  '>
      <div className='pt-3 text-2xl' >{chinese?props.chinese:props.english}</div>
      <ConnectWallet/>
    </div>
  )
}

export default Navbar