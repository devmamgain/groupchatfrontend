import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignUp = ()=>{
  const link = import.meta.env.VITE_SERVER

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
     const navigate = useNavigate()
    const handleSignup = async () => {
      try {
        const response = await axios.post(link+'/api/register', { username, password });
        localStorage.setItem('token', response.data.token);
        navigate("/groupcreate")
      } catch (error) {
        console.error('Singup', error);
      }
    };
  
    return (
      <div className="flex flex-col gap-5 ">
        <h1 className="text-3xl font-bold ">SignUp</h1>
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button onClick={handleSignup} className='rounded-xl bg-blue-500 p-2  text-white'>Signup</button>
      </div>
    );
}

export default SignUp