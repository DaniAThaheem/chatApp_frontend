import React, { useState } from 'react'
import { useAuth } from '../context/useAuth.js'
import { LockClosedIcon } from '@heroicons/react/20/solid'
import { Link } from 'react-router-dom'
import Input from '../components/basic/Input'
import Button from '../components/basic/Button'


const Login = () => {

  const {login} = useAuth()
  const [data, setData ]= useState(
    {
      email:"",
      password:""
    }
  )

  const handleDataChange = (name)=>(e)=>{
    console.log("Clicked")
    setData(
      {
        ...data,
        [name]:e.target.value
      }
    )
    console.log(data)
  }

  const handleLogin =  (e) =>{
    e.preventDefault()
    console.log("Clicked in handleLogin")
    login(data)
    .then(()=>{
      console.log("Its running")
    })
    .catch((err)=>{
      console.log("facing error", err)
    })

  } 
  return (
    <div className=' flex justify-center items-center flex-col h-screen w-screen pt-15'>
      <h1 className=' text-3xl font-bold '>Chat App</h1>
      <form onSubmit={handleLogin} className='max-w-5xl w-1/2 p-8 flex justify-center items-center gap-5 flex-col bg-dark shadow-md rounded-2xl my-16 border-secondary border-[1px]'>
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
        type="password"
        value={data.password}
        onChange={handleDataChange("password")}
        />
        <Button
        type="submit"
        disabled={Object.values(data).some((value)=>!value)}
        fullWidth
        >
          Login
        </Button>
        <small className='text-zinc-300'>
          Don&apos;t have an account?{" "}
          <Link className="text-primary hover:underline" to={"/register"}>
            Register
          </Link>
        </small>

      </form>
    </div>
  )
}

export default Login
