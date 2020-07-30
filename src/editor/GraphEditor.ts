import { EditorContext } from "./Context";
import { RenderConnection } from "./Connection";
import { RenderNode } from "./Node";
import { InteractionMode, PaperMouseEvent, PaperKeyEvent, IConnection, INode } from "./Types";
import { Point } from "paper/dist/paper-core";

export class GraphEditor {
    context!: EditorContext;

    maxId = 0;
    nodes = new Map<number, RenderNode>();
    connections = new Map<number, RenderConnection>();

    isDragging = false;

    tempConnection!: paper.Path;

    attach(canvas: HTMLCanvasElement) {
        this.context = new EditorContext(canvas);

        this.context.canvas.addEventListener("wheel", this.onWheel);

        const paper = this.context.paper;
        const view = this.context.view;
        view.onClick = this.onClick;
        view.onMouseDown = this.onMouseDown;
        view.onMouseUp = this.onMouseUp;
        view.onMouseDrag = this.onMouseDrag;
        view.onMouseMove = this.onMouseMove;
        (view as any).onKeyDown = this.onKeyDown;
        (view as any).onKeyUp = this.onKeyUp;

        // Draw an indicator at the center of the canvas
        const a = new paper.Path.Line(new paper.Point(-5, 0), new paper.Point(5, 0));
        const b = new paper.Path.Line(new paper.Point(0, -5), new paper.Point(0, 5));
        const cross = new paper.Group([a, b]);
        cross.strokeColor = new paper.Color("black");
        this.context.backgroundLayer.addChild(cross);

        this.tempConnection = new paper.Path.Line(new paper.Point(0, 0), new paper.Point(0, 0));
        this.tempConnection.strokeColor = new paper.Color("black");
        this.tempConnection!.visible = false;
        this.context.connectionsLayer.addChild(this.tempConnection);

        this.setMode(InteractionMode.Move);
    }

    detach() {
        if (this.context) {
            this.context.canvas.removeEventListener("wheel", this.onWheel);
            this.context.dispose();
        }
    }

    onClick = (e: PaperMouseEvent) => {
        const context = this.context!;
        if (e.event.button === 0) {
            if (context.interactionMode === InteractionMode.Add) {
                this.createNode(e.point);
            } else if (context.interactionMode === InteractionMode.Connect) {
                // Hit test. If we hit a box, start or end a connection
                // If we miss, do nothing
                const results = context.project.hitTest(e.point, {
                    fill: true,
                    stroke: true,
                    bounds: true,
                    hitTolerance: 2,
                });
                console.log(results);
            }
        }
    };

    onMouseDown = (e: PaperMouseEvent) => {};

    onMouseUp = (e: PaperMouseEvent) => {
        this.isDragging = false;
    };

    onMouseMove = (e: PaperMouseEvent) => {
        // If connection has started, update connection end position
    };

    onMouseDrag = (e: PaperMouseEvent) => {
        const context = this.context;
        if (context.interactionMode === InteractionMode.Move) {
            this.isDragging = true;

            // Move the camera around
            const view = this.context.view;
            const movement = new Point(e.event.movementX, e.event.movementY);
            const correctedMove = movement.divide(view.zoom);

            view.center = view.center.subtract(correctedMove);
        }
    };

    onKeyDown = (e: PaperKeyEvent) => {
        if (e.event.repeat || this.isDragging) {
            return;
        }

        if (e.key === "shift") {
            this.setMode(InteractionMode.Add);
        } else if (e.key === "control") {
            this.setMode(InteractionMode.Connect);
        }
    };
    onKeyUp = (e: PaperKeyEvent) => {
        const context = this.context;
        if (this.isDragging) {
            return;
        }

        if (context.interactionMode === InteractionMode.Add && e.key === "shift") {
            this.setMode(InteractionMode.Move);
        } else if (context.interactionMode === InteractionMode.Connect && e.key === "control") {
            this.setMode(InteractionMode.Move);
        }
    };

    setMode(newMode: InteractionMode) {
        const context = this.context;
        if (context.interactionMode === newMode) {
            return;
        }

        if (context.interactionMode === InteractionMode.Connect) {
            // Clear in-progress connection
        }

        const canvas = this.context.canvas;

        if (newMode === InteractionMode.Add) {
            canvas.style.cursor = "cell";
        } else if (newMode === InteractionMode.Connect) {
            canvas.style.cursor = "crosshair";
        } else {
            canvas.style.cursor = "default";
        }
        // TODO: Force a redraw to get the cursor to update without moving the mouse

        context.interactionMode = newMode;
    }

    onWheel = (e: WheelEvent) => {
        // Prevent zooming the browser window with Ctrl+Scroll. Only zoom the canvas.
        e.preventDefault();

        const view = this.context!.view;

        // Zoom the camera
        const deltaY = e.deltaY;
        const currentZoom = view.zoom;
        const currentPosition = view.center;

        // TODO: Zoom based on cursor position

        const zoomFactor = 1 + 0.1 * (Math.abs(deltaY) / 120);
        const maxZoom = 4.0;
        const minZoom = 0.25;
        let newZoom = deltaY < 0 ? currentZoom * zoomFactor : currentZoom / zoomFactor;
        // Clamp
        newZoom = Math.max(minZoom, Math.min(maxZoom, newZoom));
        // Snap to 1 if close enough
        if (Math.abs(newZoom - 1) < 0.05) {
            newZoom = 1;
        }

        view.zoom = newZoom;
    };

    resetZoom = () => {
        if (this.context) {
            this.context.view.zoom = 1;
        }
    };

    createNode = (position: paper.Point) => {
        let node = new RenderNode(++this.maxId, position, this.context);
        this.nodes.set(node.id, node);
    };

    removeNode = (n: number | INode) => {
        const node = typeof n === "number" ? this.nodes.get(n) : n;
        if (!node) {
            return;
        }

        // Removing a node should also remove all of its connections
        for (const connection of node.getConnections()) {
            this.removeConnection(connection.id);
        }

        node.dispose();
        this.nodes.delete(node.id);
    };

    createConnection = (from: number, to: number) => {
        // See if we already have a connection between these two nodes
        const startNode = this.nodes.get(from);
        const endNode = this.nodes.get(to);
        if (!startNode || !endNode) {
            throw Error("Invalid node address to create connection");
        }

        const existingConnections = startNode.getConnections(endNode.id);
        if (existingConnections.length > 0) {
            return;
        }

        const connection = new RenderConnection(++this.maxId, startNode, endNode, this.context);
        startNode.addConnection(connection);
        endNode.addConnection(connection);

        this.connections.set(connection.id, connection);
    };

    removeConnection = (c: number | IConnection) => {
        const connection = typeof c === "number" ? this.connections.get(c) : c;
        if (!connection) {
            return;
        }

        connection.fromNode.removeConnection(connection);
        connection.toNode.removeConnection(connection);
        connection.dispose();
        this.connections.delete(connection.id);
    };
}
