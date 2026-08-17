/* ==========================================================================
   OmniAI Orchestrator: Node Graph Canvas Interaction Engine
   ========================================================================== */

const CanvasEngine = {
    viewport: null,
    grid: null,
    svgOverlay: null,
    nodesContainer: null,
    
    panX: 0,
    panY: 0,
    scale: 1.0,
    isPanning: false,
    startX: 0,
    startY: 0,
    
    draggedNode: null,
    nodeDragStartX: 0,
    nodeDragStartY: 0,
    
    activePortDrag: null,
    tempLine: null,
    
    init() {
        this.viewport = document.getElementById('canvas-viewport');
        this.grid = document.getElementById('canvas-grid');
        this.svgOverlay = document.getElementById('canvas-connections-svg');
        this.nodesContainer = document.getElementById('nodes-container');
        
        this.setupPanning();
        this.setupNodeDragging();
        this.setupPortConnections();
        this.setupZoom();
        this.updateTransform();
        
        // Listen for window resizes
        window.addEventListener('resize', () => this.drawConnections());
    },
    
    updateTransform() {
        const transformString = `translate(${this.panX}px, ${this.panY}px) scale(${this.scale})`;
        this.grid.style.transform = transformString;
        this.nodesContainer.style.transform = transformString;
        this.drawConnections();
    },
    
    setupPanning() {
        this.viewport.addEventListener('mousedown', (e) => {
            // Only pan if clicking on the background viewport
            if (e.target === this.viewport || e.target === this.grid || e.target === this.svgOverlay) {
                this.isPanning = true;
                this.startX = e.clientX - this.panX;
                this.startY = e.clientY - this.panY;
                this.viewport.style.cursor = 'grabbing';
            }
        });
        
        window.addEventListener('mousemove', (e) => {
            if (this.isPanning) {
                this.panX = e.clientX - this.startX;
                this.panY = e.clientY - this.startY;
                this.updateTransform();
            }
        });
        
        window.addEventListener('mouseup', () => {
            if (this.isPanning) {
                this.isPanning = false;
                this.viewport.style.cursor = 'grab';
            }
        });
    },
    
    setupZoom() {
        this.viewport.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomSpeed = 0.05;
            const delta = e.deltaY > 0 ? -zoomSpeed : zoomSpeed;
            const oldScale = this.scale;
            this.scale = Math.min(Math.max(this.scale + delta, 0.3), 1.8);
            
            // Zoom towards mouse coordinates
            const rect = this.viewport.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            this.panX = mouseX - (mouseX - this.panX) * (this.scale / oldScale);
            this.panY = mouseY - (mouseY - this.panY) * (this.scale / oldScale);
            
            this.updateTransform();
        }, { passive: false });
        
        document.getElementById('btn-zoom-in').addEventListener('click', () => {
            this.scale = Math.min(this.scale + 0.1, 1.8);
            this.updateTransform();
        });
        
        document.getElementById('btn-zoom-out').addEventListener('click', () => {
            this.scale = Math.max(this.scale - 0.1, 0.3);
            this.updateTransform();
        });
        
        document.getElementById('btn-zoom-fit').addEventListener('click', () => {
            this.fitToScreen();
        });
    },
    
    fitToScreen() {
        if (appState.nodes.length === 0) {
            this.panX = 0;
            this.panY = 0;
            this.scale = 1.0;
            this.updateTransform();
            return;
        }
        
        // Find bounds of all nodes
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;
        
        appState.nodes.forEach(node => {
            minX = Math.min(minX, node.x);
            minY = Math.min(minY, node.y);
            maxX = Math.max(maxX, node.x + 250); // node width
            maxY = Math.max(maxY, node.y + 120); // node height approx
        });
        
        const pad = 40;
        const boundsW = (maxX - minX) + pad * 2;
        const boundsH = (maxY - minY) + pad * 2;
        
        const viewW = this.viewport.clientWidth;
        const viewH = this.viewport.clientHeight;
        
        this.scale = Math.min(Math.min(viewW / boundsW, viewH / boundsH), 1.5);
        this.scale = Math.max(this.scale, 0.5);
        
        this.panX = (viewW - boundsW * this.scale) / 2 - minX * this.scale + pad * this.scale;
        this.panY = (viewH - boundsH * this.scale) / 2 - minY * this.scale + pad * this.scale;
        
        this.updateTransform();
    },
    
    setupNodeDragging() {
        this.nodesContainer.addEventListener('mousedown', (e) => {
            const header = e.target.closest('.node-header');
            if (!header) return;
            
            const card = header.closest('.node-card');
            const nodeId = card.id.replace('node-', '');
            const node = appState.nodes.find(n => n.id === nodeId);
            
            if (node) {
                this.draggedNode = node;
                // Calculate grid relative drag starts (adjust for zoom scale)
                this.nodeDragStartX = e.clientX / this.scale - node.x;
                this.nodeDragStartY = e.clientY / this.scale - node.y;
                card.style.zIndex = 100;
            }
        });
        
        window.addEventListener('mousemove', (e) => {
            if (this.draggedNode && this.draggedNode.element) {
                // Update grid relative coordinates
                this.draggedNode.x = e.clientX / this.scale - this.nodeDragStartX;
                this.draggedNode.y = e.clientY / this.scale - this.nodeDragStartY;
                
                this.draggedNode.element.style.left = `${this.draggedNode.x}px`;
                this.draggedNode.element.style.top = `${this.draggedNode.y}px`;
                
                this.drawConnections();
            }
        });
        
        window.addEventListener('mouseup', () => {
            if (this.draggedNode) {
                if (this.draggedNode.element) {
                    this.draggedNode.element.style.zIndex = '';
                }
                this.draggedNode = null;
            }
        });
    },
    
    setupPortConnections() {
        this.nodesContainer.addEventListener('mousedown', (e) => {
            const port = e.target.closest('.port-out');
            if (!port) return;
            
            e.stopPropagation();
            
            const nodeId = port.getAttribute('data-node-id');
            const rect = port.getBoundingClientRect();
            const viewRect = this.viewport.getBoundingClientRect();
            
            // Store mouse tracking details
            this.activePortDrag = {
                nodeId: nodeId,
                portEl: port,
                startX: (rect.left + rect.width / 2 - viewRect.left - this.panX) / this.scale,
                startY: (rect.top + rect.height / 2 - viewRect.top - this.panY) / this.scale
            };
            
            // Create temporary SVG path
            this.tempLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            this.tempLine.setAttribute('class', 'connection-line temp');
            this.tempLine.setAttribute('stroke', 'var(--color-llm)');
            this.tempLine.setAttribute('stroke-width', '2');
            this.svgOverlay.appendChild(this.tempLine);
        });
        
        window.addEventListener('mousemove', (e) => {
            if (this.activePortDrag && this.tempLine) {
                const viewRect = this.viewport.getBoundingClientRect();
                // mouse pos relative to zoom & pan
                const curX = (e.clientX - viewRect.left - this.panX) / this.scale;
                const curY = (e.clientY - viewRect.top - this.panY) / this.scale;
                
                const d = this.calculateBezierPath(
                    this.activePortDrag.startX,
                    this.activePortDrag.startY,
                    curX,
                    curY
                );
                this.tempLine.setAttribute('d', d);
            }
        });
        
        window.addEventListener('mouseup', (e) => {
            if (this.activePortDrag) {
                const dropPort = e.target.closest('.port-in');
                
                if (dropPort) {
                    const toNodeId = dropPort.getAttribute('data-node-id');
                    const fromNodeId = this.activePortDrag.nodeId;
                    
                    if (fromNodeId !== toNodeId) {
                        appState.createConnection(fromNodeId, toNodeId);
                    }
                }
                
                // Cleanup temp drawing elements
                if (this.tempLine) {
                    this.tempLine.remove();
                    this.tempLine = null;
                }
                this.activePortDrag = null;
            }
        });
    },
    
    calculateBezierPath(x1, y1, x2, y2) {
        // Compute standard smooth cubic bezier connection line
        const controlOffset = Math.max(Math.abs(x2 - x1) * 0.5, 40);
        return `M ${x1} ${y1} C ${x1 + controlOffset} ${y1}, ${x2 - controlOffset} ${y2}, ${x2} ${y2}`;
    },
    
    drawConnections() {
        // Clear all except elements being dragged
        const lines = this.svgOverlay.querySelectorAll('.connection-line:not(.temp)');
        lines.forEach(l => l.remove());
        
        const viewRect = this.viewport.getBoundingClientRect();
        
        appState.connections.forEach(conn => {
            const fromPort = document.getElementById(`port-out-${conn.from}`);
            const toPort = document.getElementById(`port-in-${conn.to}`);
            
            if (fromPort && toPort) {
                const fromRect = fromPort.getBoundingClientRect();
                const toRect = toPort.getBoundingClientRect();
                
                // Compute coordinates relative to viewport canvas coordinates
                const x1 = (fromRect.left + fromRect.width / 2 - viewRect.left - this.panX) / this.scale;
                const y1 = (fromRect.top + fromRect.height / 2 - viewRect.top - this.panY) / this.scale;
                
                const x2 = (toRect.left + toRect.width / 2 - viewRect.left - this.panX) / this.scale;
                const y2 = (toRect.top + toRect.height / 2 - viewRect.top - this.panY) / this.scale;
                
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('class', 'connection-line');
                
                // Set custom properties if pipeline is executing
                if (appState.pipelineExecuting) {
                    path.classList.add('active');
                }
                
                path.setAttribute('d', this.calculateBezierPath(x1, y1, x2, y2));
                
                // Highlight wire colored matching fromNode's theme color
                const fromNode = appState.nodes.find(n => n.id === conn.from);
                if (fromNode) {
                    const colorMap = {
                        llm: 'var(--color-llm)',
                        research: 'var(--color-research)',
                        coding: 'var(--color-coding)',
                        image: 'var(--color-image)',
                        video: 'var(--color-video)'
                    };
                    path.style.stroke = colorMap[fromNode.type];
                }
                
                // Create overlay animation for active data flow along lines
                if (appState.pipelineExecuting) {
                    path.style.strokeDasharray = '8, 5';
                    path.style.animation = 'flow 0.8s linear infinite';
                    
                    // Add stroke keyframe rules dynamically if missing
                    if (!document.getElementById('svg-flow-animation-css')) {
                        const style = document.createElement('style');
                        style.id = 'svg-flow-animation-css';
                        style.innerHTML = `@keyframes flow { to { stroke-dashoffset: -20; } }`;
                        document.head.appendChild(style);
                    }
                }
                
                this.svgOverlay.appendChild(path);
            }
        });
    }
};
