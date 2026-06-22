function Dashboard() {
  const token = localStorage.getItem('token');

  return (
    <div>
      <h1>Dashboard</h1>

      <p>Token Exists:</p>

      <pre>{token}</pre>
    </div>
  );
}

export default Dashboard;``