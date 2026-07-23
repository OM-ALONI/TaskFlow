/* ================================================================
   TASKFLOW – Modern To-Do List Application
   Complete JavaScript – All Features
   
   Core: loadTasks, saveTasks, addTask, deleteTask, editTask,
         completeTask, renderTasks, filterTasks, sortTasks,
         searchTasks, updateStatistics, displayToast
   
   New:  toggleDarkMode, initCalendar, initQuotes, initPomodoro,
         initDragDrop, checkStreak, checkAchievements,
         updateWeeklyChart, updateDashboard, initLoadingScreen,
         initShortcuts, etc.
   ================================================================ */

(function () {
  'use strict';

  // ===================== STATE =====================
  let tasks = [];
  let deletedTasks = [];
  let activeTab = 'all';
  let editingId = null;
  let deleteTargetId = null;
  let achievements = {};

  // Pomodoro state
  let pomoInterval = null;
  let pomoSeconds = 25 * 60;
  let pomoTotalSeconds = 25 * 60;
  let pomoRunning = false;
  let pomoMode = 'focus'; // 'focus' | 'break'

  // ===================== DOM ELEMENTS =====================
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const taskForm       = $('#task-form');
  const taskInput      = $('#task-input');
  const taskDate       = $('#task-date');
  const taskPriority   = $('#task-priority');
  const taskCategory   = $('#task-category');
  const taskNotesInput = $('#task-notes');
  const errorMsg       = $('#error-msg');
  const taskList       = $('#task-list');
  const emptyState     = $('#empty-state');
  const searchInput    = $('#search-input');
  const filterPriority = $('#filter-priority');
  const filterCategory = $('#filter-category');
  const sortSelect     = $('#sort-tasks');
  const tabButtons     = $$('.tab-btn');
  const toastContainer = $('#toast-container');
  const modalOverlay   = $('#modal-overlay');
  const modalCancel    = $('#modal-cancel');
  const modalDelete    = $('#modal-delete');
  const modalText      = $('#modal-text');
  const modalTitle     = $('#modal-title');
  const navbar         = $('#navbar');
  const hamburger      = $('#hamburger');
  const navLinks       = $('#nav-links');
  const startBtn       = $('#start-btn');
  const backToTop      = $('#back-to-top');
  const themeToggle    = $('#theme-toggle');
  const fab            = $('#fab');
  const loadingScreen  = $('#loading-screen');
  const emptyCreateBtn = $('#empty-create-btn');
  const recycleControls = $('#recycle-controls');
  const emptyBinBtn    = $('#empty-bin-btn');
  const shortcutsOverlay = $('#shortcuts-overlay');
  const shortcutsBtn   = $('#shortcuts-btn');
  const shortcutsClose = $('#shortcuts-close');
  const achievementOverlay = $('#achievement-overlay');
  const achievementClose = $('#achievement-close');

  // Stats
  const statTotal     = $('#stat-total');
  const statCompleted = $('#stat-completed');
  const statPending   = $('#stat-pending');
  const statPercent   = $('#stat-percent');

  // Progress
  const progressFill   = $('#progress-fill');
  const progressPercent = $('#progress-percent');

  // Timer
  const timerTime    = $('#timer-time');
  const timerStatus  = $('#timer-status');
  const timerProgress = $('#timer-progress');
  const timerStart   = $('#timer-start');
  const timerPause   = $('#timer-pause');
  const timerReset   = $('#timer-reset');

  // ===================== QUOTES ARRAY (30+) =====================
  const quotes = [
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "It is not enough to be busy. The question is: what are we busy about?", author: "Henry David Thoreau" },
    { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
    { text: "Until we can manage time, we can manage nothing else.", author: "Peter Drucker" },
    { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
    { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
    { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
    { text: "Amateurs sit and wait for inspiration. The rest of us just get up and go to work.", author: "Stephen King" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "Productivity is never an accident. It is always the result of commitment to excellence.", author: "Paul J. Meyer" },
    { text: "Your future is created by what you do today, not tomorrow.", author: "Robert Kiyosaki" },
    { text: "A year from now you may wish you had started today.", author: "Karen Lamb" },
    { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
    { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
    { text: "Do the hard jobs first. The easy jobs will take care of themselves.", author: "Dale Carnegie" },
    { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
    { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
    { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
    { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
    { text: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt" },
    { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
    { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
    { text: "Dream big. Start small. Act now.", author: "Robin Sharma" },
    { text: "Your limitation—it's only your imagination.", author: "Unknown" },
    { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
    { text: "Great things never come from comfort zones.", author: "Unknown" },
    { text: "Success doesn't just find you. You have to go out and get it.", author: "Unknown" },
    { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" },
    { text: "Dream it. Wish it. Do it.", author: "Unknown" },
    { text: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown" },
    { text: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery" },
    { text: "Little things make big days.", author: "Unknown" },
    { text: "It's going to be hard, but hard does not mean impossible.", author: "Unknown" }
  ];

  // ===================== ACHIEVEMENTS DEFINITIONS =====================
  const achievementsDef = [
    { id: 'first_task', name: 'First Step', desc: 'Create your first task', icon: 'fa-star', check: () => tasks.length >= 1 },
    { id: 'completed_10', name: 'Getting Started', desc: 'Complete 10 tasks', icon: 'fa-check-circle', check: () => getTotalCompletedEver() >= 10 },
    { id: 'completed_50', name: 'Productivity Pro', desc: 'Complete 50 tasks', icon: 'fa-trophy', check: () => getTotalCompletedEver() >= 50 },
    { id: 'streak_7', name: 'Week Warrior', desc: 'Maintain a 7-day streak', icon: 'fa-fire', check: () => getCurrentStreak() >= 7 },
    { id: 'completed_100', name: 'Century Club', desc: 'Complete 100 tasks', icon: 'fa-crown', check: () => getTotalCompletedEver() >= 100 },
    { id: 'master', name: 'Productivity Master', desc: 'Complete 200 tasks & 14-day streak', icon: 'fa-medal', check: () => getTotalCompletedEver() >= 200 && getCurrentStreak() >= 14 }
  ];

  // ===================== LOCAL STORAGE =====================

  /** Load tasks from Local Storage */
  function loadTasks() {
    try {
      tasks = JSON.parse(localStorage.getItem('taskflow_tasks') || '[]');
      deletedTasks = JSON.parse(localStorage.getItem('taskflow_deleted') || '[]');
      achievements = JSON.parse(localStorage.getItem('taskflow_achievements') || '{}');
    } catch (e) {
      tasks = [];
      deletedTasks = [];
      achievements = {};
    }
    // Clean deleted items older than 30 days
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    deletedTasks = deletedTasks.filter(t => (t.deletedAt || 0) > thirtyDaysAgo);
  }

  /** Save tasks to Local Storage */
  function saveTasks() {
    localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
    localStorage.setItem('taskflow_deleted', JSON.stringify(deletedTasks));
    localStorage.setItem('taskflow_achievements', JSON.stringify(achievements));
  }

  // ===================== HELPERS =====================

  /** Get total completed tasks (including from deleted) */
  function getTotalCompletedEver() {
    const active = tasks.filter(t => t.completed).length;
    const deleted = deletedTasks.filter(t => t.completed).length;
    return active + deleted;
  }

  /** Format date string for display */
  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  /** Escape HTML to prevent XSS */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /** Check if a date is today */
  function isToday(dateStr) {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const today = new Date();
    return d.getFullYear() === today.getFullYear() &&
           d.getMonth() === today.getMonth() &&
           d.getDate() === today.getDate();
  }

  // ===================== TASK OPERATIONS =====================

  /** Add a new task */
  function addTask(e) {
    e.preventDefault();
    const title = taskInput.value.trim();
    if (!title) {
      showError('Please enter a task.');
      return;
    }

    const task = {
      id: Date.now().toString(),
      title,
      dueDate: taskDate.value || null,
      priority: taskPriority.value,
      category: taskCategory.value,
      notes: taskNotesInput.value.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };

    tasks.unshift(task);
    saveTasks();
    refresh();

    // Reset form
    taskInput.value = '';
    taskDate.value = '';
    taskPriority.value = 'Medium';
    taskCategory.value = 'Study';
    taskNotesInput.value = '';

    displayToast('Task Added Successfully', 'success');
    checkAchievements();
  }

  /** Move a task to the recycle bin */
  function deleteTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.deletedAt = Date.now();
      deletedTasks.push(task);
      tasks = tasks.filter(t => t.id !== id);
      saveTasks();
      refresh();
      displayToast('Task Deleted', 'error');
    }
  }

  /** Permanently delete from recycle bin */
  function permanentDelete(id) {
    deletedTasks = deletedTasks.filter(t => t.id !== id);
    saveTasks();
    refresh();
    displayToast('Permanently Deleted', 'error');
  }

  /** Restore a task from recycle bin */
  function restoreTask(id) {
    const task = deletedTasks.find(t => t.id === id);
    if (task) {
      delete task.deletedAt;
      deletedTasks = deletedTasks.filter(t => t.id !== id);
      tasks.unshift(task);
      saveTasks();
      refresh();
      displayToast('Task Restored', 'warning');
    }
  }

  /** Empty the recycle bin */
  function emptyRecycleBin() {
    deletedTasks = [];
    saveTasks();
    refresh();
    displayToast('Recycle Bin Emptied', 'info');
  }

  /** Enable editing mode */
  function editTask(id) {
    editingId = id;
    renderTasks();
  }

  /** Save edited title */
  function saveEdit(id) {
    const editInput = taskList.querySelector('.task-title-edit');
    if (!editInput) return;
    const newTitle = editInput.value.trim();
    if (!newTitle) {
      showError('Task title cannot be empty.');
      return;
    }
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.title = newTitle;
      saveTasks();
      renderTasks();
      displayToast('Task Updated', 'info');
    }
    editingId = null;
  }

  /** Cancel editing */
  function cancelEdit() {
    editingId = null;
    renderTasks();
  }

  /** Toggle task completion */
  function completeTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      if (task.completed) task.completedAt = new Date().toISOString();
      else delete task.completedAt;
      saveTasks();
      refresh();
      displayToast(task.completed ? 'Task Completed' : 'Task Restored', task.completed ? 'success' : 'warning');
      checkStreak();
      checkAchievements();
    }
  }

  /** Master refresh function */
  function refresh() {
    updateStatistics();
    updateCalendarStats();
    updateProgressBar();
    updateWeeklyChart();
    updateDashboard();
    updateStreakDisplay();
    renderTasks();
  }

  // ===================== RENDERING =====================

  /** Render task list based on filters */
  function renderTasks() {
    const isRecycleTab = activeTab === 'deleted';
    let list = isRecycleTab ? deletedTasks : tasks;

    if (!isRecycleTab) {
      list = filterTasks(list);
      list = searchTasks(list);
      list = sortTasksList(list);
    }

    taskList.innerHTML = '';

    // Show/hide recycle controls
    recycleControls.style.display = isRecycleTab ? 'flex' : 'none';

    if (list.length === 0) {
      emptyState.classList.add('show');
      return;
    }
    emptyState.classList.remove('show');

    list.forEach((task, index) => {
      const card = document.createElement('div');
      card.className = 'task-card' + (task.completed && !isRecycleTab ? ' completed-card' : '');
      card.style.animationDelay = `${index * 0.04}s`;
      card.dataset.id = task.id;

      // Drag & Drop (only for pending tasks)
      if (!isRecycleTab && !task.completed) {
        card.draggable = true;
        card.classList.add('draggable');
      }

      const priorityClass = task.priority.toLowerCase();
      const categoryClass = (task.category || 'other').toLowerCase();
      const dueDateFormatted = task.dueDate ? formatDate(task.dueDate) : 'No due date';
      const createdFormatted = formatDate(task.createdAt);

      // Title
      let titleHTML;
      if (editingId === task.id) {
        titleHTML = `<input type="text" class="task-title-edit" value="${escapeHtml(task.title)}" aria-label="Edit task title" />`;
      } else {
        titleHTML = `<div class="task-title">${escapeHtml(task.title)}</div>`;
      }

      // Badges
      const badgesHTML = `<div class="task-badges">
        <span class="priority-badge ${priorityClass}">${task.priority}</span>
        <span class="category-badge ${categoryClass}">${task.category || 'Other'}</span>
      </div>`;

      // Notes
      let notesHTML = '';
      if (task.notes && !isRecycleTab) {
        notesHTML = `
          <button class="task-notes-toggle" onclick="window.taskApp.toggleNotes(this)" aria-label="View notes">
            <i class="fas fa-sticky-note"></i> View Notes
          </button>
          <div class="task-notes-content">${escapeHtml(task.notes)}</div>
        `;
      }

      // Actions
      let actionsHTML = '';
      if (isRecycleTab) {
        actionsHTML = `
          <button class="btn btn-restore" onclick="window.taskApp.restoreTask('${task.id}')" aria-label="Restore task">
            <i class="fas fa-undo"></i> Restore
          </button>
          <button class="btn btn-perm-delete" onclick="window.taskApp.confirmPermDelete('${task.id}')" aria-label="Permanently delete">
            <i class="fas fa-trash"></i> Delete Forever
          </button>
        `;
      } else if (editingId === task.id) {
        actionsHTML = `
          <button class="btn btn-save-edit" onclick="window.taskApp.saveEdit('${task.id}')" aria-label="Save edit">
            <i class="fas fa-check"></i> Save
          </button>
          <button class="btn btn-cancel-edit" onclick="window.taskApp.cancelEdit()" aria-label="Cancel edit">
            <i class="fas fa-times"></i> Cancel
          </button>
        `;
      } else if (task.completed) {
        actionsHTML = `
          <button class="btn btn-restore" onclick="window.taskApp.completeTask('${task.id}')" aria-label="Restore task">
            <i class="fas fa-undo"></i> Restore
          </button>
          <button class="btn btn-edit" onclick="window.taskApp.editTask('${task.id}')" aria-label="Edit task">
            <i class="fas fa-pen"></i> Edit
          </button>
          <button class="btn btn-delete" onclick="window.taskApp.confirmDelete('${task.id}')" aria-label="Delete task">
            <i class="fas fa-trash"></i> Delete
          </button>
        `;
      } else {
        actionsHTML = `
          <button class="btn btn-complete" onclick="window.taskApp.completeTask('${task.id}')" aria-label="Complete task">
            <i class="fas fa-check"></i> Complete
          </button>
          <button class="btn btn-edit" onclick="window.taskApp.editTask('${task.id}')" aria-label="Edit task">
            <i class="fas fa-pen"></i> Edit
          </button>
          <button class="btn btn-delete" onclick="window.taskApp.confirmDelete('${task.id}')" aria-label="Delete task">
            <i class="fas fa-trash"></i> Delete
          </button>
        `;
      }

      card.innerHTML = `
        <div class="task-card-header">
          ${titleHTML}
          ${badgesHTML}
        </div>
        <div class="task-meta">
          <span><i class="fas fa-calendar-alt"></i> Due: ${dueDateFormatted}</span>
          <span><i class="fas fa-clock"></i> Created: ${createdFormatted}</span>
          ${task.completed && task.completedAt ? '<span><i class="fas fa-check-circle" style="color:var(--low)"></i> Completed</span>' : ''}
        </div>
        ${notesHTML}
        <div class="task-actions">${actionsHTML}</div>
      `;

      taskList.appendChild(card);
    });

    // Focus edit input
    if (editingId) {
      const editInput = taskList.querySelector('.task-title-edit');
      if (editInput) { editInput.focus(); editInput.selectionStart = editInput.value.length; }
    }

    // Init drag and drop
    initDragDrop();
  }

  // ===================== FILTER / SEARCH / SORT =====================

  function filterTasks(taskArray) {
    let result = taskArray;
    if (activeTab === 'pending') result = result.filter(t => !t.completed);
    else if (activeTab === 'completed') result = result.filter(t => t.completed);

    const pVal = filterPriority.value;
    if (pVal !== 'all') result = result.filter(t => t.priority === pVal);

    const cVal = filterCategory.value;
    if (cVal !== 'all') result = result.filter(t => (t.category || 'Other') === cVal);

    return result;
  }

  function searchTasks(taskArray) {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) return taskArray;
    return taskArray.filter(t => t.title.toLowerCase().includes(q) || (t.notes || '').toLowerCase().includes(q));
  }

  function sortTasksList(taskArray) {
    const sorted = [...taskArray];
    switch (sortSelect.value) {
      case 'newest': sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
      case 'oldest': sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); break;
      case 'alpha': sorted.sort((a, b) => a.title.localeCompare(b.title)); break;
      case 'priority':
        const order = { High: 0, Medium: 1, Low: 2 };
        sorted.sort((a, b) => order[a.priority] - order[b.priority]);
        break;
    }
    return sorted;
  }

  // ===================== STATISTICS =====================

  function updateStatistics() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    animateNumber(statTotal, total);
    animateNumber(statCompleted, completed);
    animateNumber(statPending, pending);
    statPercent.textContent = percent + '%';
  }

  /** Animate number counting */
  function animateNumber(el, target) {
    const current = parseInt(el.textContent) || 0;
    if (current === target) return;
    const duration = 300;
    const start = performance.now();
    function step(ts) {
      const progress = Math.min((ts - start) / duration, 1);
      el.textContent = Math.round(current + (target - current) * progress);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ===================== PROGRESS BAR =====================

  function updateProgressBar() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    progressFill.style.width = percent + '%';
    progressFill.setAttribute('aria-valuenow', percent);
    progressPercent.textContent = percent + '%';
  }

  // ===================== CALENDAR WIDGET =====================

  function initCalendar() {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];

    $('#calendar-date').textContent = now.getDate();
    $('#calendar-day').textContent = days[now.getDay()];
    $('#calendar-month').textContent = months[now.getMonth()] + ' ' + now.getFullYear();
    updateCalendarStats();
  }

  function updateCalendarStats() {
    const todayTasks = tasks.filter(t => isToday(t.createdAt));
    const total = todayTasks.length;
    const completed = todayTasks.filter(t => t.completed).length;
    const pending = total - completed;

    $('#cal-total').textContent = total;
    $('#cal-completed').textContent = completed;
    $('#cal-pending').textContent = pending;
  }

  // ===================== QUOTES =====================

  function initQuotes() {
    showRandomQuote();
    $('#new-quote-btn').addEventListener('click', showRandomQuote);
  }

  function showRandomQuote() {
    const q = quotes[Math.floor(Math.random() * quotes.length)];
    const textEl = $('#quote-text');
    const authorEl = $('#quote-author');
    textEl.style.opacity = '0';
    authorEl.style.opacity = '0';
    setTimeout(() => {
      textEl.textContent = `"${q.text}"`;
      authorEl.textContent = `— ${q.author}`;
      textEl.style.opacity = '1';
      authorEl.style.opacity = '1';
    }, 200);
    // Add transition for fade
    textEl.style.transition = 'opacity 0.3s ease';
    authorEl.style.transition = 'opacity 0.3s ease';
  }

  // ===================== POMODORO TIMER =====================

  function initPomodoro() {
    timerStart.addEventListener('click', startPomodoro);
    timerPause.addEventListener('click', pausePomodoro);
    timerReset.addEventListener('click', resetPomodoro);

    $$('.pomo-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.pomo-mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        pomoMode = btn.dataset.mode;
        resetPomodoro();
      });
    });

    updateTimerDisplay();
  }

  function startPomodoro() {
    if (pomoRunning) return;
    pomoRunning = true;
    timerStatus.textContent = pomoMode === 'focus' ? 'Stay Focused!' : 'Time for a Break!';
    pomoInterval = setInterval(() => {
      pomoSeconds--;
      if (pomoSeconds <= 0) {
        clearInterval(pomoInterval);
        pomoRunning = false;
        pomoSeconds = 0;
        timerStatus.textContent = pomoMode === 'focus' ? 'Focus Session Complete!' : 'Break Over!';
        playAlarm();
        displayToast(pomoMode === 'focus' ? 'Focus session complete! Take a break.' : 'Break over! Time to focus.', 'info');
      }
      updateTimerDisplay();
    }, 1000);
  }

  function pausePomodoro() {
    clearInterval(pomoInterval);
    pomoRunning = false;
    timerStatus.textContent = 'Paused';
  }

  function resetPomodoro() {
    clearInterval(pomoInterval);
    pomoRunning = false;
    pomoMode = $('.pomo-mode-btn.active').dataset.mode;
    pomoTotalSeconds = pomoMode === 'focus' ? 25 * 60 : 5 * 60;
    pomoSeconds = pomoTotalSeconds;
    timerStatus.textContent = pomoMode === 'focus' ? 'Stay Focused!' : 'Time for a Break!';
    updateTimerDisplay();
  }

  function updateTimerDisplay() {
    const mins = Math.floor(pomoSeconds / 60);
    const secs = pomoSeconds % 60;
    timerTime.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    // Update circular progress
    const circumference = 2 * Math.PI * 90; // r=90
    const progress = (pomoTotalSeconds - pomoSeconds) / pomoTotalSeconds;
    const offset = circumference * (1 - progress);
    timerProgress.style.strokeDashoffset = offset;

    if (pomoMode === 'break') {
      timerProgress.classList.add('break-mode');
    } else {
      timerProgress.classList.remove('break-mode');
    }
  }

  /** Play a simple alarm beep using Web Audio API */
  function playAlarm() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;
      oscillator.start();
      setTimeout(() => { oscillator.stop(); ctx.close(); }, 500);
    } catch (e) { /* Audio not supported */ }
  }

  // ===================== DRAG AND DROP =====================

  let draggedItem = null;

  function initDragDrop() {
    const cards = taskList.querySelectorAll('.task-card.draggable');
    cards.forEach(card => {
      card.addEventListener('dragstart', handleDragStart);
      card.addEventListener('dragend', handleDragEnd);
      card.addEventListener('dragover', handleDragOver);
      card.addEventListener('dragenter', handleDragEnter);
      card.addEventListener('dragleave', handleDragLeave);
      card.addEventListener('drop', handleDrop);
    });
  }

  function handleDragStart(e) {
    draggedItem = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.dataset.id);
  }

  function handleDragEnd() {
    this.classList.remove('dragging');
    taskList.querySelectorAll('.task-card').forEach(c => c.classList.remove('drag-over'));
    draggedItem = null;
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDragEnter(e) {
    e.preventDefault();
    if (this !== draggedItem && this.classList.contains('draggable')) {
      this.classList.add('drag-over');
    }
  }

  function handleDragLeave() {
    this.classList.remove('drag-over');
  }

  function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    if (this === draggedItem || !draggedItem) return;

    const draggedId = draggedItem.dataset.id;
    const droppedId = this.dataset.id;

    // Reorder in tasks array
    const dragIdx = tasks.findIndex(t => t.id === draggedId);
    const dropIdx = tasks.findIndex(t => t.id === droppedId);

    if (dragIdx === -1 || dropIdx === -1) return;

    const [moved] = tasks.splice(dragIdx, 1);
    tasks.splice(dropIdx, 0, moved);

    saveTasks();
    renderTasks();
    displayToast('Task reordered', 'info');
  }

  // ===================== WEEKLY CHART =====================

  function updateWeeklyChart() {
    const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const today = new Date();
    const weekData = new Array(7).fill(0);

    // Count completed tasks per day this week
    tasks.forEach(task => {
      if (!task.completed || !task.completedAt) return;
      const d = new Date(task.completedAt);
      const diff = Math.floor((today - d) / (1000 * 60 * 60 * 24));
      if (diff < 7 && diff >= 0) {
        weekData[d.getDay()]++;
      }
    });

    // Mon=1..Sun=0 -> rearrange to Mon-Sun display order
    const displayOrder = [1, 2, 3, 4, 5, 6, 0];
    const maxVal = Math.max(...weekData, 1);

    displayOrder.forEach((dayIdx, i) => {
      const key = dayKeys[dayIdx];
      const bar = $(`#chart-${key}`);
      const val = $(`#chart-val-${key}`);
      const height = weekData[dayIdx] === 0 ? 4 : (weekData[dayIdx] / maxVal) * 160;
      bar.style.height = height + 'px';
      val.textContent = weekData[dayIdx];
    });
  }

  // ===================== STREAK =====================

  function getCurrentStreak() {
    const streakData = JSON.parse(localStorage.getItem('taskflow_streak') || '{"current":0,"best":0,"lastDate":""}');
    return streakData.current || 0;
  }

  function checkStreak() {
    let streakData = JSON.parse(localStorage.getItem('taskflow_streak') || '{"current":0,"best":0,"lastDate":""}');
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Check if any task was completed today
    const completedToday = tasks.some(t => t.completed && t.completedAt && isToday(t.completedAt));

    if (completedToday) {
      if (streakData.lastDate === today) {
        // Already counted today
      } else if (streakData.lastDate === yesterday) {
        streakData.current++;
      } else {
        streakData.current = 1;
      }
      streakData.lastDate = today;
    }

    if (streakData.current > streakData.best) {
      streakData.best = streakData.current;
    }

    localStorage.setItem('taskflow_streak', JSON.stringify(streakData));
    updateStreakDisplay();
    updateDashboard();
  }

  function updateStreakDisplay() {
    const streakData = JSON.parse(localStorage.getItem('taskflow_streak') || '{"current":0,"best":0}');
    const el = $('#hero-streak');
    if (el) el.textContent = streakData.current || 0;
  }

  // ===================== DASHBOARD =====================

  function updateDashboard() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const deleted = deletedTasks.length;
    const streakData = JSON.parse(localStorage.getItem('taskflow_streak') || '{"current":0,"best":0}');

    // Average daily tasks: total completed / number of unique days with completions
    const completedTasks = tasks.filter(t => t.completed && t.completedAt);
    const uniqueDays = new Set(completedTasks.map(t => new Date(t.completedAt).toDateString()));
    const avg = uniqueDays.size === 0 ? 0 : (completedTasks.length / uniqueDays.size).toFixed(1);

    animateNumber($('#dash-total'), total);
    animateNumber($('#dash-completed'), completed);
    animateNumber($('#dash-pending'), pending);
    animateNumber($('#dash-deleted'), deleted);
    animateNumber($('#dash-streak'), streakData.current || 0);
    animateNumber($('#dash-best-streak'), streakData.best || 0);
    $('#dash-avg').textContent = avg;
  }

  // ===================== ACHIEVEMENTS =====================

  function checkAchievements() {
    achievementsDef.forEach(def => {
      if (!achievements[def.id] && def.check()) {
        achievements[def.id] = { unlockedAt: Date.now() };
        saveTasks();
        showAchievementPopup(def);
      }
    });
    renderAchievements();
  }

  function renderAchievements() {
    const grid = $('#achievements-grid');
    grid.innerHTML = '';

    achievementsDef.forEach(def => {
      const unlocked = !!achievements[def.id];
      const badge = document.createElement('div');
      badge.className = 'achievement-badge ' + (unlocked ? 'unlocked' : 'locked');
      badge.innerHTML = `
        ${unlocked ? '<div class="badge-check"><i class="fas fa-check"></i></div>' : ''}
        <span class="badge-icon"><i class="fas ${def.icon}"></i></span>
        <div class="badge-name">${def.name}</div>
        <div class="badge-desc">${def.desc}</div>
      `;
      grid.appendChild(badge);
    });
  }

  function showAchievementPopup(def) {
    $('#achievement-popup-icon').className = `fas ${def.icon}`;
    $('#achievement-popup-name').textContent = def.name;
    $('#achievement-popup-desc').textContent = def.desc;
    achievementOverlay.classList.add('show');
    displayToast(`Achievement Unlocked: ${def.name}`, 'success');
  }

  // ===================== TOAST NOTIFICATIONS =====================

  function displayToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle', warning: 'fa-exclamation-circle' };
    toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> <span>${message}</span>`;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('hiding');
      toast.addEventListener('animationend', () => toast.remove());
    }, 3000);
  }

  // ===================== MODAL =====================

  function confirmDelete(id) {
    deleteTargetId = id;
    modalTitle.textContent = 'Delete Task';
    modalText.textContent = 'Are you sure you want to delete this task?';
    modalDelete.innerHTML = '<i class="fas fa-trash"></i> Delete';
    modalDelete.onclick = () => { deleteTask(deleteTargetId); hideModal(); };
    modalOverlay.classList.add('show');
  }

  function confirmPermDelete(id) {
    deleteTargetId = id;
    modalTitle.textContent = 'Permanently Delete';
    modalText.textContent = 'This task will be gone forever. Continue?';
    modalDelete.innerHTML = '<i class="fas fa-trash"></i> Delete Forever';
    modalDelete.onclick = () => { permanentDelete(deleteTargetId); hideModal(); };
    modalOverlay.classList.add('show');
  }

  function hideModal() {
    modalOverlay.classList.remove('show');
    deleteTargetId = null;
  }

  // ===================== ERROR MESSAGE =====================

  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.classList.add('show');
    setTimeout(() => errorMsg.classList.remove('show'), 3000);
  }

  // ===================== NOTES TOGGLE =====================

  function toggleNotes(btn) {
    const content = btn.nextElementSibling;
    const isExpanded = content.classList.contains('expanded');
    content.classList.toggle('expanded');
    btn.innerHTML = isExpanded
      ? '<i class="fas fa-sticky-note"></i> View Notes'
      : '<i class="fas fa-sticky-note"></i> Hide Notes';
  }

  // ===================== DARK MODE =====================

  function initDarkMode() {
    const saved = localStorage.getItem('taskflow_theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    updateThemeIcon(saved);
  }

  function toggleDarkMode() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('taskflow_theme', next);
    updateThemeIcon(next);
    displayToast(`${next === 'dark' ? 'Dark' : 'Light'} Mode Enabled`, 'info');
  }

  function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }

  // ===================== LOADING SCREEN =====================

  function initLoadingScreen() {
    setTimeout(() => {
      loadingScreen.classList.add('hidden');
    }, 1200);
  }

  // ===================== KEYBOARD SHORTCUTS =====================

  function initShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ignore if typing in an input/textarea
      const tag = e.target.tagName;
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

      // Ctrl+N → Focus task input
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        taskInput.focus();
        taskInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      // Ctrl+F → Focus search
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        searchInput.focus();
        searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      // Ctrl+D → Toggle dark mode
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        toggleDarkMode();
      }

      // Escape → Close modals / cancel edit
      if (e.key === 'Escape') {
        if (modalOverlay.classList.contains('show')) hideModal();
        if (achievementOverlay.classList.contains('show')) achievementOverlay.classList.remove('show');
        if (shortcutsOverlay.classList.contains('show')) shortcutsOverlay.classList.remove('show');
        if (editingId) cancelEdit();
      }
    });
  }

  // ===================== RIPPLE EFFECT =====================

  function createRipple(e) {
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
    button.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  }

  // ===================== NAVIGATION =====================

  function toggleMenu() {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', hamburger.classList.contains('open'));
  }

  function handleScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
    backToTop.classList.toggle('show', window.scrollY > 400);
    updateActiveNavLink();
  }

  function updateActiveNavLink() {
    const sections = ['hero', 'tasks-section', 'pomodoro-section', 'dashboard-section', 'about-section'];
    let current = 'hero';
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el && window.scrollY >= el.offsetTop - 120) current = id;
    });
    $$('.nav-link').forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  }

  // ===================== EVENT LISTENERS =====================

  function initEventListeners() {
    taskForm.addEventListener('submit', addTask);

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        tabButtons.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        activeTab = btn.dataset.tab;
        renderTasks();
      });
    });

    searchInput.addEventListener('input', renderTasks);
    filterPriority.addEventListener('change', renderTasks);
    filterCategory.addEventListener('change', renderTasks);
    sortSelect.addEventListener('change', renderTasks);

    modalCancel.addEventListener('click', hideModal);
    modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) hideModal(); });

    hamburger.addEventListener('click', toggleMenu);

    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });

    startBtn.addEventListener('click', () => {
      $('#tasks-section').scrollIntoView({ behavior: 'smooth' });
    });

    emptyCreateBtn.addEventListener('click', () => {
      taskInput.focus();
      document.querySelector('.input-section').scrollIntoView({ behavior: 'smooth' });
    });

    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    themeToggle.addEventListener('click', toggleDarkMode);

    fab.addEventListener('click', () => {
      document.querySelector('.input-section').scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => taskInput.focus(), 400);
    });

    emptyBinBtn.addEventListener('click', () => {
      if (deletedTasks.length === 0) {
        displayToast('Recycle bin is already empty', 'info');
        return;
      }
      modalTitle.textContent = 'Empty Recycle Bin';
      modalText.textContent = 'All deleted tasks will be permanently removed.';
      modalDelete.innerHTML = '<i class="fas fa-trash"></i> Empty Bin';
      modalDelete.onclick = () => { emptyRecycleBin(); hideModal(); };
      modalOverlay.classList.add('show');
    });

    // Shortcuts help popup
    shortcutsBtn.addEventListener('click', () => shortcutsOverlay.classList.add('show'));
    shortcutsClose.addEventListener('click', () => shortcutsOverlay.classList.remove('show'));
    shortcutsOverlay.addEventListener('click', (e) => { if (e.target === shortcutsOverlay) shortcutsOverlay.classList.remove('show'); });

    // Achievement popup close
    achievementClose.addEventListener('click', () => achievementOverlay.classList.remove('show'));
    achievementOverlay.addEventListener('click', (e) => { if (e.target === achievementOverlay) achievementOverlay.classList.remove('show'); });

    // Ripple on all buttons
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn');
      if (btn) createRipple(e);
    });

    // Edit input key handlers
    taskList.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.classList.contains('task-title-edit')) saveEdit(editingId);
      if (e.key === 'Escape' && e.target.classList.contains('task-title-edit')) cancelEdit();
    });

    window.addEventListener('scroll', handleScroll);
  }

  // ===================== INITIALIZATION =====================

  function init() {
    initLoadingScreen();
    initDarkMode();
    loadTasks();
    initEventListeners();
    initCalendar();
    initQuotes();
    initPomodoro();
    initShortcuts();
    refresh();
    renderAchievements();

    // Set min date on date picker
    const today = new Date().toISOString().split('T')[0];
    taskDate.setAttribute('min', today);

    // Check streak on load
    checkStreak();
    checkAchievements();
  }

  // Run
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ===================== PUBLIC API =====================
  window.taskApp = {
    completeTask,
    editTask,
    saveEdit,
    cancelEdit,
    confirmDelete,
    confirmPermDelete,
    restoreTask,
    toggleNotes
  };

})();
