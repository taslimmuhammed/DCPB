import React from 'react'
import Footer from '../Components/Footer'
import Navbar from '../Components/Navbar'
import Staking from '../Components/Staking'

function StakingPage() {
  return (
      <div>
        <Navbar heading="USDT Staking" />
        <Staking/>
        <Footer />
      </div>
  )
}

export default StakingPage