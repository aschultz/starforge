import { ITool, PaperMouseEvent } from "../Types";
import { EditorContext } from "../Context";

export class MoveTool implements ITool {
    isActive: boolean;
    isDragging: boolean;
    context: EditorContext;

    constructor(context: EditorContext) {
        this.context = context;
        this.isActive = false;
        this.isDragging = false;
    }

    dispose() {
        this.deactivate();
    }

    activate() {
        this.isActive = true;
        this.context.canvas.style.cursor = "pointer";
        this.context.view.on("mousedrag", this.onMouseDrag);
        this.context.view.on("mouseup", this.onMouseUp);
    }
    deactivate() {
        this.isActive = false;
        this.isDragging = false;
        this.context.canvas.style.cursor = "auto";
        this.context.view.off("mousedrag", this.onMouseDrag);
        this.context.view.off("mouseup", this.onMouseUp);
    }

    onMouseDrag = (e: PaperMouseEvent) => {
        const context = this.context;
        this.isDragging = true;

        // Move the camera around
        const view = context.view;
        const movement = new context.paper.Point(e.event.movementX, e.event.movementY);
        const correctedMove = movement.divide(view.zoom);

        view.center = view.center.subtract(correctedMove);
    };

    onMouseUp = (e: PaperMouseEvent) => {
        this.isDragging = false;
    };
}
