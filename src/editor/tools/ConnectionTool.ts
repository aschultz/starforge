import { ITool, PaperMouseEvent, INode } from "../Types";
import { EditorContext } from "../Context";

export class ConnectionTool implements ITool {
    isActive: boolean;
    context: EditorContext;
    path: paper.Path;

    startNode: INode | undefined;

    constructor(context: EditorContext) {
        this.context = context;
        this.isActive = false;

        const paper = context.paper;

        this.path = new paper.Path.Line(new paper.Point(0, 0), new paper.Point(0, 0));
        this.path.strokeColor = new paper.Color("black");
        this.path.visible = false;
        context.toolsLayer.addChild(this.path);
    }

    dispose() {
        this.deactivate();
        this.path.remove();
    }

    activate() {
        this.isActive = true;
        this.context.canvas.style.cursor = "crosshair";
        this.context.view.on("click", this.onMouseClick);
        this.context.view.on("mousemove", this.onMouseMove);
    }

    deactivate() {
        this.isActive = false;
        this.path.visible = false;
        this.context.canvas.style.cursor = "auto";
        this.context.view.off("click", this.onMouseClick);
        this.context.view.off("mousemove", this.onMouseMove);
        this.startNode = undefined;
    }

    onMouseMove = (p: PaperMouseEvent) => {
        this.path.lastSegment.point = p.point;
    };

    onMouseClick = (p: PaperMouseEvent) => {
        const hitNode = this.context.editor.getNodeAtPoint(p.point);
        if (hitNode) {
            if (this.startNode === undefined) {
                // Start a new connection
                this.startNode = hitNode;
                this.path.firstSegment.point = p.point;
                this.path.lastSegment.point = p.point;
                this.path.visible = true;
            } else {
                this.context.editor.createConnection(this.startNode.id, hitNode.id);
                this.startNode = undefined;
                this.path.visible = false;
            }
        }
    };
}
