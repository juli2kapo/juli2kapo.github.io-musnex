// Fotos, videos y YouTube: uno solo o en carrusel. Los listeners se instalan una vez para toda la página.
import { esc } from './contenido.js';

const ytMiniatura = id => `https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg`;
const ytPortada = (id, alt) => `<img src="${ytMiniatura(id)}" alt="${esc(alt)}" loading="lazy"><button class="play" aria-label="Reproducir video"></button>`;

export const aspecto = media => media?.length ? `${+media[0].ancho} / ${+media[0].alto}` : '4 / 3';

export function miniatura(media) {
    for (const m of media || []) {
        if (m.tipo === 'imagen') return m.url;
        if (m.tipo === 'youtube') return ytMiniatura(m.url);
    }
    return '';
}

function itemHTML(m, alt) {
    if (m.tipo === 'imagen') return `<img src="${esc(m.url)}" alt="${esc(alt)}" loading="lazy">`;
    if (m.tipo === 'video') return `<video src="${esc(m.url)}" controls preload="metadata" playsinline></video>`;
    return `<div class="yt" data-yt="${esc(m.url)}" data-alt="${esc(alt)}">${ytPortada(m.url, alt)}</div>`;
}

export function mediaHTML(media, alt) {
    if (!media?.length) return '';
    if (media.length === 1) return `<div class="media">${itemHTML(media[0], alt)}</div>`;
    return `<div class="media carrusel" data-i="0">${media.map((m, i) => `<div class="slide${i ? '' : ' on'}">${itemHTML(m, alt)}</div>`).join('')}`
        + `<button class="c-prev" aria-label="Anterior">‹</button><button class="c-next" aria-label="Siguiente">›</button>`
        + `<div class="c-dots">${media.map((_, i) => `<span${i ? '' : ' class="on"'}></span>`).join('')}</div></div>`;
}

// Deja de reproducir lo que haya en un slide (video pausado, YouTube vuelve a la portada)
function detener(el) {
    el.querySelectorAll('video').forEach(v => v.pause());
    el.querySelectorAll('.yt').forEach(yt => {
        if (yt.querySelector('iframe')) yt.innerHTML = ytPortada(yt.dataset.yt, yt.dataset.alt);
    });
    el.closest('.card')?.classList.remove('reproduciendo');
}

if (typeof document !== 'undefined') {
    document.addEventListener('click', e => {
        const play = e.target.closest('.yt .play');
        if (play) {
            const yt = play.closest('.yt');
            yt.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(yt.dataset.yt)}?autoplay=1&rel=0" title="Video" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
            yt.closest('.card')?.classList.add('reproduciendo');
            return;
        }
        const flecha = e.target.closest('.c-prev, .c-next');
        if (!flecha) return;
        const c = flecha.closest('.carrusel');
        const slides = c.querySelectorAll('.slide');
        const puntos = c.querySelectorAll('.c-dots span');
        let i = +c.dataset.i;
        detener(slides[i]);
        slides[i].classList.remove('on');
        puntos[i].classList.remove('on');
        i = (i + (flecha.classList.contains('c-next') ? 1 : -1) + slides.length) % slides.length;
        slides[i].classList.add('on');
        puntos[i].classList.add('on');
        c.dataset.i = i;
    });
    // Mientras se reproduce un video, el texto de la tarjeta de artista se oculta
    document.addEventListener('play', e => e.target.closest?.('.card')?.classList.add('reproduciendo'), true);
    document.addEventListener('pause', e => e.target.closest?.('.card')?.classList.remove('reproduciendo'), true);
}
