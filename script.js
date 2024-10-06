// Funzione per generare un hash unico per le immagini
function hashCode(str) {
    let hash = 0, i, chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash.toString(16);
}

// Funzione per generare un link di condivisione
async function generateLink() {
    const fileInput = document.getElementById('file-input');
    const description = document.getElementById('description').value.trim();
    const files = fileInput.files;
    const linkContainer = document.getElementById('link-container');

    if (files.length === 0) {
        alert('Per favore, seleziona almeno un\'immagine.');
        return;
    }

    // Visualizza un messaggio di caricamento
    linkContainer.innerHTML = '<p>Generazione del link in corso...</p>';

    // Crea un hash per ogni immagine e raccogli i dati
    const imageHashes = [];
    for (const file of files) {
        const base64Data = await getBase64(file);
        const imageHash = hashCode(base64Data);
        imageHashes.push(imageHash);
    }

    // Crea un hash combinato basato su tutte le immagini e la descrizione
    const combinedHash = hashCode(imageHashes.join('') + description);

    // Salva l'hash combinato nel localStorage del browser (per simulare l'archiviazione)
    localStorage.setItem(combinedHash, JSON.stringify({ images: imageHashes, description }));

    // Genera un link corto basato sull'hash combinato
    const shareableLink = `${window.location.href.split('?')[0]}?id=${combinedHash}`;
    linkContainer.innerHTML = `
        <div class="link">
            <strong>Link di Condivisione:</strong> <br>
            <a href="${shareableLink}" target="_blank">${shareableLink}</a>
        </div>
    `;
}

// Funzione per convertire un'immagine in base64
function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

// Funzione per mostrare le immagini e la descrizione da un link condiviso
function showSharedContent() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (id) {
        // Recupera i dati salvati da localStorage
        const storedData = localStorage.getItem(id);
        if (storedData) {
            const { images, description } = JSON.parse(storedData);

            // Crea un contenitore per le immagini e la descrizione
            const container = document.querySelector('.container');
            const imageContainer = document.createElement('div');
            imageContainer.style.marginTop = '20px';
            container.appendChild(imageContainer);

            images.forEach(imageHash => {
                const img = document.createElement('img');
                img.src = `data:image/png;base64,${imageHash}`; // Sostituisci con un vero valore base64
                imageContainer.appendChild(img);
            });

            const descriptionContainer = document.createElement('p');
            descriptionContainer.textContent = `Descrizione: ${description}`;
            container.appendChild(descriptionContainer);
        } else {
            alert('Nessun contenuto trovato per questo ID.');
        }
    }
}

// Mostra il contenuto condiviso se presente nell'URL
window.onload = showSharedContent;
