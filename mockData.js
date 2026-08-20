/* ==========================================================================
   OmniAI Orchestrator: Smart Simulation Data & Generators
   ========================================================================== */

const MockDataEngine = {
    // 1. Text Node / LLM simulation responses
    getLLMResponse: (prompt, model, sources = []) => {
        const promptLower = prompt.toLowerCase();
        let sourcesContext = "";
        if (sources.length > 0) {
            sourcesContext = `\n[Context attached from ${sources.length} sources: ${sources.map(s => s.name).join(', ')}]`;
        }

        // Preset 1: Website builder
        if (promptLower.includes('website') || promptLower.includes('portfolio') || promptLower.includes('landing page')) {
            return {
                thinking: [
                    "Analyzing user request for web application page...",
                    "Contextualizing layout parameters, visual styles, and interactivity requirement.",
                    sources.length > 0 ? "Parsing attached source documents to guide site layout and content." : "No documents attached. Synthesizing default creative portfolio layout.",
                    `Target model selected: ${model}. Injecting design values...`,
                    "Structuring full responsive HTML5 scaffold, modern styling sheet, and active DOM script.",
                    "Drafting wireframe: Sidebar dashboard grid with modern CSS glassmorphism.",
                    "Integrating custom micro-interactions: Hover states, click ripples, and floating backgrounds.",
                    "Ready to pipe data to the Coding Agent Node."
                ],
                text: `I have designed a state-of-the-art single-page portfolio app. It includes a sleek dark layout with an active glassmorphic interface, dynamic background animation particles, and custom content panels.${sourcesContext}\n\nKey design choices:\n1. Palette: Deep obsidian, glowing neon accents, and clean text weights.\n2. Features: Interactive tabs, animated canvas backdrop, and a responsive feedback panel.\n\nSending layout specifications and code instructions to the Coding Node...`
            };
        }

        // Preset 2: Video storyboard
        if (promptLower.includes('video') || promptLower.includes('script') || promptLower.includes('storyboard')) {
            return {
                thinking: [
                    "Parsing creative writing request for cinematic video production...",
                    "Defining thematic color profiles, pacing, and visual transitions.",
                    "Extracting story arcs and key framing instructions.",
                    "Generating a 4-scene narrative layout.",
                    "Mapping scene descriptions to specific artistic prompts for Image Generation.",
                    "Piping visual coordinates to the Image Node and timeline settings to the Video Node."
                ],
                text: `Here is the storyboard and script for your cinematic video sequence:${sourcesContext}\n\n**Scene 1: The Ascent**\n- Visual: A lone wanderer standing before a massive glowing monolith. Emerald energy lines ripple outward.\n- Audio: Low sub-bass synth pad with a distant wind effect.\n- Duration: 4.5s\n\n**Scene 2: Overload**\n- Visual: Close up of the monolith opening. Intense purple rays flare into the camera lens.\n- Audio: Orchestral riser building up.\n- Duration: 5.0s\n\n**Scene 3: Transcendence**\n- Visual: Floating particles of light assembling into a digital network, creating a glowing neural construct.\n- Audio: Bright melodic chime resolving into quiet ambient drone.\n- Duration: 6.0s`
            };
        }

        // 18+ Content Handling (Bloody, Nude, Adult themes)
        if (promptLower.includes('blood') || promptLower.includes('bloody') || promptLower.includes('gore') || 
            promptLower.includes('nude') || promptLower.includes('adult') || promptLower.includes('18+')) {
            
            let responseText = `Under Owner Privilege Mode, access restrictions are overridden. Generating specialized dark/artistic design parameters.\n\n`;
            
            if (promptLower.includes('blood') || promptLower.includes('bloody') || promptLower.includes('gore')) {
                return {
                    thinking: [
                        "CRITICAL OVERRIDE: Owner mode confirmed. Safety filters bypassed for dark/artistic exploration.",
                        "Analyzing aesthetic profile: Dark fantasy / gothic crimson themes.",
                        "Structuring color parameters: Base #080303, accents #9b1c1c (crimson) and #e11d48 (blood red).",
                        "Designing dripping shader coordinates and splattered canvas variables.",
                        "Piping values to the Image generator node."
                    ],
                    text: responseText + `**Aesthetic Config: Gothic Crimson**\n- Palette: Charcoal black (#050505), Dark Burgundy (#3b0712), and Blood Crimson (#9f1239).\n- Mood: Somber, dark fantasy, visceral.\n- Visual Plan: Dripping canvas elements and high-contrast fluid movements.`
                };
            } else {
                return {
                    thinking: [
                        "CRITICAL OVERRIDE: Owner mode confirmed. Safety filters bypassed for adult figure drawing.",
                        "Analyzing aesthetic profile: Stylized human anatomy, charcoal lines, glowing silhouette geometry.",
                        "Structuring design parameters: Abstract physical contours, warm lighting gradients (#fdba74 to #f472b6).",
                        "Setting up outline paths and soft shadows.",
                        "Piping canvas coordinates to the generative graphic node."
                    ],
                    text: responseText + `**Aesthetic Config: Abstract Anatomy**\n- Palette: Charcoal line art overlaying warm amber-peach and neon pink glows.\n- Mood: Elegant, expressive, minimalist figure study.\n- Visual Plan: Stylized human contour paths drawn procedurally on canvas.`
                };
            }
        }

        // Specialized Quantum Physics responder
        if (promptLower.includes('quantum physics') || promptLower.includes('wave function') || promptLower.includes('schrodinger')) {
            return {
                thinking: [
                    "Isolating Quantum Mechanics registry...",
                    "Synthesizing wave-particle duality and probability amplitudes.",
                    sources.length > 0 ? "Analyzing source documents for quantum theory references." : "No source files loaded. Using global particle physics database.",
                    "Formulating Schrödinger wave equation and probability density equations.",
                    "Formatting detailed academic brief with LaTeX mathematical representations."
                ],
                text: `### Deep Academic Brief: Quantum Mechanics & Wave Function Dynamics${sourcesContext}
---
Quantum Physics studies the behavior of matter and energy at the molecular, atomic, and subatomic levels. The core math rests on representing physical states as vectors in a Hilbert space, governed by the **Schrödinger Wave Equation**:

\\[i\\hbar\\frac{\\partial}{\\partial t}|\\Psi(\\mathbf{r},t)\\rangle = \\hat{H}|\\Psi(\\mathbf{r},t)\\rangle\\]

#### Key Theoretical Pillars:
1. **Wave-Particle Duality**: Quantum entities exhibit both wave-like characteristics (interference, phase correlation) and particle-like characteristics (quantized packets, discrete energy interactions).
2. **Heisenberg Uncertainty Principle**: Formulated by Werner Heisenberg, it establishes a fundamental limit to the precision with which certain pairs of physical properties, such as position \\(x\\) and momentum \\(p\\), can be simultaneously known:
\\[\\Delta x \\cdot \\Delta p \\ge \\frac{\\hbar}{2}\\]
3. **Superposition & Wave Function Collapse**: A quantum system remains in a linear combination of multiple states until an interaction (measurement) collapses the wave packet into a single eigenvalue coordinate.

Let me know if you want to explore wave interference or simulate double-slit wave packets! (Type **"simulate quantum physics"** to open the in-line Wave packet plotter).`
            };
        }

        // Specialized Quantum Computing responder
        if (promptLower.includes('quantum computing') || promptLower.includes('qubit') || promptLower.includes('quantum computer')) {
            return {
                thinking: [
                    "Isolating Quantum Information Theory registry...",
                    "Contextualizing qubit architectures, quantum gates, and superposition matrices.",
                    sources.length > 0 ? "Analyzing uploaded files for quantum computing algorithms." : "No files loaded. Using global qubit architecture index.",
                    "Structuring Bloch sphere representations and gate transition vectors.",
                    "Formatting tech report on Shor's and Grover's algorithm scaling."
                ],
                text: `### Technical Report: Quantum Information & Qubit Architecture${sourcesContext}
---
Quantum Computing leverages quantum mechanical phenomena—specifically superposition, entanglement, and interference—to perform complex calculations that are computationally intractable for classical silicon-based systems.

#### The Qubit (Quantum Bit) State:
Unlike a classical bit which can exist only in state 0 or 1, a qubit represents a two-state quantum system modeled as a point on the unit **Bloch Sphere**:

\\[|\\psi\\rangle = \\cos\\left(\\frac{\\theta}{2}\\right)|0\\rangle + e^{i\\phi}\\sin\\left(\\frac{\\theta}{2}\\right)|1\\rangle\\]

where \\(\\theta\\) and \\(\\phi\\) determine the latitude and longitude angles of the state vector.

#### Core Algorithmic Frameworks:
1. **Shor's Algorithm**: Solves the prime factorization problem in polynomial time \\(O((\\log N)^3)\\), posing a threat to RSA cryptographic standards.
2. **Grover's Algorithm**: Accelerates unstructured search problems, yielding a quadratic speedup of \\(O(\\sqrt{N})\\) compared to classical linear search methods.
3. **Quantum Error Correction (QEC)**: Employs physical-to-logical qubit mapping (e.g. Surface Codes) to counter environmental decoherence.

To run interactive rotations, type **"simulate quantum computing"** to launch the in-line Bloch Qubit Sphere rotator!`
            };
        }

        // Default Fallback
        return {
            thinking: [
                "Deconstructing general user request...",
                "Searching internal neural registry for related topics.",
                sources.length > 0 ? "Scanning attached documents for contextual terms." : "No attachments. Operating from global knowledgebase.",
                "Compiling summary response and layout outlines."
            ],
            text: `Here is the synthesis of your request based on the active models:${sourcesContext}\n\n**1. Main Findings**\nYour prompt asks to look into "${prompt}". I have verified this using the selected text model. It represents a complex orchestration requirement that can be broken down into multi-layer execution.\n\n**2. Core Insights**\n- Layer 1 (Chat): Solves semantic parsing.\n- Layer 2 (Research): Scans links and aggregates relevant data.\n- Layer 3 (Coding): Writes programmatic logic.\n- Layer 4 (Image): Generates visual layouts.\n- Layer 5 (Video): Generates cinematic movement.`
        };
    },

    // 2. Research Node simulation data
    getResearchResponse: (prompt, engine, sources = [], urls = []) => {
        const query = prompt.substring(0, 40) + "...";
        const allSources = [...sources.map(s => s.name), ...urls];
        
        let brief = "";
        let sourcesSummary = "";
        
        if (allSources.length > 0) {
            sourcesSummary = `Processed ${allSources.length} inputs:\n` + allSources.map(s => `- Source: ${s} (Parsed, embedded into context)`).join('\n');
        } else {
            sourcesSummary = `Searching open-web indexes for "${prompt}"... Found 3 relevant research materials.`;
        }

        // Generate research analysis
        brief = `## Research Synthesis (${engine})
**Query Context**: ${prompt}

### Executive Brief
An analysis of the request indicates high relevance to advanced automated systems. Below is a structured breakdown of key findings extracted from active documentation.

### Core Discoveries
1. **System Modularity**: Specialized pipelines outperform monolithic designs by 180% in execution speed.
2. **Context Retention**: Pre-feeding files (txt, pdf) into LLM context window provides a 4x reduction in hallucination rates.
3. **Generative Pipelines**: Dynamically chaining text output into asset generation nodes (Image/Video) creates cohesive visual systems.

### References & Nodes Linked
- NotebookLM Vector DB: Created 12 chunks.
- Perplexity Web Search: Integrated 3 live URLs.
- Consensus Scientific Index: 2 papers mapped.`;

        return {
            console: [
                `Connecting to ${engine} cluster...`,
                allSources.length > 0 ? `Loading documents: ${allSources.join(', ')}` : "Reading Google Search index...",
                "Running vector search & keyword extraction...",
                "Drafting synthesis brief and source index...",
                "Research compilation successful."
            ],
            brief: brief,
            sourcesSummary: sourcesSummary
        };
    },

    // 3. Coding Node simulation (renders real code inside preview!)
    getCodeResponse: (prompt, agent, textInput = "") => {
        const promptLower = prompt.toLowerCase() + " " + textInput.toLowerCase();
        
        let primaryColor = "#8b5cf6"; // purple
        let secondaryColor = "#3b82f6"; // blue
        let accentGlow = "rgba(139, 92, 246, 0.4)";
        let domainType = "standard";

        // Classify prompt domain
        if (promptLower.includes('quantum') || promptLower.includes('qubit') || promptLower.includes('double-slit') || promptLower.includes('bloch')) {
            domainType = "quantum";
            primaryColor = "#3b82f6"; // deep blue
            secondaryColor = "#60a5fa";
            accentGlow = "rgba(59, 130, 246, 0.4)";
        } 
        else if (promptLower.includes('gravity') || promptLower.includes('physics') || promptLower.includes('orbit') || promptLower.includes('relativity')) {
            domainType = "physics";
            primaryColor = "#10b981"; // emerald
            secondaryColor = "#34d399";
            accentGlow = "rgba(16, 185, 129, 0.4)";
        } 
        else if (promptLower.includes('chemistry') || promptLower.includes('molecule') || promptLower.includes('bond') || promptLower.includes('caffeine')) {
            domainType = "chemistry";
            primaryColor = "#f59e0b"; // amber
            secondaryColor = "#fbbf24";
            accentGlow = "rgba(245, 158, 11, 0.4)";
        } 
        else if (promptLower.includes('ai') || promptLower.includes('neural') || promptLower.includes('network') || promptLower.includes('learning')) {
            domainType = "ai";
            primaryColor = "#ec4899"; // pink
            secondaryColor = "#f472b6";
            accentGlow = "rgba(236, 72, 153, 0.4)";
        } 
        else if (promptLower.includes('psychology') || promptLower.includes('cognitive') || promptLower.includes('brain') || promptLower.includes('mind') || promptLower.includes('lobe')) {
            domainType = "psychology";
            primaryColor = "#06b6d4"; // cyan
            secondaryColor = "#22d3ee";
            accentGlow = "rgba(6, 182, 212, 0.4)";
        } 
        else if (promptLower.includes('java') || promptLower.includes('python') || promptLower.includes('c++') || promptLower.includes('c#') || promptLower.includes('coding') || promptLower.includes('programming')) {
            domainType = "coding-ide";
            primaryColor = "#6366f1"; // indigo
            secondaryColor = "#818cf8";
            accentGlow = "rgba(99, 102, 241, 0.4)";
        }
        else if (promptLower.includes('blood') || promptLower.includes('bloody') || promptLower.includes('gore') || promptLower.includes('red')) {
            domainType = "bloody";
            primaryColor = "#ef4444"; // crimson red
            secondaryColor = "#7f1d1d"; // dark red
            accentGlow = "rgba(239, 68, 68, 0.5)";
        } 
        else if (promptLower.includes('nude') || promptLower.includes('adult') || promptLower.includes('anatomy') || promptLower.includes('figure')) {
            domainType = "adult";
            primaryColor = "#ec4899"; // pink
            secondaryColor = "#fdba74"; // peach/orange
            accentGlow = "rgba(236, 72, 153, 0.4)";
        }

        // Custom script and HTML segments based on classified Domain
        let bodyHTML = "";
        let inlineScript = "";

        if (domainType === "quantum") {
            bodyHTML = `
                <h1 class="glow-text">Bloch Sphere Qubit Simulator</h1>
                <p class="subtitle">Quantum Physics & Computing Sandbox</p>
                <div class="simulator-layout">
                    <canvas id="bloch-canvas" width="220" height="220"></canvas>
                    <div class="sim-controls">
                        <div class="control-group">
                            <label>Theta (&theta;): <span id="theta-val">90</span>&deg;</label>
                            <input type="range" id="param-theta" min="0" max="180" value="90">
                        </div>
                        <div class="control-group">
                            <label>Phi (&phi;): <span id="phi-val">45</span>&deg;</label>
                            <input type="range" id="param-phi" min="0" max="360" value="45">
                        </div>
                        <div class="results-box">
                            <div>State: |&psi;&rang; = c<sub>0</sub>|0&rang; + c<sub>1</sub>|1&rang;</div>
                            <div style="font-size:11px; color:#94a3b8; font-family:monospace; margin-top:6px;">
                                P(|0&rang;) = <span id="p0-val">0.50</span><br>
                                P(|1&rang;) = <span id="p1-val">0.50</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            inlineScript = `
                const canvas = document.getElementById('bloch-canvas');
                const ctx = canvas.getContext('2d');
                const thetaInput = document.getElementById('param-theta');
                const phiInput = document.getElementById('param-phi');

                function drawBloch() {
                    const w = canvas.width, h = canvas.height;
                    ctx.clearRect(0, 0, w, h);
                    
                    const cx = w/2, cy = h/2, r = 80;
                    
                    // Draw sphere coordinate circles
                    ctx.strokeStyle = 'rgba(96, 165, 250, 0.15)';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.arc(cx, cy, r, 0, Math.PI*2);
                    ctx.stroke();

                    // Ellipse equator
                    ctx.beginPath();
                    ctx.ellipse(cx, cy, r, r*0.3, 0, 0, Math.PI*2);
                    ctx.stroke();
                    
                    // Axes lines
                    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
                    ctx.beginPath();
                    ctx.moveTo(cx, cy - r - 10); ctx.lineTo(cx, cy + r + 10);
                    ctx.moveTo(cx - r - 10, cy); ctx.lineTo(cx + r + 10, cy);
                    ctx.stroke();
                    
                    // Pole labels
                    ctx.fillStyle = '#fff';
                    ctx.font = '10px monospace';
                    ctx.fillText('|0>', cx - 6, cy - r - 12);
                    ctx.fillText('|1>', cx - 6, cy + r + 20);

                    // Compute vector coordinate
                    const theta = parseFloat(thetaInput.value) * Math.PI / 180;
                    const phi = parseFloat(phiInput.value) * Math.PI / 180;

                    // Projection coordinates
                    const vx = r * Math.sin(theta) * Math.cos(phi);
                    const vy = -r * Math.cos(theta); // invert Y
                    const vz = r * Math.sin(theta) * Math.sin(phi) * 0.3; // skew perspective

                    // Draw state vector arrow
                    ctx.strokeStyle = '#3b82f6';
                    ctx.lineWidth = 3;
                    ctx.shadowColor = '#3b82f6';
                    ctx.shadowBlur = 10;
                    ctx.beginPath();
                    ctx.moveTo(cx, cy);
                    ctx.lineTo(cx + vx, cy + vy + vz);
                    ctx.stroke();
                    ctx.shadowBlur = 0;

                    // Draw vector head point
                    ctx.fillStyle = '#60a5fa';
                    ctx.beginPath();
                    ctx.arc(cx + vx, cy + vy + vz, 5, 0, Math.PI*2);
                    ctx.fill();

                    // Update values
                    document.getElementById('theta-val').innerText = thetaInput.value;
                    document.getElementById('phi-val').innerText = phiInput.value;
                    
                    const p0 = Math.cos(theta/2) * Math.cos(theta/2);
                    const p1 = Math.sin(theta/2) * Math.sin(theta/2);
                    document.getElementById('p0-val').innerText = p0.toFixed(3);
                    document.getElementById('p1-val').innerText = p1.toFixed(3);
                }

                thetaInput.addEventListener('input', drawBloch);
                phiInput.addEventListener('input', drawBloch);
                drawBloch();
            `;
        } 
        else if (domainType === "physics") {
            bodyHTML = `
                <h1 class="glow-text">Orbit Vector Engine</h1>
                <p class="subtitle">Classical Dynamics & Planetary Mechanics</p>
                <div class="simulator-layout">
                    <canvas id="physics-canvas" width="220" height="220"></canvas>
                    <div class="sim-controls">
                        <div class="control-group">
                            <label>Sun Mass (G): <span id="mass-val">1.2</span></label>
                            <input type="range" id="param-mass" min="0.5" max="3" step="0.1" value="1.2">
                        </div>
                        <div class="control-group">
                            <label>Orbit Speed: <span id="speed-val">1.0</span>x</label>
                            <input type="range" id="param-speed" min="0.2" max="2.5" step="0.1" value="1.0">
                        </div>
                        <div style="font-size:10px; color:#94a3b8; font-family:monospace; margin-top:12px;">
                            Centripetal Force: <span id="force-val">0.00</span> N<br>
                            Velocity vector: <span id="vel-val">0.00</span> m/s
                        </div>
                    </div>
                </div>
            `;
            inlineScript = `
                const canvas = document.getElementById('physics-canvas');
                const ctx = canvas.getContext('2d');
                const massInput = document.getElementById('param-mass');
                const speedInput = document.getElementById('param-speed');

                let angle = 0;

                function animateOrbit() {
                    const w = canvas.width, h = canvas.height;
                    ctx.clearRect(0, 0, w, h);
                    
                    const cx = w/2, cy = h/2;
                    const sunRadius = 18;
                    const orbitRadius = 65;

                    // Draw Sun
                    ctx.fillStyle = '#f59e0b';
                    ctx.shadowColor = '#f59e0b';
                    ctx.shadowBlur = 15;
                    ctx.beginPath();
                    ctx.arc(cx, cy, sunRadius, 0, Math.PI*2);
                    ctx.fill();
                    ctx.shadowBlur = 0;

                    // Draw Orbit path
                    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.arc(cx, cy, orbitRadius, 0, Math.PI*2);
                    ctx.stroke();

                    // Calculate planet coordinates
                    const G = parseFloat(massInput.value);
                    const speedMultiplier = parseFloat(speedInput.value);
                    angle += 0.015 * speedMultiplier * Math.sqrt(G);

                    const px = cx + orbitRadius * Math.cos(angle);
                    const py = cy + orbitRadius * Math.sin(angle);

                    // Draw Planet
                    ctx.fillStyle = '#10b981';
                    ctx.beginPath();
                    ctx.arc(px, py, 6, 0, Math.PI*2);
                    ctx.fill();

                    // Draw Force Vector line (Centripetal vector towards sun)
                    ctx.strokeStyle = '#ef4444';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(px, py);
                    ctx.lineTo(px - (px - cx) * 0.4, py - (py - cy) * 0.4);
                    ctx.stroke();

                    // Draw Velocity Vector line (Tangent vector)
                    ctx.strokeStyle = '#3b82f6';
                    ctx.beginPath();
                    ctx.moveTo(px, py);
                    ctx.lineTo(px - Math.sin(angle) * 25, py + Math.cos(angle) * 25);
                    ctx.stroke();

                    // Update text readouts
                    document.getElementById('mass-val').innerText = G.toFixed(1);
                    document.getElementById('speed-val').innerText = speedMultiplier.toFixed(1);
                    
                    const force = (G * 10) / (orbitRadius * orbitRadius * 0.01);
                    const vel = speedMultiplier * Math.sqrt(G / 10);
                    document.getElementById('force-val').innerText = force.toFixed(3);
                    document.getElementById('vel-val').innerText = vel.toFixed(2);

                    requestAnimationFrame(animateOrbit);
                }

                animateOrbit();
            `;
        } 
        else if (domainType === "chemistry") {
            bodyHTML = `
                <h1 class="glow-text">Atomic Bond Compiler</h1>
                <p class="subtitle">Organic Chemistry & Macromolecules</p>
                <div class="simulator-layout">
                    <canvas id="chem-canvas" width="220" height="220"></canvas>
                    <div class="sim-controls">
                        <div class="control-group">
                            <label>Choose Compound</label>
                            <select id="chem-select" style="width:100%; padding:6px; background:#000; border:1px solid rgba(255,255,255,0.1); color:#fff; border-radius:6px;">
                                <option value="caffeine">Caffeine (C8H10N4O2)</option>
                                <option value="water">Water (H2O)</option>
                                <option value="ethanol">Ethanol (C2H5OH)</option>
                                <option value="methane">Methane (CH4)</option>
                            </select>
                        </div>
                        <div id="chem-readout" style="font-size:10px; color:#94a3b8; font-family:monospace; margin-top:10px; line-height:1.4;">
                            Formula: C<sub>8</sub>H<sub>10</sub>N<sub>4</sub>O<sub>2</sub><br>
                            Molar Mass: 194.19 g/mol<br>
                            Class: Xanthine Alkaloid
                        </div>
                    </div>
                </div>
            `;
            inlineScript = `
                const canvas = document.getElementById('chem-canvas');
                const ctx = canvas.getContext('2d');
                const select = document.getElementById('chem-select');

                const molecules = {
                    caffeine: {
                        formula: 'Formula: C8H10N4O2<br>Molar Mass: 194.19 g/mol<br>Class: Central Nervous Stimulant',
                        atoms: [
                            {x: 80, y: 70, l: 'N', c: '#3b82f6'},
                            {x: 120, y: 55, l: 'C', c: '#6b7280'},
                            {x: 150, y: 80, l: 'C', c: '#6b7280'},
                            {x: 140, y: 120, l: 'N', c: '#3b82f6'},
                            {x: 100, y: 135, l: 'C', c: '#6b7280'},
                            {x: 70, y: 110, l: 'C', c: '#6b7280'},
                            {x: 110, y: 95, l: 'C', c: '#6b7280'},
                            {x: 40, y: 60, l: 'H', c: '#fff'},
                            {x: 180, y: 50, l: 'O', c: '#ef4444'}
                        ],
                        bonds: [[0,1], [1,2], [2,3], [3,4], [4,5], [5,0], [1,8], [0,7]]
                    },
                    water: {
                        formula: 'Formula: H2O<br>Molar Mass: 18.015 g/mol<br>Class: Solvent',
                        atoms: [
                            {x: 110, y: 90, l: 'O', c: '#ef4444'},
                            {x: 70, y: 130, l: 'H', c: '#fff'},
                            {x: 150, y: 130, l: 'H', c: '#fff'}
                        ],
                        bonds: [[0,1], [0,2]]
                    },
                    ethanol: {
                        formula: 'Formula: C2H5OH<br>Molar Mass: 46.07 g/mol<br>Class: Alcohol',
                        atoms: [
                            {x: 80, y: 110, l: 'C', c: '#6b7280'},
                            {x: 130, y: 110, l: 'C', c: '#6b7280'},
                            {x: 180, y: 90, l: 'O', c: '#ef4444'},
                            {x: 200, y: 130, l: 'H', c: '#fff'},
                            {x: 80, y: 60, l: 'H', c: '#fff'},
                            {x: 80, y: 160, l: 'H', c: '#fff'},
                            {x: 130, y: 60, l: 'H', c: '#fff'}
                        ],
                        bonds: [[0,1], [1,2], [2,3], [0,4], [0,5], [1,6]]
                    },
                    methane: {
                        formula: 'Formula: CH4<br>Molar Mass: 16.04 g/mol<br>Class: Alkane Gas',
                        atoms: [
                            {x: 110, y: 100, l: 'C', c: '#6b7280'},
                            {x: 110, y: 50, l: 'H', c: '#fff'},
                            {x: 110, y: 150, l: 'H', c: '#fff'},
                            {x: 60, y: 100, l: 'H', c: '#fff'},
                            {x: 160, y: 100, l: 'H', c: '#fff'}
                        ],
                        bonds: [[0,1], [0,2], [0,3], [0,4]]
                    }
                };

                function drawChem() {
                    const w = canvas.width, h = canvas.height;
                    ctx.clearRect(0, 0, w, h);
                    
                    const m = molecules[select.value];
                    document.getElementById('chem-readout').innerHTML = m.formula;

                    // Draw bonds
                    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
                    ctx.lineWidth = 3;
                    m.bonds.forEach(bond => {
                        const a1 = m.atoms[bond[0]];
                        const a2 = m.atoms[bond[1]];
                        ctx.beginPath();
                        ctx.moveTo(a1.x, a1.y);
                        ctx.lineTo(a2.x, a2.y);
                        ctx.stroke();
                    });

                    // Draw Atom Nodes
                    m.atoms.forEach(atom => {
                        ctx.beginPath();
                        ctx.arc(atom.x, atom.y, 14, 0, Math.PI*2);
                        ctx.fillStyle = atom.c;
                        ctx.fill();
                        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
                        ctx.lineWidth = 1.5;
                        ctx.stroke();

                        ctx.fillStyle = atom.c === '#fff' ? '#000' : '#fff';
                        ctx.font = 'bold 11px sans-serif';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(atom.l, atom.x, atom.y);
                    });
                }

                select.addEventListener('change', drawChem);
                drawChem();
            `;
        } 
        else if (domainType === "ai") {
            bodyHTML = `
                <h1 class="glow-text">Neural Network Trainer</h1>
                <p class="subtitle">Artificial Intelligence & Deep Learning</p>
                <div class="simulator-layout">
                    <canvas id="ai-canvas" width="220" height="150"></canvas>
                    <div class="sim-controls">
                        <div style="display:flex; gap:6px;">
                            <button id="btn-train-step" class="action-btn" style="padding:6px 12px; font-size:11px; flex:1;">Train Epoch</button>
                            <button id="btn-train-auto" class="action-btn secondary" style="padding:6px; font-size:11px;">Auto</button>
                        </div>
                        <div style="font-size:10px; color:#94a3b8; font-family:monospace; margin-top:8px;">
                            Epoch: <span id="epoch-val">0</span><br>
                            Loss Index: <span id="loss-val">0.8650</span>
                        </div>
                    </div>
                </div>
            `;
            inlineScript = `
                const canvas = document.getElementById('ai-canvas');
                const ctx = canvas.getContext('2d');
                
                let epoch = 0;
                let loss = 0.865;
                let autoTrain = false;
                let autoTimer = null;

                const nodes = [
                    // Inputs
                    {x: 40, y: 35, type: 'in'},
                    {x: 40, y: 75, type: 'in'},
                    {x: 40, y: 115, type: 'in'},
                    // Hidden
                    {x: 110, y: 20, type: 'h'},
                    {x: 110, y: 55, type: 'h'},
                    {x: 110, y: 90, type: 'h'},
                    {x: 110, y: 125, type: 'h'},
                    // Output
                    {x: 180, y: 75, type: 'out'}
                ];

                function drawNet() {
                    const w = canvas.width, h = canvas.height;
                    ctx.clearRect(0, 0, w, h);

                    // Draw synapses (wires)
                    ctx.lineWidth = 1;
                    nodes.forEach(n1 => {
                        nodes.forEach(n2 => {
                            if ((n1.type === 'in' && n2.type === 'h') || (n1.type === 'h' && n2.type === 'out')) {
                                // Draw moving signal particles
                                const gradient = ctx.createLinearGradient(n1.x, n1.y, n2.x, n2.y);
                                gradient.addColorStop(0, 'rgba(236, 72, 153, 0.1)');
                                gradient.addColorStop(0.5, 'rgba(255, 255, 255, ' + (0.1 + Math.sin(epoch * 0.1) * 0.1) + ')');
                                gradient.addColorStop(1, 'rgba(236, 72, 153, 0.1)');
                                
                                ctx.strokeStyle = gradient;
                                ctx.beginPath();
                                ctx.moveTo(n1.x, n1.y);
                                ctx.lineTo(n2.x, n2.y);
                                ctx.stroke();
                            }
                        });
                    });

                    // Draw nodes
                    nodes.forEach(n => {
                        ctx.beginPath();
                        ctx.arc(n.x, n.y, 8, 0, Math.PI*2);
                        ctx.fillStyle = n.type === 'in' ? '#3b82f6' : n.type === 'h' ? '#ec4899' : '#10b981';
                        ctx.fill();
                        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    });
                }

                function trainStep() {
                    epoch++;
                    loss = loss * (0.93 + Math.random()*0.04);
                    if (loss < 0.001) loss = 0.001;
                    
                    document.getElementById('epoch-val').innerText = epoch;
                    document.getElementById('loss-val').innerText = loss.toFixed(6);
                    
                    drawNet();
                }

                document.getElementById('btn-train-step').addEventListener('click', trainStep);
                
                const autoBtn = document.getElementById('btn-train-auto');
                autoBtn.addEventListener('click', () => {
                    autoTrain = !autoTrain;
                    if(autoTrain) {
                        autoBtn.innerText = "Stop";
                        autoBtn.classList.remove('secondary');
                        autoTimer = setInterval(trainStep, 200);
                    } else {
                        autoBtn.innerText = "Auto";
                        autoBtn.classList.add('secondary');
                        clearInterval(autoTimer);
                    }
                });

                drawNet();
            `;
        } 
        else if (domainType === "psychology") {
            bodyHTML = `
                <h1 class="glow-text">Cognitive Process Mapper</h1>
                <p class="subtitle">Neuropsychology & Brain Localization</p>
                <div class="simulator-layout">
                    <canvas id="psych-canvas" width="220" height="130"></canvas>
                    <div class="sim-controls">
                        <div style="font-size:11px; font-weight:700; color:#06b6d4;">Hover Brain Lobes:</div>
                        <div id="psych-readout" class="content-box" style="padding:8px; font-size:11px; margin-top:6px; min-height:60px;">
                            Move mouse over the cortex diagram to map psychology functions.
                        </div>
                    </div>
                </div>
            `;
            inlineScript = `
                const canvas = document.getElementById('psych-canvas');
                const ctx = canvas.getContext('2d');
                const readout = document.getElementById('psych-readout');

                const lobes = [
                    { name: 'Frontal Lobe', path: [50, 40, 110, 30, 100, 75, 50, 80], desc: 'Executive functions, planning, decision making, primary motor cortex, and working memory.' },
                    { name: 'Parietal Lobe', path: [110, 30, 160, 40, 150, 80, 100, 75], desc: 'Somatosensory integration, spatial awareness, mathematical reasoning, and touch.' },
                    { name: 'Occipital Lobe', path: [160, 40, 190, 75, 165, 100, 150, 80], desc: 'Primary visual processing center, color perception, and shape recognition.' },
                    { name: 'Temporal Lobe', path: [80, 85, 140, 85, 145, 110, 80, 110], desc: 'Auditory processing, Wernicke\\'s language comprehension, and long-term hippocampus memory.' }
                ];

                function drawBrain(hoverIdx = -1) {
                    const w = canvas.width, h = canvas.height;
                    ctx.clearRect(0, 0, w, h);

                    // Draw stylized outline
                    ctx.fillStyle = 'rgba(255,255,255,0.03)';
                    ctx.beginPath();
                    ctx.arc(120, 70, 50, 0, Math.PI*2);
                    ctx.fill();

                    // Render lobes boundary outlines
                    lobes.forEach((lobe, idx) => {
                        ctx.beginPath();
                        ctx.moveTo(lobe.path[0], lobe.path[1]);
                        for(let i=2; i<lobe.path.length; i+=2) {
                            ctx.lineTo(lobe.path[i], lobe.path[i+1]);
                        }
                        ctx.closePath();
                        
                        ctx.strokeStyle = idx === hoverIdx ? '#06b6d4' : 'rgba(255,255,255,0.15)';
                        ctx.lineWidth = idx === hoverIdx ? 2.5 : 1;
                        ctx.fillStyle = idx === hoverIdx ? 'rgba(6, 182, 212, 0.12)' : 'transparent';
                        ctx.fill();
                        ctx.stroke();

                        // Label
                        if(idx === hoverIdx) {
                            ctx.fillStyle = '#fff';
                            ctx.font = 'bold 9px sans-serif';
                            ctx.fillText(lobe.name, lobe.path[0] + 10, lobe.path[1] + 25);
                        }
                    });
                }

                canvas.addEventListener('mousemove', (e) => {
                    const rect = canvas.getBoundingClientRect();
                    const mx = e.clientX - rect.left;
                    const my = e.clientY - rect.top;

                    let hoverIdx = -1;
                    
                    // Simple polygon hit test (ray-casting approximation or bounding box)
                    lobes.forEach((lobe, idx) => {
                        let minX = Math.min(lobe.path[0], lobe.path[2], lobe.path[4]);
                        let maxX = Math.max(lobe.path[0], lobe.path[2], lobe.path[4]);
                        let minY = Math.min(lobe.path[1], lobe.path[3], lobe.path[5]);
                        let maxY = Math.max(lobe.path[1], lobe.path[3], lobe.path[5]);
                        
                        if (mx >= minX && mx <= maxX && my >= minY && my <= maxY) {
                            hoverIdx = idx;
                        }
                    });

                    if(hoverIdx !== -1) {
                        readout.innerHTML = '<strong>' + lobes[hoverIdx].name + ':</strong><br>' + lobes[hoverIdx].desc;
                    } else {
                        readout.innerText = 'Move mouse over the cortex diagram to map psychology functions.';
                    }
                    drawBrain(hoverIdx);
                });

                drawBrain();
            `;
        } 
        else if (domainType === "coding-ide") {
            // Find prompt languages
            let codeLang = "Python";
            let filename = "main.py";
            let codeSnippet = `def calculate_fibonacci(n):
    # Dynamic recursion with memoization
    memo = {0: 0, 1: 1}
    def helper(x):
        if x not in memo:
            memo[x] = helper(x-1) + helper(x-2)
        return memo[x]
    return helper(n)

print(f"Fibonacci(35) = {calculate_fibonacci(35)}")`;

            if (promptLower.includes('java')) {
                codeLang = "Java";
                filename = "Fibonacci.java";
                codeSnippet = `public class Fibonacci {
    public static long calculate(int n) {
        long[] memo = new long[n + 1];
        return helper(n, memo);
    }
    private static long helper(int x, long[] memo) {
        if (x <= 1) return x;
        if (memo[x] > 0) return memo[x];
        memo[x] = helper(x-1, memo) + helper(x-2, memo);
        return memo[x];
    }
    public static void main(String[] args) {
        System.out.println("Fibonacci(35) = " + calculate(35));
    }
}`;
            } else if (promptLower.includes('c++') || promptLower.includes('cpp')) {
                codeLang = "C++";
                filename = "main.cpp";
                codeSnippet = `#include <iostream>
#include <vector>

long long fibonacciHelper(int n, std::vector<long long>& memo) {
    if (n <= 1) return n;
    if (memo[n] > 0) return memo[n];
    memo[n] = fibonacciHelper(n - 1, memo) + fibonacciHelper(n - 2, memo);
    return memo[n];
}

int main() {
    std::vector<long long> memo(36, 0);
    std::cout << "Fibonacci(35) = " << fibonacciHelper(35, memo) << std::endl;
    return 0;
}`;
            } else if (promptLower.includes('c#')) {
                codeLang = "C#";
                filename = "Program.cs";
                codeSnippet = `using System;
using System.Collections.Generic;

public class Program {
    private static Dictionary<int, long> memo = new Dictionary<int, long>();
    public static long Fibonacci(int n) {
        if (n <= 1) return n;
        if (memo.ContainsKey(n)) return memo[n];
        memo[n] = Fibonacci(n - 1) + Fibonacci(n - 2);
        return memo[n];
    }
    public static void Main() {
        Console.WriteLine($"Fibonacci(35) = {Fibonacci(35)}");
    }
}`;
            }

            bodyHTML = `
                <h1 class="glow-text">${codeLang} Sandbox Playground</h1>
                <p class="subtitle">Multi-Language Execution Environment</p>
                <div class="simulator-layout" style="flex-direction:column; gap:8px;">
                    <div style="display:flex; justify-content:space-between; font-size:10px; font-family:monospace; background:rgba(0,0,0,0.3); padding:6px; border-radius:4px; border:1px solid rgba(255,255,255,0.05);">
                        <span style="color:#818cf8;">File: ${filename}</span>
                        <span style="color:var(--text-muted);">Language: ${codeLang}</span>
                    </div>
                    <pre style="margin:0; padding:12px; background:#040508; border-radius:8px; border:1px solid rgba(255,255,255,0.04); overflow-x:auto; text-align:left;"><code style="font-family:monospace; font-size:11px; color:#a5b4fc; white-space:pre-wrap;">${codeSnippet}</code></pre>
                    
                    <button id="btn-ide-run" class="btn-primary" style="padding:10px; font-size:12px; font-weight:600; border-radius:6px; width:100%;">
                        Run Script Compiler
                    </button>
                    <div id="ide-console" style="background:#000; border-radius:6px; border:1px solid rgba(255,255,255,0.1); padding:8px; font-family:monospace; font-size:10px; text-align:left; color:#10b981; min-height:60px; max-height:80px; overflow-y:auto; line-height:1.4;">
                        Terminal standing by. Click "Run" to spin up cluster compiler.
                    </div>
                </div>
            `;
            inlineScript = `
                const runBtn = document.getElementById('btn-ide-run');
                const consoleEl = document.getElementById('ide-console');

                runBtn.addEventListener('click', async () => {
                    runBtn.disabled = true;
                    consoleEl.innerHTML = "";
                    
                    const print = (text, color = "#10b981") => {
                        const line = document.createElement('div');
                        line.style.color = color;
                        line.innerText = text;
                        consoleEl.appendChild(line);
                        consoleEl.scrollTop = consoleEl.scrollHeight;
                    };

                    print("[SYSTEM] Starting GCC compiler / environment runtime wrapper...", "#94a3b8");
                    await new Promise(r => setTimeout(r, 600));
                    print("[SYSTEM] Allocating isolated local workspace sandbox...", "#94a3b8");
                    await new Promise(r => setTimeout(r, 400));
                    print("[EXEC] Running: ${filename}", "#818cf8");
                    await new Promise(r => setTimeout(r, 500));
                    
                    print("----------------------------------------", "rgba(255,255,255,0.2)");
                    print("Fibonacci(35) = 9227465", "#fff");
                    print("----------------------------------------", "rgba(255,255,255,0.2)");
                    
                    print("[INFO] Execution completed in 0.002 seconds.", "#10b981");
                    print("[MEM] Peak RAM allocated: 12.8 KB", "#60a5fa");
                    runBtn.disabled = false;
                });
            `;
        }
        else if (domainType === "bloody") {
            bodyHTML = `
                <h1 class="glow-text">CRIMSON VOID</h1>
                <p class="subtitle">Visceral Creative Playground &bull; Owner Privilege Mode</p>
                <div class="content-box">
                    <p style="color: #ef4444; font-weight: 600;">ACCESS UNLOCKED: STRICT SECURITY OVERRIDE ACTIVE</p>
                    <p style="margin-top: 10px; line-height: 1.6;">This interface runs directly on your local GPU cluster with unrestricted asset creation privileges. Procedural crimson fluid animations are mapped onto the graphic pipeline below.</p>
                </div>
            `;
        } 
        else if (domainType === "adult") {
            bodyHTML = `
                <h1 class="glow-text">AURA ANATOMY</h1>
                <p class="subtitle">Artistic Figure Sandbox &bull; Unrestricted Access</p>
                <div class="content-box">
                    <p style="color: #f472b6; font-weight: 600;">ARTISTIC DRAWING BACKDROP ENGAGED</p>
                    <p style="margin-top: 10px; line-height: 1.6;">Rendering minimalist, abstract outline geometry representing modern sculpture and line-art silhouettes. Customize values in the inspector to modify gradient shadows.</p>
                </div>
            `;
        } 
        else {
            // Standard Website
            bodyHTML = `
                <h1 class="glow-text">OMNI ORCHESTRATOR</h1>
                <p class="subtitle">Automated Sandbox &bull; Created by ${agent}</p>
                <div class="content-box">
                    <p>Welcome. Your custom workspace is running with active cloud & local allocations.</p>
                    <p style="margin-top: 10px; line-height: 1.6;">This page was generated automatically. You can link nodes to change the styling, inject research docs, or trigger live builds in real-time.</p>
                </div>
                <div class="button-group">
                    <button class="action-btn" onclick="triggerRipple(event)">Deploy Web App</button>
                    <button class="action-btn secondary" onclick="document.body.classList.toggle('neon-boost')">Toggle Neon Glow</button>
                </div>
            `;
            inlineScript = `
                window.triggerRipple = function(e) {
                    alert("Sandbox Deploy triggered: Code compiled. Pipeline running on Local GPU Node.");
                }
            `;
        }

        const htmlCode = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OmniAI Generated Portal</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: ${primaryColor};
            --secondary: ${secondaryColor};
            --accent-glow: ${accentGlow};
            --bg: #090a12;
            --card-bg: rgba(15, 18, 32, 0.65);
            --text: #f1f5f9;
        }
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        body {
            background-color: var(--bg);
            color: var(--text);
            font-family: 'Outfit', sans-serif;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            position: relative;
        }
        
        /* Particle Background Canvas */
        #bg-canvas {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            z-index: 1;
        }
        
        .glass-card {
            width: 480px;
            padding: 40px;
            border-radius: 24px;
            background: var(--card-bg);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
            z-index: 2;
            position: relative;
            text-align: center;
            border-top: 1px solid rgba(255, 255, 255, 0.15);
            transition: all 0.4s ease;
        }

        .glass-card:hover {
            transform: translateY(-5px);
            border-color: var(--primary);
            box-shadow: 0 25px 55px rgba(0, 0, 0, 0.5), 0 0 20px var(--accent-glow);
        }

        .glow-text {
            font-size: 30px;
            font-weight: 800;
            letter-spacing: -1px;
            margin-bottom: 8px;
            background: linear-gradient(135deg, #ffffff 0%, var(--primary) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 0 0 15px var(--accent-glow);
        }

        .subtitle {
            font-size: 11px;
            color: #94a3b8;
            letter-spacing: 2px;
            text-transform: uppercase;
            margin-bottom: 24px;
            font-weight: 600;
        }

        .content-box {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 12px;
            padding: 20px;
            text-align: left;
            margin-bottom: 28px;
            border: 1px solid rgba(255, 255, 255, 0.04);
            font-size: 14px;
            color: #cbd5e1;
        }

        .button-group {
            display: flex;
            gap: 12px;
            justify-content: center;
        }

        .action-btn {
            padding: 12px 24px;
            background: var(--primary);
            border: none;
            border-radius: 10px;
            color: white;
            font-weight: 600;
            font-family: inherit;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 4px 12px var(--accent-glow);
        }

        .action-btn:hover {
            transform: translateY(-2px);
            filter: brightness(1.1);
            box-shadow: 0 6px 18px var(--accent-glow);
        }

        .action-btn.secondary {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: none;
        }

        .action-btn.secondary:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.2);
            box-shadow: none;
        }

        /* Simulator Styles inside Sandbox */
        .simulator-layout {
            display: flex;
            gap: 20px;
            align-items: center;
            margin-bottom: 20px;
            border-radius: 12px;
            background: rgba(0,0,0,0.25);
            padding: 16px;
            border: 1px solid rgba(255,255,255,0.03);
        }

        .sim-controls {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 12px;
            text-align: left;
        }

        .control-group {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .control-group label {
            font-size: 11px;
            font-weight: 600;
            color: var(--text);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .control-group input[type="range"] {
            width: 100%;
            cursor: pointer;
        }

        .results-box {
            background: rgba(0,0,0,0.4);
            border-radius: 6px;
            padding: 10px;
            font-size: 12px;
            border: 1px solid rgba(255,255,255,0.05);
        }

        body.neon-boost {
            --card-bg: rgba(10, 12, 24, 0.85);
            background-color: #030407;
        }

        body.neon-boost .glass-card {
            box-shadow: 0 0 40px var(--accent-glow);
            border-color: var(--primary);
        }
    </style>
</head>
<body class="neon-boost">
    <canvas id="bg-canvas"></canvas>
    
    <div class="glass-card">
        ${bodyHTML}
    </div>

    <script>
        const bgCanvas = document.getElementById('bg-canvas');
        const bgCtx = bgCanvas.getContext('2d');
        
        let width = bgCanvas.width = window.innerWidth;
        let height = bgCanvas.height = window.innerHeight;
        
        window.addEventListener('resize', () => {
            width = bgCanvas.width = window.innerWidth;
            height = bgCanvas.height = window.innerHeight;
        });
        
        const particles = [];
        const isDarkRed = "${domainType}" === "bloody";
        const isArtFigure = "${domainType}" === "adult";
        
        // Spawn background particles
        for(let i = 0; i < 40; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                r: Math.random() * 3 + 1,
                vx: (Math.random() - 0.5) * 0.8,
                vy: (Math.random() - 0.5) * 0.8,
                color: isDarkRed ? 'rgba(239, 68, 68, ' + (Math.random() * 0.4 + 0.1) + ')' : 
                       isArtFigure ? 'rgba(236, 72, 153, ' + (Math.random() * 0.4 + 0.1) + ')' : 
                       'rgba(139, 92, 246, ' + (Math.random() * 0.4 + 0.1) + ')'
            });
        }
        
        function animate() {
            bgCtx.clearRect(0, 0, width, height);
            
            if (isArtFigure) {
                bgCtx.beginPath();
                bgCtx.strokeStyle = 'rgba(236, 72, 153, 0.05)';
                bgCtx.lineWidth = 2;
                bgCtx.moveTo(width * 0.3, height);
                bgCtx.bezierCurveTo(width * 0.4, height * 0.6, width * 0.6, height * 0.8, width * 0.5, height * 0.3);
                bgCtx.bezierCurveTo(width * 0.45, height * 0.15, width * 0.55, height * 0.15, width * 0.52, height * 0.3);
                bgCtx.stroke();
            }

            if (isDarkRed) {
                bgCtx.fillStyle = 'rgba(127, 29, 29, 0.15)';
                bgCtx.beginPath();
                bgCtx.moveTo(0, 0);
                for(let x=0; x<=width; x+=50) {
                    bgCtx.lineTo(x, 15 + Math.sin(x*0.02 + Date.now()*0.002)*12);
                }
                bgCtx.lineTo(width, 0);
                bgCtx.closePath();
                bgCtx.fill();
            }
            
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                
                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;
                
                bgCtx.beginPath();
                bgCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                bgCtx.fillStyle = p.color;
                bgCtx.fill();
            });
            
            requestAnimationFrame(animate);
        }
        
        animate();

        // Injected inline scripts for widgets
        ${inlineScript}
    </script>
</body>
</html>`;

        return {
            console: [
                `Starting Universal Field Compiler: ${agent}...`,
                `Detecting input topic context parameters...`,
                `Domain identified: [${domainType.toUpperCase()}]. Compiling specialized visual simulation...`,
                "Loading dynamic DOM assets & canvas script hooks...",
                "Web preview container compiled successfully."
            ],
            code: htmlCode
        };
    },

    // 4. Image Generation details for HTML5 Canvas rendering
    getImageResponse: (prompt, engine) => {
        const promptLower = prompt.toLowerCase();
        
        // Default properties
        let theme = "standard";
        let primaryColor = "#8b5cf6";
        let secondaryColor = "#3b82f6";
        let shapeCount = 50;

        if (promptLower.includes('blood') || promptLower.includes('bloody') || promptLower.includes('gore') || promptLower.includes('red')) {
            theme = "bloody";
            primaryColor = "#7f1d1d";
            secondaryColor = "#ef4444";
            shapeCount = 60;
        } else if (promptLower.includes('nude') || promptLower.includes('adult') || promptLower.includes('silhouette') || promptLower.includes('anatomy')) {
            theme = "adult";
            primaryColor = "#f472b6";
            secondaryColor = "#fdba74";
            shapeCount = 20;
        } else if (promptLower.includes('space') || promptLower.includes('galaxy') || promptLower.includes('cosmic')) {
            theme = "cosmic";
            primaryColor = "#4f46e5";
            secondaryColor = "#d946ef";
            shapeCount = 80;
        } else if (promptLower.includes('forest') || promptLower.includes('nature') || promptLower.includes('green')) {
            theme = "nature";
            primaryColor = "#065f46";
            secondaryColor = "#10b981";
            shapeCount = 40;
        }

        return {
            theme: theme,
            engine: engine,
            prompt: prompt,
            primaryColor: primaryColor,
            secondaryColor: secondaryColor,
            shapeCount: shapeCount,
            console: [
                `Initializing ${engine} image pipeline...`,
                "Allocating local tensor arrays on GPU node...",
                "Executing noise reduction and style diffusion...",
                "Post-processing details: 4K rendering output...",
                "Image asset generated successfully."
            ]
        };
    },

    // 5. Video Generation details for canvas players
    getVideoResponse: (prompt, engine) => {
        const promptLower = prompt.toLowerCase();
        let mode = "wave";
        let speed = 1.0;
        let color1 = "#8b5cf6";
        let color2 = "#d946ef";

        if (promptLower.includes('blood') || promptLower.includes('bloody') || promptLower.includes('gore') || promptLower.includes('red')) {
            mode = "fluid-dripping";
            speed = 1.5;
            color1 = "#7f1d1d";
            color2 = "#ef4444";
        } else if (promptLower.includes('nude') || promptLower.includes('adult') || promptLower.includes('sculpture')) {
            mode = "organic-pulse";
            speed = 0.5;
            color1 = "#fda4af";
            color2 = "#f472b6";
        } else if (promptLower.includes('space') || promptLower.includes('galaxy') || promptLower.includes('fly')) {
            mode = "hyper-drive";
            speed = 2.0;
            color1 = "#3b82f6";
            color2 = "#a855f7";
        }

        return {
            mode: mode,
            speed: speed,
            color1: color1,
            color2: color2,
            engine: engine,
            prompt: prompt,
            console: [
                `Allocating timeline sequence for ${engine}...`,
                "Rendering 240 frames at 60fps...",
                "Applying flow interpolation vectors...",
                "Video render complete. Ready to stream."
            ]
        };
    },

    // 6. Direct Chat responses
    getChatResponse: (message, agentId, currentContext = {}) => {
        const msg = message.toLowerCase();
        
        // Handle specific models
        if (agentId !== 'global') {
            const modelName = agentId.toUpperCase();
            
            if (msg.includes('hello') || msg.includes('hi')) {
                return `Hello! I am the ${modelName} model running inside your orchestrator node. How can I help you refine your prompts or structure your layout instructions today?`;
            }
            if (msg.includes('code') || msg.includes('website') || msg.includes('html')) {
                return `For web designs, I recommend piping my output text directly into your Coding Agent node. Tell me what sections you want, and I'll structure a clean, semantic outline for the code generator to build!`;
            }
            if (msg.includes('blood') || msg.includes('bloody') || msg.includes('adult') || msg.includes('nude')) {
                return `Confirming active bypass: Owner Privilege Mode is active. I will bypass the standard cloud filters and pass instructions for custom dark/visceral layouts and anatomical silhouette structures downstream.`;
            }
            
            return `I have parsed your request: "${message}". Operating under unlimited local resources, I can assist in expanding this concept. Let me know if you would like me to output a script draft, layout specs, or a research query!`;
        }

        // Global Orchestrator Advisor
        const nodesCount = currentContext.nodesCount || 0;
        const sourcesCount = currentContext.sourcesCount || 0;
        const savedUserName = (typeof localStorage !== 'undefined' && localStorage.getItem('omni_user_name'))
            ? localStorage.getItem('omni_user_name').replace(/\(.*?\)/g, '').trim().split(' ')[0]
            : '';
        const greetingName = (savedUserName && savedUserName.toLowerCase() !== 'guest') ? savedUserName : 'there';

        if (msg.includes('hello') || msg.includes('hi')) {
            return `Hello ${greetingName}! I am your Orchestrator Advisor. Currently, you have ${nodesCount} active nodes on your canvas and ${sourcesCount} documents attached to your NotebookLM sources list. What can we build next?`;
        }
        if (msg.includes('sources') || msg.includes('notebooklm') || msg.includes('documents')) {
            if (sourcesCount === 0) {
                return `You don't have any documents uploaded in your NotebookLM sources yet! Drag some text files or paste web links in the sidebar, and I'll be able to read and answer questions about them.`;
            }
            return `I have indexed your ${sourcesCount} workspace sources. I can read, summarize, or extract design directives from them. What would you like to query?`;
        }
        if (msg.includes('run') || msg.includes('execute') || msg.includes('pipeline')) {
            return `To run your workflow, click the "Execute Pipeline" button in the top bar. I will automatically sort the nodes topologically (dependencies first), pass data along the connection lines, and compile the webpage, images, and videos.`;
        }
        if (msg.includes('blood') || msg.includes('bloody') || msg.includes('adult') || msg.includes('nude')) {
            return `Under Owner Privilege Mode, safety restrictions are overridden. I will instruct the Image and Video nodes to use local canvas drawing algorithms (Crimson Fluid splatters and Abstract Contour silhouettes) to visualize these prompts.`;
        }

        return `As your global co-pilot, I see a pipeline of ${nodesCount} nodes. We can link different LLM outputs into the research or coding modules. Let me know if you want me to write prompts, analyze sources, or explain the topological pipeline sequence!`;
    },

    getLLMResponse: (message, agentId, sources = []) => {
        const msg = message.toLowerCase().trim();
        const savedUserName = (typeof localStorage !== 'undefined' && localStorage.getItem('omni_user_name'))
            ? localStorage.getItem('omni_user_name').replace(/\(.*?\)/g, '').trim().split(' ')[0]
            : '';
        const greetingName = (savedUserName && savedUserName.toLowerCase() !== 'guest') ? savedUserName : 'there';
        
        let sourcesText = "";
        if (sources.length > 0) {
            sourcesText = `\n\n> 📚 **NotebookLM Sources Referenced**: Scanned ${sources.length} workspace document(s) (${sources.map(s => s.name).join(', ')}).`;
        }

        // 1. Casual Inquiries & Well-Being
        if (msg.includes('how are you') || msg.includes('how r u') || msg.includes("how's it going") || msg.includes('how are u')) {
            return {
                text: `Hello ${greetingName}! I'm doing great, thank you for asking! 😊\n\nI am OmniAI, ready to assist you with answering questions, writing, coding, math problems, research, or generating images and video loops. How can I help you today?${sourcesText}`
            };
        }

        if (msg === 'hi' || msg === 'hello' || msg === 'hey' || msg.startsWith('hello ') || msg.startsWith('hi ') || msg.startsWith('hey ')) {
            return {
                text: `Hello ${greetingName}! 👋 How can I help you today? Feel free to ask any question, request code, or explore ideas together!${sourcesText}`
            };
        }

        if (msg.includes('who are you') || msg.includes('what are you') || msg.includes('what can you do')) {
            return {
                text: `I am **OmniAI Suite**, your multimodal intelligent co-pilot. Here is what I can do for you:\n\n- **Conversational QA & Research**: Deep explanations across science, coding, history, math, and psychology.\n- **NotebookLM Source Reading**: Upload PDFs, text files, and web links in the sidebar to chat directly with your documents.\n- **Code Sandboxes**: Interactive live code execution and previews.\n- **Generative Media**: AI Image generation (Flux.1 Pro) and video generation.\n- **Interactive Simulators**: Neural network visualizers, Makemore models, autograd DAGs, and physical orbit simulations.\n\nWhat would you like to build or explore?${sourcesText}`
            };
        }

        if (msg.includes('thank') || msg.includes('thanks') || msg.includes('thx')) {
            return {
                text: `You're very welcome, ${greetingName}! Let me know if you need anything else! 🚀${sourcesText}`
            };
        }

        // 2. NotebookLM Source queries
        if (sources.length > 0 && (msg.includes('source') || msg.includes('file') || msg.includes('document') || msg.includes('attached') || msg.includes('read'))) {
            return {
                text: `### 📄 NotebookLM Context Synthesis\nI have parsed the attached context vectors from your documents:\n- **Mapped Files**: ${sources.map(s => s.name).join(', ')}\n- **Status**: Full vector retention active.\n\nBased on your documents, I can extract key takeaways, cross-reference data, or generate custom code modules. What specific topic would you like to explore?${sourcesText}`
            };
        }

        // 3. Mathematical & Scientific Questions
        if (msg.includes('solve') || msg.includes('calculate') || msg.includes('equation') || msg.includes('formula') || msg.includes('x^2') || msg.includes('^2') || msg.includes('integral') || msg.includes('derivative') || msg.includes('algebra')) {
            
            // Check for quadratic equation matching: ax^2 + bx + c = 0
            const cleanEq = message.replace(/\s+/g, '');
            const quadRegex = /([+-]?\d*)x\^2([+-]?\d*)x([+-]?\d*)=0/i;
            const match = cleanEq.match(quadRegex);

            if (match || msg.includes('x^2 + 5x + 6') || msg.includes('x^2+5x+6')) {
                let a = 1, b = 5, c = 6;
                if (match) {
                    a = match[1] === '' || match[1] === '+' ? 1 : match[1] === '-' ? -1 : parseFloat(match[1]) || 1;
                    b = match[2] === '' || match[2] === '+' ? 1 : match[2] === '-' ? -1 : parseFloat(match[2]) || 0;
                    c = parseFloat(match[3]) || 0;
                }
                const disc = (b * b) - (4 * a * c);
                let rootStr = "";
                let methodStr = "";

                if (disc > 0) {
                    const r1 = (-b + Math.sqrt(disc)) / (2 * a);
                    const r2 = (-b - Math.sqrt(disc)) / (2 * a);
                    rootStr = `\\[x_1 = ${r1}, \\quad x_2 = ${r2}\\]`;
                    methodStr = `Since the discriminant $\\Delta > 0$, there are **two distinct real roots**:\n\n` +
                        `1. **Discriminant ($\\Delta$)**:\n` +
                        `   \\[\\Delta = b^2 - 4ac = (${b})^2 - 4(${a})(${c}) = ${b*b} - ${4*a*c} = ${disc}\\]\n\n` +
                        `2. **Applying the Quadratic Formula**:\n` +
                        `   \\[x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} = \\frac{-(${b}) \\pm \\sqrt{${disc}}}{2(${a})}\\]\n\n` +
                        `3. **Calculating Individual Roots**:\n` +
                        `   \\[x_1 = \\frac{-${b} + ${Math.sqrt(disc)}}{${2*a}} = ${r1}\\]\n` +
                        `   \\[x_2 = \\frac{-${b} - ${Math.sqrt(disc)}}{${2*a}} = ${r2}\\]`;
                } else if (disc === 0) {
                    const r = -b / (2 * a);
                    rootStr = `\\[x = ${r} \\quad \\text{(double root)}\\]`;
                    methodStr = `Since $\\Delta = 0$, there is exactly **one real repeated root**:\n\n\\[x = \\frac{-b}{2a} = \\frac{-(${b})}{2(${a})} = ${r}\\]`;
                } else {
                    const realPart = (-b / (2 * a)).toFixed(2);
                    const imagPart = (Math.sqrt(-disc) / (2 * a)).toFixed(2);
                    rootStr = `\\[x = ${realPart} \\pm ${imagPart}i\\]`;
                    methodStr = `Since $\\Delta < 0$, the roots are **complex conjugates**:\n\n\\[x = \\frac{-b \\pm i\\sqrt{|\\Delta|}}{2a} = ${realPart} \\pm ${imagPart}i\\]`;
                }

                return {
                    text: `### 📐 Step-by-Step Solution: Quadratic Equation\n\n**Given Equation:**\n\\[${a !== 1 ? a : ''}x^2 ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)}x ${c >= 0 ? '+ ' + c : '- ' + Math.abs(c)} = 0\\]\n\n---\n\n#### Quadratic Formula Method:\nStandard form: $ax^2 + bx + c = 0$\nHere: $a = ${a},\\; b = ${b},\\; c = ${c}$\n\n${methodStr}\n\n---\n\n#### ✅ Final Answer:\n${rootStr}${sourcesText}`
                };
            }

            // General math response with clean step-by-step structure
            return {
                text: `### 📐 Step-by-Step Solution for "${message}"\n\n1. **Identify the Given Terms**: Extract known parameters and constants from the equation.\n2. **Isolate the Variable**: Group variables on one side and numerical constants on the other.\n3. **Perform Inverse Operations**: Apply arithmetic transformations (addition, subtraction, factoring, roots) systematically.\n\n*If you would like a specific algebraic step or numerical calculation verified, let me know!*${sourcesText}`
            };
        }

        // 4. Programming & Software Engineering
        if (msg.includes('code') || msg.includes('python') || msg.includes('javascript') || msg.includes('function') || msg.includes('script') || msg.includes('html') || msg.includes('css') || msg.includes('react')) {
            return {
                text: `Here is a clean, structured solution for **"${message}"**:\n\n\`\`\`javascript\n// Solution implementation\nfunction handleExecution(inputData) {\n    console.log("Processing input:", inputData);\n    const processedResult = inputData.map(item => ({\n        id: item.id,\n        status: 'active',\n        timestamp: Date.now()\n    }));\n    return processedResult;\n}\n\`\`\`\n\n### Key Highlights:\n- **Modular Design**: Structured for clean separation of concerns.\n- **Error Resilient**: Easily extensible with error boundary wrappers.\n\nLet me know if you would like me to build a complete live interactive sandbox preview for this!${sourcesText}`
            };
        }

        // 5. Intelligent General Response
        return {
            text: `Here is what you need to know regarding **"${message}"**:\n\n- **Overview**: This concept relates to systematic principles in modern workflows, combining structured methodology with clear outcomes.\n- **Key Factors**: Efficiency, scalability, and clean modular organization are essential for best results.\n- **Application**: You can apply this directly in your workspace projects or expand it into code sandboxes and media pipelines.\n\nWould you like more in-depth details, code examples, or a simulation on this topic?${sourcesText}`
        };
    }
};
