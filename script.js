// --- CONFIGURATION ---
// Keys are no longer stored here. They will be loaded from localStorage or user input.
let API_KEYS = {
    weatherApi: '',
    newsApi: ''
};

// --- DOM ELEMENT SELECTORS ---
const views = {
    dashboard: document.getElementById('view-dashboard'),
    trends: document.getElementById('view-trends')
};
const navLinks = {
    dashboard: document.getElementById('nav-dashboard'),
    trends: document.getElementById('nav-trends')
};
const fetchDataBtn = document.getElementById('fetch-data-btn');
const loader = document.getElementById('loader');
const lastUpdatedEl = document.getElementById('last-updated');
const kpiCardsContainer = document.getElementById('kpi-cards');
const recommendationsEl = document.getElementById('recommendations');
const detailsPanelContainer = document.getElementById('details-panel-container');
const detailsPanel = document.getElementById('details-panel');
const apiKeyModal = document.getElementById('api-key-modal');
const weatherApiKeyInput = document.getElementById('weather-api-key');
const newsApiKeyInput = document.getElementById('news-api-key');
const saveKeysBtn = document.getElementById('save-keys-btn');
const resetKeysBtn = document.getElementById('reset-keys-btn');


// --- APP STATE & INITIALIZATION ---
let map, admissionsChart, trendsChart;
let hospitalMarkers = [];

// Simulated Hospital Data for Mumbai
const hospitals = [
    { id: 1, name: "KEM Hospital", lat: 19.006, lon: 72.842, capacity: 1800, type: "Public" },
    { id: 2, name: "Lilavati Hospital", lat: 19.058, lon: 72.83, capacity: 323, type: "Private" },
    { id: 3, name: "Breach Candy Hospital", lat: 18.966, lon: 72.806, capacity: 210, type: "Private" },
    { id: 4, name: "Fortis Hospital, Mulund", lat: 19.172, lon: 72.946, capacity: 315, type: "Private" },
    { id: 5, name: "Sion Hospital (LTMMC)", lat: 19.030, lon: 72.859, capacity: 1400, type: "Public"}
];

// Custom Map Marker Icons
const iconTemplates = {
    green: new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] }),
    yellow: new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] }),
    red: new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] })
};

document.addEventListener('DOMContentLoaded', () => {
    initializeMap();
    initializeCharts();
    setupEventListeners();
    loadApiKeys();
    updateDashboard(15);
});

// --- API KEY MANAGEMENT ---
function loadApiKeys() {
    const savedKeys = localStorage.getItem('intellisurge_apikeys');
    if (savedKeys) {
        API_KEYS = JSON.parse(savedKeys);
    }
    if (!API_KEYS.weatherApi || !API_KEYS.newsApi) {
        apiKeyModal.classList.remove('hidden');
    } else {
        lastUpdatedEl.innerHTML = `API keys loaded from browser storage. <br>Ready to fetch live data.`;
    }
}

function saveApiKeys() {
    API_KEYS.weatherApi = weatherApiKeyInput.value;
    API_KEYS.newsApi = newsApiKeyInput.value;

    if (API_KEYS.weatherApi && API_KEYS.newsApi) {
        localStorage.setItem('intellisurge_apikeys', JSON.stringify(API_KEYS));
        apiKeyModal.classList.add('hidden');
        lastUpdatedEl.textContent = 'API keys saved. Ready to fetch live data.';
    } else {
        alert('Please enter both API keys to continue.');
    }
}

function resetApiKeys() {
    if (confirm('Are you sure you want to clear your saved API keys?')) {
        localStorage.removeItem('intellisurge_apikeys');
        API_KEYS = { weatherApi: '', newsApi: '' };
        weatherApiKeyInput.value = '';
        newsApiKeyInput.value = '';
        apiKeyModal.classList.remove('hidden');
    }
}

// --- INITIALIZATION FUNCTIONS ---
function initializeMap() {
    map = L.map('map').setView([19.0760, 72.8777], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    hospitals.forEach(h => {
        const marker = L.marker([h.lat, h.lon], { icon: iconTemplates.green }).addTo(map);
        marker.on('click', () => showHospitalDetails(h.id));
        hospitalMarkers.push({ ...h, marker });
    });
}

function initializeCharts() {
    const admissionsCtx = document.getElementById('admissionsChart').getContext('2d');
    admissionsChart = new Chart(admissionsCtx, {
        type: 'bar', data: { labels: ['Next 6h', '6-12h', '12-18h', '18-24h'], datasets: [{ label: 'Predicted Admissions', data: [], backgroundColor: 'rgba(99, 102, 241, 0.6)' }] },
        options: { scales: { y: { beginAtZero: true } }, plugins: { legend: { display: false } } }
    });
    const trendsCtx = document.getElementById('trendsChart').getContext('2d');
    trendsChart = new Chart(trendsCtx, {
        type: 'line', data: { labels: ['6 Days Ago', '5 Days Ago', '4 Days Ago', '3 Days Ago', '2 Days Ago', 'Yesterday', 'Today'], datasets: [{ label: 'Surge Score', data: [25, 30, 45, 40, 60, 55, 15], fill: true, borderColor: 'rgb(75, 192, 192)', tension: 0.3 }] },
        options: { scales: { y: { beginAtZero: true, max: 100 } } }
    });
}

// --- EVENT HANDLING ---
function setupEventListeners() {
    fetchDataBtn.addEventListener('click', handleFetchData);
    saveKeysBtn.addEventListener('click', saveApiKeys);
    resetKeysBtn.addEventListener('click', resetApiKeys);
    
    navLinks.dashboard.addEventListener('click', (e) => { e.preventDefault(); switchView('dashboard'); });
    navLinks.trends.addEventListener('click', (e) => { e.preventDefault(); switchView('trends'); });

    detailsPanelContainer.addEventListener('click', (e) => {
        if (e.target === detailsPanelContainer) {
            detailsPanelContainer.classList.add('hidden');
        }
    });
}

function switchView(viewName) {
    Object.values(views).forEach(v => v.classList.add('hidden'));
    Object.values(navLinks).forEach(l => l.classList.remove('active'));
    views[viewName].classList.remove('hidden');
    navLinks[viewName].classList.add('active');
}

// --- API FETCHING ---
async function handleFetchData() {
    if (!API_KEYS.weatherApi || !API_KEYS.newsApi) {
        alert("API keys are missing. Please enter them via the modal to fetch live data.");
        apiKeyModal.classList.remove('hidden');
        return;
    }
    loader.classList.remove('hidden');
    fetchDataBtn.disabled = true;
    
    const [weatherData, newsData] = await Promise.all([getWeatherData(), getHealthNews()]);
    
    const score = calculateSurgeScore(weatherData, newsData);
    updateDashboard(score, weatherData, newsData);

    loader.classList.add('hidden');
    fetchDataBtn.disabled = false;
    lastUpdatedEl.textContent = `Live data updated: ${new Date().toLocaleTimeString()}`;
}

async function getWeatherData() {
    const url = `https://api.weatherapi.com/v1/current.json?key=${API_KEYS.weatherApi}&q=Mumbai`;
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Weather API error: ${res.statusText}`);
        const data = await res.json();
        return {
            temp: data.current.temp_c,
            feels_like: data.current.feelslike_c,
            condition: data.current.condition.text
        };
    } catch (error) {
        console.error("Weather API fetch failed:", error);
        return { error: error.message };
    }
}

async function getHealthNews() {
    const keywords = 'virus OR outbreak OR hospital OR health OR pandemic OR epidemic';
    const url = `https://newsapi.org/v2/everything?qInTitle=(${keywords}) AND (mumbai OR india)&language=en&sortBy=publishedAt&pageSize=5&apiKey=${API_KEYS.newsApi}`;
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`News API error: ${res.statusText}`);
        const data = await res.json();
        return { articles: data.articles, count: data.articles.length };
    } catch (error) {
        console.error("News API fetch failed:", error);
        return { error: error.message };
    }
}

// --- CORE LOGIC & UPDATES ---
function calculateSurgeScore(weather, news) {
    let score = 10;
    if (weather && !weather.error) {
        if (weather.feels_like > 35) score += (weather.feels_like - 35) * 2;
        if (weather.condition.toLowerCase().includes('rain') || weather.condition.toLowerCase().includes('storm')) score += 10;
    }
    if (news && !news.error) {
        score += news.count * 8;
    }
    return Math.min(Math.round(score), 100);
}

function updateDashboard(score, weather = {}, news = {}) {
    updateKpiCards(score, weather, news);
    updateChart(score);
    updateRecommendations(score);
    updateMap(score);
    trendsChart.data.datasets[0].data[6] = score;
    trendsChart.update();
}

function updateKpiCards(score, weather, news) {
    let scoreColor = 'text-green-600';
    if (score >= 70) scoreColor = 'text-red-600';
    else if (score >= 40) scoreColor = 'text-yellow-500';

    const kpis = [
        { label: 'Patient Surge Score', value: score, color: scoreColor },
        { label: 'Weather Factor', value: weather.error ? 'N/A' : `${weather.temp}°C`, subtext: weather.condition || 'Unavailable' },
        { label: 'Health News Alerts', value: news.error ? 'N/A' : news.count }
    ];

    kpiCardsContainer.innerHTML = kpis.map(kpi => `
        <div class="bg-white p-6 rounded-xl shadow-lg text-center">
            <h3 class="text-lg font-semibold text-gray-500">${kpi.label}</h3>
            <p class="text-5xl font-bold mt-2 ${kpi.color || 'text-gray-800'}">${kpi.value}</p>
            ${kpi.subtext ? `<p class="text-sm text-gray-500 mt-1">${kpi.subtext}</p>` : ''}
        </div>
    `).join('');
}

function updateChart(score) {
    const baseAdmissions = [10, 15, 12, 18];
    const multiplier = 1 + (score / 100) * 3;
    admissionsChart.data.datasets[0].data = baseAdmissions.map(d => Math.round(d * multiplier));
    admissionsChart.update();
}

function updateRecommendations(score) {
    let html = '';
    const createRec = (text, type) => {
        const styles = { info: 'bg-blue-100 text-blue-800', warn: 'bg-yellow-100 text-yellow-800', crit: 'bg-red-100 text-red-800' };
        const icon = { info: 'i', warn: '!', crit: '!!'};
        return `<div class="p-3 rounded-lg flex items-start ${styles[type]}"><b class="mr-2">${icon[type]}</b><p class="text-sm">${text}</p></div>`;
    };
    if (score < 40) {
        html += createRec("Monitor standard inputs. All systems normal.", "info");
    } else if (score < 70) {
        html += createRec("Place on-call staff on alert. Review critical supply inventory.", "warn");
        html += createRec("Prepare designated overflow areas for potential use.", "info");
    } else {
        html += createRec("Activate surge staffing protocols immediately. Call in on-call staff.", "crit");
        html += createRec("Postpone non-essential elective surgeries to free up capacity.", "warn");
        html += createRec("Initiate contact with regional hospital network for load balancing.", "warn");
    }
    recommendationsEl.innerHTML = html;
}

function updateMap(score) {
    hospitalMarkers.forEach(h => {
        const occupancy = (score / 100) * (60 + Math.random() * 30) + 10;
        let icon = iconTemplates.green;
        if (occupancy > 85) icon = iconTemplates.red;
        else if (occupancy > 65) icon = iconTemplates.yellow;
        h.marker.setIcon(icon);
    });
}

function showHospitalDetails(hospitalId) {
    const hospital = hospitalMarkers.find(h => h.id === hospitalId);
    if (!hospital) return;
    
    const scoreText = document.querySelector('#kpi-cards p')?.textContent;
    const score = parseInt(scoreText) || 15;
    
    const occupancy = Math.min(100, Math.round((score / 100) * 70 + 25 + Math.random() * 5));
    const erWait = Math.round((score / 100) * 120 + 15);
    const icuBeds = Math.round(hospital.capacity * 0.1);
    const icuAvailable = Math.max(0, Math.round(icuBeds * (1 - score/100) - Math.random() * 2));

    let statusColor = 'bg-green-500';
    if (occupancy > 85) statusColor = 'bg-red-500';
    else if (occupancy > 65) statusColor = 'bg-yellow-500';

    detailsPanel.innerHTML = `
        <div class="p-6">
            <div class="flex justify-between items-start">
                <div>
                    <h2 class="text-2xl font-bold">${hospital.name}</h2>
                    <p class="text-md text-gray-500">${hospital.type} Hospital</p>
                </div>
                <button id="close-panel-btn" class="text-gray-400 hover:text-gray-700 text-3xl leading-none">&times;</button>
            </div>
            <div class="mt-4 pt-4 border-t">
                <div class="flex items-center mb-4">
                    <span class="px-3 py-1 text-sm font-semibold text-white ${statusColor} rounded-full">Overall Status: ${occupancy > 85 ? 'Critical' : (occupancy > 65 ? 'Busy' : 'Normal')}</span>
                </div>
                <div class="grid grid-cols-2 gap-4 text-center">
                    <div class="bg-gray-100 p-4 rounded-lg">
                        <p class="text-sm text-gray-500">Overall Occupancy</p>
                        <p class="text-3xl font-bold">${occupancy}%</p>
                    </div>
                    <div class="bg-gray-100 p-4 rounded-lg">
                        <p class="text-sm text-gray-500">ER Wait Time</p>
                        <p class="text-3xl font-bold">${erWait} <span class="text-lg">min</span></p>
                    </div>
                    <div class="bg-gray-100 p-4 rounded-lg">
                        <p class="text-sm text-gray-500">Total ICU Beds</p>
                        <p class="text-3xl font-bold">${icuBeds}</p>
                    </div>
                    <div class="bg-gray-100 p-4 rounded-lg">
                        <p class="text-sm text-gray-500">Available ICU Beds</p>
                        <p class="text-3xl font-bold">${icuAvailable}</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    detailsPanelContainer.classList.remove('hidden');
    document.getElementById('close-panel-btn').onclick = () => detailsPanelContainer.classList.add('hidden');
}
