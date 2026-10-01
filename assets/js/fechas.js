// Fechas de conciertos, eventos y cursos. "AAAA-MM-DD" = día exacto, "AAAA-MM" = solo mes, "" = sin fecha.
export const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
export const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

// Último día en que la fecha sigue siendo "próxima" ("2026-03" vale hasta el 31/3)
export function finDeFecha(f) {
    if (!f) return null;
    const [a, m, d] = f.split('-').map(Number);
    return new Date(a, m - 1, d || new Date(a, m, 0).getDate());
}

// Próximos (el más cercano primero), después sin fecha, al final los que pasaron (el más reciente primero)
export function ordenarPorFecha(items, hoy = new Date()) {
    const h = new Date(hoy);
    h.setHours(0, 0, 0, 0);
    const con = items.map(it => ({ it, fin: finDeFecha(it.fecha) }));
    const proximos = con.filter(x => x.fin && x.fin >= h).sort((a, b) => a.fin - b.fin);
    const sinFecha = con.filter(x => !x.fin);
    const pasados = con.filter(x => x.fin && x.fin < h).sort((a, b) => b.fin - a.fin);
    return [...proximos, ...sinFecha, ...pasados].map(x => x.it);
}

export function formatearFecha(f) {
    if (!f) return '';
    const [a, m, d] = f.split('-');
    return d ? `${d}/${m}/${a}` : `${m}/${a}`;
}

// Orden de conciertos: por fecha y, el mismo día, por hora (sin hora va primero)
export const porFechaYHora = (a, b) => (a.fecha + ' ' + a.hora).localeCompare(b.fecha + ' ' + b.hora);
