import React from 'react'
import Footer from '../Components/Footer'
import Home from '../Components/Home'
import { EthersContext } from '../Contexts/EthersContext'
import { useContext } from 'react'
import Connect from '../Components/Connect'

function HomePage() {
    return (
      <div className= 'pb-32'>
      <Home/>
      <Footer index={1}/>
    </div>
  )
}

export default HomePage