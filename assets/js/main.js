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
    const step = () => (track.querySelector('.card')?.offsetWidth || 0) + 8;
    document.querySelector('.prev').addEventListener('click', () => {
        track.scrollLeft <= 2 ? track.scrollTo({ left: track.scrollWidth }) : track.scrollBy({ left: -step() });
    });
    document.querySelector('.next').addEventListener('click', () => {
        track.scrollLeft + track.clientWidth >= track.scrollWidth - 2 ? track.scrollTo({ left: 0 }) : track.scrollBy({ left: step() });
    });
}

// Formulario: el de Wix no funciona fuera de Wix, se envía por FormSubmit.
// Envío normal (no AJAX) porque FormSubmit solo manda adjuntos así; después vuelve con ?enviado=1
const form = document.getElementById('form');
if (form) {
    const msg = form.querySelector('.form-msg');
    const cv = form.querySelector('#cv');
    if (new URLSearchParams(location.search).has('enviado')) {
        msg.textContent = '¡Muchas gracias por contactarnos! Te responderemos a la brevedad.';
        history.replaceState(null, '', location.pathname + '#contacto');
    }
    cv.addEventListener('change', () => {
        const f = cv.files[0];
        if (f && !/\.pdf$/i.test(f.name)) cv.setCustomValidity('El archivo tiene que ser un PDF.');
        else if (f && f.size > 10 * 1024 * 1024) cv.setCustomValidity('El PDF no puede pesar más de 10 MB.');
        else cv.setCustomValidity('');
        cv.reportValidity();
    });
    form.addEventListener('submit', () => {
        form.querySelector('button').disabled = true;
        msg.textContent = 'Enviando…';
    });
    // Si vuelven con "atrás", el botón no queda trabado
    addEventListener('pageshow', () => {
        form.querySelector('button').disabled = false;
        if (msg.textContent === 'Enviando…') msg.textContent = '';
    });
}
