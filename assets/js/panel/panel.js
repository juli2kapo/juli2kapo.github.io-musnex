// Panel de edición de www.musnex.com.ar. Se entra con ?clave=… (la clave queda solo en memoria).
import { API_URL } from '../contenido.js';
import { ordenarPorFecha, formatearFecha } from '../fechas.js';
import { SECCIONES, nuevoItem } from './secciones.js';
import { crearFormulario } from './formulario.js';

const app = document.getElementById('app');
const estadoEl = document.querySelector('.p-estado');
const clave = new URLSearchParams(location.search).get('clave') || '';
const est = { datos: null, tab: 'conciertos', form: null }; // form: { item, esNuevo, ui, sucio }

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function api(metodo, ruta, cuerpo) {
    const r = await fetch(API_URL + ruta, {
        method: metodo, cache: 'no-store',
        headers: { 'content-type': 'application/json', 'x-edit-key': clave },
        body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    });
    if (!r.ok) throw new Error((await r.text()) || `Error ${r.status}`);
    return r.json();
}

function avisar(texto, error = false) {
    estadoEl.textContent = texto;
    estadoEl.classList.toggle('error', error);
    clearTimeout(avisar.t);
    if (!error && texto) avisar.t = setTimeout(() => (estadoEl.textContent = ''), 4000);
}

const mensaje = texto => (app.innerHTML = `<p class="p-aviso">${esc(texto)}</p>`);

// Si hay cambios sin guardar, pregunta antes de perderlos
const puedeSalir = () => !est.form?.sucio || confirm('Tenés cambios sin guardar. ¿Querés descartarlos?');
addEventListener('beforeunload', e => { if (est.form?.sucio) e.preventDefault(); });

function ordenados(tab) {
    const lista = est.datos[tab];
    return SECCIONES[tab].orden === 'fecha' ? ordenarPorFecha(lista) : lista;
}

function etiquetaFecha(tab, it) {
    if (tab === 'artistas') return '';
    return it.fecha ? formatearFecha(it.fecha) : 'Sin fecha';
}

function render() {
    const def = SECCIONES[est.tab];
    const manual = def.orden === 'manual';
    const lista = ordenados(est.tab);
    app.innerHTML = `
        <nav class="p-tabs">${Object.entries(SECCIONES).map(([k, s]) =>
            `<button type="button" data-tab="${k}" class="${k === est.tab ? 'on' : ''}">${s.titulo} <span>${est.datos[k].length}</span></button>`).join('')}</nav>
        <div class="p-cols">
            <section class="p-lista">
                <button type="button" class="p-btn" data-acc="nuevo">${def.nuevo}</button>
                ${lista.length ? '' : '<p class="p-vacio">Todavía no hay nada cargado acá.</p>'}
                <ul>${lista.map((it, i) => `
                    <li class="${est.form?.item.id === it.id ? 'on' : ''}">
                        <span class="p-fecha-lista">${esc(etiquetaFecha(est.tab, it))}</span>
                        <span class="p-nombre">${esc(def.nombre(it))}</span>
                        <span class="p-acciones">
                            ${manual ? `<button type="button" data-acc="subir" data-id="${it.id}" ${i ? '' : 'disabled'} title="Subir">↑</button>
                            <button type="button" data-acc="bajar" data-id="${it.id}" ${i < lista.length - 1 ? '' : 'disabled'} title="Bajar">↓</button>` : ''}
                            <button type="button" data-acc="editar" data-id="${it.id}" title="Editar">✎</button>
                            <button type="button" data-acc="borrar" data-id="${it.id}" title="Borrar">🗑</button>
                        </span>
                    </li>`).join('')}</ul>
                ${def.orden === 'fecha' ? '<p class="p-nota">En la web se ordenan solos: próximos, sin fecha y los que ya pasaron.</p>' : '<p class="p-nota">En la web aparecen en este orden.</p>'}
            </section>
            <section class="p-editor"></section>
        </div>`;
    const editor = app.querySelector('.p-editor');
    if (!est.form) {
        editor.innerHTML = '<p class="p-vacio">Elegí uno de la lista para editarlo, o tocá el botón de arriba para crear uno nuevo.</p>';
        return;
    }
    editor.innerHTML = `<h2>${est.form.esNuevo ? def.nuevo.replace('+ ', '') : 'Editar: ' + esc(def.nombre(est.form.item))}</h2>`;
    editor.append(est.form.ui.el);
    const botones = document.createElement('div');
    botones.className = 'p-guardar';
    botones.innerHTML = '<button type="button" class="p-btn" data-acc="guardar">Guardar</button><button type="button" class="p-btn p-btn-sec" data-acc="cancelar">Cancelar</button>';
    editor.append(botones);
}

function abrir(item, esNuevo) {
    const form = { item, esNuevo, sucio: false };
    form.ui = crearFormulario(SECCIONES[est.tab], item, { clave, alCambiar: () => (form.sucio = true) });
    est.form = form;
    render();
    app.querySelector('.p-editor input, .p-editor textarea')?.focus();
}

async function guardarSeccion(lista, ok) {
    avisar('Guardando…');
    try {
        const r = await api('PUT', `/api/contenido/${est.tab}`, lista);
        est.datos[est.tab] = r[est.tab];
        avisar(ok);
        return true;
    } catch (e) {
        avisar(e.message, true);
        return false;
    }
}

async function guardar() {
    if (est.form.ui.subiendo()) return avisar('Esperá a que terminen de subirse los archivos.', true);
    let item;
    try { item = est.form.ui.leer(); } catch (e) { return avisar(e.message, true); }
    const lista = est.datos[est.tab].slice();
    const i = lista.findIndex(x => x.id === item.id);
    if (i === -1) lista.push(item); else lista[i] = item;
    if (await guardarSeccion(lista, 'Guardado ✓')) {
        est.form = null;
        render();
    }
}

app.addEventListener('click', async e => {
    const tab = e.target.closest('[data-tab]');
    if (tab) {
        if (tab.dataset.tab === est.tab || !puedeSalir()) return;
        est.tab = tab.dataset.tab;
        est.form = null;
        return render();
    }
    const b = e.target.closest('[data-acc]');
    if (!b) return;
    const lista = est.datos[est.tab];
    const it = lista.find(x => x.id === b.dataset.id);
    switch (b.dataset.acc) {
        case 'nuevo': if (puedeSalir()) abrir(nuevoItem(est.tab), true); break;
        case 'editar': if (est.form?.item.id !== it.id && puedeSalir()) abrir(structuredClone(it), false); break;
        case 'cancelar': if (puedeSalir()) { est.form = null; render(); } break;
        case 'guardar': await guardar(); break;
        case 'borrar': {
            if (!confirm(`¿Borrar "${SECCIONES[est.tab].nombre(it)}"? No se puede deshacer.`)) return;
            if (await guardarSeccion(lista.filter(x => x.id !== it.id), 'Borrado ✓')) {
                if (est.form?.item.id === it.id) est.form = null;
                render();
            }
            break;
        }
        case 'subir': case 'bajar': {
            const nueva = lista.slice();
            const i = nueva.indexOf(it), j = i + (b.dataset.acc === 'subir' ? -1 : 1);
            [nueva[i], nueva[j]] = [nueva[j], nueva[i]];
            if (await guardarSeccion(nueva, 'Orden guardado ✓')) render();
            break;
        }
    }
});

async function iniciar() {
    if (!clave) return mensaje('Para entrar al panel usá tu link de edición (el que termina en ?clave=…).');
    try { await api('GET', '/api/acceso'); } catch (e) {
        return mensaje(/Clave/.test(e.message) ? 'Link de edición inválido. Revisá que hayas copiado el link completo.' : 'No se pudo conectar con el servidor. Probá de nuevo en un rato.');
    }
    try { est.datos = await api('GET', '/api/contenido'); } catch {
        return mensaje('No se pudo cargar el contenido. Probá de nuevo en un rato.');
    }
    render();
}
iniciar();
