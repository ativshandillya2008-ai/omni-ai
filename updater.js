/* ==========================================================================
   OmniAI Orchestrator: Auto-Evolution & Self-Optimization Module
   ========================================================================== */

const AutoUpdater = {
    logs: [
        "03:00 AM - Cron job triggered: Checking module updates...",
        "03:02 AM - Updated Llama local models to latest build (v3.1.26)",
        "03:15 AM - Automated style audit: Adjusted backdrop filter opacity for better readability",
        "03:30 AM - Cleaned temp sandbox build cache (saved 4.2 GB VRAM)",
        "03:45 AM - Patched Bezier connection vector coordinate system",
        "04:00 AM - Self-diagnostics: GPU cluster temperature stable at 62°C",
        "04:10 AM - Synchronized NotebookLM source indexing weights"
    ],
    
    init() {
        this.renderUpdaterPanel();
        this.startMockDailyTimer();
    },

    renderUpdaterPanel() {
        const sidebarContent = document.querySelector('.sidebar-content');
        if (!sidebarContent) return;

        // Insert Auto-Evolution Hub section before credentials
        const section = document.createElement('section');
        section.className = 'sidebar-section';
        section.id = 'auto-evolution-section';
        const isOwner = localStorage.getItem('omni_is_owner') === 'true';
        section.style.display = isOwner ? 'block' : 'none';
        section.innerHTML = `
            <div class="section-title">Auto-Evolution Hub</div>
            <p class="section-desc">Self-optimizing node engine. Updates modules and patches layouts daily.</p>
            <div class="updater-panel glass-panel" style="padding: 12px; border-radius: 10px; background: rgba(0,0,0,0.25); display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; justify-content: space-between; font-size: 11px;">
                    <span style="color: var(--text-secondary);">System Health:</span>
                    <span style="color: var(--color-success); font-weight: 600;">OPTIMAL</span>
                </div>
                <div style="height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden;">
                    <div style="width: 94%; height: 100%; background: linear-gradient(90deg, var(--color-llm), var(--color-coding)); border-radius: 3px;"></div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px; font-size: 10px; font-family: var(--font-mono); color: var(--text-muted); max-height: 80px; overflow-y: auto; padding-right: 4px;" id="updater-log-ticker">
                    <!-- Logs populated here -->
                </div>
                <button id="btn-trigger-evolve" class="btn-primary" style="padding: 8px 12px; font-size: 11px; font-weight: 600; border-radius: 6px;">
                    Evolve Node Codebase
                </button>
            </div>
        `;

        const credentialsSection = document.getElementById('credentials-title') ? document.getElementById('credentials-title').closest('.sidebar-section') : null;
        if (credentialsSection) {
            sidebarContent.insertBefore(section, credentialsSection);
        } else {
            sidebarContent.appendChild(section);
        }

        // Populate log lines
        const ticker = document.getElementById('updater-log-ticker');
        this.logs.forEach(log => {
            const line = document.createElement('div');
            line.innerText = log;
            ticker.appendChild(line);
        });
        ticker.scrollTop = ticker.scrollHeight;

        // Bind evolve button action
        document.getElementById('btn-trigger-evolve').addEventListener('click', () => {
            this.runSelfUpgrade();
        });
    },

    startMockDailyTimer() {
        // Log a new line every 40 seconds to represent live cron tasks
        setInterval(() => {
            const ticker = document.getElementById('updater-log-ticker');
            if (!ticker) return;

            const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
            const events = [
                "Checked model repository... no new updates found.",
                "Optimized canvas Bezier rendering paths (VRAM load reduced by 0.5%).",
                "Self-audit: Cleaned dead references from sandbox connections.",
                "Refined prompt weights for multi-turn conversational agents.",
                "Regulated GPU clusters fan speed. Core temp at 59°C."
            ];
            
            const randomEvent = events[Math.floor(Math.random() * events.length)];
            const line = document.createElement('div');
            line.innerText = `${time} - ${randomEvent}`;
            ticker.appendChild(line);
            ticker.scrollTop = ticker.scrollHeight;
        }, 40000);
    },

    async runSelfUpgrade() {
        const btn = document.getElementById('btn-trigger-evolve');
        const ticker = document.getElementById('updater-log-ticker');
        if (!btn || !ticker) return;

        btn.disabled = true;
        btn.innerText = "Patching Systems...";
        appState.logTerminal("[UPDATER] Initiating manual evolution cycle...", "warning-line");

        const steps = [
            "Scanning app.js, style.css, nodes.js for styling audits...",
            "Analyzing pipeline topological performance bottlenecks...",
            "Self-Correction: Enhancing button ripple response latency...",
            "Applying hot-fix patch: Shifting interface glow indices...",
            "Rebuilding compiler templates in mockData.js..."
        ];

        for (const step of steps) {
            const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
            const line = document.createElement('div');
            line.style.color = 'var(--color-coding)';
            line.innerText = `${time} - [PATCH] ${step}`;
            ticker.appendChild(line);
            ticker.scrollTop = ticker.scrollHeight;
            appState.logTerminal(`[UPDATER] ${step}`, "system-line");
            await new Promise(resolve => setTimeout(resolve, 600));
        }

        // Dynamically inject updated styling to show active self-modification!
        if (!document.getElementById('evolved-styles-css')) {
            const evolvedStyle = document.createElement('style');
            evolvedStyle.id = 'evolved-styles-css';
            evolvedStyle.innerHTML = `
                :root {
                    --color-llm: #a855f7;      /* Shunted purple to deep violet */
                    --border-glow: rgba(168, 85, 247, 0.35);
                    --bg-glass: rgba(10, 14, 26, 0.75);
                }
                .glass-panel {
                    border-color: rgba(255,255,255,0.08);
                    box-shadow: 0 16px 50px -8px rgba(0,0,0,0.6);
                }
                .btn-run {
                    filter: saturate(1.2);
                }
            `;
            document.head.appendChild(evolvedStyle);
            appState.logTerminal("[UPDATER] Hot-patch applied. Visual theme variables optimized.", "success-line");
        } else {
            appState.logTerminal("[UPDATER] Codebase already running at maximum optimization levels.", "info-line");
        }

        btn.disabled = false;
        btn.innerText = "System Up-To-Date";
        btn.style.background = 'var(--color-success)';
    }
};

// Initialize updater
document.addEventListener('DOMContentLoaded', () => {
    // delay initialization briefly to ensure main state has loaded
    setTimeout(() => AutoUpdater.init(), 100);
});
