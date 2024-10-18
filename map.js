async function fetchData() {
    const response = await fetch("bird_migration_v4.csv");
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
    const arrowAreas=[];


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

        // Agregar flechas manualmente
        if (i % 2 == 0) {
            const [arrowTrace, arrowlimits] = createArrowTrace(
                data.longitude[i],
                data.latitude[i],
                data.longitude[i + 1],
                data.latitude[i + 1],
                color
            );

            let overlapping = false;

            // Verificar si la flecha se solapa con áreas anteriores
            for (let ocupiedArea of arrowAreas) {
                if (
                    arrowlimits[0] < ocupiedArea[2] &&
                    arrowlimits[2] > ocupiedArea[0] &&
                    arrowlimits[1] < ocupiedArea[3] &&
                    arrowlimits[3] > ocupiedArea[1]
                ) {
                    overlapping = true;
                    break;  // Si hay un solapamiento, no hace falta seguir verificando
                }
            }

            // Solo agregar la flecha si no se solapa con otras áreas
            if (!overlapping) {
                arrowAreas.push(arrowlimits);
                traces.push(arrowTrace);
            }
        }

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
                titleside: 'top',
                titlefont: {
                    size: 18,        // Tamaño de la fuente
                    family: 'Arial', // Familia de la fuente
                    weight: 'bold'   // Estilo en negrita
                },
                ticksuffix: ' km/h',  // Unidades de velocidad
                len: 0.5,  // Longitud de la barra de colores
                tickvals: [lowSpeed, midSpeed, highSpeed],  // Etiquetas de los puntos medios
                ticktext: [`Baja (${lowSpeed} mph)`, `Media (${midSpeed} mph)`, `Alta (${highSpeed} mph)`],  // Etiquetas personalizadas
                x: 0.75,  // Posición horizontal
            }
        },
        showlegend: false  // No muestra leyenda porque ya tiene el colorbar
    };

    traces.push(colorScaleTrace);

    const windRoseAnnotations = [
        {
            xref: "paper", yref: "paper", x: 0.95-0.60, y: 0.95, text: "N", showarrow: false,
            font: {size: 12, color: "black"}
        },
        {
            xref: "paper", yref: "paper", x: 0.973-0.60, y: 0.9, text: "E", showarrow: false,
            font: {size: 12, color: "black"}
        },
        {
            xref: "paper", yref: "paper", x: 0.95-0.60, y: 0.85, text: "S", showarrow: false,
            font: {size: 12, color: "black"}
        },
        {
            xref: "paper", yref: "paper", x: 0.92-0.60, y: 0.9, text: "W", showarrow: false,
            font: {size: 12, color: "black"}
        },
        {
            xref: "paper", yref: "paper", x: 0.95-0.60, y: 0.922, text: "+", showarrow: false,
            font: {size: 30, color: "black"}
        }
    ];

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const text = "Las gaviotas son aves migratorias que recorren grandes distancias entre Europa y África en busca de mejores condiciones para alimentarse y reproducirse. Su migración es estacional y sigue rutas definidas a lo largo de costas y mares. Estas aves enfrentan cambios climáticos y geográficos que influyen en sus patrones de vuelo.";
    const maxLineWidth = 300;
    const justifiedLines = justifyText(text, maxLineWidth, context);

    const subtitleAnnotations = justifiedLines.map((line, index) => {
        return {
            text: line,
            font: {
                size: 13,
                color: 'rgb(116, 101, 130)',
            },
            showarrow: false,
            xref: "paper",
            yref: "paper",
            x: 0.5,  // Centrar horizontalmente
            y: 1.2 - index * 0.05,  // Ajustar la posición vertical para cada línea
            align: "center"
        };
    });

    const layout = {
        title: "Migración de Gaviota",
        titlefont: {
            size: 40,
            family: "Arial, sans-serif"
        },
        annotations: windRoseAnnotations.concat(subtitleAnnotations),
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
            t: 180,
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

// Función para crear una flecha manualmente con ángulos de 30 grados respecto a la línea de trayectoria
function createArrowTrace(lon1, lat1, lon2, lat2, color) {
    const arrowScale = 0.4;  // Escala para el tamaño de la flecha
    const angleInRadians = 30 * (Math.PI / 180);  // Convertimos 30 grados a radianes

    // Diferencias en longitudes y latitudes (dirección del segmento)
    const dx = lon2 - lon1;
    const dy = lat2 - lat1;
    const length = Math.sqrt(dx * dx + dy * dy);  // Longitud del segmento
    const normDx = (dx / length) * arrowScale;  // Normalizamos y escalamos la dirección en x
    const normDy = (dy / length) * arrowScale;  // Normalizamos y escalamos la dirección en y

    // Ahora aplicamos una rotación de 30 grados para la base de la flecha (triángulo)
    const lonArrowLeft = lon2 - (normDx * Math.cos(angleInRadians) - normDy * Math.sin(angleInRadians));
    const latArrowLeft = lat2 - (normDx * Math.sin(angleInRadians) + normDy * Math.cos(angleInRadians));

    const lonArrowRight = lon2 - (normDx * Math.cos(-angleInRadians) - normDy * Math.sin(-angleInRadians));
    const latArrowRight = lat2 - (normDx * Math.sin(-angleInRadians) + normDy * Math.cos(-angleInRadians));

    // Creamos el triángulo de la flecha con 3 puntos
    const lonArrow = [lonArrowLeft, lon2, lonArrowRight];  // Coordenadas longitud de los 3 puntos
    const latArrow = [latArrowLeft, lat2, latArrowRight];  // Coordenadas latitud de los 3 puntos

    const arrowWidth = 4;  // Ancho de la flecha

    return [
        {
        type: "scattergeo",
        mode: "lines",  // Usamos líneas para dibujar el triángulo (flecha)
        lon: lonArrow,
        lat: latArrow,
        line: {
            width: arrowWidth,
            color: color  // El mismo color de la línea de trayectoria
        },
        showlegend: false
    }, [Math.min(lonArrowLeft, lonArrowRight)-arrowWidth*0.1, 
        Math.min(latArrowLeft, latArrowRight)-arrowWidth*0.1, 
        Math.max(lonArrowLeft, lonArrowRight)+arrowWidth*0.1, 
        Math.max(latArrowLeft, latArrowRight)+arrowWidth*0.1]
]; // Devuelve los límites de la flecha
}

function justifyText(text, maxLineWidth, context) {
    const words = text.split(' ');
    let lines = [];
    let currentLine = [];
    let currentLineWidth = 0;

    words.forEach((word) => {
        const wordWidth = context.measureText(word + " ").width;

        // Si la palabra cabe en la línea actual, la añadimos
        if (currentLineWidth + wordWidth <= maxLineWidth) {
            currentLine.push(word);
            currentLineWidth += wordWidth;
        } else {
            // Línea completa, se pasa a la siguiente línea
            lines.push(currentLine);
            currentLine = [word];  // Empezamos una nueva línea con la palabra actual
            currentLineWidth = wordWidth;
        }
    });

    // Añadir la última línea si quedó algo pendiente
    if (currentLine.length > 0) {
        lines.push(currentLine);
    }

    // Justificar todas las líneas menos la última
    const justifiedLines = lines.map((line, index) => {
        if (index === lines.length - 1) {
            return line.join(' ');  // La última línea no se justifica
        }

        // Justificamos las líneas anteriores
        const totalWords = line.length;
        const lineText = line.join(' ');
        const lineWidth = context.measureText(lineText).width;
        const extraSpace = maxLineWidth - lineWidth;

        // Distribuir el espacio extra entre las palabras
        const spacesBetweenWords = totalWords - 1;
        const baseSpaceWidth = context.measureText(' ').width;
        const additionalSpace = extraSpace / spacesBetweenWords;

        // Aseguramos que haya al menos un espacio entre palabras
        return line.map((word, i) => {
            if (i < spacesBetweenWords) {
                return word + ' '.repeat(1 + Math.floor(additionalSpace / baseSpaceWidth));
            } else {
                return word;
            }
        }).join('');
    });

    return justifiedLines;
}
