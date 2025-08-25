import React, { createContext, useContext, useEffect, useState } from 'react'
import { LOCALSTORAGE } from '../utils'
import { io } from 'socket.io-client'

const getSocket = ()=>{
    const token = LOCALSTORAGE.get("token")

    const socket = io(import.meta.env.VITE_SOCKET_URI,{
        withCredentials:true,
        auth:{token}
    })

    return socket

}

const SocketContext = createContext(
    {
        socket:null
    }
)

const useSocket = ()=> useContext(SocketContext)

const SocketProvider = ({children})=>{

    const [socket, setSocket ] = useState(null)

    useEffect(()=>{
        setSocket(getSocket())
    },[])

    return (
        <SocketContext.Provider value={{socket}}>
            {children}
        </SocketContext.Provider>
    )

}

export {
   SocketContext,
   useSocket,
   SocketProvider


}
