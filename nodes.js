/* ==========================================================================
   OmniAI Orchestrator: Specialized Modules (Nodes)
   ========================================================================== */

class BaseNode {
    constructor(id, type, x, y) {
        this.id = id;
        this.type = type;
        this.x = x;
        this.y = y;
        this.inputs = [];
        this.outputs = [];
        this.params = {};
        this.status = 'idle';
        this.element = null;
        this.outputData = null;
    }

    render(container) {
        const card = document.createElement('div');
        card.id = `node-${this.id}`;
        card.className = `node-card`;
        card.setAttribute('data-type', this.type);
        card.style.left = `${this.x}px`;
        card.style.top = `${this.y}px`;

        const colorMap = {
            llm: 'var(--color-llm)',
            research: 'var(--color-research)',
            coding: 'var(--color-coding)',
            image: 'var(--color-image)',
            video: 'var(--color-video)'
        };
        card.style.setProperty('--node-color', colorMap[this.type]);
        card.style.setProperty('--node-glow', colorMap[this.type] + '40'); // 40 is hex opacity

        const headerHtml = `
            <div class="node-header">
                <div class="node-title-group">
                    <span class="node-title-dot"></span>
                    <h4>${this.getDisplayName()}</h4>
                </div>
                <button class="node-delete-btn" onclick="appState.deleteNode('${this.id}')">&times;</button>
            </div>
        `;

        const bodyHtml = `
            <div class="node-body">
                <div class="node-meta-info" id="node-meta-${this.id}">${this.getMetaText()}</div>
                <div class="node-summary" id="node-summary-${this.id}">Configure in Inspector</div>
                <div id="node-preview-area-${this.id}" style="margin-top: 10px; display: none;"></div>
            </div>
        `;

        // Render input/output ports
        let portsHtml = '<div class="node-ports">';
        if (this.hasInput()) {
            portsHtml += `
                <div class="port-input-wrapper">
                    <div class="port port-in" id="port-in-${this.id}" data-node-id="${this.id}" data-port-type="in"></div>
                    <span class="port-label">In</span>
                </div>
            `;
        } else {
            portsHtml += '<div></div>'; // space saver
        }
        
        if (this.hasOutput()) {
            portsHtml += `
                <div class="port-output-wrapper">
                    <span class="port-label">Out</span>
                    <div class="port port-out" id="port-out-${this.id}" data-node-id="${this.id}" data-port-type="out"></div>
                </div>
            `;
        } else {
            portsHtml += '<div></div>';
        }
        portsHtml += '</div>';

        card.innerHTML = headerHtml + bodyHtml + portsHtml;
        container.appendChild(card);
        this.element = card;
        
        this.bindEvents();
        return card;
    }

    bindEvents() {
        // Double click to open inspector
        this.element.addEventListener('dblclick', (e) => {
            if (e.target.closest('.node-delete-btn') || e.target.closest('.port')) return;
            appState.selectNode(this);
        });

        // Click to select
        this.element.addEventListener('mousedown', (e) => {
            if (e.target.closest('.node-delete-btn') || e.target.closest('.port')) return;
            appState.selectNode(this);
        });
    }

    setStatus(status) {
        this.status = status;
        if (!this.element) return;
        
        this.element.classList.remove('idle', 'executing', 'success', 'error');
        this.element.classList.add(status);
        
        // update top actions bar status badge if this node runs in pipeline
        if (status === 'executing') {
            this.element.classList.add('executing');
        } else {
            this.element.classList.remove('executing');
        }
    }

    updateSummary(text) {
        const el = document.getElementById(`node-summary-${this.id}`);
        if (el) {
            el.innerText = text;
            el.title = text;
        }
    }

    getConnectedInputs() {
        // Return active input data from connected parent nodes
        const parentNodeIds = appState.getParentNodeIds(this.id);
        const inputs = [];
        parentNodeIds.forEach(pId => {
            const pNode = appState.nodes.find(n => n.id === pId);
            if (pNode && pNode.outputData) {
                inputs.push({
                    nodeId: pId,
                    type: pNode.type,
                    data: pNode.outputData
                });
            }
        });
        return inputs;
    }

    // Abstract methods overridden by child classes
    getDisplayName() { return 'Base Node'; }
    getMetaText() { return 'Base Model'; }
    hasInput() { return true; }
    hasOutput() { return true; }
    async execute() { return null; }
}

/* ==========================================================================
   1. LLM Node Class
   ========================================================================== */
class LLMNode extends BaseNode {
    constructor(id, x, y) {
        super(id, 'llm', x, y);
        this.params = {
            model: 'gpt-4o',
            prompt: 'Create a responsive landing page layout',
            temperature: 0.7
        };
    }

    getDisplayName() { return 'LLM / Chat'; }
    getMetaText() { return `Model: ${this.params.model}`; }
    hasInput() { return true; }

    async execute() {
        this.setStatus('executing');
        appState.logTerminal(`[LLM] Node ${this.id} executing prompt: "${this.params.prompt}"...`, 'node-line');
        
        // Fetch inputs from connected parent (e.g. Research data)
        const connectedInputs = this.getConnectedInputs();
        let promptModifier = this.params.prompt;
        
        const researchInputs = connectedInputs.filter(i => i.type === 'research');
        if (researchInputs.length > 0) {
            promptModifier += `
Integrate the following research findings into your response:
${researchInputs[0].data.brief}`;
            appState.logTerminal(`[LLM] Appended context from Research Node ${researchInputs[0].nodeId}`, 'info-line');
        }

        // Simulate execution delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const response = MockDataEngine.getLLMResponse(promptModifier, this.params.model, appState.sources);
        
        // Print thinking processes to terminal
        for (const thinkLine of response.thinking) {
            appState.logTerminal(`[THINK] ${thinkLine}`, 'system-line');
            await new Promise(resolve => setTimeout(resolve, 250));
        }

        this.outputData = {
            text: response.text,
            prompt: this.params.prompt
        };

        this.updateSummary(response.text);
        this.setStatus('success');
        appState.logTerminal(`[LLM] Node ${this.id} executed successfully.`, 'success-line');
        return this.outputData;
    }
}

/* ==========================================================================
   2. Research Node Class
   ========================================================================== */
class ResearchNode extends BaseNode {
    constructor(id, x, y) {
        super(id, 'research', x, y);
        this.params = {
            engine: 'perplexity',
            deepSearch: true
        };
    }

    getDisplayName() { return 'Deep Research'; }
    getMetaText() { return `Engine: ${this.params.engine}`; }
    hasInput() { return true; }

    async execute() {
        this.setStatus('executing');
        appState.logTerminal(`[RESEARCH] Connecting to ${this.params.engine}...`, 'node-line');

        const connectedInputs = this.getConnectedInputs();
        let seedPrompt = "General tech synthesis";
        
        const llmInputs = connectedInputs.filter(i => i.type === 'llm');
        if (llmInputs.length > 0) {
            seedPrompt = llmInputs[0].data.text;
        }

        await new Promise(resolve => setTimeout(resolve, 2500));

        const urls = appState.sources.filter(s => s.type === 'url').map(s => s.name);
        const docs = appState.sources.filter(s => s.type === 'file');

        const response = MockDataEngine.getResearchResponse(seedPrompt, this.params.engine, docs, urls);

        for (const log of response.console) {
            appState.logTerminal(`[RESEARCH LOG] ${log}`, 'system-line');
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        this.outputData = {
            brief: response.brief,
            sources: response.sourcesSummary
        };

        this.updateSummary(response.sourcesSummary);
        this.setStatus('success');
        appState.logTerminal(`[RESEARCH] Node ${this.id} completed analysis. Brief sent to downstream connectors.`, 'success-line');
        return this.outputData;
    }
}

/* ==========================================================================
   3. Coding Node Class
   ========================================================================== */
class CodingNode extends BaseNode {
    constructor(id, x, y) {
        super(id, 'coding', x, y);
        this.params = {
            agent: 'Anti Gravity Builder',
            sandboxPort: 8080
        };
    }

    getDisplayName() { return 'Coding Agent'; }
    getMetaText() { return `Agent: ${this.params.agent}`; }
    hasInput() { return true; }

    async execute() {
        this.setStatus('executing');
        appState.logTerminal(`[CODING] Starting programmatic layout construction...`, 'node-line');

        const connectedInputs = this.getConnectedInputs();
        let instructionText = "Build default workspace";
        let contextText = "";

        // Combine outputs from parent nodes to guide website code structure
        const llmInput = connectedInputs.find(i => i.type === 'llm');
        if (llmInput) {
            instructionText = llmInput.data.prompt;
            contextText = llmInput.data.text;
        }
        const researchInput = connectedInputs.find(i => i.type === 'research');
        if (researchInput) {
            contextText += "
" + researchInput.data.brief;
        }

        await new Promise(resolve => setTimeout(resolve, 3000));

        const response = MockDataEngine.getCodeResponse(instructionText, this.params.agent, contextText);

        for (const log of response.console) {
            appState.logTerminal(`[BUILDER] ${log}`, 'system-line');
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        this.outputData = {
            code: response.code
        };

        // Render code immediately in the bottom workspace iframe and source editor
        appState.updateSandboxPreview(response.code);

        this.updateSummary(`Generated Sandbox (Port ${this.params.sandboxPort})`);
        this.setStatus('success');
        appState.logTerminal(`[CODING] Code compilation success. Sandboxed site rendered at localhost:${this.params.sandboxPort}`, 'success-line');
        return this.outputData;
    }
}

/* ==========================================================================
   4. Image Node Class (Procedural Generative Canvas)
   ========================================================================== */
class ImageNode extends BaseNode {
    constructor(id, x, y) {
        super(id, 'image', x, y);
        this.params = {
            engine: 'Midjourney v6',
            resolution: '16:10',
            prompt: 'An abstract futuristic dashboard, dark mode, vibrant purple glows'
        };
        this.canvasElement = null;
    }

    getDisplayName() { return 'Image Generator'; }
    getMetaText() { return `Engine: ${this.params.engine}`; }
    hasInput() { return true; }

    async execute() {
        this.setStatus('executing');
        
        const connectedInputs = this.getConnectedInputs();
        let promptText = this.params.prompt;

        const llmInput = connectedInputs.find(i => i.type === 'llm');
        if (llmInput) {
            promptText = llmInput.data.text;
            appState.logTerminal(`[IMAGE] Inherited prompt from LLM Node: "${promptText.substring(0, 50)}..."`, 'info-line');
        }

        appState.logTerminal(`[IMAGE] Rendering prompt: "${promptText.substring(0, 60)}" via ${this.params.engine}...`, 'node-line');

        await new Promise(resolve => setTimeout(resolve, 2500));

        const response = MockDataEngine.getImageResponse(promptText, this.params.engine);

        for (const log of response.console) {
            appState.logTerminal(`[GPU-RENDER] ${log}`, 'system-line');
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        this.outputData = {
            theme: response.theme,
            primaryColor: response.primaryColor,
            secondaryColor: response.secondaryColor,
            shapeCount: response.shapeCount,
            prompt: promptText
        };

        // Render visual thumbnail inside node card
        this.drawNodeThumbnail(response);
        
        // Save to Assets Library
        appState.saveGeneratedAsset('image', response);

        this.updateSummary(`Rendered: ${response.theme.toUpperCase()} (${this.params.resolution})`);
        this.setStatus('success');
        appState.logTerminal(`[IMAGE] Asset saved in Local Gallery.`, 'success-line');
        return this.outputData;
    }

    drawNodeThumbnail(data) {
        const previewContainer = document.getElementById(`node-preview-area-${this.id}`);
        if (!previewContainer) return;

        previewContainer.innerHTML = '';
        previewContainer.style.display = 'block';

        const canvas = document.createElement('canvas');
        canvas.width = 222;
        canvas.height = 138;
        canvas.style.borderRadius = '8px';
        canvas.style.border = '1px solid var(--border-color)';
        canvas.style.display = 'block';

        previewContainer.appendChild(canvas);
        this.canvasElement = canvas;
        
        this.renderCanvasAsset(canvas, data);
    }

    renderCanvasAsset(canvas, data) {
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        
        ctx.fillStyle = '#06070b';
        ctx.fillRect(0, 0, w, h);

        const gradient = ctx.createRadialGradient(w/2, h/2, 20, w/2, h/2, w);
        gradient.addColorStop(0, data.primaryColor + '30');
        gradient.addColorStop(1, '#06070b');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = data.primaryColor + '33';
        ctx.lineWidth = 1;

        if (data.theme === 'bloody') {
            // Draw dramatic dripping blood lines and splash circles
            ctx.fillStyle = data.primaryColor; // deep red
            ctx.strokeStyle = data.secondaryColor;

            // Background splatters
            for(let i=0; i<data.shapeCount; i++) {
                ctx.beginPath();
                ctx.arc(Math.random()*w, Math.random()*h, Math.random()*4, 0, Math.PI*2);
                ctx.fill();
            }

            // Dripping liquid lines from top
            ctx.beginPath();
            ctx.moveTo(0, 0);
            for(let x=0; x<=w; x+=10) {
                let dropHeight = 10 + Math.sin(x*0.08)*12 + Math.cos(x*0.03)*8 + Math.random()*6;
                if(x % 30 === 0) dropHeight += 15; // make larger drips
                ctx.lineTo(x, dropHeight);
            }
            ctx.lineTo(w, 0);
            ctx.closePath();
            ctx.fill();
        } 
        else if (data.theme === 'adult') {
            // Draw abstract glowing human anatomy outline (nude figure drawing style)
            ctx.strokeStyle = data.primaryColor;
            ctx.shadowColor = data.primaryColor;
            ctx.shadowBlur = 10;
            ctx.lineWidth = 2.5;

            ctx.beginPath();
            // stylized aesthetic chest/hip curve
            ctx.moveTo(w*0.35, h*0.9);
            ctx.bezierCurveTo(w*0.4, h*0.5, w*0.6, h*0.7, w*0.55, h*0.25); // torso
            ctx.bezierCurveTo(w*0.5, h*0.1, w*0.62, h*0.1, w*0.6, h*0.25); // head shape
            ctx.bezierCurveTo(w*0.58, h*0.4, w*0.65, h*0.5, w*0.58, h*0.9);
            ctx.stroke();

            // warm soft backing glow circles
            ctx.shadowBlur = 0;
            ctx.fillStyle = data.secondaryColor + '1a';
            ctx.beginPath();
            ctx.arc(w*0.5, h*0.4, 25, 0, Math.PI*2);
            ctx.fill();
        } 
        else if (data.theme === 'cosmic') {
            // Nebula rings & stars
            ctx.fillStyle = '#ffffff';
            for (let i = 0; i < data.shapeCount; i++) {
                ctx.fillRect(Math.random()*w, Math.random()*h, Math.random()*2, Math.random()*2);
            }
            // Ring
            ctx.strokeStyle = data.primaryColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(w/2, h/2, 40, 0, Math.PI*2);
            ctx.stroke();
        } 
        else {
            // Standard geometric abstract patterns
            ctx.strokeStyle = data.primaryColor;
            ctx.lineWidth = 1.5;
            for(let i=0; i<8; i++) {
                ctx.beginPath();
                ctx.arc(w/2, h/2, 10 + i*12, 0, Math.PI*2);
                ctx.stroke();
            }
        }
    }
}

/* ==========================================================================
   5. Video Node Class (Canvas Timeline Loop Player)
   ========================================================================== */
class VideoNode extends BaseNode {
    constructor(id, x, y) {
        super(id, 'video', x, y);
        this.params = {
            engine: 'Veo 3',
            duration: 5,
            prompt: 'Pulsing geometric waves flowing through space'
        };
        this.canvasElement = null;
        this.animFrameId = null;
        this.activeData = null;
    }

    getDisplayName() { return 'Video Generator'; }
    getMetaText() { return `Engine: ${this.params.engine}`; }
    hasInput() { return true; }

    async execute() {
        this.setStatus('executing');

        const connectedInputs = this.getConnectedInputs();
        let promptText = this.params.prompt;

        const imgInput = connectedInputs.find(i => i.type === 'image');
        if (imgInput) {
            promptText = imgInput.data.prompt;
            appState.logTerminal(`[VIDEO] Linked visuals from Image Node: "${promptText.substring(0, 50)}..."`, 'info-line');
        }

        appState.logTerminal(`[VIDEO] Rendering timeline for "${promptText.substring(0, 60)}" on ${this.params.engine}...`, 'node-line');

        await new Promise(resolve => setTimeout(resolve, 3000));

        const response = MockDataEngine.getVideoResponse(promptText, this.params.engine);

        for (const log of response.console) {
            appState.logTerminal(`[VIDEO RENDER] ${log}`, 'system-line');
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        this.outputData = response;
        this.activeData = response;

        // Render animation inside node card
        this.startVideoTimeline();
        
        // Save to Assets Library
        appState.saveGeneratedAsset('video', response);

        this.updateSummary(`Render: ${response.mode.toUpperCase()} (${this.params.duration}s)`);
        this.setStatus('success');
        appState.logTerminal(`[VIDEO] Video compiled and streaming.`, 'success-line');
        return this.outputData;
    }

    startVideoTimeline() {
        const previewContainer = document.getElementById(`node-preview-area-${this.id}`);
        if (!previewContainer) return;

        // Stop any running animations first
        if (this.animFrameId) {
            cancelAnimationFrame(this.animFrameId);
        }

        previewContainer.innerHTML = '';
        previewContainer.style.display = 'block';

        const canvas = document.createElement('canvas');
        canvas.width = 222;
        canvas.height = 138;
        canvas.style.borderRadius = '8px';
        canvas.style.border = '1px solid var(--border-color)';
        canvas.style.display = 'block';

        previewContainer.appendChild(canvas);
        this.canvasElement = canvas;

        const ctx = canvas.getContext('2d');
        const self = this;
        let tick = 0;

        function playLoop() {
            if (!self.canvasElement || !self.activeData) return;
            
            const w = canvas.width;
            const h = canvas.height;
            const mode = self.activeData.mode;
            const c1 = self.activeData.color1;
            const c2 = self.activeData.color2;
            const speed = self.activeData.speed;

            ctx.fillStyle = '#050609';
            ctx.fillRect(0, 0, w, h);

            tick += speed;

            if (mode === 'fluid-dripping') {
                // Liquid red dripping layers and ripple waves
                ctx.fillStyle = c1;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                for(let x=0; x<=w; x+=10) {
                    let yVal = 20 + Math.sin(x*0.06 + tick*0.05)*15 + Math.cos(tick*0.02)*6;
                    ctx.lineTo(x, yVal);
                }
                ctx.lineTo(w, 0);
                ctx.fill();

                // dripping drops falling down
                ctx.fillStyle = c2;
                for(let drop=0; drop<3; drop++) {
                    let dropX = w * (0.2 + drop*0.3);
                    let dropY = (tick * (2 + drop) + drop*50) % (h + 30);
                    if(dropY > 20) {
                        ctx.beginPath();
                        ctx.arc(dropX, dropY, 5, 0, Math.PI*2);
                        ctx.fill();
                    }
                }
            } 
            else if (mode === 'organic-pulse') {
                // Stylized outline breathing in and out (nude anatomy visual effect)
                ctx.strokeStyle = c2;
                ctx.lineWidth = 2.5;
                ctx.shadowColor = c1;
                ctx.shadowBlur = 10 + Math.sin(tick*0.04)*6;

                // animated contour lines
                ctx.beginPath();
                ctx.moveTo(w*0.3, h);
                // sway curve horizontally to simulate motion
                let sway = Math.sin(tick*0.03)*12;
                ctx.bezierCurveTo(w*0.4 + sway, h*0.6, w*0.6 + sway, h*0.7, w*0.5, h*0.3);
                ctx.bezierCurveTo(w*0.46, h*0.15, w*0.54, h*0.15, w*0.5, h*0.3);
                ctx.stroke();

                ctx.shadowBlur = 0;
            } 
            else if (mode === 'hyper-drive') {
                // expanding stars
                ctx.strokeStyle = c1;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(w/2, h/2, (tick * 2) % (w/2), 0, Math.PI*2);
                ctx.stroke();

                ctx.fillStyle = c2;
                for (let i = 0; i < 20; i++) {
                    let angle = (i * Math.PI * 2) / 20;
                    let radius = ((tick * 1.5 + i*10) % (w/2));
                    let sx = w/2 + Math.cos(angle) * radius;
                    let sy = h/2 + Math.sin(angle) * radius;
                    ctx.fillRect(sx, sy, 2, 2);
                }
            } 
            else {
                // standard rolling waves
                ctx.strokeStyle = c1;
                ctx.lineWidth = 2;
                ctx.beginPath();
                for(let x=0; x<w; x++) {
                    let y = h/2 + Math.sin(x*0.03 + tick*0.05)*15 + Math.cos(x*0.01 + tick*0.02)*10;
                    if(x===0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
            }

            self.animFrameId = requestAnimationFrame(playLoop);
        }

        playLoop();
    }
}
