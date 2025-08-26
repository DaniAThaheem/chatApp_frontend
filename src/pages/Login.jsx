import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { LockClosedIcon } from '@heroicons/react/20/solid'
import { Navigate } from 'react-router-dom'


const Login = () => {

  const {login} = useAuth()
  const [data, setData ]= useState(
    {
      email:"",
      password:""
    }
  )

  const handleDataChange = (name)=>(e)=>{
    setData(
      {
        ...data,
        [name]:e.target.value
      }
    )
  }

  const handleLogin = async () =>{
    await login(data)

  } 
  return (
    <div className=''>
      <h1 className=''>Chat App</h1>
      <div className=''>
        <h1 className="">
          <LockClosedIcon className=''/>Login
        </h1>
        <Input
        placeholder ="Enter email..."
        type="email"
        value={data.email}
        onChange={handleDataChange("email")}
         />
        <Input 
        placeholder ="Enter password"
        type="passsword"
        value={data.password}
        onChange={handleDataChange("passsword")}
        />
        <Button
        disabled={Object.values(data).some((value)=>!value)}
        fullWidth
        onClick={handleLogin}
        >
          Register
        </Button>
        <small className=''>
          Don&apos;t have an account?
          <Navigate className="" to={"/register"}>
            Register
          </Navigate>
        </small>

      </div>
    </div>
  )
}

export default Login
