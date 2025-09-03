import React from 'react'
import {useAuth} from "../../context/useAuth.js"
import {Navigate} from "react-router-dom"
const PrivateRoute = ({children}) => {
    const {user, token} = useAuth()
    if(!token || !user?._id){
        return (
            <Navigate to={"/login"} replace/>
        )
    }
  return (
    <div>
      {children}
    </div>
  )
}

export default PrivateRoute
