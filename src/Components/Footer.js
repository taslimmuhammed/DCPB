import React from 'react'
import { useNavigate } from 'react-router-dom'
import home from '../Assets/home.png'
import help from '../Assets/help.png'
import locker from '../Assets/locker.png'
import docs from '../Assets/docs.png'

function Footer() {
    const navigate = useNavigate()
  return (
      <div className="footer-main">
        <div className='footer-sub py-3'>
            <img src={home} className='w-12 h-12' onClick={()=>navigate("/")}/>
            <img src={locker}  className='w-12 h-12' onClick={()=>navigate("/stake")}/>
            <img src={docs}  className='w-12 h-12' onClick={()=>navigate("/list")}/>
            <img src={help}  className='w-12 h-12' onClick={()=>navigate("/affiliate")}/>
        </div>
      </div>
  )
}

export default Footer