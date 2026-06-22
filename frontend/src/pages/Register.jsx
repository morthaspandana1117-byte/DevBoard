import { useState } from 'react';
import client from '../api/client';


function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await client.post(
      '/auth/register',
      {
        name,
        email,
        password,
      }
    );

    console.log(response.data);

    alert('Registration Successful');

  } catch (error) {
    console.log(error.response?.data);

    alert(
      error.response?.data?.message ||
      'Registration Failed'
    );
  }
};

  return (
    <div>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) =>
            setName(e.target.value)
            }
        />

        <br /><br />

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
            Register
        </button>

      </form>
    </div>
  );
}

export default Register;