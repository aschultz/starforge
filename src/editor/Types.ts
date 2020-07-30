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

export interface INode {
    readonly id: number;
    readonly MoveEvent: TypedEvent<INode, MoveEvent>;

    position: paper.Point;

    addConnection(connection: IConnection): void;
    getConnections(nodeId?: number): IConnection[];
    removeConnection(connection: IConnection): void;

    dispose(): void;
}

export interface IConnection {
    id: number;
    fromNode: INode;
    toNode: INode;
    type: ConnectionType;

    dispose(): void;
}
