import { IConnection, INode, ConnectionType } from "./Types";
import { EditorContext } from "./Context";

export class GraphConnection implements IConnection {
    id: number;
    fromNode: INode;
    toNode: INode;
    type: ConnectionType;

    constructor(id: number, from: INode, to: INode) {
        this.id = id;
        this.fromNode = from;
        this.toNode = to;
        this.type = ConnectionType.Bidirectional;
    }

    update() {}

    dispose() {}
}

export class RenderConnection extends GraphConnection {
    path: paper.Path;

    constructor(id: number, from: INode, to: INode, context: EditorContext) {
        super(id, from, to);

        this.path = new paper.Path();
        this.path.strokeColor = new paper.Color("black");

        this.fromNode.MoveEvent.on(this.update);
        this.toNode.MoveEvent.on(this.update);
        this.update();
    }

    update() {
        this.path.firstSegment.point = this.fromNode.position;
        this.path.lastSegment.point = this.toNode.position;
    }

    dispose() {
        this.path.remove();
        this.fromNode.MoveEvent.off(this.update);
        this.toNode.MoveEvent.off(this.update);
    }
}
