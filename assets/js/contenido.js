// Contenido editable (conciertos, artistas, eventos, cursos) que se carga desde la API.
// En localhost se puede probar contra otra API con ?api=http://localhost:8787
const enLocal = typeof location !== 'undefined' && /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
const apiLocal = enLocal ? new URLSearchParams(location.search).get('api') : null;
export const API_URL = apiLocal || 'https://api.musnex.com.ar';

let pedido;
export function cargarContenido() {
    pedido ||= fetch(API_URL + '/api/contenido', { cache: 'no-cache' }).then(r => {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
    });
    return pedido;
}

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const linkify = s => esc(s).replace(/https?:\/\/[^\s<]+/g, u => `<a href="${u}" target="_blank" rel="noopener">${u}</a>`);
export const botonHTML = (b, clase) => b ? `<a class="${clase}" href="${esc(b.url)}" target="_blank" rel="noopener">${esc(b.texto)}</a>` : '';
export const errorHTML = que => `<p class="carga-error">No se pudieron cargar ${que}. Probá de nuevo en un rato.</p>`;
