import paper from "paper/dist/paper-core";

type Dictionary<T> = { [key: string]: T };

function removeItem<T>(item: T, array: T[]) {
    const index = array.indexOf(item);
    if (index >= 0) {
        array.splice(index, 1);
    }
}

enum ConnectionType {
    Directed,
    Bidirectional,
}

class Node {
    nodeId: number;
    data: Dictionary<string> = {};
    connections: Connection[] = [];
    group: paper.Group;

    constructor(id: number, center: paper.Point) {
        this.nodeId = id;

        this.group = new paper.Group();
        this.group.onMouseDrag = this.onDrag;

        const width = 100;
        const height = 50;
        const bounds = new paper.Rectangle(center.x - width / 2, center.y - height / 2, width, height);
        const box = new paper.Path.Rectangle(bounds);
        this.group.addChild(box);
    }

    get position(): paper.Point {
        return this.group.position;
    }
    set position(p: paper.Point) {
        this.group.position = p;

        for (const connection of this.connections) {
            connection.update();
        }
    }

    getConnections(node: Node): Connection[] {
        return this.connections.filter((x) => x.fromNode === node || x.toNode === node);
    }

    onDrag = (e: paper.MouseEvent) => {
        this.position = this.position.add(e.delta);
    };

    dispose() {
        this.group.remove();
    }
}

class Connection {
    connectionId: number;
    fromNode: Node;
    toNode: Node;

    path: paper.Path;

    constructor(id: number, from: Node, to: Node) {
        this.connectionId = id;
        this.fromNode = from;
        this.toNode = to;

        this.path = new paper.Path();
        this.path.strokeColor = new paper.Color("black");
        this.update();
    }

    update() {
        this.path.firstSegment.point = this.fromNode.position;
        this.path.lastSegment.point = this.toNode.position;
    }

    dispose() {
        this.path.remove();
    }
}

export class GraphEditor {
    canvas: HTMLCanvasElement | undefined;
    project: paper.Project | undefined;
    view: paper.View | undefined;

    mainTool: paper.Tool | undefined;
    addTool: paper.Tool | undefined;

    maxId = 0;
    nodes = new Map<number, Node>();
    connections = new Map<number, Connection>();

    attach(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.project = new paper.Project(canvas);
        this.view = this.project.view;
        this.view.center = new paper.Point(0, 0);

        canvas.addEventListener("wheel", this.onWheel);
        this.view.onMouseDrag = this.onMouseDrag;

        // Draw an indicator at the center of the canvas
        let a = new paper.Path.Line(new paper.Point(-5, 0), new paper.Point(5, 0));
        let b = new paper.Path.Line(new paper.Point(0, -5), new paper.Point(0, 5));
        let cross = new paper.Group([a, b]);
        cross.strokeColor = new paper.Color("black");
    }

    detach() {
        if (this.canvas) {
            this.canvas.removeEventListener("wheel", this.onWheel);
        }
        if (this.project) {
            this.project.remove();
            this.project = undefined;
            this.view = undefined;
        }
    }

    onMouseDrag = (e: any) => {
        // Move the camera around
        const movement = new paper.Point(e.event.movementX, e.event.movementY);
        const correctedMove = movement.divide(this.view!.zoom);

        this.view!.center = this.view!.center.subtract(correctedMove);
    };

    onWheel = (e: WheelEvent) => {
        // Zoom the camera
        const deltaY = e.deltaY;
        const currentZoom = this.view!.zoom;
        const currentPosition = this.view!.center;

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

        this.view!.zoom = newZoom;
    };

    createNode = (position: paper.Point) => {
        let node = new Node(++this.maxId, position);
        this.nodes.set(node.nodeId, node);
    };

    createConnection = (from: number, to: number) => {
        // See if we already have a connection between these two nodes
        const startNode = this.nodes.get(from);
        const endNode = this.nodes.get(to);
        if (!startNode || !endNode) {
            // ERROR
            return;
        }

        const existingConnections = startNode.getConnections(endNode);
        if (existingConnections.length > 0) {
            return;
        }

        const connection = new Connection(++this.maxId, startNode, endNode);
        this.connections.set(connection.connectionId, connection);
    };

    removeNode = (nodeId: number) => {
        const node = this.nodes.get(nodeId);
        if (!node) {
            return;
        }

        node.dispose();

        // Removing a node should also remove all of its connections
        for (const connection of node.connections) {
            this.removeConnection(connection.connectionId);
        }

        this.nodes.delete(nodeId);
    };

    removeConnection = (connectionId: number) => {
        const connection = this.connections.get(connectionId);
        if (!connection) {
            return;
        }

        connection.dispose();

        removeItem(connection, connection.fromNode.connections);
        removeItem(connection, connection.toNode.connections);
        this.connections.delete(connectionId);
    };
}
