import { EthersContext } from '../Contexts/EthersContext'
import { useContext } from 'react'
import Footer from '../Components/Footer'
import Navbar from '../Components/Navbar'
import Affiliate from '../Components/Affiliate'
import Connect from '../Components/Connect'
import Loader from '../Components/Loader'
import Login from '../Components/Login'

function AffiliatePage() {
  const { address, SignedIn, L1, L2, L13, L14, L15, L16 } = useContext(EthersContext)
  if (!address) return (<Connect />)
  else if (L1 || L2 || L13 || L14 || L15 ||L16) return <Loader />
  else if (!SignedIn) return (<Login />)
  else return (
    <div className='pb-32'>
      <Navbar english="Community" chinese="社区"/>
          <Affiliate/>
         <Footer index={5} />
    </div>
  )
}

export default AffiliatePage