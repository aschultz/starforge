import { IConnection, INode, ConnectionType, PaperMouseEvent, ConnectionDirection } from "./Types";
import { EditorContext } from "./Context";

export class GraphConnection implements IConnection {
    id: number;
    fromNode: INode;
    toNode: INode;
    connectionType: ConnectionType;

    readonly type = "link";

    constructor(id: number, from: INode, to: INode) {
        this.id = id;
        this.fromNode = from;
        this.toNode = to;
        this.connectionType = ConnectionType.Undirected;
    }

    update() {}

    dispose() {}

    isMatchingConnection(a: number, b: number, direction: ConnectionDirection) {
        const isFrom = this.toNode.id === a && this.fromNode.id === b;
        const isTo = this.fromNode.id === a && this.toNode.id === b;
        switch (direction) {
            case "from":
                return this.connectionType === ConnectionType.Directed && isFrom;
            case "to":
                return this.connectionType === ConnectionType.Directed && isTo;
            case "none":
                return this.connectionType === ConnectionType.Undirected && (isFrom || isTo);
            default:
                return isFrom || isTo;
        }
    }
}

export class RenderConnection extends GraphConnection {
    context: EditorContext;
    path: paper.Path;

    constructor(id: number, from: INode, to: INode, context: EditorContext) {
        super(id, from, to);
        this.context = context;

        const paper = context.paper;

        this.path = new paper.Path.Line(new paper.Point(0, 0), new paper.Point(0, 0));
        this.path.strokeColor = new paper.Color("black");
        this.path.strokeWidth = 2;
        this.path.on("doubleclick", this.onDoubleClick);
        this.context.connectionsLayer.addChild(this.path);

        this.fromNode.MoveEvent.on(this.update);
        this.toNode.MoveEvent.on(this.update);
        this.update();
    }

    dispose() {
        this.path.data["entity"] = undefined;
        this.path.remove();
        this.fromNode.MoveEvent.off(this.update);
        this.toNode.MoveEvent.off(this.update);
    }

    update = () => {
        this.path.firstSegment.point = this.fromNode.position;
        this.path.lastSegment.point = this.toNode.position;
    };

    onDoubleClick = (e: PaperMouseEvent) => {
        this.context.editor.startEditing(this);
    };
}
