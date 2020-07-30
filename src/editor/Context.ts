import paperLib from "paper/dist/paper-core";
import { InteractionMode } from "./Types";

export class EditorContext {
    canvas: HTMLCanvasElement;
    paper: paper.PaperScope;
    project: paper.Project;
    view: paper.View;

    backgroundLayer: paper.Layer;
    connectionsLayer: paper.Layer;
    nodesLayer: paper.Layer;

    interactionMode = InteractionMode.Move;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;

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
    }

    dispose() {
        this.project.remove();
    }
}
