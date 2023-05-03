import io from 'socket.io-client';
import { useEffect, useState } from 'react';
import shortid from 'shortid';
import clsx from 'clsx';

const App = () => {
  const [socket, setSocket] = useState('')
  const [tasks, setTasks] = useState([])
  const [taskName, setTaskName] = useState('')
  const [action, setAction] = useState('add')
  const [editedName, setEditedName] = useState('')
  const [editedId, setEditedId] = useState('')

  console.log(tasks)

  useEffect(() => {
    const socketInitial = io("http://localhost:8000")
    setSocket(socketInitial);
    socketInitial.on('addTask', (taskData) => addTask(taskData))
    socketInitial.on('editTask', (taskData) => editTask(taskData))
    socketInitial.on('removeTask', (taskId, fromServer) => removeTask(taskId, fromServer))
    socketInitial.on('updateData', (tasks) => setTasks(tasks))
  }, []);

  console.log(tasks)

  const removeTask = (taskId, fromServer) => {
    setTasks(tasks => tasks.filter(task => task.id !== taskId))
    if (!fromServer) {
      socket.emit('removeTask', taskId)
    }
  }

  const addTask = (taskData) => {
    setTasks(tasks => [...tasks, taskData])
  }

  const editTask = (taskData) => {
    const updatedTasksArr = tasks.map(task =>
      task.id === taskData.id ?
        { ...task, name: taskData.name } :
        task
    );
    setTasks(updatedTasksArr);
  }

  const handleRemoveClick = (e, taskId) => {
    e.preventDefault();
    removeTask(taskId)
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const taskData = { name: taskName, id: shortid() };
    addTask(taskData);
    console.log(taskData)
    socket.emit('addTask', taskData);
    setTaskName('')
  }

  const handleEditClick = (e, taskId) => {
    e.preventDefault();
    setAction('edit');
    setEditedId(taskId)
  }

  const handleEditFormSubmit = (e) => {
    e.preventDefault();
    const taskData = { name: editedName, id: editedId };
    editTask(taskData)
    setAction('add')
    setEditedId('')
    setEditedName('')
    socket.emit('editTask', taskData);
  }


  return (
    <div className="App">

      <header>
        <h1>ToDoList.app</h1>
      </header>

      <section className="tasks-section" id="tasks-section">
        <h2>Tasks</h2>

        <ul className="tasks-section__list" id="tasks-list">
          {tasks.map(task => (
            <li key={task.id} className={clsx('task', task.id === editedId && 'edited')}>
              {task.name}
              <div className='buttons'>
                <button onClick={(e) => handleRemoveClick(e, task.id)} className="btn btn--red">Remove</button>
                <button onClick={(e) => handleEditClick(e, task.id)} className="btn">Edit</button>
              </div>
            </li>
          ))}
        </ul>
        {action === 'add' &&
          <form id="add-task-form" onSubmit={handleSubmit}>
            <input value={taskName} onChange={(e) => setTaskName(e.target.value)} className="text-input" autoComplete="off" type="text" placeholder="Type taske name" id="task-name" />
            <button className="btn" type="submit">Add</button>
          </form>}
        {action === 'edit' &&
          <form id="add-task-form" onSubmit={handleEditFormSubmit}>
            <input value={editedName} onChange={(e) => setEditedName(e.target.value)} className="text-input" autoComplete="off" type="text" placeholder="Type edited name" />
            <button className="btn" type="submit">Confirm change</button>
          </form>}

      </section>
    </div >
  );
}

export default App;
