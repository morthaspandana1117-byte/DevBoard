import { useState } from 'react';
import client from '../api/client';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const handleSubmit = async (e) => {
   e.preventDefault();

    try {
        const response = await client.post(
        '/auth/login',
        {
            email,
            password,
        }
        );

        console.log(response.data);
        localStorage.setItem(
            'token',
            response.data.token
        );

        navigate('/dashboard');

    } catch (error) {
        console.log(error.response?.data);

        alert(
        error.response?.data?.message ||
        'Login Failed'
        );
    }
  };

  return (
  <div>
    <h1>Login</h1>

    <form onSubmit ={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) =>
          setEmail(e.target.value)
        }
      />

      <br /><br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
      />

      <br /><br />

      <button type="submit">
        Login
      </button>
    </form>
  </div>
);
}

export default Login;