// Global

let globalTraces = null;
let globalLayout = null
const synth = new Tone.Synth().toDestination();
let globalMinLat = null;
let globalMaxLat = null;
let globalSeagullData = null;
let playingAnimation = false;

// Data

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
        const dat = (new Date(cols[1]));

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
    
    globalSeagullData = seagullData;

    return seagullData;
}

// Map

async function buildPlot() {

    const data = await fetchData();

    const traces = [];
    const minLon = Math.min(...data.longitude);
    const maxLon = Math.max(...data.longitude);
    const minLat = Math.min(...data.latitude);
    const maxLat = Math.max(...data.latitude);
    globalMinLat = minLat;
    globalMaxLat = maxLat;

    for (let i = 0; i < data.latitude.length - 1; i++) {
        let dat = data.date[i].getMonth();
        let season = seasonColorInfo(dat);

        let lineTrace = {
            type: "scattergeo",
            lon: [data.longitude[i], data.longitude[i + 1]],
            lat: [data.latitude[i], data.latitude[i + 1]],
            mode: "lines",
            //text: `Fecha: ${data.date[i].toLocaleDateString("en-GB")}`,
            hovertemplate: `Longitud: ${parseFloat(data.longitude[i]).toFixed(2)}\n` +
                            `Latitud: ${parseFloat(data.latitude[i]).toFixed(2)}\n` +
                            `Fecha: ${data.date[i].toLocaleDateString("en-GB")}`,
            line: {
                width: 4,
                color: season.color
            },
        };

        if (i == 1) {
            let offsetLon = 1.5;
            let offsetLat = -0.5;
            let textTrace = {
                type: "scattergeo",
                mode: "markers+text",
                lon: [data.longitude[i] + offsetLon],
                lat: [data.latitude[i] + offsetLat],
                text: ["Punto de partida (verano)"],
                textposition: "middle right",
                marker: {
                    color: season.color,
                    size: 8,
                },
                textfont: {
                    size: 17
                },
                hoverinfo: "skip",
            };
            traces.push(textTrace);
        }

        if (i == 10) {
            let offsetLon = -1.5;
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
                    size: 8,
                },
                textfont: {
                    size: 17
                },
                hoverinfo: "skip",
            };
            traces.push(textTrace);
        }

        if (i == 45) {
            let offsetLon = 1.5;
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
                    size: 8,
                },
                textfont: {
                    size: 17
                },
                hoverinfo: "skip",
            };
            traces.push(textTrace);
        }

        if (i == 75) {
            let offsetLon = 1.5;
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
                    size: 8,
                },
                textfont: {
                    size: 17
                },
                hoverinfo: "skip",
            };
            traces.push(textTrace);
        }

        traces.push(lineTrace);

    }

    globalTraces = traces;

    const layout = {
        title: "Migración de Gaviota",
        titlefont: {
            size: 40,
            family: "Arial, sans-serif"
        },
        annotations: [
            {
                text: "Trayectoria de una gaviota: Agosto-Abril",
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
            zoom: true,
        },
        margin: {
            l: 50, 
            r: 50,
            t: 150,
            b: 50
        },
    };

    globalLayout = layout;

    const config = {
        displayModeBar: true,
        modeBarButtonsToRemove: ["pan2d", "select2d", "lasso2d"],
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
        name = "Primavera";
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
        name = "Otoño";
    }
    else {
        console.log("Invalid month number");
    }

    let color = `rgb(${r}, ${g}, ${b})`;

    return {color, name};

}

function resetPlot() {
    Plotly.react("map", globalTraces, globalLayout);
}

buildPlot();

// Text to speech

function speak(text) {
    speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-ES";
    utterance.rate = 0.7;
    window.speechSynthesis.speak(utterance);
}

// Tone

let queue = [];

function disableBtn(id) {
    document.getElementById(id).disabled = true;
}

function enableBtn(id) {
    document.getElementById(id).disabled = false;
} 

document.getElementById("tone").addEventListener("click", () => {
    if (Tone.context.state !== "running") {
        Tone.start();
    }
    if (!playingAnimation) {
        playingAnimation = true;
        disableBtn("tone");
        enableBtn("stop");
        triggerTone();
    }
})

document.getElementById("stop").addEventListener("click", () => {
    queue = [];
})

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function proportion(value, min, max, offset) {
    return ((value - min) / (max - min)) + offset;
}

function latitudeToFreq(lat) {
    const minFreq = 300;
    const maxFreq = 500;
    const minLat = globalMinLat;
    const maxLat = globalMaxLat;

    const latProp = proportion(lat, minLat, maxLat, 0);
    const freqStep = (maxFreq - minFreq) * latProp;
    return minFreq + freqStep;
}

async function triggerTone() {

    const latitudes = globalSeagullData.latitude;
    const longitudes = globalSeagullData.longitude;
    const dates = globalSeagullData.date;

    // Insert frequencies to play in queue

    for (let i = 0; i < 90; i+=2) {
        const freqToPlay = latitudeToFreq(latitudes[i]);
        const dataToQueue = {
            freq: freqToPlay,
            lat: latitudes[i],
            lon: longitudes[i],
            dat: dates[i],
        }
        queue.push(dataToQueue);
    }

    // Play frequencies in queue

    let currentSeason = null;

    while (queue.length != 0) {
        const data = queue.shift();
        const freq = data.freq;
        const lat = data.lat;
        const lon = data.lon;
        const dat = data.dat;
        const seasonColor = seasonColorInfo(dat.getMonth());
        const color = seasonColor.color;
        const seasonName = seasonColor.name;

        const movingTrace = {
            type: "scattergeo",
            mode: "markers",
            lon: [lon],
            lat: [lat],
            marker: {
                color: "white",
                size: 20,
                line: {
                    color: color,
                    width: 7,
                },
            },
            hoverinfo: "skip",
        };

        Plotly.react("map", [...globalTraces ,movingTrace], globalLayout);

        if (currentSeason != seasonName) {
            currentSeason = seasonName;
            speak(seasonName);
            await sleep(400);
        }
        else
        {
            synth.triggerAttackRelease(freq, "100n");
        }

        // synth.triggerAttackRelease(freq, "100n");
        await sleep(350);
    }

    resetPlot();
    playingAnimation = false;
    enableBtn("tone");
    disableBtn("stop");
}