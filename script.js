// Variabili globali per la gestione dei dati
let users = JSON.parse(localStorage.getItem('users')) || [];
let projects = JSON.parse(localStorage.getItem('projects')) || [];
let loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser')) || null;
let currentProject = JSON.parse(sessionStorage.getItem('currentProject')) || null;

// Funzione per alternare tra i form di registrazione e login
function toggleForms(formId) {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('coworker-login-form').style.display = 'none';
    document.getElementById(formId).style.display = 'block';
}

// Funzione per generare un ID univoco (UUID)
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0,
            v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

// Funzione per registrare un nuovo creatore di progetti
function register() {
    const email = document.getElementById('reg-email').value;
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;

    if (password !== confirmPassword) {
        alert('Le password non corrispondono!');
        return;
    }
    if (users.find(user => user.email.toLowerCase() === email.toLowerCase() || user.username.toLowerCase() === username.toLowerCase())) {
        alert('Esiste già un utente con questa email o username!');
        return;
    }

    users.push({ email, username, password, role: 'creator', projects: [] });
    localStorage.setItem('users', JSON.stringify(users));
    alert('Registrazione avvenuta con successo!');
    toggleForms('login-form');
}

// Funzione per effettuare il login per creatori di progetto e co-worker
function login(role) {
    let username, password, projectId;
    if (role === 'creator') {
        const email = document.getElementById('login-email').value;
        password = document.getElementById('login-password').value;
        const user = users.find(user => user.email.toLowerCase() === email.toLowerCase() && user.password === password && user.role === 'creator');

        if (!user) {
            alert('Email o password non validi per il creatore di progetto!');
            return;
        }

        loggedInUser = user;
        sessionStorage.setItem('loggedInUser', JSON.stringify(loggedInUser)); // Salva la sessione temporanea
        document.getElementById('register-login').style.display = 'none';
        document.getElementById('project-management').style.display = 'block';
    } else {
        username = document.getElementById('coworker-username').value.toLowerCase();
        password = document.getElementById('coworker-password').value;
        projectId = document.getElementById('project-id').value.trim();

        const project = projects.find(proj => proj.projectId === projectId);
        if (!project) {
            alert('ID progetto non valido! Assicurati di avere l\'ID corretto.');
            return;
        }

        const user = project.users.find(user => user.username.toLowerCase() === username && user.password === password);
        if (!user) {
            alert('Username o password non validi per co-worker!');
            return;
        }

        currentProject = project;
        sessionStorage.setItem('currentProject', JSON.stringify(currentProject)); // Salva la sessione temporanea
        document.getElementById('register-login').style.display = 'none';
        document.getElementById('project-dashboard').style.display = 'block';
        document.getElementById('add-task-button').style.display = 'none'; // Nascondi il pulsante di creazione task per co-worker
        document.getElementById('add-user-button').style.display = 'none'; // Nascondi il pulsante di creazione utente per co-worker
        loadProjectTasks(currentProject);
    }
}

// Funzione per creare un nuovo progetto e aggiungere co-worker
function createProject() {
    const projectName = prompt('Inserisci il nome del progetto (solo lettere):');
    if (!projectName || !/^[A-Za-z]+$/.test(projectName)) {
        alert('Il nome del progetto deve contenere solo lettere!');
        return;
    }
    const projectId = generateUUID(); // Genera un UUID come ID del progetto

    const project = {
        projectName,
        projectId,
        tasks: [],
        users: []
    };

    // Aggiungi utenti al progetto
    let addMoreUsers = true;
    while (addMoreUsers) {
        const username = prompt('Inserisci il nome utente del co-worker (lascia vuoto per terminare):');
        if (!username) break;

        const password = prompt(`Inserisci la password per l'utente ${username}:`);
        if (password) {
            project.users.push({ username: username.toLowerCase(), password });
            alert(`Utente ${username} aggiunto al progetto con successo!`);
        }

        addMoreUsers = confirm('Vuoi aggiungere un altro utente?');
    }

    projects.push(project);
    localStorage.setItem('projects', JSON.stringify(projects));
    loggedInUser.projects.push(projectId);
    localStorage.setItem('users', JSON.stringify(users)); // Aggiorna l'utente nel localStorage
    alert(`Progetto creato con successo! ID del progetto: ${projectId}`);
}

// Funzione per aggiungere un co-worker al progetto corrente
function addUser() {
    if (!currentProject) {
        alert('Nessun progetto selezionato. Crea o carica un progetto.');
        return;
    }

    const username = prompt('Inserisci il nome utente del co-worker:');
    const password = prompt(`Inserisci la password per l'utente ${username}:`);
    if (username && password) {
        currentProject.users.push({ username: username.toLowerCase(), password });
        localStorage.setItem('projects', JSON.stringify(projects)); // Aggiorna il progetto nel localStorage
        alert(`Utente ${username} aggiunto con successo!`);
    }
}

// Funzione per mostrare il modale di creazione task
function showTaskForm() {
    document.getElementById('task-name').value = ''; // Reset dei campi
    document.getElementById('task-user').value = '';
    document.getElementById('task-desc').value = '';
    document.getElementById('task-color').value = '#000000';
    document.getElementById('task-modal').style.display = 'block';
}

// Funzione per nascondere il modale di creazione task
function hideTaskForm() {
    document.getElementById('task-modal').style.display = 'none';
}

// Funzione per creare un nuovo task
function createTask() {
    if (!currentProject) {
        alert('Nessun progetto selezionato. Crea o carica un progetto.');
        return;
    }

    const taskName = document.getElementById('task-name').value;
    const assignedUser = document.getElementById('task-user').value.toLowerCase();
    const taskDesc = document.getElementById('task-desc').value;
    const taskColor = document.getElementById('task-color').value;

    const userExists = currentProject.users.find(user => user.username === assignedUser);
    if (!userExists) {
        alert(`Utente ${assignedUser} non esiste in questo progetto!`);
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
    localStorage.setItem('projects', JSON.stringify(projects)); // Aggiorna il progetto nel localStorage
    loadProjectTasks(currentProject);
    hideTaskForm(); // Nascondi il modale dopo la creazione del task
    alert('Task creato con successo!');
}

// Funzione per visualizzare i progetti dell'utente loggato
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

// Funzione per caricare un progetto specifico e visualizzare i task
function loadProject(projectId) {
    const project = projects.find(proj => proj.projectId === projectId);
    if (!project) return;

    currentProject = project;
    sessionStorage.setItem('currentProject', JSON.stringify(currentProject)); // Salva il progetto corrente in sessionStorage
    document.getElementById('project-management').style.display = 'none';
    document.getElementById('project-dashboard').style.display = 'block';
    document.getElementById('project-name').innerText = project.projectName;
    document.getElementById('add-task-button').style.display = loggedInUser.role === 'creator' ? 'block' : 'none'; // Mostra il pulsante se il creatore è loggato
    document.getElementById('add-user-button').style.display = loggedInUser.role === 'creator' ? 'block' : 'none'; // Mostra il pulsante se il creatore è loggato
    loadProjectTasks(project);
}

// Funzione per abilitare il drag-and-drop dei task
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

    // Aggiorna lo stato del task nel progetto corrente
    const taskName = taskElement.innerText.split(" -> ")[0];
    const newStatus = event.target.id;
    const task = currentProject.tasks.find(task => task.name === taskName);
    task.status = newStatus;

    localStorage.setItem('projects', JSON.stringify(projects)); // Salva le modifiche al progetto nel localStorage
    loadProjectTasks(currentProject);
}

// Funzione per eliminare un task tramite drag-and-drop nel cestino
function deleteTask(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData("text");
    const taskElement = document.getElementById(data);
    if (taskElement) {
        const taskName = taskElement.innerText.split(" -> ")[0];
        const taskIndex = currentProject.tasks.findIndex(task => task.name === taskName);
        currentProject.tasks.splice(taskIndex, 1);
        localStorage.setItem('projects', JSON.stringify(projects)); // Aggiorna il progetto nel localStorage
        loadProjectTasks(currentProject);
        alert(`Task ${taskName} eliminato con successo!`);
    }
}

// Funzione per caricare i task del progetto corrente
function loadProjectTasks(project) {
    // Svuota le colonne prima di caricare i task
    document.getElementById('to-do').innerHTML = '<h3>To Do</h3>';
    document.getElementById('in-progress').innerHTML = '<h3>In Progress</h3>';
    document.getElementById('done').innerHTML = '<h3>Done</h3>';

    // Itera attraverso i task del progetto e li posiziona nella colonna corretta
    project.tasks.forEach((task, index) => {
        const taskElement = document.createElement('div');
        taskElement.className = 'task';
        taskElement.id = 'task-' + index;
        taskElement.draggable = true;
        taskElement.ondragstart = drag;
        taskElement.innerText = `${task.name} -> ${task.assignedUser}\nDescrizione: ${task.description}`;
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

// Funzione per attivare/disattivare il cestino
function toggleTrashCan() {
    const trashCan = document.getElementById('trash-can');
    trashCan.classList.toggle('active');
}

// Salvataggio automatico dell'utente loggato e del progetto corrente
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
