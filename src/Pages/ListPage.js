import React from 'react'
import Footer from '../Components/Footer'
import Navbar from '../Components/Navbar'
import Staking from '../Components/Staking'
import StakingList from '../Components/StakingList'
import { EthersContext } from '../Contexts/EthersContext'
import { useContext } from 'react'
import Connect from '../Components/Connect'
import Loader from '../Components/Loader'
import Login from '../Components/Login'

function ListPage() {
  const { address, SignedIn, L1, L2, L13, L14, L15 } = useContext(EthersContext)
  if (!address) return (<Connect />)
  else if (L1 || L2 || L13 || L14 || L15) return <Loader />
  else if (!SignedIn) return (<Login />)
  else return (
    <div className='pb-32'>
      <Navbar english="Staking List" chinese="资押清单"/>
      <StakingList/>
      <Footer index={3} />
    </div>
  )
}

export default ListPage