async function fetchData() {
    const response = await fetch("bird_migration_v2.csv");
    const data = await response.text();

    const rows = data.split("\n").slice(1);

    const latitude = [];
    const longitude = [];
    const speed = [];

    rows.forEach(row => {
        const cols = row.split(",");
        const lat = parseFloat(cols[3]);
        const lon = parseFloat(cols[4]);
        const spd = parseFloat(cols[5]);

        // Asegúrate de que los valores sean numéricos
        if (!isNaN(lat) && !isNaN(lon) && !isNaN(spd)) {
            latitude.push(lat);
            longitude.push(lon);
            speed.push(spd);
        }
    });

    return { latitude, longitude, speed };
}

fetchData().then(data => {
    const traces = [];
    const minSpeed = Math.min(...data.speed);
    const maxSpeed = Math.max(...data.speed);

    // Evita división por cero ajustando el rango
    if (minSpeed === maxSpeed) {
        minSpeed -= 1;
    }

    for (let i = 0; i < data.latitude.length - 1; i++) {
        let speed = data.speed[i];
        let color = getColorForSpeedContinuous(speed, minSpeed, maxSpeed);

        let trace = {
            type: "scattergeo",
            lon: [data.longitude[i], data.longitude[i + 1]],
            lat: [data.latitude[i], data.latitude[i + 1]],
            mode: "lines",
            line: {
                width: 2,
                color: color  // Cambia el color basado en la velocidad continua
            }
        };

        traces.push(trace);
    }

    const layout = {
        title: "Migración de Aves",
        showlegend: false,
        geo: {
            scope: "world",
            projection: {
                type: "azimuthal equal area",
                scale: 4
            },
            center: {
                lon: data.longitude[Math.floor(data.longitude.length / 2)],
                lat: data.latitude[Math.floor(data.latitude.length / 2)]
            },
            showland: true,
            landcolor: 'rgb(243, 243, 243)',
            countrycolor: 'rgb(204, 204, 204)',
            showcountries: true,
            showcoastlines: true,
            showframe: false,
            fitbounds: "locations",
            dragmode: false,
            zoom: false
        }
    };

    const config = {
        staticPlot: true  // Desactiva todas las interacciones
    };

    Plotly.newPlot("map", traces, layout, config);
});

// Función para obtener el color continuo basado en la velocidad
function getColorForSpeedContinuous(speed, minSpeed, maxSpeed) {
    const ratio = (speed - minSpeed) / (maxSpeed - minSpeed);

    if (ratio < 0.5) {
        const normalized = ratio * 2;
        const r = Math.floor(150 * (1 - normalized));
        const g = Math.floor(150 * (1 - normalized));
        const b = 255;
        return `rgb(${r}, ${g}, ${b})`; // Usa backticks para interpolar variables
    } else {
        const normalized = ratio * 2;
        const r = 255;
        const g = Math.floor(150 * (1 - normalized));
        const b = Math.floor(150 * (1 - normalized));
        return `rgb(${r}, ${g}, ${b})`; // Usa backticks aquí también
    }
}
