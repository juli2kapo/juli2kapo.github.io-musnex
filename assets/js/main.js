// Menú móvil
const header = document.querySelector('header');
const menuBtn = document.querySelector('.menu-btn');
menuBtn.addEventListener('click', () => {
    const open = header.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
});

// Slider de artistas (inicio)
const track = document.querySelector('.track');
if (track) {
    const step = () => track.querySelector('.card').offsetWidth + 8;
    document.querySelector('.prev').addEventListener('click', () => {
        track.scrollLeft <= 2 ? track.scrollTo({ left: track.scrollWidth }) : track.scrollBy({ left: -step() });
    });
    document.querySelector('.next').addEventListener('click', () => {
        track.scrollLeft + track.clientWidth >= track.scrollWidth - 2 ? track.scrollTo({ left: 0 }) : track.scrollBy({ left: step() });
    });
}

// Tarjeta con video: carga YouTube recién al tocar play
document.querySelectorAll('.card[data-youtube] .play').forEach(btn => {
    btn.addEventListener('click', () => {
        const card = btn.closest('.card');
        card.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${card.dataset.youtube}?autoplay=1&rel=0"
            title="Melodías Eternas" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
    });
});

// Formulario: el de Wix no funciona fuera de Wix, se envía por FormSubmit
const form = document.getElementById('form');
if (form) {
    const msg = form.querySelector('.form-msg');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button');
        btn.disabled = true;
        msg.textContent = 'Enviando…';
        try {
            const res = await fetch('https://formsubmit.co/ajax/gestion@musnex.com.ar', {
                method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form)
            });
            if (!res.ok) throw new Error();
            form.reset();
            msg.textContent = '¡Muchas gracias por contactarnos! Te responderemos a la brevedad.';
        } catch {
            msg.innerHTML = 'No se pudo enviar. Escribinos a <a href="mailto:gestion@musnex.com.ar">gestion@musnex.com.ar</a>.';
        } finally {
            btn.disabled = false;
        }
    });
}
