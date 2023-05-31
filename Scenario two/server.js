require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Pending incoming messages
let messages = [
  'Hello!',
  'Our secret appointment is at 3pm.',
  'You must not tell anyone about this.'
];

let users = [
  {
    username: 'user1',
    hash: bcrypt.hashSync('password1', 10)
  },
  {
    username: 'admin',
    hash: '$2b$10$XzsGndHIAfHTBrbb.NcQWuDqVohBcRgkHvsNXCKuZuaAQm4HIVvoC'
  }
];

const validateAuthentication = (req) => {
  console.log('Validating authentication');
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies._token;

  try {
    const payload = jwt.verify(token, process.env.SECRET_KEY);
    return true;
  } catch (e) {
    return false;
  }
}

app.get('/', (req, res) => {


  if (validateAuthentication(req)) {
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies._token;
    const payload = jwt.decode(token);
    res.send(`<h1>Welcome, ${payload.username}!</h1>`);
  } else {
    res.send(`
      <form action="/login" method="post">
        <label for="username">Username:</label><br>
        <input type="text" id="username" name="username"><br>
        <label for="password">Password:</label><br>
        <input type="password" id="password" name="password">
        <input type="submit" value="Submit">
      </form>
    `);
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = users.find(user => user.username === username);

  if (!user) {
    return res.status(400).send('User not found');
  }

  const match = await bcrypt.compare(password, user.hash);

  if (!match) {
    return res.status(401).send('Invalid password');
  }

  const token = jwt.sign({ username: user.username }, process.env.SECRET_KEY);

  res.cookie('_token', token, { httpOnly: true , sameSite: 'none'});
  res.send('Login successful');
});

wss.on('connection', (ws, req) => {
  if (!validateAuthentication(req)) {
    console.error('Invalid authentication');
    ws.close();
    return;
  }

  console.log('New client connected');

  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies._token;
  const payload = jwt.decode(token);

  ws.send(`Welcome, ${payload.username}!`);
  messages.forEach((msg) => {
    ws.send(msg);
  });

  ws.on('message', (message) => {
    console.log(`Received message => ${message}`);
    ws.send(`You sent => ${message}`);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

server.listen(3000, () => {
  console.log('Server started on port 3000');
});
