import './App.css'
import Chat from './pages/Chat'
import Login from './pages/Login'
import Register from './pages/Register'
import { useAuth } from './context/useAuth.js'
import { Routes, Route, Navigate,  } from 'react-router-dom'
import PublicRoute from "./components/basic/PublicRoute"
import PrivateRoute from "./components/basic/PrivateRoute"

function App() {
  const {user, token} = useAuth()

  return (
    <>
      <Routes>
        <Route
        path='/'
        element={
          token && user?
          <Navigate to={"/chats"} />
          :
          <Navigate to ={"/login"} />
        }
        >
        </Route>

        <Route
        path='/chats'
        element={
          <PrivateRoute>
            <Chat />
          </PrivateRoute>
        }
        />
        <Route
        path='/login'
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
        />
        <Route
        path='/register'
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
        />
        <Route
        path='*'
        element={
          <p>
            Page Not Found
          </p>
        }
        />
      </Routes>
    </>
  )
}

export default App
