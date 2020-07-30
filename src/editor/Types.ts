import paper from "paper/dist/paper-core";
import { TypedEvent } from "./Emitter";

export type Dictionary<T> = { [key: string]: T };

export type PaperMouseEvent = paper.MouseEvent & { event: MouseEvent };
export type PaperKeyEvent = paper.KeyEvent & { event: KeyboardEvent };

export enum ConnectionType {
    Directed,
    Bidirectional,
}

export enum InteractionMode {
    Move,
    Add,
    Connect,
}

export type MoveEvent = {
    newPosition: paper.Point;
};

export interface IEntity {
    readonly id: number;
    readonly type: string;
}

export interface INode extends IEntity {
    readonly type: "node";
    readonly MoveEvent: TypedEvent<INode, MoveEvent>;

    position: paper.Point;

    addConnection(connection: IConnection): void;
    getConnections(nodeId?: number): IConnection[];
    removeConnection(connection: IConnection): void;

    dispose(): void;
}

export interface IConnection extends IEntity {
    readonly type: "link";
    fromNode: INode;
    toNode: INode;
    connectionType: ConnectionType;

    dispose(): void;
}

export interface ITool {
    isActive: boolean;
    activate(): void;
    deactivate(): void;
    dispose(): void;
}

export interface IEditor {
    createNode(p: paper.Point): void;
    //removeNode(p: paper.Point): void;
    getNodeAtPoint(point: paper.Point): INode | undefined;

    createConnection(nodeA: number, nodeB: number): void;
}
