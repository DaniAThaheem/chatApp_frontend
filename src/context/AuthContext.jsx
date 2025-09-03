import React, {useState, useEffect, createContext} from 'react'
import { LOCALSTORAGE, requestHandler } from '../utils'
import {registerUser, loginUser, logoutUser} from "../api/index.js"
import { useNavigate } from 'react-router-dom'
import Loader from "../components/basic/Loader.jsx"


const AuthContext = createContext(
    {
        user:null,
        token:null,
        login:()=>{},
        logout:()=>{},
        register:()=>{}
    }
)




const AuthProvider = (
    {children}
) =>{

    const [isLoading, setIsLoading] = useState(false)
    const [ user, setUser] = useState(null)
    const [token, setToken] = useState(null)

    const navigate = useNavigate()

    const login = async (data)=>{
        console.log("iin the login section")
        await requestHandler(
            async()=> await loginUser(data),
            setIsLoading,
            (res)=>{
                console.log(res, "response in login")
                const resonseData = res.data
                console.log(resonseData, "response data is here")
                const data = resonseData[0]
                console.log(data, "data is here")
                console.log(data, "data in login")
                setUser(data.user)
                setToken(data.accessToken)
                LOCALSTORAGE.set("user", data.user)
                LOCALSTORAGE.set("token", data.accessToken)
                navigate("/chats")
            },
            alert
        )
    }
    const register = async (data)=>{
        await requestHandler(
            async()=> await registerUser(data),
            setIsLoading,
            ()=>{
                
                alert("Account created successfully, Go ahead and login")
                navigate("/login")
            },
            alert
        )
    }
    const logout = async ()=>{
        await requestHandler(
            async()=> await logoutUser(),
            setIsLoading,
            ()=>{
                
                setUser(null)
                setToken(null)
                LOCALSTORAGE.clear()
                navigate("/login")
            },
            alert
        )
    }


    useEffect(()=>{
        setIsLoading(true)
        const _user = LOCALSTORAGE.get("user")
        const _token = LOCALSTORAGE.get("token")
        if(_user && _token){
            setUser(_user)
            setToken(_token)
        }
        setIsLoading(false)
    },[])
    

    return (
    <AuthContext.Provider value={{login, logout, register, user, token}}>
        {isLoading ? <Loader/> : children}
    </AuthContext.Provider>
    )
}

export {
    AuthContext,
    AuthProvider
}
























// const AuthContext = () => {
//   return (
//     <div>
      
//     </div>
//   )
// }

// export default AuthContext
