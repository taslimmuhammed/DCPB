import React from 'react'
import Footer from '../Components/Footer'
import Home from '../Components/Home'
import { EthersContext } from '../Contexts/EthersContext'
import { useContext } from 'react'
import Connect from '../Components/Connect'

function HomePage() {
    return (
      <div>
      <Home/>
      <Footer/>
    </div>
  )
}

export default HomePage