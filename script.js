// Global variables for data management
let users = JSON.parse(localStorage.getItem('users')) || [];
let projects = JSON.parse(localStorage.getItem('projects')) || [];
let loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser')) || null;
let currentProject = JSON.parse(sessionStorage.getItem('currentProject')) || null;

// Toggle between registration and login forms
function toggleForms(formId) {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('coworker-login-form').style.display = 'none';
    document.getElementById(formId).style.display = 'block';
}

// Generate a unique ID (UUID)
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0,
            v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

// Save users and projects to localStorage
function saveToLocalStorage() {
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('projects', JSON.stringify(projects));
}

// Register a new project creator
function register() {
    const email = document.getElementById('reg-email').value;
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    if (users.find(user => user.email.toLowerCase() === email.toLowerCase() || user.username.toLowerCase() === username.toLowerCase())) {
        alert('An account with this email or username already exists!');
        return;
    }

    users.push({ email, username, password, role: 'creator', projects: [] });
    saveToLocalStorage();
    alert('Registration successful!');
    toggleForms('login-form');
}

// Login for project creators and co-workers
function login(role) {
    let username, password, projectId;
    if (role === 'creator') {
        const email = document.getElementById('login-email').value;
        password = document.getElementById('login-password').value;
        const user = users.find(user => user.email.toLowerCase() === email.toLowerCase() && user.password === password && user.role === 'creator');

        if (!user) {
            alert('Invalid email or password!');
            return;
        }

        loggedInUser = user;
        sessionStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
        document.getElementById('register-login').style.display = 'none';
        document.getElementById('project-management').style.display = 'block';
    } else {
        username = document.getElementById('coworker-username').value.toLowerCase();
        password = document.getElementById('coworker-password').value;
        projectId = document.getElementById('project-id').value.trim();

        const project = projects.find(proj => proj.projectId === projectId);
        if (!project) {
            alert('Invalid project ID!');
            return;
        }

        const user = project.users.find(user => user.username.toLowerCase() === username && user.password === password);
        if (!user) {
            alert('Invalid username or password!');
            return;
        }

        currentProject = project;
        sessionStorage.setItem('currentProject', JSON.stringify(currentProject));
        document.getElementById('register-login').style.display = 'none';
        document.getElementById('project-dashboard').style.display = 'block';
        document.getElementById('add-task-button').style.display = 'none';
        document.getElementById('add-user-button').style.display = 'none';
        loadProjectTasks(currentProject);
    }
}

// Create a new project and add co-workers
function createProject() {
    const projectName = prompt('Enter the project name (letters only):');
    if (!projectName || !/^[A-Za-z]+$/.test(projectName)) {
        alert('Project name should only contain letters!');
        return;
    }
    const projectId = generateUUID();

    const project = {
        projectName,
        projectId,
        tasks: [],
        users: []
    };

    let addMoreUsers = true;
    while (addMoreUsers) {
        const username = prompt('Enter the co-worker username (leave blank to finish):');
        if (!username) break;

        const password = prompt(`Enter a password for ${username}:`);
        if (password) {
            project.users.push({ username: username.toLowerCase(), password });
            alert(`User ${username} added successfully!`);
        }

        addMoreUsers = confirm('Do you want to add another user?');
    }

    projects.push(project);
    saveToLocalStorage();
    loggedInUser.projects.push(projectId);
    saveToLocalStorage();
    alert(`Project created successfully! Project ID: ${projectId}`);
}

// Add a co-worker to the current project
function addUser() {
    if (!currentProject) {
        alert('No project selected. Create or load a project.');
        return;
    }

    const username = prompt('Enter the co-worker username:');
    const password = prompt(`Enter a password for ${username}:`);
    if (username && password) {
        currentProject.users.push({ username: username.toLowerCase(), password });
        saveToLocalStorage();
        alert(`User ${username} added successfully!`);
    }
}

// Show the task creation modal
function showTaskForm() {
    document.getElementById('task-name').value = '';
    document.getElementById('task-user').value = '';
    document.getElementById('task-desc').value = '';
    document.getElementById('task-color').value = '#000000';
    document.getElementById('task-modal').style.display = 'block';
}

// Hide the task creation modal
function hideTaskForm() {
    document.getElementById('task-modal').style.display = 'none';
}

// Create a new task
function createTask() {
    if (!currentProject) {
        alert('No project selected. Create or load a project.');
        return;
    }

    const taskName = document.getElementById('task-name').value;
    const assignedUser = document.getElementById('task-user').value.toLowerCase();
    const taskDesc = document.getElementById('task-desc').value;
    const taskColor = document.getElementById('task-color').value;

    const userExists = currentProject.users.find(user => user.username === assignedUser);
    if (!userExists) {
        alert(`User ${assignedUser} does not exist in this project!`);
        return;
    }

    const task = {
        name: taskName,
        assignedUser: assignedUser,
        description: taskDesc,
        color: taskColor,
        status: 'to-do'
    };

    currentProject.tasks.push(task);
    saveToLocalStorage();
    loadProjectTasks(currentProject);
    hideTaskForm();
    alert('Task created successfully!');
}

// View projects for the logged-in user
function viewProjects() {
    const projectList = document.getElementById('project-list');
    projectList.innerHTML = '';

    loggedInUser.projects.forEach(projectId => {
        const project = projects.find(proj => proj.projectId === projectId);
        if (project) {
            const projectDiv = document.createElement('div');
            projectDiv.innerText = `${project.projectName} (ID: ${project.projectId})`;
            projectDiv.onclick = () => loadProject(projectId);
            projectList.appendChild(projectDiv);
        }
    });
}

// Load a specific project and display tasks
function loadProject(projectId) {
    const project = projects.find(proj => proj.projectId === projectId);
    if (!project) return;

    currentProject = project;
    sessionStorage.setItem('currentProject', JSON.stringify(currentProject));
    document.getElementById('project-management').style.display = 'none';
    document.getElementById('project-dashboard').style.display = 'block';
    document.getElementById('project-name').innerText = project.projectName;
    document.getElementById('add-task-button').style.display = loggedInUser.role === 'creator' ? 'block' : 'none';
    document.getElementById('add-user-button').style.display = loggedInUser.role === 'creator' ? 'block' : 'none';
    loadProjectTasks(project);
}

// Drag-and-drop for task management
function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    event.dataTransfer.setData("text", event.target.id);
}

function drop(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData("text");
    const taskElement = document.getElementById(data);
    event.target.appendChild(taskElement);

    const taskName = taskElement.innerText.split(" -> ")[0];
    const newStatus = event.target.id;
    const task = currentProject.tasks.find(task => task.name === taskName);
    task.status = newStatus;

    saveToLocalStorage();
    loadProjectTasks(currentProject);
}

// Delete a task via drag-and-drop into trash can
function deleteTask(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData("text");
    const taskElement = document.getElementById(data);
    if (taskElement) {
        const taskName = taskElement.innerText.split(" -> ")[0];
        const taskIndex = currentProject.tasks.findIndex(task => task.name === taskName);
        currentProject.tasks.splice(taskIndex, 1);
        saveToLocalStorage();
        loadProjectTasks(currentProject);
        alert(`Task ${taskName} deleted successfully!`);
    }
}

// Load the tasks for the current project
function loadProjectTasks(project) {
    document.getElementById('to-do').innerHTML = '<h3>To Do</h3>';
    document.getElementById('in-progress').innerHTML = '<h3>In Progress</h3>';
    document.getElementById('done').innerHTML = '<h3>Done</h3>';

    project.tasks.forEach((task, index) => {
        const taskElement = document.createElement('div');
        taskElement.className = 'task';
        taskElement.id = 'task-' + index;
        taskElement.draggable = true;
        taskElement.ondragstart = drag;
        taskElement.innerText = `${task.name} -> ${task.assignedUser}\nDescription: ${task.description}`;
        taskElement.style.borderLeftColor = task.color;

        if (task.status === 'to-do') {
            document.getElementById('to-do').appendChild(taskElement);
        } else if (task.status === 'in-progress') {
            document.getElementById('in-progress').appendChild(taskElement);
        } else if (task.status === 'done') {
            document.getElementById('done').appendChild(taskElement);
        }
    });
}

// Toggle trash can visibility
function toggleTrashCan() {
    const trashCan = document.getElementById('trash-can');
    trashCan.classList.toggle('active');
}

// Automatic loading of logged-in user and current project
if (sessionStorage.getItem('loggedInUser')) {
    loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
    document.getElementById('register-login').style.display = 'none';
    document.getElementById('project-management').style.display = 'block';
}

if (sessionStorage.getItem('currentProject')) {
    currentProject = JSON.parse(sessionStorage.getItem('currentProject'));
    document.getElementById('register-login').style.display = 'none';
    document.getElementById('project-dashboard').style.display = 'block';
    loadProjectTasks(currentProject);
}
