import paper from "paper/dist/paper-core";
import { TypedEvent } from "./Emitter";

export type Dictionary<T> = { [key: string]: T };

export type PaperMouseEvent = paper.MouseEvent & { event: MouseEvent };
export type PaperKeyEvent = paper.KeyEvent & { event: KeyboardEvent };

export enum ConnectionType {
    Directed,
    Undirected,
}

export type ConnectionDirection = "from" | "to" | "none" | undefined;

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
    getConnection(nodeId: number, direction: ConnectionDirection): IConnection | undefined;
    removeConnection(connection: IConnection): void;

    dispose(): void;
}

export interface IConnection extends IEntity {
    readonly type: "link";
    fromNode: INode;
    toNode: INode;
    connectionType: ConnectionType;

    dispose(): void;

    isMatchingConnection(a: number, b: number, direction?: ConnectionDirection): boolean;
}

export interface ITool {
    isActive: boolean;
    activate(): void;
    deactivate(): void;
    dispose(): void;
}

export interface IEditor {
    createNode(p: paper.Point): INode;
    createConnection(nodeA: number, nodeB: number, directional: boolean): IConnection;

    removeEntityAtPoint(p: paper.Point): void;

    startEditing(entity: IEntity): void;

    getEntityAtPoint(point: paper.Point, hitTolerance: number): IEntity | undefined;
    getNodeAtPoint(point: paper.Point): INode | undefined;
    getConnectionAtPoint(point: paper.Point): IConnection | undefined;

    saveToDotFile(): void;
}
