// Editor de fotos/videos de un elemento: subir a UploadThing, pegar YouTube, ordenar y quitar.
const RE_YT = /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([A-Za-z0-9_-]{11})/;

export function idYoutube(texto) {
    const t = texto.trim();
    return RE_YT.exec(t)?.[1] || (/^[A-Za-z0-9_-]{11}$/.test(t) ? t : null);
}

// Ancho y alto reales del archivo, medidos en el navegador antes de subirlo
function medir(file) {
    const url = URL.createObjectURL(file);
    return new Promise((ok, mal) => {
        const listo = (ancho, alto) => {
            URL.revokeObjectURL(url);
            ancho && alto ? ok({ ancho, alto }) : mal(new Error(`No se pudo leer "${file.name}". ¿Es una foto o un video MP4?`));
        };
        if (file.type.startsWith('video/')) {
            const v = document.createElement('video');
            v.preload = 'metadata';
            v.onloadedmetadata = () => listo(v.videoWidth, v.videoHeight);
            v.onerror = () => listo();
            v.src = url;
        } else {
            const i = new Image();
            i.onload = () => listo(i.naturalWidth, i.naturalHeight);
            i.onerror = () => listo();
            i.src = url;
        }
    });
}

const LIMITE = { imagen: 64, video: 256 }; // MB, igual que la API

export function crearEditorMedia(inicial, { clave, soloImagen = false, alCambiar = () => {} }) {
    const items = (Array.isArray(inicial) ? inicial : inicial ? [inicial] : []).map(m => ({ ...m }));
    const max = soloImagen ? 1 : 30;
    let enCurso = 0;
    const el = document.createElement('div');
    el.className = 'p-media';

    const aviso = t => { const p = el.querySelector('.p-prog'); if (p) p.textContent = t; };

    function pintar(textoAviso = '') {
        const thumb = m => m.tipo === 'video'
            ? `<video src="${m.url}" muted preload="metadata"></video>`
            : `<img src="${m.tipo === 'youtube' ? `https://i.ytimg.com/vi/${m.url}/mqdefault.jpg` : m.url}" alt="">`;
        el.innerHTML = `
            <div class="p-thumbs">${items.map((m, i) => `
                <figure>${thumb(m)}
                    <figcaption>${m.tipo === 'youtube' ? 'YouTube' : m.tipo === 'video' ? 'Video' : 'Foto'}${i === 0 && !soloImagen ? ' · principal' : ''}</figcaption>
                    <div class="p-acc">
                        ${soloImagen ? '' : `<button type="button" data-a="izq" data-i="${i}" ${i ? '' : 'disabled'} title="Mover antes">←</button>
                        <button type="button" data-a="der" data-i="${i}" ${i < items.length - 1 ? '' : 'disabled'} title="Mover después">→</button>`}
                        <button type="button" data-a="quitar" data-i="${i}" title="Quitar">✕</button>
                    </div>
                </figure>`).join('')}</div>
            <div class="p-subir">
                ${items.length < max ? `<label class="p-btn p-btn-sec">${soloImagen ? 'Elegir imagen' : 'Subir fotos/videos'}
                    <input type="file" hidden ${soloImagen ? 'accept="image/*"' : 'multiple accept="image/*,video/mp4,video/webm"'}></label>
                    ${soloImagen ? '' : `<input type="text" class="p-yt" placeholder="…o pegá un link de YouTube">
                    <button type="button" class="p-btn p-btn-sec" data-a="yt">Agregar</button>`}` : ''}
                <span class="p-prog" role="status">${textoAviso}</span>
            </div>`;
    }

    el.addEventListener('click', e => {
        const b = e.target.closest('button[data-a]');
        if (!b) return;
        const i = +b.dataset.i;
        if (b.dataset.a === 'quitar') items.splice(i, 1);
        else if (b.dataset.a === 'izq') [items[i - 1], items[i]] = [items[i], items[i - 1]];
        else if (b.dataset.a === 'der') [items[i + 1], items[i]] = [items[i], items[i + 1]];
        else if (b.dataset.a === 'yt') {
            const id = idYoutube(el.querySelector('.p-yt').value);
            if (!id) return aviso('Ese link de YouTube no es válido. Copiá el link del video desde YouTube.');
            items.push({ tipo: 'youtube', url: id, ancho: 16, alto: 9 });
        }
        pintar();
        alCambiar();
    });

    el.addEventListener('change', async e => {
        if (e.target.type !== 'file') return;
        const files = [...e.target.files].slice(0, max - items.length);
        e.target.value = '';
        for (const f of files) {
            const tipo = f.type.startsWith('video/') ? 'video' : 'imagen';
            if (f.size > LIMITE[tipo] * 1024 * 1024) return aviso(`"${f.name}" pesa más de ${LIMITE[tipo]} MB.`);
        }
        enCurso++;
        try {
            for (let n = 0; n < files.length; n++) {
                aviso(`Subiendo ${n + 1} de ${files.length}…`);
                const f = files[n];
                const medida = await medir(f);
                const [r] = await window.UT.uploadFiles('media', { files: [f], headers: { 'x-edit-key': clave } });
                items.push({ tipo: f.type.startsWith('video/') ? 'video' : 'imagen', url: r.ufsUrl || r.url, key: r.key, ...medida });
                pintar(`Subiendo ${n + 1} de ${files.length}…`);
                alCambiar();
            }
            pintar('Listo ✓ (falta tocar Guardar)');
        } catch (err) {
            pintar('No se pudo subir: ' + (err.message || 'error desconocido'));
        } finally {
            enCurso--;
        }
    });

    pintar();
    return { el, valor: () => items.map(m => ({ ...m })), subiendo: () => enCurso > 0 };
}
