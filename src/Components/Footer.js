import React from 'react'
import { useNavigate } from 'react-router-dom'
import home from '../Assets/home.png'
import help from '../Assets/help.png'
import locker from '../Assets/locker.png'
import docs from '../Assets/docs.png'
import wallet from '../Assets/wallet.png'
function Footer() {
    const navigate = useNavigate()
  return (
      <div className="footer-main">
        <div className='footer-sub py-3'>
            <img src={home} className='w-10 h-10' onClick={()=>navigate("/")}/>
            <img src={locker}  className='w-10 h-10' onClick={()=>navigate("/stake")}/>
            <img src={docs}  className='w-10 h-10' onClick={()=>navigate("/list")}/>
            <img src={wallet} className='w-10 h-10' onClick={() => navigate("/wallet")} />
            <img src={help}  className='w-10 h-10' onClick={()=>navigate("/affiliate")}/>
        </div>
      </div>
  )
}

export default Footer