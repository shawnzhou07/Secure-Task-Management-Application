import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Register from "./Register"
import Login from './Login'
import Tasks from './Tasks'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/tasks" element={<Tasks />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App