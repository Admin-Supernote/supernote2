// Variabili globali
let users = JSON.parse(localStorage.getItem('users')) || [];
let projects = JSON.parse(localStorage.getItem('projects')) || [];
let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')) || null;

// Funzione per alternare tra i form di registrazione e login
function toggleForms() {
    document.getElementById('register-form').style.display = document.getElementById('register-form').style.display === 'none' ? 'block' : 'none';
    document.getElementById('login-form').style.display = document.getElementById('login-form').style.display === 'none' ? 'block' : 'none';
}

// Funzione per registrare un nuovo utente
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

    users.push({ email, username, password, projects: [] });
    localStorage.setItem('users', JSON.stringify(users));
    alert('Registrazione avvenuta con successo!');
    toggleForms();
}

// Funzione per effettuare il login
function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const user = users.find(user => user.email === email && user.password === password);

    if (!user) {
        alert('Email o password non validi!');
        return;
    }

    loggedInUser = user;
    localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
    alert('Login effettuato con successo!');
    document.getElementById('register-login').style.display = 'none';
    document.getElementById('project-management').style.display = 'block';
}

// Funzione per creare un nuovo progetto
function createProject() {
    const projectName = prompt('Inserisci il nome del progetto:');
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

// Funzione per caricare un progetto specifico
function loadProject(projectId) {
    const project = projects.find(proj => proj.projectId === projectId);
    if (!project) return;

    document.getElementById('project-management').style.display = 'none';
    document.getElementById('project-dashboard').style.display = 'block';
    document.getElementById('project-name').innerText = project.projectName;
}

// Funzione di esempio per le impostazioni
function settings() {
    alert('Impostazioni utente in fase di sviluppo.');
}

// Salvataggio automatico dell'utente loggato
if (loggedInUser) {
    document.getElementById('register-login').style.display = 'none';
    document.getElementById('project-management').style.display = 'block';
}
