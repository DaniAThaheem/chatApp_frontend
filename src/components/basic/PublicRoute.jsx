import React from 'react'
import { useAuth } from '../../context/useAuth.js'
import { Navigate } from 'react-router-dom'

const PublicRoute = ({children}) => {
    const {user, token} = useAuth()
        if(token && user?._id){
            return (
                <Navigate to={"/chats"} replace/>
            )
        }
  return (
    <div>
      {children}
    </div>
  )
}

export default PublicRoute
