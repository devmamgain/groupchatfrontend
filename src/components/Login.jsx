import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login =()=>{
  const link = import.meta.env.VITE_SERVER
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate()
    const handleLogin = async () => {
      try {
        const response = await axios.post(link+'/api/login', { username, password });
        localStorage.setItem('token', response.data.token);
        navigate("/groupcreate")

      } catch (error) {
        console.error('Login failed', error);
      }
    };
  
    return (
      <div className="flex flex-col gap-5 p-5">
        <h1 className="text-3xl font-bold ">Login</h1>

        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button onClick={handleLogin} className='rounded-xl bg-blue-500 p-2  text-white'>Login</button>
      </div>
    );
}

export default Login