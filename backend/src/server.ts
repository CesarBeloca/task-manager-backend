import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// const pool = new Pool({
//   user: 'admin',
//   password: 'mysecretpassword',
//   host: 'localhost',
//   port: 5432,
//   database: 'tasksdb',
// });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const initDb = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      completed BOOLEAN DEFAULT FALSE
    )
  `);
  console.log('Database ready');
};
initDb();

app.get('/api/tasks', async (req, res) => {
  console.log('GET /api/tasks - fetching all tasks');
  try {
    const result = await pool.query('SELECT * FROM tasks ORDER BY id ASC');
    console.log(`Found ${result.rows.length} tasks`);
    res.json(result.rows);
  } catch (err) {
    console.error('GET error:', err);
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/tasks', async (req, res) => {
  console.log('POST /api/tasks - body:', req.body);
  const { title } = req.body;
  if (!title) {
    console.log('Rejected: missing title');
    return res.status(400).json({ error: 'Title required' });
  }
  console.log(`Inserting task with title: "${title}"`);
  try {
    const result = await pool.query(
      'INSERT INTO tasks (title) VALUES ($1) RETURNING *',
      [title]
    );
    console.log('Inserted task:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('POST error:', err);
    res.status(500).json({ error: (err as Error).message });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  console.log(`PUT /api/tasks/${req.params.id} - body:`, req.body);
  const { completed } = req.body;
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE tasks SET completed = $1 WHERE id = $2 RETURNING *',
      [completed, id]
    );
    if (result.rowCount === 0) {
      console.log(`Task ${id} not found`);
      return res.status(404).json({ error: 'Task not found' });
    }
    console.log(`Updated task ${id}: completed = ${completed}`);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('PUT error:', err);
    res.status(500).json({ error: (err as Error).message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  console.log(`DELETE /api/tasks/${req.params.id}`);
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      console.log(`Task ${id} not found for deletion`);
      return res.status(404).json({ error: 'Task not found' });
    }
    console.log(`Deleted task ${id}`);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error('DELETE error:', err);
    res.status(500).json({ error: (err as Error).message });
  }
});

app.listen(port, () => console.log(`Backend running on http://localhost:${port}`));
