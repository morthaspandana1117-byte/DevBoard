import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import client from '../api/client';

function BoardDetails() {
  const { boardId } = useParams();

  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await client.get(
          `/tasks/board/${boardId}`
        );

        console.log(response.data);

        setTasks(response.data);

      } catch (error) {
        console.log(error.response?.data);
      }
    };

    fetchTasks();
  }, [boardId]);

  const createTask = async (e) => {
  e.preventDefault();

  try {
    const response = await client.post('/tasks', {
      title,
      description,
      board: boardId,
    });

    console.log(response.data);

    setTasks([...tasks, response.data]);
    setTitle('');
    setDescription('');

  } catch (error) {
    console.log(error.response?.data);
  }
};

  return (
    <div>
      <h1>Board Details</h1>

      <form onSubmit={createTask}>
        <input
            type="text"
            placeholder="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
        />

        <br /><br />

        <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
        />

        <br /><br />

        <button type="submit">
            Create Task
        </button>
      </form>

      <hr />
      <h3>Tasks</h3>

      {tasks.map((task) => (
        <div key={task._id}>
          <p>{task.title}</p>
        </div>
      ))}
    </div>
  );
}

export default BoardDetails;