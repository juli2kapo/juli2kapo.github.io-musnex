// Arma el formulario de un elemento según los campos de su sección y lo vuelve a leer al guardar.
import { crearEditorMedia } from './media-editor.js';

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

function control(tag, props = {}) {
    const el = document.createElement(tag);
    Object.assign(el, props);
    return el;
}

function obligatorio(c, v) {
    if (c.req && !v) throw new Error(`Falta completar: ${c.label}.`);
    return v;
}

// Fecha que puede ser día exacto, solo mes o "sin fecha definida"
function fechaFlexible(valor) {
    const caja = control('div', { className: 'p-fecha' });
    const modo = control('select');
    modo.innerHTML = '<option value="dia">Día exacto</option><option value="mes">Solo mes</option><option value="sin">Sin fecha definida</option>';
    const dia = control('input', { type: 'date' });
    const mes = control('select');
    mes.innerHTML = MESES.map((m, i) => `<option value="${String(i + 1).padStart(2, '0')}">${m}</option>`).join('');
    const anio = control('input', { type: 'number', min: 2020, max: 2100, value: new Date().getFullYear() });
    const [a, m, d] = (valor || '').split('-');
    modo.value = !valor ? 'sin' : d ? 'dia' : 'mes';
    if (d) dia.value = valor;
    if (a && !d) { mes.value = m; anio.value = a; }
    const actualizar = () => {
        dia.hidden = modo.value !== 'dia';
        mes.hidden = anio.hidden = modo.value !== 'mes';
    };
    modo.addEventListener('change', actualizar);
    actualizar();
    caja.append(modo, dia, mes, anio);
    const leer = () => {
        if (modo.value === 'sin') return '';
        if (modo.value === 'dia') {
            if (!dia.value) throw new Error('Elegí el día de la fecha (o cambiá a "Sin fecha definida").');
            return dia.value;
        }
        if (!/^\d{4}$/.test(anio.value)) throw new Error('El año de la fecha no es válido.');
        return `${anio.value}-${mes.value}`;
    };
    return { el: caja, leer };
}

function botonConLink(valor) {
    const caja = control('div', { className: 'p-boton' });
    const texto = control('input', { type: 'text', placeholder: 'Texto del botón (ej.: Entradas)', value: valor?.texto || '', maxLength: 60 });
    const url = control('input', { type: 'url', placeholder: 'https://…', value: valor?.url || '' });
    caja.append(texto, url);
    const leer = () => {
        const t = texto.value.trim(), u = url.value.trim();
        if (!t && !u) return null;
        if (!t || !u) throw new Error('El botón necesita texto y link (o dejá los dos vacíos).');
        if (!/^(https?:\/\/|mailto:)/i.test(u)) throw new Error('El link del botón tiene que empezar con https://');
        return { texto: t, url: u };
    };
    return { el: caja, leer };
}

export function crearFormulario(def, item, { clave, alCambiar }) {
    const form = control('form', { className: 'p-form', noValidate: true });
    const lectores = [];
    const editores = [];
    for (const c of def.campos) {
        const campo = control('div', { className: 'p-campo' });
        const label = control('label', { textContent: c.label + (c.req ? ' *' : '') });
        campo.append(label);
        if (c.ayuda) campo.append(control('small', { textContent: c.ayuda }));
        const v = item[c.k];
        if (c.tipo === 'linea' || c.tipo === 'dia' || c.tipo === 'hora') {
            const i = control('input', { type: { linea: 'text', dia: 'date', hora: 'time' }[c.tipo], value: v || '' });
            campo.append(i);
            lectores.push(() => [c.k, obligatorio(c, i.value.trim())]);
        } else if (c.tipo === 'area') {
            const t = control('textarea', { rows: 6, value: v || '' });
            campo.append(t);
            lectores.push(() => [c.k, t.value.trim()]);
        } else if (c.tipo === 'fechaFlexible' || c.tipo === 'boton') {
            const f = c.tipo === 'boton' ? botonConLink(v) : fechaFlexible(v);
            campo.append(f.el);
            lectores.push(() => [c.k, f.leer()]);
        } else {
            const ed = crearEditorMedia(v, { clave, soloImagen: c.tipo === 'imagen', alCambiar });
            campo.append(ed.el);
            editores.push(ed);
            lectores.push(() => [c.k, c.tipo === 'imagen' ? ed.valor()[0] || null : ed.valor()]);
        }
        form.append(campo);
    }
    form.addEventListener('input', alCambiar);
    form.addEventListener('change', alCambiar);
    form.addEventListener('submit', e => e.preventDefault());
    return {
        el: form,
        leer: () => Object.fromEntries([['id', item.id], ...lectores.map(f => f())]),
        subiendo: () => editores.some(e => e.subiendo()),
    };
}
