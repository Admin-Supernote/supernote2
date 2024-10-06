// Variabili globali per la gestione dei dati
let users = JSON.parse(localStorage.getItem('users')) || [];
let projects = JSON.parse(localStorage.getItem('projects')) || [];
let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')) || null;
let currentProject = JSON.parse(localStorage.getItem('currentProject')) || null;

// Funzione per alternare tra i form di registrazione e login
function toggleForms(formId) {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('coworker-login-form').style.display = 'none';
    document.getElementById(formId).style.display = 'block';
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
    if (users.find(user => user.email === email || user.username === username)) {
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
        const user = users.find(user => user.email === email && user.password === password && user.role === 'creator');

        if (!user) {
            alert('Email o password non validi per il creatore di progetto!');
            return;
        }

        loggedInUser = user;
        localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
        alert('Login effettuato con successo come creatore di progetto!');
        document.getElementById('register-login').style.display = 'none';
        document.getElementById('project-management').style.display = 'block';
    } else {
        username = document.getElementById('coworker-username').value;
        password = document.getElementById('coworker-password').value;
        projectId = document.getElementById('project-id').value;

        const project = projects.find(proj => proj.projectId === projectId);
        if (!project) {
            alert('ID progetto non valido!');
            return;
        }

        const user = project.users.find(user => user.username === username && user.password === password);
        if (!user) {
            alert('Username o password non validi per co-worker!');
            return;
        }

        currentProject = project;
        localStorage.setItem('currentProject', JSON.stringify(currentProject));
        alert('Login effettuato con successo come co-worker!');
        document.getElementById('register-login').style.display = 'none';
        document.getElementById('project-dashboard').style.display = 'block';
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
    const projectId = generateProjectId(projectName);

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
            project.users.push({ username, password });
            alert(`Utente ${username} aggiunto al progetto con successo!`);
        }

        addMoreUsers = confirm('Vuoi aggiungere un altro utente?');
    }

    projects.push(project);
    localStorage.setItem('projects', JSON.stringify(projects));
    loggedInUser.projects.push(projectId);
    localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
    alert(`Progetto creato con successo! ID del progetto: ${projectId}`);
}

// Funzione per generare un ID univoco mescolando numeri e lettere del nome del progetto
function generateProjectId(projectName) {
    let id = '';
    const characters = '0123456789';
    const nameArray = projectName.split(''); // Divide il nome del progetto in lettere
    for (let i = 0; i < nameArray.length; i++) {
        const randomNum = characters.charAt(Math.floor(Math.random() * characters.length)); // Numero casuale
        id += randomNum + nameArray[i]; // Combina numero e lettera
    }
    return id;
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

    document.getElementById('project-management').style.display = 'none';
    document.getElementById('project-dashboard').style.display = 'block';
    document.getElementById('project-name').innerText = project.projectName;
    loadProjectTasks(project);
}

// Funzione per caricare i task del progetto corrente
function loadProjectTasks(project) {
    // Svuota le colonne prima di caricare i task
    document.getElementById('to-do').innerHTML = '<h3>To Do</h3>';
    document.getElementById('in-progress').innerHTML = '<h3>In Progress</h3>';
    document.getElementById('done').innerHTML = '<h3>Done</h3>';

    // Itera attraverso i task del progetto e li posiziona nella colonna corretta
    project.tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'task';
        taskElement.innerText = `${task.name} -> ${task.assignedUser}`;
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

// Salvataggio automatico dell'utente loggato e del progetto corrente
if (loggedInUser) {
    document.getElementById('register-login').style.display = 'none';
    document.getElementById('project-management').style.display = 'block';
}

if (currentProject) {
    document.getElementById('register-login').style.display = 'none';
    document.getElementById('project-dashboard').style.display = 'block';
    loadProjectTasks(currentProject);
}
