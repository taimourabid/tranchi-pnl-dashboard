const express = require('express');
const fs      = require('fs');
const path    = require('path');
const crypto  = require('crypto');

const app       = express();
const DATA_PATH      = path.join(__dirname, 'data.json');
const DATA_JULY_PATH = path.join(__dirname, 'data_july.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function readData()       { return JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8')); }
function writeData(d)     { fs.writeFileSync(DATA_PATH, JSON.stringify(d, null, 2)); }
function readJuly()       { return JSON.parse(fs.readFileSync(DATA_JULY_PATH, 'utf-8')); }
function writeJuly(d)     { fs.writeFileSync(DATA_JULY_PATH, JSON.stringify(d, null, 2)); }
function uid()            { return crypto.randomUUID(); }

// July dashboard
app.get('/july', (req, res) => res.sendFile(path.join(__dirname, 'public', 'july.html')));

app.get('/july/api/data', (req, res) => res.json(readJuly()));

app.post('/july/api/transactions', (req, res) => {
  const data = readJuly();
  const txn  = { id: uid(), ...req.body, amount: parseFloat(req.body.amount) };
  data.transactions.push(txn);
  writeJuly(data);
  res.json(txn);
});

app.delete('/july/api/transactions/:id', (req, res) => {
  const data = readJuly();
  data.transactions = data.transactions.filter(t => t.id !== req.params.id);
  writeJuly(data);
  res.json({ ok: true });
});

app.post('/july/api/expenses', (req, res) => {
  const data = readJuly();
  const cat  = { id: uid(), label: req.body.label, items: [] };
  data.expenses.push(cat);
  writeJuly(data);
  res.json(cat);
});

app.delete('/july/api/expenses/:id', (req, res) => {
  const data = readJuly();
  data.expenses = data.expenses.filter(e => e.id !== req.params.id);
  writeJuly(data);
  res.json({ ok: true });
});

app.post('/july/api/expenses/:catId/items', (req, res) => {
  const data = readJuly();
  const cat  = data.expenses.find(e => e.id === req.params.catId);
  if (!cat) return res.status(404).json({ error: 'Not found' });
  const item = { id: uid(), name: req.body.name, amount: parseFloat(req.body.amount) };
  cat.items.push(item);
  writeJuly(data);
  res.json(item);
});

app.delete('/july/api/expenses/:catId/items/:itemId', (req, res) => {
  const data = readJuly();
  const cat  = data.expenses.find(e => e.id === req.params.catId);
  if (!cat) return res.status(404).json({ error: 'Not found' });
  cat.items = cat.items.filter(i => i.id !== req.params.itemId);
  writeJuly(data);
  res.json({ ok: true });
});

app.get('/api/data', (req, res) => res.json(readData()));

app.post('/api/transactions', (req, res) => {
  const data = readData();
  const txn  = { id: uid(), ...req.body, amount: parseFloat(req.body.amount) };
  data.transactions.push(txn);
  writeData(data);
  res.json(txn);
});

app.delete('/api/transactions/:id', (req, res) => {
  const data = readData();
  data.transactions = data.transactions.filter(t => t.id !== req.params.id);
  writeData(data);
  res.json({ ok: true });
});

app.post('/api/expenses', (req, res) => {
  const data = readData();
  const cat  = { id: uid(), label: req.body.label, items: [] };
  data.expenses.push(cat);
  writeData(data);
  res.json(cat);
});

app.delete('/api/expenses/:id', (req, res) => {
  const data = readData();
  data.expenses = data.expenses.filter(e => e.id !== req.params.id);
  writeData(data);
  res.json({ ok: true });
});

app.post('/api/expenses/:catId/items', (req, res) => {
  const data = readData();
  const cat  = data.expenses.find(e => e.id === req.params.catId);
  if (!cat) return res.status(404).json({ error: 'Not found' });
  const item = { id: uid(), name: req.body.name, amount: parseFloat(req.body.amount) };
  cat.items.push(item);
  writeData(data);
  res.json(item);
});

app.delete('/api/expenses/:catId/items/:itemId', (req, res) => {
  const data = readData();
  const cat  = data.expenses.find(e => e.id === req.params.catId);
  if (!cat) return res.status(404).json({ error: 'Not found' });
  cat.items = cat.items.filter(i => i.id !== req.params.itemId);
  writeData(data);
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Tranchi P&L running on port ${PORT}`));
