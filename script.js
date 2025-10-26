
const taskText = document.getElementById('taskText');
const taskDate = document.getElementById('taskDate');
const taskTime = document.getElementById('taskTime');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskTableBody = document.getElementById('taskTableBody');

const STORAGE_KEY = 'reminderTasks_v2';
let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

// Save tasks in localStorage
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Display all tasks
function renderTasks() {
  taskTableBody.innerHTML = '';

  if (tasks.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 5;
    td.style.opacity = 0.6;
    td.textContent = 'No tasks yet!';
    tr.appendChild(td);
    taskTableBody.appendChild(tr);
    return;
  }

  tasks.forEach(task => {
    const tr = document.createElement('tr');
    tr.className = 'task-row';

    const tdText = document.createElement('td');
    tdText.textContent = task.text;
    tdText.className = task.completed ? 'completed' : 'incomplete';

    const tdDate = document.createElement('td');
    tdDate.textContent = task.date || '-';

    const tdTime = document.createElement('td');
    tdTime.textContent = task.time || '-';

    const tdStatus = document.createElement('td');
    const statusBtn = document.createElement('button');
    statusBtn.className = 'status-btn ' + (task.completed ? 'complete-btn' : 'incomplete-btn');
    statusBtn.textContent = task.completed ? 'Completed' : 'Incomplete';
    statusBtn.addEventListener('click', () => toggleComplete(task.id));
    tdStatus.appendChild(statusBtn);

    const tdDelete = document.createElement('td');
    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '🗑';
    deleteBtn.className = 'delete-btn';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));
    tdDelete.appendChild(deleteBtn);

    tr.appendChild(tdText);
    tr.appendChild(tdDate);
    tr.appendChild(tdTime);
    tr.appendChild(tdStatus);
    tr.appendChild(tdDelete);

    taskTableBody.appendChild(tr);
  });
}

// Add a new task
function addTask() {
  const text = taskText.value.trim();
  if (!text) return;

  const newTask = {
    id: Date.now().toString(),
    text: text,
    date: taskDate.value,
    time: taskTime.value,
    completed: false,
    alerted: false // for reminder alert tracking
  };

  tasks.unshift(newTask);
  saveTasks();
  renderTasks();

  taskText.value = '';
  taskDate.value = '';
  taskTime.value = '';
  taskText.focus();
}

// Toggle completion
function toggleComplete(id) {
  tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
  saveTasks();
  renderTasks();
}

// Delete a task
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

// Check reminders every 30 seconds
function checkReminders() {
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0];
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM

  tasks.forEach(task => {
    if (
      task.date === currentDate &&
      task.time === currentTime &&
      !task.alerted &&
      !task.completed
    ) {
      task.alerted = true;
      saveTasks();
      showReminder(task.text);
    }
  });
}

// Show reminder popup + sound
function showReminder(taskText) {
  const audio = new Audio('https://www.soundjay.com/button/beep-07.wav');
  audio.play();

  alert(Reminder: "${taskText}" is due now!);
}

// Event listeners
addTaskBtn.addEventListener('click', addTask);
taskText.addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });

// Initial render
renderTasks();

// Periodically check for reminders
setInterval(checkReminders, 30000); // check every 30 seconds