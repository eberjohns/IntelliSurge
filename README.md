# IntelliSurge: AI-Powered Patient Flow Management System
**A submission for the MumbaiHacks Hackathon, demonstrating a next-generation approach to crisis management in healthcare.**

[Live Interactive Demo →](https://google.com)

IntelliSurge is not just a dashboard; it's a live, interactive simulation of an agentic AI designed to partner with healthcare administrators. This experience showcases the entire lifecycle of an AI agent's operation—from autonomous data gathering and transparent reasoning to automated planning and learning from human feedback. It provides a tangible vision for the future of data-driven, proactive healthcare management.

## 🤖 The Agentic Flow: A Guided Experience

This simulation is designed as a guided narrative to demonstrate the core capabilities of an AI agent in a real-world scenario. A user (the judge) can initiate and observe the following flow:

1. **Goal-Setting:** The user begins by selecting a potential crisis scenario (e.g., an impending heatwave), giving the agent its primary objective.

2. **Autonomous Multi-Source Data Gathering:** The agent immediately and autonomously pulls data from multiple diverse sources, including:
    - **Live Weather API:** Real-time conditions for Mumbai.
    - **Simulated Social Media:** Scanning for keywords indicating public health distress.
    - **Simulated Traffic & Event APIs:** Building a comprehensive situational picture.

3. **Transparent Reasoning:** A "Thought Process" log provides a real-time, step-by-step view into the agent's analysis. This makes the "black box" of AI transparent and understandable, building trust in its conclusions.

4. **Automated Planning:** Based on its synthesis, the agent generates a concrete, multi-point action plan with clear categories (Staffing, Logistics, Capacity) designed to mitigate the predicted surge.

5. **Human-in-the-Loop Collaboration:** The user is a critical part of the process. They can approve or reject each of the agent's suggestions, demonstrating a true human-AI partnership model.

6. **Simulated Impact Visualization:** As the user authorizes actions, the simulation visualizes the real-world impact on a GIS map of the city's hospital network, showing how resources are being allocated.

7. **Reinforcement Learning Loop:** After the event simulation is complete, the user provides feedback on the plan's effectiveness. The agent logs this feedback to "learn" and improve its decision-making models for future events.

## 🔐 A Note on API Key Security

This project requires API keys to fetch live data. To ensure maximum security and demonstrate professional best practices:
- **No keys are stored in the code or the repository.**
- The application prompts the user for keys upon launch.
- These keys are stored securely and only in the browser's local ```localStorage```, and can be cleared at any time.

## ⚙️ How to Run the Simulation

1. **Get Free API Keys**:
- Sign up for a free API key at WeatherAPI.com.
- Sign up for a free developer API key at News API. (Note: The News API is planned for future versions but a key is required by the current script structure).

2. **Launch the Live Demo** using the link at the top of this README.

3. **Enter Your Keys** when prompted by the secure modal.

4. **Select a Scenario** and click "**Activate Agent**" to begin the simulation and witness the agentic flow firsthand.

## 🛠️ Technologies Used

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)

- **Styling:** Tailwind CSS (via CDN)

- **Mapping:** Leaflet.js

## Clone the repository:

```bash
git clone https://github.com/eberjohns/IntelliSurge.git
```
