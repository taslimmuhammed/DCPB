import React from 'react'
import Footer from '../Components/Footer'
import Navbar from '../Components/Navbar'
import Staking from '../Components/Staking'
import StakingList from '../Components/StakingList'

function ListPage() {
  return (
    <div>
      <Navbar heading="Staking List" />
      <StakingList/>
      <Footer />
    </div>
  )
}

export default ListPage