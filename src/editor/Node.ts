import {
    Dictionary,
    INode,
    IConnection,
    InteractionMode,
    MoveEvent,
    PaperMouseEvent,
    ConnectionType,
    ConnectionDirection,
} from "./Types";
import { EditorContext } from "./Context";
import { removeItem } from "./Collections";
import { TypedEvent } from "./Emitter";

export class GraphNode implements INode {
    protected readonly _nodeId: number;
    protected _data: Dictionary<string>;
    protected _connections: IConnection[];
    protected _position: paper.Point;

    readonly type = "node";
    readonly MoveEvent = new TypedEvent<INode, MoveEvent>();

    constructor(id: number, center: paper.Point) {
        this._nodeId = id;
        this._data = {};
        this._connections = [];
        this._position = center;
    }

    get id() {
        return this._nodeId;
    }

    get position(): paper.Point {
        return this._position;
    }

    set position(p: paper.Point) {
        this._position = p;
        this.MoveEvent.emit(this, { newPosition: p });
    }

    /**
     * Gets connections between this node and others
     * @param otherNodeId (Optional) Include only connections to or from the specified node
     */
    getConnections(otherNodeId?: number): IConnection[] {
        if (otherNodeId !== undefined) {
            return this._connections.filter((x) => x.isMatchingConnection(this.id, otherNodeId));
        } else {
            return this._connections;
        }
    }

    getConnection(otherNodeId: number, direction: ConnectionDirection): IConnection | undefined {
        return this._connections.find((x) => x.isMatchingConnection(this.id, otherNodeId, direction));
    }

    addConnection(connection: IConnection) {
        if (connection.fromNode !== this && connection.toNode !== this) {
            throw new Error("Connection is does not include this node");
        }

        if (this._connections.indexOf(connection) === -1) {
            this._connections.push(connection);
        }
    }

    removeConnection(connection: IConnection) {
        removeItem(connection, this._connections);
    }

    dispose() {
        this._connections = [];
    }
}

export class RenderNode extends GraphNode {
    context: EditorContext;
    group: paper.Group;
    box: paper.Path;
    text: paper.PointText;

    constructor(id: number, center: paper.Point, context: EditorContext) {
        super(id, center);
        this.context = context;

        const paper = context.paper;

        this.text = new paper.PointText(center);
        this.text.fillColor = new paper.Color("black");
        this.text.content = "This is a test of the node\r\ncreation tool";
        this.text.justification = "center";
        this.text.fontFamily = "Arial";
        this.text.fontSize = 14;

        this.box = new paper.Path.Rectangle(this.text.strokeBounds.expand(20));
        this.box.strokeColor = new paper.Color("black");
        this.box.fillColor = new paper.Color("white");

        this.group = new paper.Group([this.box, this.text]);
        this.group.data["entity"] = this;
        this.group.on("mousedrag", this.onDrag);
        this.group.on("mouseenter", this.onMouseEnter);
        this.group.on("mouseleave", this.onMouseLeave);
        this.group.on("doubleclick", this.onDoubleClick);
        this.group.position = center;
        context.nodesLayer.addChild(this.group);
    }

    dispose() {
        this.group.data["entity"] = undefined;
        this.group.remove();
    }

    get position(): paper.Point {
        return this._position;
    }

    set position(p: paper.Point) {
        this.group.position = p;
        super["position"] = p;
    }

    onDrag = (e: PaperMouseEvent) => {
        if (this.context.interactionMode === InteractionMode.Move) {
            e.stopPropagation();
            this.position = this.position.add(e.delta);
        }
    };
    onMouseEnter = (e: PaperMouseEvent) => {
        this.box.selected = true;
    };
    onMouseLeave = (e: PaperMouseEvent) => {
        this.box.selected = false;
    };
    onDoubleClick = (e: PaperMouseEvent) => {
        this.context.editor.startEditing(this);
    };
}
