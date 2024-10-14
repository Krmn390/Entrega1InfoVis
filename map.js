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
    const minLong = Math.min(...data.longitude);
    const maxLong = Math.max(...data.longitude);
    const minLat = Math.min(...data.latitude);
    const maxLat = Math.max(...data.latitude);

    // // Evita división por cero ajustando el rango
    // if (minSpeed === maxSpeed) {
    //     minSpeed -= 1;
    // }

    // Crear trazos para las líneas de migración
    for (let i = 0; i < data.latitude.length - 1; i++) {
        let speed = data.speed[i];
        let color = getColorForSpeedContinuous(speed, minSpeed, maxSpeed);

        let lineTrace = {
            type: "scattergeo",
            lon: [data.longitude[i], data.longitude[i + 1]],
            lat: [data.latitude[i], data.latitude[i + 1]],
            mode: "lines",
            line: {
                width: 4,
                color: color
            }
        };

        traces.push(lineTrace);
    }

    // Trace adicional para la barra de colores (colorbar)
    const lowSpeed = minSpeed.toFixed(2);
    const midSpeed = ((minSpeed + maxSpeed) / 2).toFixed(2);
    const highSpeed = maxSpeed.toFixed(2);

    // Trace adicional para la barra de colores (colorbar)
    const colorScaleTrace = {
        type: "scattergeo",
        mode: "markers",
        lat: [0], // Latitud arbitraria para que el colorbar sea independiente
        lon: [0], // Longitud arbitraria
        marker: {
            size: 0.1,  // Tamaño pequeño para no interferir
            color: [lowSpeed, highSpeed],  // Rango de colores
            cmin: lowSpeed,
            cmax: highSpeed,
            colorscale: [
                [0, 'rgb(255, 153, 21)'],  // Color para velocidad baja
                [1, 'rgb(0, 0, 255)']       // Color para velocidad alta
            ],
            colorbar: {
                title: 'Velocidad',
                titleside: 'right',
                ticksuffix: ' km/h',  // Unidades de velocidad
                tickvals: [lowSpeed, midSpeed, highSpeed],  // Etiquetas de los puntos medios
                ticktext: [`Baja (${lowSpeed} mph)`, `Media (${midSpeed} mph)`, `Alto (${highSpeed}) mph)`],  // Etiquetas personalizadas
            }
        },
        showlegend: false  // No muestra leyenda porque ya tiene el colorbar
    };

    traces.push(colorScaleTrace);

    const layout = {
        title: "Migración de Gaviotas",
        showlegend: false,
        geo: {
            scope: "world",
            projection: {
                type: "azimuthal equal area",
                scale: 11
            },
            center: {
                lon: (minLong + maxLong)/2,
                lat: (minLat + maxLat)/2
            },
            showland: true,
            landcolor: 'rgb(220,220,220)',
            countrycolor: 'rgb(255, 255, 255)',
            showcountries: true,
            showcoastlines: true,
            showframe: true,
            fitbounds: false,  // Desactiva ajuste automático del zoom
            dragmode: false,
            zoom: false,
        },
        margin: {
            l: 50,  // Ajusta los márgenes para que el colorbar no afecte el mapa
            r: 50,
            t: 50,
            b: 50
        },
        // annotations: [{
        //     x: 0,
        //     y: 0,
        //     xref: "paper",
        //     yref: "paper",
        //     text: 'This scatter plot displays the locations of major global cities, highlighting their geographic distribution.',
        //     showarrow: false,
        //     font: {
        //         size: 12,
        //         color: 'black'
        //     }
        // }]
    };

    const config = {
        staticPlot: true  // Desactiva todas las interacciones
    };

    Plotly.newPlot("map", traces, layout, config);
});


// Función para obtener el color continuo basado en la velocidad
function getColorForSpeedContinuous(speed, minSpeed, maxSpeed) {
    // const ratio = (speed - minSpeed) / (maxSpeed - minSpeed);

    // if (ratio < 0.5) {
    //     const normalized = ratio * 2;
    //     const r = Math.floor(255 * (normalized));
    //     const g = Math.floor(255 * (normalized));
    //     const b = Math.floor(255 * (1 - normalized));
    //     return `rgb(${r}, ${g}, ${b})`; // Usa backticks para interpolar variables
    // } else {
    //     const normalized = 2*(1-ratio);
    //     const r = 255;
    //     const g = Math.floor(255 * (1 - normalized));
    //     const b = 0;
    //     return `rgb(${r}, ${g}, ${b})`; // Usa backticks aquí también
    // }

    // const minR = 255;
    // const minG = 0;
    // const minB = 0;
    // const maxR = 255;
    // const maxG = 255;
    // const maxB = 0;

    // const minR = 0;
    // const minG = 255;
    // const minB = 0;
    // const maxR = 0;
    // const maxG = 0;
    // const maxB = 255;

    const minR = 0;
    const minG = 0;
    const minB = 255;
    const maxR = 255;
    const maxG = 153;
    const maxB = 21;
    const ratio = 1-(speed - minSpeed) / (maxSpeed - minSpeed);

    const r = minR + (maxR - minR) * ratio;
    const g = minG + (maxG - minG) * ratio;
    const b = minB + (maxB - minB) * ratio;

    return `rgb(${r}, ${g}, ${b})`;
}
