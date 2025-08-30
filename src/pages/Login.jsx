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
    <div className=' flex justify-center items-center flex-col h-screen w-screen '>
      <h1 className=' text-3xl font-bold '>Chat App</h1>
      <div className='max-w-5xl w-1/2 p-8 flex justify-center items-center gap-5 flex-col bg-dark shadow-md rounded-2xl my-16 border-secondary border-[1px]'>
        <h1 className="inline-flex items-center text-2xl mb-4 flex-col">
          <LockClosedIcon className='h-8 w-8 mb-2 '/>Login
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
        <small className='text-zinc-300'>
          Don&apos;t have an account?
          <Navigate className="text-primary hover:underline" to={"/register"}>
            Register
          </Navigate>
        </small>

      </div>
    </div>
  )
}

export default Login
