console.log('✅ detalle.js cargado');

document.addEventListener('DOMContentLoaded', () => {
    if (typeof coffees === 'undefined') {
        console.error('❌ coffees no está definido. Falta cargar js/coffees.js antes.');
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const index = parseInt(params.get('id'), 10);
    console.log('🔎 id:', index);

    const coffee = coffees[index];
    if (!coffee) {
        document.getElementById('coffee-detail').innerHTML =
            `<p>No hay café con id "${params.get('id')}". <a href="index.html">Volver</a></p>`;
        return;
    }

    document.title = `${coffee.title} - Coffee PWA`;

    const img = document.getElementById('detail-img');
    const title = document.getElementById('detail-title');
    const desc = document.getElementById('detail-desc');
    const details = document.getElementById('detail-details');

    img.src = coffee.image;
    img.alt = coffee.title;
    title.textContent = coffee.title;
    desc.textContent = coffee.description;

    let html = '';
    for (const [key, value] of Object.entries(coffee.details)) {
        const k = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
        html += `<p><strong>${k}:</strong> ${value}</p>`;
    }
    details.innerHTML = html;

    console.log('✅ Datos pintados');
});