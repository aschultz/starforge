import paperLib from "paper/dist/paper-core";
import { InteractionMode, IEditor, PaperMouseEvent } from "./Types";

export class EditorContext {
    editor: IEditor;
    canvas: HTMLCanvasElement;
    paper: paper.PaperScope;
    project: paper.Project;
    view: paper.View;

    backgroundLayer: paper.Layer;
    connectionsLayer: paper.Layer;
    nodesLayer: paper.Layer;
    toolsLayer: paper.Layer;

    interactionMode: InteractionMode;
    mousePosition: paper.Point;

    constructor(canvas: HTMLCanvasElement, editor: IEditor) {
        this.canvas = canvas;
        this.editor = editor;

        const paper = (this.paper = new paperLib.PaperScope());
        paper.settings.insertItems = false;
        paper.settings.handleSize = 8;
        paper.settings.hitTolerance = 0;

        const project = (this.project = new paper.Project(canvas));

        this.view = this.project.view;
        this.view.center = new paper.Point(0, 0);

        this.backgroundLayer = project.addLayer(new paper.Layer());
        this.connectionsLayer = project.addLayer(new paper.Layer());
        this.nodesLayer = project.addLayer(new paper.Layer());
        this.toolsLayer = project.addLayer(new paper.Layer());

        this.interactionMode = InteractionMode.Move;
        this.mousePosition = new paper.Point(0, 0);
        this.view.on("mousemove", this.onMouseMove);
    }

    dispose() {
        this.project.remove();
    }

    onMouseMove = (e: PaperMouseEvent) => {
        this.mousePosition = e.point;
    };
}
