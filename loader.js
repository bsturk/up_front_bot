const nationalityFiles = [
    'america',
    'germany',
    'russia',
    'japan',
    'britain',
    'france',
    'italy'
];

const scenarioFiles = [
    'tutorial',
    'a', 'b', 'c', 'd', 'e', 'f',
    'g', 'h', 'i', 'j', 'k', 'l',
    'm', 'n', 'o', 'p', 'q', 'r',
    's', 't', 'u', 'v', 'w', 'x'
];

window.loadedNationalityData = {};
window.loadedScenarioData = {};

function loadScript(path) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = path;
        script.async = true;
        script.onload = () => {
            console.log(`Loaded: ${path}`);
            resolve();
        };
        script.onerror = (error) => {
            console.error(`Failed to load script: ${path}`, error);
            reject(new Error(`Failed to load script: ${path}`));
        };
        document.body.appendChild(script);
    });
}

function aggregateLoadedData() {
    console.log("Aggregating loaded data...");
    nationalityFiles.forEach(baseName => {
        const expectedVarName = `${baseName}Data`;
        if (window[expectedVarName]) {
            const data = window[expectedVarName];
            if (data && data.name) {
                window.loadedNationalityData[data.name] = data;
            } else {
                 console.warn(`Variable ${expectedVarName} loaded from ${baseName}.js is missing 'name' property or is invalid.`);
            }
        } else {
            console.warn(`Expected variable ${expectedVarName} not found after loading ${baseName}.js`);
        }
    });

    scenarioFiles.forEach(baseName => {
        const expectedVarName = `${baseName}Data`;
        if (window[expectedVarName]) {
             const data = window[expectedVarName];
             if (data && data.name) {
                 window.loadedScenarioData[data.name] = data;
             } else {
                 console.warn(`Variable ${expectedVarName} loaded from ${baseName}.js is missing 'name' property or is invalid.`);
             }
        } else {
            console.warn(`Expected variable ${expectedVarName} not found after loading ${baseName}.js`);
        }
    });

    console.log("Loaded Nationalities:", window.loadedNationalityData);
    console.log("Loaded Scenarios:", window.loadedScenarioData);

    document.dispatchEvent(new Event('dataReady'));
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded. Starting data script loading...");

    const nationalityPromises = nationalityFiles.map(name => loadScript(`nationalities/${name}.js`));
    const scenarioPromises    = scenarioFiles.map(name    => loadScript(`scenarios/${name}.js`));

    const allPromises = [...nationalityPromises, ...scenarioPromises];

    Promise.all(allPromises)
    .then(() => {
        console.log("All data scripts loaded successfully.");
        aggregateLoadedData();
        console.log("Dispatching dataReady event...");
        document.dispatchEvent(new Event('dataReady'));
        window.gameDataReady = true;
        console.log("gameDataReady flag set to true.");
    })
    .catch(error => {
         window.gameDataReady = false;
    });
});