// Configurazione del Gioco "Trova le Differenze"
const gameConfig = {
    modes: {
        EASY: { differences: 5, imgSize: 300 },
        MEDIUM: { differences: 7, imgSize: 400 },
        HARD: { differences: 10, imgSize: 500 }
    },
    mode: 'EASY', // Modalità di default
    colorMode: 'Color', // Colore di default
    differences: [],
    foundDifferences: 0
};

// Elemento di selezione per la modalità di gioco
const createModeSelection = () => {
    const container = document.createElement('div');
    container.style.textAlign = 'center';
    container.style.margin = '20px';

    const label = document.createElement('label');
    label.textContent = 'Seleziona Modalità: ';
    container.appendChild(label);

    const select = document.createElement('select');
    select.id = 'mode-select';

    Object.keys(gameConfig.modes).forEach(mode => {
        const option = document.createElement('option');
        option.value = mode;
        option.textContent = mode;
        select.appendChild(option);
    });

    select.addEventListener('change', e => {
        gameConfig.mode = e.target.value;
        resetGame();
    });

    container.appendChild(select);
    return container;
};

// Elemento di selezione per il colore (Bianco&Nero/Colore)
const createColorSelection = () => {
    const container = document.createElement('div');
    container.style.textAlign = 'center';
    container.style.margin = '20px';

    const label = document.createElement('label');
    label.textContent = 'Modalità Colore: ';
    container.appendChild(label);

    const select = document.createElement('select');
    select.id = 'color-select';

    ['Color', 'B&W'].forEach(color => {
        const option = document.createElement('option');
        option.value = color;
        option.textContent = color;
        select.appendChild(option);
    });

    select.addEventListener('change', e => {
        gameConfig.colorMode = e.target.value;
        resetGame();
    });

    container.appendChild(select);
    return container;
};

// Creazione delle immagini del gioco
const createGameImages = () => {
    const container = document.createElement('div');
    container.className = 'game-area';
    container.style.display = 'flex';
    container.style.justifyContent = 'center';

    // Immagine originale
    const originalImage = createImage();
    container.appendChild(originalImage);

    // Immagine con differenze
    const modifiedImage = createImage(true);
    container.appendChild(modifiedImage);

    return container;
};

// Creazione di un'immagine (originale o modificata)
const createImage = (isModified = false) => {
    const imgSize = gameConfig.modes[gameConfig.mode].imgSize;
    const canvas = document.createElement('canvas');
    canvas.width = imgSize;
    canvas.height = imgSize;
    canvas.className = 'game-image';
    canvas.style.border = '1px solid black';
    const ctx = canvas.getContext('2d');

    // Riempimento casuale del canvas per creare l'immagine
    ctx.fillStyle = isModified ? 'lightgrey' : 'white';
    ctx.fillRect(0, 0, imgSize, imgSize);

    // Disegno delle differenze solo se è l'immagine modificata
    if (isModified) {
        createDifferences(ctx, imgSize);
    }

    // Aggiunta evento click per trovare le differenze
    canvas.addEventListener('click', (e) => handleImageClick(e, canvas, ctx));

    return canvas;
};

// Creazione di differenze casuali nell'immagine
const createDifferences = (ctx, size) => {
    gameConfig.differences = [];
    const diffCount = gameConfig.modes[gameConfig.mode].differences;
    
    for (let i = 0; i < diffCount; i++) {
        const x = Math.random() * (size - 20);
        const y = Math.random() * (size - 20);
        ctx.fillStyle = 'red';
        ctx.fillRect(x, y, 20, 20);
        gameConfig.differences.push({ x, y, found: false });
    }
};

// Gestione del click sull'immagine per trovare le differenze
const handleImageClick = (e, canvas, ctx) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Controlla se il click è su una differenza
    gameConfig.differences.forEach((diff, index) => {
        if (!diff.found && Math.abs(x - diff.x) < 20 && Math.abs(y - diff.y) < 20) {
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 4;
            ctx.strokeRect(diff.x, diff.y, 20, 20);
            gameConfig.differences[index].found = true;
            gameConfig.foundDifferences++;
        }
    });

    // Controlla se tutte le differenze sono state trovate
    if (gameConfig.foundDifferences === gameConfig.differences.length) {
        showWinMessage();
    }
};

// Visualizzazione del messaggio "HAI VINTO"
const showWinMessage = () => {
    alert('HAI VINTO! Complimenti, hai trovato tutte le differenze!');
    resetGame();
};

// Reset del gioco per iniziare una nuova partita
const resetGame = () => {
    gameConfig.foundDifferences = 0;
    document.getElementById('game').innerHTML = '';
    initializeGame();
};

// Inizializzazione del gioco
const initializeGame = () => {
    const gameContainer = document.getElementById('game');
    gameContainer.appendChild(createModeSelection());
    gameContainer.appendChild(createColorSelection());
    gameContainer.appendChild(createGameImages());
};

// Avvio del gioco al caricamento della pagina
window.onload = () => {
    initializeGame();
};
