// Calendario de conciertos: arma el mes y muestra el detalle del concierto elegido.
import { cargarContenido, esc, linkify, botonHTML, errorHTML } from './contenido.js';
import { mediaHTML, aspecto, miniatura } from './media.js';
import { MESES, DIAS, porFechaYHora } from './fechas.js';

let conciertos = [];
let fallo = false;
try {
    conciertos = (await cargarContenido()).conciertos;
} catch {
    fallo = true;
}

const eventos = conciertos
    .slice().sort(porFechaYHora)
    .map(e => ({ ...e, d: new Date(e.fecha + 'T00:00:00') }));
const key = d => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const porDia = {};
eventos.forEach(e => (porDia[key(e.d)] ||= []).push(e));

const grid = document.querySelector('.cal-grid');
const titulo = document.querySelector('.cal-head h2');
const panel = document.querySelector('.event-panel');

const hoy = new Date();
hoy.setHours(0, 0, 0, 0);
// Abre en el mes actual; si este mes no hay nada pero hay un concierto futuro, abre en ese mes
let actual = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
const proximo = eventos.find(e => e.d >= hoy);
const hayEsteMes = eventos.some(e => e.d.getFullYear() === actual.getFullYear() && e.d.getMonth() === actual.getMonth());
if (!hayEsteMes && proximo) actual = new Date(proximo.d.getFullYear(), proximo.d.getMonth(), 1);

// Muestra todos los conciertos de un día (normalmente uno; si hay varios, uno debajo del otro)
function mostrar(evs) {
    grid.querySelectorAll('.day.active').forEach(d => d.classList.remove('active'));
    if (fallo) {
        panel.innerHTML = errorHTML('los conciertos');
        return;
    }
    if (!evs?.length) {
        panel.innerHTML = `<p class="none">No hay conciertos programados este mes.<br><br>
            Seguinos en <a href="https://www.instagram.com/malena.sol.decuzzi/" target="_blank" rel="noopener">Instagram</a>
            para enterarte de las próximas fechas.</p>`;
        return;
    }
    grid.querySelector(`[data-key="${key(evs[0].d)}"]`)?.classList.add('active');
    panel.innerHTML = evs.map(e => {
        const fecha = `${DIAS[e.d.getDay()]} ${e.d.getDate()} de ${MESES[e.d.getMonth()].toLowerCase()} de ${e.d.getFullYear()}`;
        return `<article class="concierto">
            ${e.media.length ? `<div class="panel-media" style="aspect-ratio: ${aspecto(e.media)}">${mediaHTML(e.media, e.titulo)}</div>` : ''}
            <h3>${esc(e.titulo)}</h3>
            <p class="when">${e.hora ? esc(e.hora) + ' hs<br>' : ''}${fecha}</p>
            <p class="desc">${linkify(e.descripcion)}</p>
            ${botonHTML(e.boton, 'btn-rect')}
        </article>`;
    }).join('');
}

function render() {
    const y = actual.getFullYear(), m = actual.getMonth();
    titulo.textContent = `${MESES[m]} ${y}`;
    grid.innerHTML = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => `<div class="dow">${d}</div>`).join('');
    const primero = new Date(y, m, 1).getDay();
    const total = new Date(y, m + 1, 0).getDate();
    for (let i = 0; i < primero; i++) grid.insertAdjacentHTML('beforeend', '<div class="day empty"></div>');
    for (let n = 1; n <= total; n++) {
        const d = new Date(y, m, n);
        const evs = porDia[key(d)];
        const el = document.createElement(evs ? 'button' : 'div');
        el.className = 'day' + (evs ? ' has-event' : '') + (d.getTime() === hoy.getTime() ? ' today' : '');
        el.innerHTML = `<span>${n}</span>`;
        if (evs) {
            el.dataset.key = key(d);
            el.setAttribute('aria-label', `${n}: ${evs.map(e => e.titulo).join(', ')}`);
            const fondo = miniatura(evs[0].media);
            if (fondo) el.style.backgroundImage = `url("${encodeURI(fondo)}")`;
            el.addEventListener('click', () => mostrar(evs));
        }
        grid.appendChild(el);
    }
    const delMes = eventos.filter(e => e.d.getFullYear() === y && e.d.getMonth() === m);
    const elegido = delMes.find(e => e.d >= hoy) || delMes[0];
    mostrar(elegido && porDia[key(elegido.d)]);
}

document.querySelector('.cal-prev').addEventListener('click', () => { actual.setMonth(actual.getMonth() - 1); render(); });
document.querySelector('.cal-next').addEventListener('click', () => { actual.setMonth(actual.getMonth() + 1); render(); });
render();
