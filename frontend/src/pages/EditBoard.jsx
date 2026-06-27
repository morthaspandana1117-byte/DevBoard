import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

function EditBoard() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');

  useEffect(() => {
    const fetchBoardDetails = async () => {
      try {
        const response = await client.get(
          `/boards/${boardId}`
        );

        console.log(response.data);

        setTitle(response.data.title);

      } catch (error) {
        console.log(error.response?.data);
      }
    };

    fetchBoardDetails();
  }, [boardId]);

  const updateBoard = async (e) => {
  e.preventDefault();

  try {
    const response = await client.put(`/boards/${boardId}`, {
      title
    });

    console.log(response.data);
    navigate('/dashboard');
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
      <h1>🖋️Edit Board</h1>

      <form onSubmit={updateBoard}>
        <input
            type="text"
            placeholder="Board Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
        />

        <br /><br />

        <button type="submit">
            Update Board
        </button>
      </form>

      <hr />
    </div>
  );
}

export default EditBoard;