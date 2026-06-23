import { useEffect, useState } from 'react';
import client from '../api/client';

function Dashboard() {
  const [boards, setBoards] = useState([]);
  const [title, setTitle] = useState('');

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const response = await client.get('/boards');

        setBoards(response.data);
      } catch (error) {
        console.log(error.response?.data);
      }
    };

    fetchBoards();
  }, []);

  const createBoard = async(e) => {
    e.preventDefault();

    try{
      const response = await client.post(
        '/boards',
        {
          title,
        }
      );

      console.log(response.data);

      setBoards([...boards, response.data]);
      setTitle('');
    } catch(error){
      console.log(error.response?.data);
    }
  };

  return (
    <div>
      <h1>Dashboard</h1>

      <form onSubmit={createBoard}>
          <input
              type="text"
              placeholder="Enter title name"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
          />

          <button type="Submit">
            Create Board
          </button>

      </form>
      
      {boards.map((board) => (
        <div key={board._id}>
          <h3>{board.title}</h3>
        </div>
      ))}
    </div>
  );
}

export default Dashboard;