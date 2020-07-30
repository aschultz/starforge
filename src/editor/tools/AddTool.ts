import { ITool, PaperMouseEvent } from "../Types";
import { EditorContext } from "../Context";

export class AddTool implements ITool {
    isActive: boolean;
    context: EditorContext;

    constructor(context: EditorContext) {
        this.context = context;
        this.isActive = true;
    }

    dispose() {
        this.deactivate();
    }

    activate() {
        this.isActive = true;
        this.context.canvas.style.cursor = "cell";
        this.context.view.on("click", this.onMouseClick);
    }
    deactivate() {
        this.isActive = false;
        this.context.canvas.style.cursor = "auto";
        this.context.view.off("click", this.onMouseClick);
    }

    onMouseClick = (e: PaperMouseEvent) => {
        if (e.event.button === 0) {
            this.context.editor.createNode(e.point);
        }
    };
}
