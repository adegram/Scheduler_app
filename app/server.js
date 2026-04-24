const express = require('express');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4045;

// In-memory store
let tasks = [
  { id: uuidv4(), title: 'Containerize the app', status: 'done', priority: 'high', createdAt: new Date().toISOString() },
  { id: uuidv4(), title: 'Write unit tests', status: 'in-progress', priority: 'medium', createdAt: new Date().toISOString() },
  { id: uuidv4(), title: 'Deploy to production', status: 'todo', priority: 'high', createdAt: new Date().toISOString() },
];

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    port: PORT,
  });
});

// GET all tasks
app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

// POST create task
app.post('/api/tasks', (req, res) => {
  const { title, priority = 'medium' } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }
  const task = {
    id: uuidv4(),
    title: title.trim(),
    status: 'todo',
    priority,
    createdAt: new Date().toISOString(),
  };
  tasks.unshift(task);
  res.status(201).json(task);
});

// PATCH update task status
app.patch('/api/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  const { status, title, priority } = req.body;
  if (status) task.status = status;
  if (title) task.title = title.trim();
  if (priority) task.priority = priority;
  res.json(task);
});

// DELETE task
app.delete('/api/tasks/:id', (req, res) => {
  const idx = tasks.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Task not found' });
  tasks.splice(idx, 1);
  res.status(204).send();
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  ┌─────────────────────────────────────┐`);
  console.log(`  │  TASKBOARD running on port ${PORT}    │`);
  console.log(`  │  http://localhost:${PORT}              │`);
  console.log(`  └─────────────────────────────────────┘\n`);
});
