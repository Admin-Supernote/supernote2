// Funzione per generare il link di condivisione
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

    // Codifica tutte le immagini in base64 e crea un array di dati
    const imageDataArray = [];
    for (const file of files) {
        const base64Data = await getBase64(file);
        imageDataArray.push(encodeURIComponent(base64Data));
    }

    // Crea un URL con le immagini e la descrizione come parametri
    const imageParams = imageDataArray.join('|');
    const encodedDescription = encodeURIComponent(description);
    const shareableLink = `${window.location.href.split('?')[0]}?images=${imageParams}&description=${encodedDescription}`;

    // Mostra il link nella pagina
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

// Funzione per visualizzare le immagini e la descrizione da un link condiviso
function showSharedContent() {
    const params = new URLSearchParams(window.location.search);
    const imagesParam = params.get('images');
    const descriptionParam = params.get('description');

    if (imagesParam) {
        const imageContainer = document.createElement('div');
        imageContainer.style.marginTop = '20px';
        document.querySelector('.container').appendChild(imageContainer);

        // Decodifica le immagini e crea elementi img
        const imageArray = imagesParam.split('|');
        imageArray.forEach(base64 => {
            const img = document.createElement('img');
            img.src = decodeURIComponent(base64);
            imageContainer.appendChild(img);
        });
    }

    if (descriptionParam) {
        const descriptionContainer = document.createElement('p');
        descriptionContainer.textContent = `Descrizione: ${decodeURIComponent(descriptionParam)}`;
        document.querySelector('.container').appendChild(descriptionContainer);
    }
}

// Mostra il contenuto condiviso se presente nell'URL
window.onload = showSharedContent;
