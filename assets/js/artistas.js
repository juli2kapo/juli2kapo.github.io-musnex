// Inicio: tarjetas de Artistas destacados desde el contenido editable.
import { cargarContenido, esc, botonHTML, errorHTML } from './contenido.js';
import { mediaHTML, aspecto } from './media.js';

const track = document.querySelector('.track');
try {
    const { artistas } = await cargarContenido();
    track.innerHTML = artistas.map(a => `
        <article class="card" style="aspect-ratio: ${aspecto(a.media)}">
            ${mediaHTML(a.media, a.nombre)}
            <div class="card-info">
                <h3>${esc(a.nombre)}</h3>
                ${a.texto ? `<p>${esc(a.texto)}</p>` : ''}
                ${botonHTML(a.boton, 'card-btn')}
            </div>
        </article>`).join('');
} catch {
    track.innerHTML = errorHTML('los artistas');
}
