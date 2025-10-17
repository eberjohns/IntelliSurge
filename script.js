// --- CONFIGURATION & DOM ELEMENT SELECTION ---
let API_KEYS = { weatherApi: '', newsApi: '' };

const scenarioSection = document.getElementById('scenario-section');
const agentWorkspace = document.getElementById('agent-workspace');
const activateAgentBtn = document.getElementById('activate-agent-btn');

const dataFeedsEl = document.getElementById('data-feeds');
const thoughtProcessEl = document.getElementById('agent-thought-process');
const actionPlanContainer = document.getElementById('action-plan-container');
const actionPlanEl = document.getElementById('action-plan');

const feedbackContainer = document.getElementById('feedback-container');
const learningConfirmationEl = document.getElementById('learning-confirmation');

const apiKeyModal = document.getElementById('api-key-modal');
const weatherApiKeyInput = document.getElementById('weather-api-key');
const newsApiKeyInput = document.getElementById('news-api-key');
const saveKeysBtn = document.getElementById('save-keys-btn');
const resetKeysBtn = document.getElementById('reset-keys-btn');

let map;
let hospitalMarkers = [];
const hospitals = [
    { id: 1, name: "KEM Hospital", lat: 19.006, lon: 72.842, resources: 100 },
    { id: 2, name: "Lilavati Hospital", lat: 19.058, lon: 72.83, resources: 100 },
    { id: 3, name: "Sion Hospital (LTMMC)", lat: 19.030, lon: 72.859, resources: 100 },
    { id: 4, name: "Breach Candy Hospital", lat: 18.966, lon: 72.806, resources: 100 }
];

// --- APP INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    activateAgentBtn.addEventListener('click', runAgentSimulation);
    saveKeysBtn.addEventListener('click', saveApiKeys);
    resetKeysBtn.addEventListener('click', resetApiKeys);
    loadApiKeys();
});

// --- API KEY MANAGEMENT (SECURITY) ---
function loadApiKeys() {
    const savedKeys = localStorage.getItem('intellisurge_apikeys_v2');
    if (savedKeys) {
        API_KEYS = JSON.parse(savedKeys);
    }
    // Only show modal on activation if keys are missing
}

function saveApiKeys() {
    API_KEYS.weatherApi = weatherApiKeyInput.value.trim();
    API_KEYS.newsApi = newsApiKeyInput.value.trim();

    if (API_KEYS.weatherApi && API_KEYS.newsApi) {
        localStorage.setItem('intellisurge_apikeys_v2', JSON.stringify(API_KEYS));
        apiKeyModal.classList.add('hidden');
        runAgentSimulation(); // Continue with the simulation after saving keys
    } else {
        alert('Please provide both API keys to proceed.');
    }
}

function resetApiKeys() {
    if (confirm('Are you sure you want to clear your saved API keys?')) {
        localStorage.removeItem('intellisurge_apikeys_v2');
        API_KEYS = { weatherApi: '', newsApi: '' };
        weatherApiKeyInput.value = '';
        newsApiKeyInput.value = '';
        alert('API keys have been cleared.');
    }
}

// --- SIMULATED APIS (for demonstration) ---
const simulatedApi = {
    getSocialMediaFeed: (scenario) => {
        const keywords = {
            heatwave: ['dehydrated', 'faint', 'heat stroke', 'exhaustion'],
            outbreak: ['fever', 'cough', 'sick', 'vomiting', 'quarantine'],
            festival: ['crowd', 'stampede', 'injured', 'emergency', 'overwhelmed']
        };
        return { source: "Social Media Intelligence", count: Math.floor(Math.random() * 40) + 10, keywords: keywords[scenario].slice(0, 2).join(', ') };
    },
    getTrafficReport: () => ({ source: "Municipal Traffic Grid", congestion: `${Math.floor(Math.random() * 50) + 20}%`, status: "Moderate Delays" }),
    getPublicEvents: (scenario) => {
        const event = {
            heatwave: "City-wide heat advisory",
            outbreak: "Localized health warnings issued",
            festival: "Ongoing Annual Music Festival"
        };
        return { source: "Public Event Coordination", event: event[scenario] };
    }
};

// --- AGENTIC FLOW ---
async function runAgentSimulation() {
    if (!API_KEYS.weatherApi || !API_KEYS.newsApi) {
        apiKeyModal.classList.remove('hidden');
        return;
    }
    scenarioSection.classList.add('hidden');
    agentWorkspace.classList.remove('hidden');
    initializeMap();

    const scenario = document.getElementById('scenario-select').value;
    const agent = new Agent(scenario);
    
    await agent.logThought("Booting IntelliSurge Agent...");
    
    // 1. DATA GATHERING
    await agent.logThought("Phase 1: Autonomous Data Ingestion protocols initiated...");
    const data = await agent.gatherData();
    agent.displayDataFeeds(data);
    
    // 2. REASONING & SYNTHESIS
    await agent.logThought("Phase 2: Synthesizing multi-source data streams...");
    const analysis = agent.analyzeData(data);
    await agent.logThought(`SYNTHESIS COMPLETE. Calculated Surge Risk: ${analysis.risk}%.`);
    await agent.logThought(`REASONING: ${analysis.reason}`, 2000);

    // 3. PLAN GENERATION
    await agent.logThought("Phase 3: Generating multi-stage action plan...");
    const plan = agent.generatePlan(analysis);
    agent.displayActionPlan(plan);
    await agent.logThought("PLAN GENERATED. Awaiting human-in-the-loop authorization.");
}

// --- AGENT CLASS ---
class Agent {
    constructor(scenario) {
        this.scenario = scenario;
    }

    async logThought(message, delay = 1500) {
        return new Promise(resolve => {
            setTimeout(() => {
                const p = document.createElement('p');
                p.textContent = message;
                thoughtProcessEl.appendChild(p);
                thoughtProcessEl.scrollTop = thoughtProcessEl.scrollHeight;
                resolve();
            }, delay);
        });
    }

    async gatherData() {
        const socialData = simulatedApi.getSocialMediaFeed(this.scenario);
        const trafficData = simulatedApi.getTrafficReport();
        const eventData = simulatedApi.getPublicEvents(this.scenario);
        // Integrate REAL APIs here
        const realWeatherData = await this.getRealWeatherData(); 
        return [realWeatherData, socialData, trafficData, eventData];
    }
    
    async getRealWeatherData() {
        const url = `https://api.weatherapi.com/v1/current.json?key=${API_KEYS.weatherApi}&q=Mumbai`;
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error();
            const data = await res.json();
            return { source: "Live Weather Feed", temp: `${data.current.temp_c}°C`, condition: data.current.condition.text, humidity: `${data.current.humidity}%` };
        } catch {
            return { source: "Live Weather Feed", error: "Failed to fetch" };
        }
    }

    displayDataFeeds(data) {
        dataFeedsEl.innerHTML = data.map(feed => `
            <div class="data-card">
                <h3 class="font-semibold text-indigo-400">${feed.source}</h3>
                <div class="text-sm mt-2 space-y-1">
                    ${Object.entries(feed).filter(([key]) => key !== 'source').map(([key, value]) => `
                        <p><span class="text-gray-400 capitalize">${key.replace('_', ' ')}:</span> <span class="font-medium">${value}</span></p>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    analyzeData(data) {
        let risk = 10;
        let reasons = [];
        const weather = data.find(d => d.source === 'Live Weather Feed');
        if (weather && !weather.error) {
            if (parseFloat(weather.temp) > 32) {
                risk += 25;
                reasons.push("High temperatures increase heat-related illnesses.");
            }
        }
        const social = data.find(d => d.source === 'Social Media Intelligence');
        if (social.count > 30) {
            risk += 30;
            reasons.push("High volume of relevant social media chatter detected.");
        }
        if (this.scenario === 'festival') {
            risk += 35;
            reasons.push("A major public event is a significant risk factor.");
        }
        return { risk: Math.min(100, risk), reason: reasons.join(' ') };
    }

    generatePlan(analysis) {
        const plan = [];
        if (analysis.risk > 30) plan.push({ id: 1, text: "Place on-call staff on high alert", category: "Staffing" });
        if (analysis.risk > 50) {
            plan.push({ id: 2, text: "Prepare mobile triage units near high-risk zones", category: "Resources" });
            plan.push({ id: 3, text: "Review critical supply inventory (IV fluids, ventilators)", category: "Logistics" });
        }
        if (analysis.risk > 75) {
            plan.push({ id: 4, text: "Activate mutual aid agreements with regional hospitals", category: "Communication" });
            plan.push({ id: 5, text: "Recommend postponement of non-essential elective surgeries", category: "Capacity" });
        }
        return plan;
    }

    displayActionPlan(plan) {
        actionPlanContainer.classList.remove('hidden');
        actionPlanEl.innerHTML = plan.map(item => `
            <div id="action-${item.id}" class="action-item">
                <span class="text-sm"><strong class="text-indigo-300">[${item.category}]</strong> ${item.text}</span>
                <div class="action-buttons">
                    <button class="approve-btn" data-id="${item.id}">Approve</button>
                    <button class="reject-btn" data-id="${item.id}">Reject</button>
                </div>
            </div>
        `).join('');
        document.querySelectorAll('.approve-btn, .reject-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handlePlanInteraction(e));
        });
    }

    handlePlanInteraction(e) {
        const actionId = e.target.dataset.id;
        const isApproved = e.target.classList.contains('approve-btn');
        const itemEl = document.getElementById(`action-${actionId}`);
        
        itemEl.classList.add(isApproved ? 'approved' : 'rejected');
        itemEl.querySelector('.action-buttons').remove();
        
        if (isApproved) {
            this.logThought(`ACTION ${actionId} AUTHORIZED. Executing...`, 200);
            updateMapResources();
        } else {
            this.logThought(`ACTION ${actionId} REJECTED by operator. Re-evaluating...`, 200);
        }

        if (actionPlanEl.querySelectorAll('.action-buttons').length === 0) {
            this.logThought("PLAN COMPLETE. Awaiting post-incident review.", 1000).then(() => this.showFeedback());
        }
    }
    
    showFeedback() {
        feedbackContainer.classList.remove('hidden');
        document.querySelectorAll('.feedback-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const feedback = e.target.dataset.feedback;
                learningConfirmationEl.textContent = `Feedback logged: "${feedback}". Agent model will be updated.`;
                learningConfirmationEl.classList.remove('hidden');
                feedbackContainer.querySelector('.flex').remove();
                this.logThought(`Human feedback received. Adjusting parameters for scenario: ${this.scenario}.`, 500);
                this.logThought("AGENT STANDBY.", 1000);
            });
        });
    }
}

// --- MAP & UI UTILITIES ---
function initializeMap() {
    if (map) map.remove(); // Clear previous map instance if any
    map = L.map('map').setView([19.0760, 72.8777], 12);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(map);

    hospitalMarkers.length = 0; // Clear the array
    hospitals.forEach(h => {
        const marker = L.marker([h.lat, h.lon]).addTo(map);
        marker.bindPopup(`<b>${h.name}</b><br>Resource Strain: <span id="res-${h.id}">LOW</span>`);
        hospitalMarkers.push({ ...h, marker });
    });
}

function updateMapResources() {
    hospitalMarkers.forEach(h => {
        const strainLevels = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'];
        const newStrainIndex = Math.floor(Math.random() * 3) + 1; // Randomly increase strain
        const strainEl = document.getElementById(`res-${h.id}`);
        if(strainEl) strainEl.textContent = strainLevels[newStrainIndex];
    });
}
