import { ITool } from "../Types";
import { EditorContext } from "../Context";

export class ZoomTool implements ITool {
    isActive: boolean;
    context: EditorContext;

    constructor(context: EditorContext) {
        this.context = context;
        this.isActive = false;
    }

    dispose() {
        this.deactivate();
    }

    activate() {
        this.isActive = true;
        this.context.canvas.addEventListener("wheel", this.onWheel);
    }
    deactivate() {
        this.isActive = false;
        this.context.canvas.removeEventListener("wheel", this.onWheel);
    }

    onWheel = (e: WheelEvent) => {
        // Prevent zooming the browser window with Ctrl+Scroll. Only zoom the canvas.
        e.preventDefault();

        const view = this.context.view;

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
        this.context.view.zoom = 1;
    };
}
