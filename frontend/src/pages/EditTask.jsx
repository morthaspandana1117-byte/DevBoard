import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

function EditTask() {
  const { taskId, boardId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        const response = await client.get(
          `/tasks/${taskId}`
        );

        console.log(response.data);

        setTitle(response.data.title);

      } catch (error) {
        console.log(error.response?.data);
      }
    };

    fetchTaskDetails();
  }, [taskId]);

  const updateTask = async (e) => {
  e.preventDefault();

  try {
    const response = await client.put(`/tasks/${taskId}`, {
      title
    });

    console.log(response.data);
    navigate(`/boards/${boardId}`);
  } catch (error) {
    console.log(error.response?.data);

    alert(
        error.response?.data?.message ||
        'Update Failed'
        );
  }
};

  return (
    <div>
      <h1>🖋️Edit Task</h1>

      <form onSubmit={updateTask}>
        <input
            type="text"
            placeholder="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
        />

        <br /><br />

        <button type="submit">
            Update Task
        </button>
      </form>

      <hr />
    </div>
  );
}

export default EditTask;