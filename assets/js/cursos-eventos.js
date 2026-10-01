// Cursos/Eventos: tarjetas desde el contenido editable, ordenadas por fecha
// (próximos → sin fecha → pasados).
import { cargarContenido, esc, linkify, botonHTML, errorHTML } from './contenido.js';
import { ordenarPorFecha, formatearFecha } from './fechas.js';

const listaEventos = document.querySelector('.eventos-lista');
const listaCursos = document.querySelector('.cursos-lista');
const fechaHTML = f => f ? `<p class="evento-fecha">${formatearFecha(f)}</p>` : '';
const textoHTML = t => t ? `<p>${linkify(t)}</p>` : '';

try {
    const { eventos, cursos } = await cargarContenido();
    listaEventos.innerHTML = ordenarPorFecha(eventos).map(e => `
        <article class="evento-card">
            <h3>${esc(e.titulo)}</h3>${fechaHTML(e.fecha)}${textoHTML(e.texto)}${botonHTML(e.boton, 'evento-link')}
        </article>`).join('') || '<p class="vacio">Próximamente nuevos eventos.</p>';
    listaCursos.innerHTML = ordenarPorFecha(cursos).map(c => `
        <div class="pill">
            ${c.imagen ? `<img class="pill-img" src="${esc(c.imagen.url)}" alt="${esc(c.titulo)}" loading="lazy">` : ''}
            <h3>${esc(c.titulo)}</h3>${fechaHTML(c.fecha)}${textoHTML(c.texto)}${botonHTML(c.boton, 'btn-rect')}
        </div>`).join('') || '<p class="vacio">Próximamente nuevos cursos.</p>';
} catch {
    listaEventos.innerHTML = errorHTML('los eventos');
    listaCursos.innerHTML = errorHTML('los cursos');
}
