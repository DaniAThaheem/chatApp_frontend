import { LockClosedIcon } from '@heroicons/react/20/solid'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'
import Input from '../components/basic/Input'
import Button from '../components/basic/Button'

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
    <div className='flex justify-center items-center flex-col h-screen w-screen overflow-y-auto '>
      <h1 className=' box-border text-3xl font-bold pt-30'>Chat App</h1>
      <form className='max-w-5xl w-1/2 p-8 flex justify-center items-center gap-5 flex-col bg-dark shadow-md rounded-2xl my-16 border-secondary border-[1px]'>
        <h1 className="inline-flex items-center text-2xl mb-4 flex-col">
          <LockClosedIcon className='h-8 w-8 mb-2' />Register
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
        <small className='text-zinc-300'>
          Already have an account?{" "}
          <Link className="text-primary hover:underline" to={"/login"}>
            Login
          </Link>
        </small>

      </form>
    </div>
  )
}

export default Register
