const express = require('express');
const path = require('path');
const socket = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
let tasks = [];

app.use(express.static(path.join(__dirname, '/client')));

app.use((req, res) => {
  res.status(404).json({ message: 'not found' });
})

const server = app.listen(process.env.PORT || 8000, () => {
  console.log('Server is running on port: 8000');
});

const io = socket(server);
io.on('connection', (socket) => {
  io.to(socket.id).emit('updateData', tasks);
  console.log(tasks)
  socket.on('addTask', (task) => {
    socket.broadcast.emit('addTask', task);
    tasks.push(task)
    console.log('New task add, new task list: ', tasks);
  })
  socket.on('removeTask', (taskId) => {
    tasks = tasks.filter(task => task.id !== taskId)
    socket.broadcast.emit('removeTask', taskId, fromServer = (true));
    console.log(taskId - 'task removed');
  })
  socket.on('editTask', (editedTask) => {
    socket.broadcast.emit('editTask', editedTask);
    tasks = tasks.map(task =>
      task.id === editedTask.id ?
        { ...task, name: editedTask.name } :
        task
    );
    console.log('Changed task, new task list: ', tasks);
  })

});

server.prependListener("request", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
});