import React from 'react'
import Footer from '../Components/Footer'
import Navbar from '../Components/Navbar'
import Staking from '../Components/Staking'
import { EthersContext } from '../Contexts/EthersContext'
import { useContext, useEffect } from 'react'
import Connect from '../Components/Connect'
import Loader from '../Components/Loader'
import Login from '../Components/Login'
import Wallet from '../Components/Wallet'

function WalletPage() {
    const { address, SignedIn, L1, L2,L13, L14, L15 } = useContext(EthersContext)
    if (!address) return (<Connect />)
    else if (L1 || L2 || L13 || L14 || L15) return <Loader />
    else if (!SignedIn) return (<Login />)
    else return (
        <div className='pb-32'>
            <Navbar english="Wallet" chinese="钱包"/>
            <Wallet />
            <Footer index={4} />
        </div>
    )
}

export default WalletPage