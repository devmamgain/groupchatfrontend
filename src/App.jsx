import { useState } from 'react'
import './App.css'
import Login from './components/Login'
import SignUp from './components/SignUP'
import { Route, Routes } from 'react-router-dom'
import GroupCreation from './components/GroupCreation'

function App() {

  return (
    <Routes>
    <Route path='/' element={<div className='flex divide-x-2 gap-5 min-h-screen flex-grow items-center justify-center'><SignUp/> <Login/> </div>}/>
    <Route path='/groupcreate' element={<GroupCreation/>}/>

    </Routes>
  )
}

export default App
