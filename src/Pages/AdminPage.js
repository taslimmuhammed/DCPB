import React from 'react'
import Footer from '../Components/Footer'
import Navbar from '../Components/Navbar'
import Admin from '../Components/Admin'

function AdminPage() {
  return (
    <div>
      <Navbar heading="Admin Panel" />
      <Admin/>
      <Footer />
    </div>
  )
}

export default AdminPage