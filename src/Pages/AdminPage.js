import Footer from '../Components/Footer'
import Navbar from '../Components/Navbar'
import Admin from '../Components/Admin'
import { EthersContext } from '../Contexts/EthersContext'
import { useContext } from 'react'
import Connect from '../Components/Connect'
import Loader from '../Components/Loader'
import Login from '../Components/Login'

function AdminPage() {
  const { address, SignedIn, L1, L2, L13, L14, L15 } = useContext(EthersContext)
  if (!address) return (<Connect />)
  else if (L1 || L2 ||L13 || L14 || L15) return <Loader />
  else if (!SignedIn) return (<Login />)
  else return (
    <div className='pb-32'>
      <Navbar heading="Admin Panel" />
      <Admin/>
      <Footer />
    </div>
  )
}

export default AdminPage