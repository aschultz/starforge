import { EditorContext } from "./Context";
import { RenderConnection } from "./Connection";
import { RenderNode } from "./Node";
import {
    InteractionMode,
    PaperMouseEvent,
    PaperKeyEvent,
    IConnection,
    INode,
    IEntity,
    ITool,
    IEditor,
    ConnectionType,
} from "./Types";
import { ZoomTool } from "./tools/ZoomTool";
import { MoveTool } from "./tools/MoveTool";
import { AddTool } from "./tools/AddTool";
import { ConnectionTool } from "./tools/ConnectionTool";
import { saveAsDotFile } from "./io/DotFile";

/**
 * Given a Paper item, walks up the scene graph looking for an attached entity
 * @param item The item to start the search at
 */
function getEntity(item?: paper.Item): IEntity | undefined {
    let current = item;
    while (current !== undefined && current.data["entity"] === undefined) {
        current = current.parent;
    }
    return current ? (current.data["entity"] as IEntity) : undefined;
}

export class GraphEditor implements IEditor {
    isAttached: boolean = false;
    context!: EditorContext;

    maxId = 0;
    nodes = new Map<number, RenderNode>();
    connections = new Map<number, RenderConnection>();

    zoomTool!: ZoomTool;
    moveTool!: MoveTool;
    addTool!: AddTool;
    connectionTool!: ConnectionTool;

    attach(canvas: HTMLCanvasElement) {
        if (this.isAttached) {
            return;
        }
        this.isAttached = true;

        this.context = new EditorContext(canvas, this);
        this.zoomTool = new ZoomTool(this.context);
        this.moveTool = new MoveTool(this.context);
        this.addTool = new AddTool(this.context);
        this.connectionTool = new ConnectionTool(this.context);

        this.zoomTool.activate();
        this.moveTool.activate();

        const paper = this.context.paper;
        const view = this.context.view;
        view.on("keydown", this.onKeyDown);
        view.on("keyup", this.onKeyUp);

        // Draw an indicator at the center of the canvas
        const a = new paper.Path.Line(new paper.Point(-5, 0), new paper.Point(5, 0));
        const b = new paper.Path.Line(new paper.Point(0, -5), new paper.Point(0, 5));
        const cross = new paper.Group([a, b]);
        cross.strokeColor = new paper.Color("black");
        this.context.backgroundLayer.addChild(cross);

        this.setMode(InteractionMode.Move);
    }

    detach() {
        this.zoomTool?.dispose();
        this.moveTool?.dispose();
        this.addTool?.dispose();
        this.connectionTool?.dispose();
        this.context?.dispose();
        this.isAttached = false;
    }

    resetZoom = () => {
        this.zoomTool?.resetZoom();
        this.context.view.center = new this.context.paper.Point(0, 0);
    };

    onKeyDown = (e: PaperKeyEvent) => {
        if (e.event.repeat || this.moveTool.isDragging) {
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
        if (this.moveTool.isDragging) {
            return;
        }

        if (context.interactionMode === InteractionMode.Add && e.key === "shift") {
            this.setMode(InteractionMode.Move);
        } else if (context.interactionMode === InteractionMode.Connect && e.key === "control") {
            this.setMode(InteractionMode.Move);
        }
    };

    setMode(newMode: InteractionMode) {
        const currentMode = this.context.interactionMode;
        if (currentMode === newMode) {
            return;
        }

        switch (currentMode) {
            case InteractionMode.Move:
                this.moveTool.deactivate();
                break;
            case InteractionMode.Add:
                this.addTool.deactivate();
                break;
            case InteractionMode.Connect:
                this.connectionTool.deactivate();
                break;
        }

        switch (newMode) {
            case InteractionMode.Move:
                this.moveTool.activate();
                break;
            case InteractionMode.Add:
                this.addTool.activate();
                break;
            case InteractionMode.Connect:
                this.connectionTool.activate();
                break;
        }

        this.context.interactionMode = newMode;
    }

    createNode = (position: paper.Point) => {
        let node = new RenderNode(++this.maxId, position, this.context);
        this.nodes.set(node.id, node);
        return node;
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

    createConnection = (from: number, to: number, directional: boolean) => {
        // See if we already have a connection between these two nodes
        const startNode = this.nodes.get(from);
        const endNode = this.nodes.get(to);
        if (!startNode || !endNode) {
            throw Error("Invalid node address to create connection");
        }

        const existingConnection = startNode.getConnection(endNode.id, directional ? "to" : "none");
        if (existingConnection) {
            return existingConnection;
        } else {
            const newConnection = new RenderConnection(++this.maxId, startNode, endNode, this.context);
            startNode.addConnection(newConnection);
            endNode.addConnection(newConnection);

            this.connections.set(newConnection.id, newConnection);
            return newConnection;
        }
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

    removeEntityAtPoint = (p: paper.Point): void => {
        const entity = this.getEntityAtPoint(p);
        if (entity) {
            if (entity.type === "node") {
                this.removeNode(entity.id);
            } else if (entity.type === "link") {
                this.removeConnection(entity.id);
            }
        }
    };

    getNodeAtPoint = (point: paper.Point): INode | undefined => {
        const entity = this.getEntityAtPoint(point, 2);
        if (entity && entity.type === "node") {
            return entity as INode;
        }
        return;
    };

    getConnectionAtPoint = (point: paper.Point): IConnection | undefined => {
        const entity = this.getEntityAtPoint(point, 2);
        if (entity && entity.type === "link") {
            return entity as IConnection;
        }
        return;
    };

    getEntityAtPoint = (point: paper.Point, hitTolerance = 0): IEntity | undefined => {
        const results = this.context.nodesLayer.hitTest(point, {
            fill: true,
            stroke: true,
            hitTolerance,
        });

        if (results) {
            return getEntity(results.item);
        }
        return;
    };

    startEditing = (entity: IEntity) => {};

    stopEditing = () => {};

    saveToDotFile = () => {
        saveAsDotFile([...this.nodes.values()]);
    };
}
