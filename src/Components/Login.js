import React, { useContext, useState } from 'react'
import { EthersContext } from '../Contexts/EthersContext'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import Loader from '../Components/Loader'
import { useContractWrite } from '@thirdweb-dev/react'
import Footer from './Footer'
import Navbar from './Navbar'

function Login() {
    const [RefId, setRefId] = useState("")
    const navigate = useNavigate()
    const [isLoading, setisLoading] = useState(false)
    const { tokenContract, contract } = useContext(EthersContext)
    const { mutateAsync: signIn } = useContractWrite(contract, "signIn")
    const handleSignIn = async () => {
        setisLoading(true)
        try {
            let temp = RefId;
            if (temp == "" || temp== null || temp==undefined || temp=="0") temp = "0x0000000000000000000000000000000000000000"
            const data = await signIn({ args: [temp] });
            console.info("contract call successs", data);
            navigate("/stake")
        } catch (e) {
            toast.error("Something went wrong try again after refreshing")
        }
        setisLoading(false)
    }
    if (isLoading) return <Loader />
    else return (
        <div>
            <Navbar heading="Sign In"/>
        <div className='flex flex-col w-full h-screen justify-center text-white'>
            <label className="text-sm text-stone-500 mb-2" >
                Referal Id[Optional]:
            </label>
            <input
                className="px-3 py-4 pl-10 bg-stone-800"
                placeholder="0x000000000000000000000000000"
                onChange={(e) => setRefId(e.target.value)}
            />
            <div className='mt-5 w-full text-center bg-stone-600 text-yellow-400 font-bold text-2xl p-2 hover:bg-stone-700'
                onClick={handleSignIn}>
                Sign In
            </div>
            <Footer />
        </div></div>
    )
}

export default Login