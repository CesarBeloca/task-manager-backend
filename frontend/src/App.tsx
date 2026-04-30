import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

const API = 'http://localhost:5000/api';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    axios.get(`${API}/tasks`).then(res => setTasks(res.data));
  }, []);

  const addTask = async () => {
    if (!newTask.trim()) return;
    const res = await axios.post(`${API}/tasks`, { title: newTask });
    setTasks([...tasks, res.data]);
    setNewTask('');
  };

  const toggleTask = async (id: number, completed: boolean) => {
    await axios.put(`${API}/tasks/${id}`, { completed: !completed });
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !completed } : t));
  };

  const deleteTask = async (id: number) => {
    await axios.delete(`${API}/tasks/${id}`);
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
      <div style={{ padding: '2rem', maxWidth: '500px', margin: '0 auto' }}>
        <h1>Task Manager</h1>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input
              style={{ flex: 1, padding: '0.5rem' }}
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTask()}
          />
          <button onClick={addTask} style={{ padding: '0.5rem 1rem' }}>Add</button>
        </div>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {tasks.map(task => (
              <li key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id, task.completed)}
                />
                <span style={{ flex: 1, textDecoration: task.completed ? 'line-through' : 'none' }}>
              {task.title}
            </span>
                <button onClick={() => deleteTask(task.id)} style={{ color: 'red' }}>Delete</button>
              </li>
          ))}
        </ul>
      </div>
  );
}

export default App;
