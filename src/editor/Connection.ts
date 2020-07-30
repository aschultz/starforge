import { IConnection, INode, ConnectionType } from "./Types";
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
        this.connectionType = ConnectionType.Bidirectional;
    }

    update() {}

    dispose() {}
}

export class RenderConnection extends GraphConnection {
    context: EditorContext;
    path: paper.Path;

    constructor(id: number, from: INode, to: INode, context: EditorContext) {
        super(id, from, to);
        this.context = context;

        const paper = context.paper;

        this.path = new paper.Path.Line(new paper.Point(0, 0), new paper.Point(0, 0));
        this.path.data["entity"] = this;
        this.path.strokeColor = new paper.Color("black");
        this.context.connectionsLayer.addChild(this.path);

        this.fromNode.MoveEvent.on(this.update);
        this.toNode.MoveEvent.on(this.update);
        this.update();
    }

    update = () => {
        this.path.firstSegment.point = this.fromNode.position;
        this.path.lastSegment.point = this.toNode.position;
    };

    dispose() {
        this.path.data["entity"] = undefined;
        this.path.remove();
        this.fromNode.MoveEvent.off(this.update);
        this.toNode.MoveEvent.off(this.update);
    }
}
