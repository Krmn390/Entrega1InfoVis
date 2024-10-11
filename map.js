

async function fetchData() {
    const response = await fetch("bird_migration_v2.csv");
    const data = await response.text();

    const rows = data.split("\n").slice(1);

    const latitude = [];
    const longitude = [];
    const speed = [];

    rows.forEach(row =>{
        const cols = row.split(",");
        latitude.push(cols[3]);
        longitude.push(cols[4]);
        speed.push(cols[5]);
    });

    return {latitude, longitude, speed};
}

fetchData().then(data => {
    const traces = [];

    for (let i = 0; i < data.latitude.length - 1; i++) {
        let trace = {
            type: "scattergeo",
            lon: [data.longitude[i], data.longitude[i+1]],
            lat: [data.latitude[i], data.latitude[i+1]],
            mode: "lines",
            line: {
                width: 2,
                color: "red"
            }
        };

        traces.push(trace);
    };

    const layout = {
        title: "Test",
        showlegend: false,
        geo:{
            scope: "world",
            projection: {
                type: "azimuthal equal area"
            }
        },
        showland: true,
        landcolor: 'rgb(243,243,243)',
        countrycolor: 'rgb(204,204,204)'
    };

    Plotly.newPlot("map", traces, layout);
})