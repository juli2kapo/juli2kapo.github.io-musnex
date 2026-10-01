// Qué campos tiene cada sección del panel.
// Tipos: linea, area, dia, hora, fechaFlexible (día / solo mes / sin fecha), media, imagen, boton
const BOTON = { k: 'boton', tipo: 'boton', label: 'Botón con link (opcional)', ayuda: 'Ej.: "Entradas" + https://… Dejalo vacío si no lleva botón.' };

export const SECCIONES = {
    conciertos: {
        titulo: 'Conciertos', nuevo: '+ Nuevo concierto', orden: 'fecha', nombre: it => it.titulo,
        campos: [
            { k: 'fecha', tipo: 'dia', label: 'Fecha', req: true },
            { k: 'hora', tipo: 'hora', label: 'Hora (opcional)' },
            { k: 'titulo', tipo: 'linea', label: 'Título', req: true },
            { k: 'descripcion', tipo: 'area', label: 'Descripción', ayuda: 'Los links (https://…) se vuelven clickeables solos.' },
            { k: 'media', tipo: 'media', label: 'Fotos y videos', ayuda: 'Si cargás más de uno se ven como carrusel. El primero es el que aparece en el calendario.' },
            BOTON,
        ],
    },
    artistas: {
        titulo: 'Artistas destacados', nuevo: '+ Nuevo artista', orden: 'manual', nombre: it => it.nombre,
        campos: [
            { k: 'nombre', tipo: 'linea', label: 'Nombre', req: true },
            { k: 'texto', tipo: 'area', label: 'Texto' },
            { k: 'media', tipo: 'media', label: 'Fotos y videos', ayuda: 'La tarjeta toma la forma de la primera foto o video. Si cargás más de uno se ven como carrusel.' },
            BOTON,
        ],
    },
    eventos: {
        titulo: 'Eventos', nuevo: '+ Nuevo evento', orden: 'fecha', nombre: it => it.titulo,
        campos: [
            { k: 'titulo', tipo: 'linea', label: 'Título', req: true },
            { k: 'fecha', tipo: 'fechaFlexible', label: 'Fecha' },
            { k: 'texto', tipo: 'area', label: 'Texto', ayuda: 'Los links (https://…) se vuelven clickeables solos.' },
            BOTON,
        ],
    },
    cursos: {
        titulo: 'Cursos', nuevo: '+ Nuevo curso', orden: 'fecha', nombre: it => it.titulo,
        campos: [
            { k: 'titulo', tipo: 'linea', label: 'Título', req: true },
            { k: 'fecha', tipo: 'fechaFlexible', label: 'Fecha' },
            { k: 'texto', tipo: 'area', label: 'Texto', ayuda: 'Los links (https://…) se vuelven clickeables solos.' },
            { k: 'imagen', tipo: 'imagen', label: 'Imagen (opcional)' },
            BOTON,
        ],
    },
};

const VACIOS = { linea: '', area: '', dia: '', hora: '', fechaFlexible: '', media: [], imagen: null, boton: null };

export function nuevoId() {
    return [...crypto.getRandomValues(new Uint8Array(10))].map(b => (b % 36).toString(36)).join('');
}

export function nuevoItem(seccion) {
    const it = { id: nuevoId() };
    for (const c of SECCIONES[seccion].campos) it[c.k] = structuredClone(VACIOS[c.tipo]);
    return it;
}
