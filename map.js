async function fetchData() {
    const response = await fetch("bird_migration_v4.csv");
    const data = await response.text();

    const rows = data.split("\n").slice(1);

    const latitude = [];
    const longitude = [];
    const date = []

    rows.forEach(row => {
        const cols = row.split(",");
        const lat = parseFloat(cols[3]);
        const lon = parseFloat(cols[4]);
        const dat = (new Date(cols[1])).getMonth();

        if (!isNaN(lat) && !isNaN(lon) && !isNaN(dat)) {
            latitude.push(lat);
            longitude.push(lon);
            date.push(dat);
        }
    });

    const seagullData = {
        latitude,
        longitude,
        date
    };
    
    return seagullData;
}

async function buildPlot() {

    const data = await fetchData();

    const traces = [];
    const minLon = Math.min(...data.longitude);
    const maxLon = Math.max(...data.longitude);
    const minLat = Math.min(...data.latitude);
    const maxLat = Math.max(...data.latitude);

    for (let i = 0; i < data.latitude.length - 1; i++) {
        let dat = data.date[i]
        let season = seasonColorInfo(dat);

        let lineTrace = {
            type: "scattergeo",
            lon: [data.longitude[i], data.longitude[i + 1]],
            lat: [data.latitude[i], data.latitude[i + 1]],
            mode: "lines+text",
            line: {
                width: 4,
                color: season.color
            },
        };

        if (i == 1) {
            let offsetLon = 1;
            let offsetLat = 0;
            let textTrace = {
                type: "scattergeo",
                mode: "markers+text",
                lon: [data.longitude[i] + offsetLon],
                lat: [data.latitude[i] + offsetLat],
                text: ["<b>Punto de partida (verano)<b>"],
                textposition: "middle right",
                marker: {
                    color: season.color,
                },
                textfont: {
                    size: 17
                },
            };
            traces.push(textTrace);
        }

        if (i == 10) {
            let offsetLon = -1;
            let offsetLat = 0;
            let textTrace = {
                type: "scattergeo",
                mode: "markers+text",
                lon: [data.longitude[i] + offsetLon],
                lat: [data.latitude[i] + offsetLat],
                text: ["Migración al sur (otoño)"],
                textposition: "middle left",
                marker: {
                    color: season.color,
                },
                textfont: {
                    size: 17
                },
            };
            traces.push(textTrace);
        }

        if (i == 45) {
            let offsetLon = 1;
            let offsetLat = 0;
            let textTrace = {
                type: "scattergeo",
                mode: "markers+text",
                lon: [data.longitude[i] + offsetLon],
                lat: [data.latitude[i] + offsetLat],
                text: ["Sector objetivo (invierno)"],
                textposition: "middle right",
                marker: {
                    color: season.color,
                },
                textfont: {
                    size: 17
                },
            };
            traces.push(textTrace);
        }

        if (i == 75) {
            let offsetLon = 1;
            let offsetLat = 0;
            let textTrace = {
                type: "scattergeo",
                mode: "markers+text",
                lon: [data.longitude[i] + offsetLon],
                lat: [data.latitude[i] + offsetLat],
                text: ["Migración al norte (primavera)"],
                textposition: "middle right",
                marker: {
                    color: season.color,
                },
                textfont: {
                    size: 17
                },
            };
            traces.push(textTrace);
        }

        traces.push(lineTrace);

    }

    const layout = {
        title: "Migración de Gaviota",
        titlefont: {
            size: 40,
            family: "Arial, sans-serif"
        },
        annotations: [
            {
                text: "Trayectoria de una gaviota a lo largo del año",
                font: {
                    size: 25,
                    color: 'rgb(116, 101, 130)',
                },
                showarrow: false,
                align: 'center',
                x: 0.5,
                y: 1.1,
            },
        ],
        showlegend: false,
        legend: {
            x: 0.5,
            y: 0.05,
            xanchor: "center",
            yanchor: "center",
            font: {
                size: 20,
            },
            borderwidth: 1,
            bordercolor: 'black',
        },
        geo: {
            scope: "world",
            projection: {
                type: "mercator",
                scale: 10
            },
            center: {
                lon: (minLon + maxLon)/2,
                lat: (minLat + maxLat)/2
            },
            showland: true,
            landcolor: 'rgb(255,255,255)',
            countrycolor: 'rgb(255, 255, 255)',
            showcountries: true,
            showcoastlines: true,
            showframe: false,
            fitbounds: false,
            dragmode: false,
            zoom: false,
        },
        margin: {
            l: 50, 
            r: 50,
            t: 150,
            b: 50
        },
    };

    const config = {
        staticPlot: true 
    };

    Plotly.newPlot("map", traces, layout, config);
}

function seasonColorInfo(monthNumber) {
    const winter = [12, 1, 2];
    const spring = [3, 4, 5];
    const summer = [6, 7, 8];
    const autumn = [9, 10, 11];

    let r = 0;
    let g = 0;
    let b = 0;
    let name = "";

    if (winter.includes(monthNumber)) {
        r = 25;
        g = 75;
        b = 61;
        name = "Invierno";
    }
    else if (spring.includes(monthNumber)) {
        r = 245;
        g = 196;
        b = 23;
        name = "Otoño";
    }
    else if (summer.includes(monthNumber)) {
        r = 203;
        g = 37;
        b = 98;
        name = "Verano";
    }
    else if (autumn.includes(monthNumber)) {
        r = 73;
        g = 136;
        b = 229;
        name = "Primavera";
    }
    else {
        console.log("Invalid month number");
    }

    let color = `rgb(${r}, ${g}, ${b})`;

    return {color, name};

}

// function dataBySeason(data) {
//     const winter = [12, 1, 2];
//     const spring = [3, 4, 5];
//     const summer = [6, 7, 8];
//     const autumn = [9, 10, 11];

//     let winterDate = [];
//     let winterLat = [];
//     let winterLon = [];
//     let springDate = [];
//     let springLat = [];
//     let springLon = [];
//     let summerDate = [];
//     let summerLat = [];
//     let summerLon = [];
//     let autumnDate = [];
//     let autumnLat = [];
//     let autumnLon = [];

//     for (let i = 0; i < data.latitude.length; i++) {
//         let month = data.date[i];
//         let lat = data.latitude[i];
//         let lon = data.longitude[i];

//         if (winter.includes(month)) {
//             winterDate.push(month);
//             winterLat.push(lat);
//             winterLon.push(lon);
//         }
//         else if (spring.includes(month)) {
//             springDate.push(month);
//             springLat.push(lat);
//             springLon.push(lon);
//         }
//         else if (summer.includes(month)) {
//             summerDate.push(month);
//             summerLat.push(lat);
//             summerLon.push(lon);
//         }
//         else if (autumn.includes(month)) {
//             autumnDate.push(month);
//             autumnLat.push(lat);
//             autumnLon.push(lon);
//         }
//         else {
//             console.log("Invalid month number");
//         }
//     }

//     let winterData = {
//         date: winterDate,
//         longitude: winterLon,
//         latitude: winterLat,
//     };

//     let springData = {
//         date: springDate,
//         longitude: springLat,
//         latitude: springLon,
//     };

//     let summerData = {
//         date: summerDate,
//         longitude: summerLon,
//         latitude: summerLat,
//     };

//     let autumnData = {
//         date: autumnDate,
//         longitude: autumnLon,
//         latitude: autumnLat,
//     };

//     let filteredData = {
//         winter: winterData,
//         spring: springData,
//         summer: summerData,
//         autumn: autumnData,
//     };

//     return filteredData;
// }

// function proportion(value, min, max, offset) {
//     return ((value - min) / (max - min)) + offset;
// }

buildPlot()