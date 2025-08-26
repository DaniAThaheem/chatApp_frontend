import { LockClosedIcon } from '@heroicons/react/20/solid'
import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Register = () => {
  const [data, setData] = useState(
    {
      email:"",
      username:"",
      password:""
    }
  )
  const {register}  = useAuth()

  const handleDataChange = (name)=>(e)=>{
    setData({
      ...data,
      [name]:e.target.value
  })
  }

  const handleRegister = async() => {await register(data)}
  return (
    <div className=''>
      <h1 className=''>Chat App</h1>
      <div className=''>
        <h1 className="">
          <LockClosedIcon className='' />Register
        </h1>
        <Input
        placeholder ="Enter email..."
        type="email"
        value={data.email}
        onChange={handleDataChange("email")}
         />
        <Input
        placeholder ="Enter username"
        value={data.username}
        onChange={handleDataChange("username")}
        />
        <Input 
        placeholder ="Enter password"
        type="password"
        value={data.password}
        onChange={handleDataChange("password")}
        />
        <Button
        disabled={Object.values(data).some((value)=>!value)}
        fullWidth
        onClick={handleRegister}
        >
          Register
        </Button>
        <small className=''>
          Already have an account?
          <Navigate className="" to={"/login"}>
            Login
          </Navigate>
        </small>

      </div>
    </div>
  )
}

export default Register
