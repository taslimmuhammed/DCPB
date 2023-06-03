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
    const { address, SignedIn, L1, L2 } = useContext(EthersContext)
    if (!address) return (<Connect />)
    else if (L1 || L2) return <Loader />
    else if (!SignedIn) return (<Login />)
    else return (
        <div>
            <Navbar heading="Wallet" />
            <Wallet />
            <Footer />
        </div>
    )
}

export default WalletPage