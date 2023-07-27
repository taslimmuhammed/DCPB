import React from 'react'
import { useNavigate } from 'react-router-dom'
import home from '../Assets/home.png'
import help from '../Assets/help.png'
import locker from '../Assets/locker.png'
import docs from '../Assets/docs.png'
import wallet from '../Assets/wallet.png'
function Footer({index}) {
    const navigate = useNavigate()
  return (
      <div className="footer-main">
        <div className='footer-sub py-3'>
            <img src={home} className={index==1? "w-12 h-12": "w-8 h-8 mt-2"} onClick={()=>navigate("/")}/>
            <img src={locker}  className={index==2? "w-12 h-12": "w-8 h-8 mt-2"} onClick={()=>navigate("/stake")}/>
            <img src={docs}  className={index==3? "w-12 h-12": "w-8 h-8 mt-2"} onClick={()=>navigate("/list")}/>
            <img src={wallet} className={index==4? "w-12 h-12": "w-8 h-8 mt-2"} onClick={() => navigate("/wallet")} />
            <img src={help}  className={index==5? "w-12 h-12": "w-8 h-8 mt-2"} onClick={()=>navigate("/affiliate")}/>
        </div>
      </div>
  )
}

export default Footer