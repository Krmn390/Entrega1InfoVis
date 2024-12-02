import "https://cdn.plot.ly/plotly-2.34.0.min.js"; // Importa la librería Plotly para gráficos interactivos.
import "https://cdnjs.cloudflare.com/ajax/libs/tone/15.1.3/Tone.js"
import Protobject from './js/protobject.js'; // Importa Protobject para recibir datos en tiempo real de otros scripts.

const synth = new Tone.Synth().toDestination();
let playingAnimation = false;
let defaultZoom = true;
window.onresize = function(){ location.reload(); }

// Estructura HTML del gráfico y del contador de personas.
document.body.innerHTML = `
  <script src="http://unpkg.com/tone"></script>
  <div id="map"></div>
    <div id="button-container">
        <button id="tone">Migrar</button>
        <button id="stop" disabled>Detener</button>
        <button id="reset">Resetear Mapa</button> <!-- Botón para resetear el mapa -->
  </div> 
  <style>
  	div {   
    	border: 0px solid #ba5858;   
	}
  
    body {
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      flex-direction: column;
      align-items: center;
      height: 100vh; /* Ocupa toda la altura de la ventana */
    }

    #map {
        flex: 1;
        width: 100%;
        height: 100%;
        cursor: default  ; /* Cambia el cursor al pasar por encima del mapa */
    }

    #map:hover {
        cursor: pointer; /* Cambia el cursor cuando el mouse está sobre el mapa */
    }


    #button-container {
        margin-bottom: 20px;
    }

    button {
        display: inline-block;
        padding: 15px 25px;
        font-size: 20px;
        cursor: pointer;
        text-align: center;
        text-decoration: none;
        outline: none;
        color: #fff;
        background-color: #04AA6D;
        border: none;
        border-radius: 15px;
        box-shadow: 0 9px #999;
        font-family: monospace;
        font-weight: 900;
    }

    button:hover {background-color: #3e8e41}

    button:active {
        background-color: #3e8e41;
        box-shadow: 0 5px #666;
        transform: translateY(4px);
    }

    button:disabled {
        background-color: gray;
    }
  </style>
`;

const data = {
  "latitude": [
    49.4198595,
    49.93076370000001,
    50.191926200000005,
    49.7685454,
    49.2281914,
    49.296683,
    49.01696389999999,
    48.6713979,
    48.065082700000005,
    47.3662028,
    46.558929600000006,
    45.735739200000005,
    44.67901,
    43.5312553,
    43.5858659,
    43.5819344,
    43.7042178,
    43.3142216,
    42.908123,
    42.4277559,
    41.5612089,
    40.9421918,
    40.34523170000001,
    39.840185,
    39.212519,
    38.6151341,
    38.0557021,
    37.4510776,
    36.8380671,
    35.9548114,
    34.991584100000004,
    34.487827100000004,
    34.0745851,
    33.807835600000004,
    33.553458500000005,
    33.375221,
    33.129796899999995,
    32.8348956,
    32.4964453,
    31.5578111,
    30.9256847,
    30.4397706,
    30.747593100000003,
    31.2976239,
    31.880126300000004,
    32.2773683,
    33.0027533,
    33.329987800000005,
    33.5734283,
    34.1519357,
    34.9692424,
    35.4775427,
    36.2555924,
    36.776272,
    37.1138454,
    37.9698972,
    38.8005795,
    39.7937992,
    40.2114597,
    40.7704936,
    40.762852,
    41.41117379999999,
    42.1530483,
    43.3331457,
    43.7156289,
    43.7839978,
    43.5596574,
    43.617192200000005,
    43.5614194,
    43.4127075,
    43.60035429999999,
    44.0800189,
    44.523720700000005,
    44.8782238,
    45.10375689999999,
    45.5153922,
    46.1925054,
    46.7812976,
    47.2334574,
    47.8732759,
    48.7813541,
    49.6464289,
    50.028405600000006,
    50.4989835,
    50.4619046,
    50.6613248,
    51.2277875,
    50.3467111,
    50.6462893,
    51.2370201,
    50.8189971,
    51.3408721,
    50.9127871,
    51.3505504,
    50.751512,
    51.3114789,
    50.8822568,
    51.3406529,
    50.9968202
  ],
  "longitude": [
    2.1207332,
    2.2768063,
    2.7334971,
    2.3454776,
    1.9046408,
    1.2294158000000002,
    0.8850443000000001,
    0.397205,
    -0.3445484,
    -1.1818273,
    -1.8675369,
    -2.3347381,
    -3.9603468,
    -5.265283,
    -6.1071113,
    -7.314528200000001,
    -8.164909399999999,
    -8.9794067,
    -9.2760071,
    -8.8757916,
    -8.8367824,
    -8.681258900000001,
    -8.9872049,
    -8.9939824,
    -9.3671655,
    -9.4093426,
    -9.0609038,
    -8.8265998,
    -8.731481,
    -7.8363881,
    -7.0592478000000005,
    -6.7884660000000006,
    -6.8009588,
    -7.1965127,
    -7.5387443,
    -8.2653464,
    -8.6268125,
    -8.9095213,
    -9.2725603,
    -9.7378392,
    -9.8299806,
    -9.6512085,
    -9.9077192,
    -9.8009043,
    -9.4820422,
    -9.20808,
    -8.7202414,
    -8.3262207,
    -7.6455705,
    -7.243288400000001,
    -6.973439900000001,
    -6.8363509,
    -6.642249700000001,
    -6.419829,
    -6.7769519,
    -7.3112725,
    -7.5792565,
    -7.647415700000001,
    -7.7455667,
    -8.0836454,
    -8.5724477,
    -8.7128344,
    -8.619912199999998,
    -8.4253634,
    -8.034944099999999,
    -7.5649019,
    -7.1126523,
    -6.3793465,
    -5.5970144,
    -4.714668799999999,
    -3.7721686,
    -3.3051361000000004,
    -2.778295,
    -2.1902071,
    -1.6535265,
    -1.1884032,
    -0.8452828000000001,
    -0.6156010000000001,
    -0.338496,
    0.2110743,
    0.7273392,
    1.5298869,
    1.9360427,
    2.2229469,
    2.6758038,
    3.1431487,
    3.2905238,
    3.1801676,
    3.5371575,
    3.2105514,
    3.2438479,
    3.182934,
    3.3247504,
    3.1779778,
    3.3049581,
    3.2085919,
    3.3222722,
    3.1832984,
    3.3889947
  ],
  "month": [
    7,
    7,
    7,
    10,
    10,
    10,
    10,
    10,
    10,
    10,
    10,
    10,
    10,
    10,
    10,
    10,
    10,
    10,
    10,
    10,
    10,
    10,
    10,
    10,
    10,
    10,
    10,
    10,
    10,
    10,
    10,
    10,
    10,
    10,
    10,
    10,
    10,
    10,
    10,
    10,
    10,
    10,
    2,
    2,
    2,
    2,
    2,
    2,
    2,
    2,
    2,
    2,
    2,
    2,
    2,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3
  ],
  "year": [
    2013,
    2013,
    2013,
    2013,
    2013,
    2013,
    2013,
    2013,
    2013,
    2013,
    2013,
    2013,
    2013,
    2013,
    2013,
    2013,
    2013,
    2013,
    2013,
    2013,
    2013,
    2013,
    2013,
    2013,
    2013,
    2013,
    2013,
    2013,
    2013,
    2013,
    2013,
    2013,
    2013,
    2013,
    2013,
    2013,
    2013,
    2013,
    2013,
    2013,
    2013,
    2013,
    2014,
    2014,
    2014,
    2014,
    2014,
    2014,
    2014,
    2014,
    2014,
    2014,
    2014,
    2014,
    2014,
    2014,
    2014,
    2014,
    2014,
    2014,
    2014,
    2014,
    2014,
    2014,
    2014,
    2014,
    2014,
    2014,
    2014,
    2014,
    2014,
    2014,
    2014,
    2014,
    2014,
    2014,
    2014,
    2014,
    2014,
    2014,
    2014,
    2014,
    2014,
    2014,
    2014,
    2014,
    2014,
    2014,
    2014,
    2014,
    2014,
    2014,
    2014,
    2014,
    2014,
    2014,
    2014,
    2014,
    2014
  ]
}

const summerText = `
    En verano algunas especies de gaviota<br>
    deciden migrar, motivadas principalmente<br>
    por el frio y la escasez de comida.<br>
`

const autumnText = `
    Algunas gaviotas eligen migrar<br>
    al oeste de Africa, donde hay<br>
    comida y aguas calidas.<br>
`
const winterText = `
    Diferentes grupos de gaviotas se<br>
    detienen en distintos lugares, no<br>
    mantienen un lugar de descanso fijo.<br>
`
const springText = `
    Cuando llega el momento, las gaviotas<br>
    vuelven donde partieron.<br>
`

const traces = [];
const minLon = Math.min(...data.longitude);
const maxLon = Math.max(...data.longitude);
const minLat = Math.min(...data.latitude);
const maxLat = Math.max(...data.latitude);

for (let i = 0; i < data.latitude.length - 1; i++) {
  let dat = data.month[i];
  let season = seasonColorInfo(dat);
  let hoverText = "";

  if (season.name === "verano") {
    hoverText = summerText;
  }
  else if (season.name === "otoño") {
    hoverText = autumnText;
  } else if (season.name === "invierno") {
    hoverText = winterText;
  } else if (season.name === "primavera") {
    hoverText = springText;
  }

  let lineTrace = {
    type: "scattergeo",
    lon: [data.longitude[i], data.longitude[i + 1]],
    lat: [data.latitude[i], data.latitude[i + 1]],
    mode: "lines",
    hovertemplate: hoverText + "<br>" +
    `Longitud: ${parseFloat(data.longitude[i]).toFixed(2)}<br>` +
    `Latitud: ${parseFloat(data.latitude[i]).toFixed(2)}<br>` +
    `Fecha: ${data.month[i]}-${data.year[i]}`,
    line: {
      width: 4,
      color: season.color
    },
    hoverlabel: {
      font: {
        size: 20,
      }
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
      text: ["Punto de <br> partida <br> (verano)"],
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
      text: ["Migración al sur <br> (otoño)"],
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
      text: ["Sector objetivo <br> (invierno)"],
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
      text: ["Migración al norte <br> (primavera)"],
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
      scale: 11.5
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
    showframe: true,
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

const config = {
  displayModeBar: true,
  modeBarButtonsToRemove: ["pan2d", "select2d", "lasso2d"],
};

Plotly.newPlot("map", traces, layout, config);

// Functions

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
        name = "invierno";
    }
    else if (spring.includes(monthNumber)) {
        r = 245;
        g = 196;
        b = 23;
        name = "primavera";
    }
    else if (summer.includes(monthNumber)) {
        r = 203;
        g = 37;
        b = 98;
        name = "verano";
    }
    else if (autumn.includes(monthNumber)) {
        r = 73;
        g = 136;
        b = 229;
        name = "otoño";
    }
    else {
        console.log("Invalid month number");
    }

    let color = `rgb(${r}, ${g}, ${b})`;

    return {color, name};
}

function resetPlot() {
    Plotly.react("map", traces, layout);
  	defaultZoom = true;
}

function speak(text) {
    speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-ES";
    utterance.rate = 0.7;
    window.speechSynthesis.speak(utterance);
}

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

document.getElementById("reset").addEventListener("click", () => {
    resetMapPosition(); // Llama a la función de reseteado cuando se presiona el botón
});

function resetMapPosition() {
    // Simula un clic en el botón de reseteo de Plotly usando su clase CSS
    const resetButton = document.querySelector('.modebar-btn[data-title="Reset"]');
    if (resetButton) {
        resetButton.click();
    }
}



function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function proportion(value, min, max, offset) {
    return ((value - min) / (max - min)) + offset;
}

function latitudeToFreq(lat) {
    const minFreq = 300;
    const maxFreq = 500;
    const latProp = proportion(lat, minLat, maxLat, 0);
    const freqStep = (maxFreq - minFreq) * latProp;
    return minFreq + freqStep;
}

async function triggerTone() {

    // Workaround

    speak(""); // For some reason, the first speak never plays
    await sleep(100);

    // Global data

    const latitudes = data.latitude;
    const longitudes = data.longitude;
    const dates = data.month

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
        const datai = queue.shift();
        const freq = datai.freq;
        const lat = datai.lat;
        const lon = datai.lon;
        const dat = datai.dat;
        const seasonColor = seasonColorInfo(dat);
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

        Plotly.react("map", [...traces ,movingTrace], layout);

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

// Protobject

const latCenter = (minLat + maxLat)/2;
const lonCenter = (minLon + maxLon)/2;
// lat ~ y
// lon ~ x
const latAdjustment = 50.5;
const lonAdjustment = 50;
let timeoutId = null;
const plotDiv = document.getElementById("map");
const fingerDataFrec = 3;
let fingerDataCounter = 0;
let fingerTouchedStart = false;
let summerSpeakDone = false;
let autumnSpeakDone = false;
let winterSpeakDone = false;
let springSpeakDone = false;

plotDiv.on("plotly_relayout", function (eventData) {
	defaultZoom = false;
});

function fingerToMapCoord(fingerCoord, center, adjustment) {
  return (fingerCoord - 0.5) * adjustment + center;
}

function drawFingerTrace(lat, lon) {
  const fingerTrace = {
    type: "scattergeo",
    mode: "markers",
    lon: [lon],
    lat: [lat],
    marker: {
      color: "white",
      size: 20,
      line: {
        color: "gray",
        width: 7,
      },
    },
    hoverinfo: "skip",
  };
  Plotly.react("map", [...traces ,fingerTrace], layout);
}

function inSelection(lat, lon) {
  // calibrated manually
  if (29 <= lat && lat <= 41) {
    if (-12 <= lon && lon <= -4) {
      return true;
    }
    else {
      return false;
    }
  }
  else if (41 < lat && lat <= 53) {
    const inf = (11/12)*(lat -53) -1;
    const sup = (3/4)*(lat - 53) + 6;
    if (inf <= lon && lon <= sup) {
      return true;
    }
    else {
      return false;
    }
  }
  return false;
}

function mDistance(x0, y0, x1, y1) {
	return Math.abs(x0 - x1) + Math.abs(y0 - y1);
}

function fingerSpeak(x, y) {
	if (mDistance(x, y, 1, 50) < 1.5 && !summerSpeakDone) {
      speak("Verano");
      summerSpeakDone = true;
    }
  	else if (mDistance(x, y, -3, 48.5) < 1.3 && !autumnSpeakDone) {
      speak("Otoño");
      autumnSpeakDone = true;
    }
    else if (mDistance(x, y, -8.5, 31) < 2 && !winterSpeakDone) {
      speak("Invierno");
      winterSpeakDone = true;
    }
  	else if (mDistance(x, y, -7, 38) < 1.5 && !springSpeakDone) {
      speak("Primavera");
      springSpeakDone = true;
  	}
}

function fingerTone(lat, lon) {
  //console.log(fingerDataCounter)
  if (fingerDataCounter % fingerDataFrec === 0 && inSelection(lat, lon)) {
    fingerSpeak(lon, lat);
	synth.triggerAttackRelease(latitudeToFreq(lat), "100n");
  }
  fingerDataCounter = (fingerDataCounter + 1) % fingerDataFrec;
}

Protobject.onReceived((fingerData) => {
  // lat ~ y
  // lon ~ x
  // console.log(fingerData);
  clearTimeout(timeoutId);
  const xData = fingerData["x"];
  const yData = 1 - fingerData["y"];
  //console.log(`${Number(xData).toFixed(2)}-${Number(yData).toFixed(2)}`);
  const traceLon = fingerToMapCoord(xData, lonCenter, lonAdjustment);
  const traceLat = fingerToMapCoord(yData, latCenter, latAdjustment);
  console.log(`x=${Number(traceLon).toFixed(2)} y=${Number(traceLat).toFixed(2)}`);
  if (!defaultZoom) {resetMapPosition();}
  if (playingAnimation) {
    queue = [];
  	playingAnimation = false;
    enableBtn("tone");
    disableBtn("stop");
  }
  if (mDistance(traceLon, traceLat, 1, 50) < 1.3) {
  	fingerTouchedStart = true;
  }
  if (fingerTouchedStart) {
  	fingerTone(traceLat, traceLon);
  }
  drawFingerTrace(traceLat, traceLon);
  timeoutId = setTimeout(() => {
  	resetPlot();
    fingerTouchedStart = false;
    summerSpeakDone = false;
    autumnSpeakDone = false;
    winterSpeakDone = false;
    springSpeakDone = false;
  }, 1000);
});


