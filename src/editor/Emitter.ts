export type EventHandler = (...args: any) => any;

type StringKey<T> = Extract<keyof T, string>;

type EventMap<K extends any> = {
    [P in StringKey<K>]: EventHandler;
};

export interface IEventEmitter<TEvents extends EventMap<TEvents>> {
    on<K extends StringKey<TEvents>>(eventName: K, handler: TEvents[K]): void;
    off<K extends StringKey<TEvents>>(eventName: K, handler: TEvents[K]): void;
    emit<K extends StringKey<TEvents>>(eventName: K, ...args: Parameters<TEvents[K]>): void;
}

export class EventEmitter {
    private _listeners = new Map<string, EventHandler[]>();

    //on<K extends StringKey<TEvents>>(eventName: K, handler: TEvents[K]): void;
    on(eventName: string, handler: EventHandler): void {
        const listeners = this._listeners.get(eventName) || [];
        this._listeners.set(eventName, [...listeners, handler]);
    }

    //off<K extends StringKey<TEvents>>(eventName: K, handler: TEvents[K]): void;
    off(eventName: string, handler: EventHandler): void {
        const listeners = this._listeners.get(eventName) || [];
        this._listeners.set(
            eventName,
            listeners.filter((f) => f !== handler)
        );
    }

    //emit<K extends StringKey<TEvents>>(eventName: K, ...args: Parameters<TEvents[K]>): void;
    emit(eventName: string, ...args: any) {
        const listeners = this._listeners.get(eventName);
        if (listeners) {
            for (const listener of listeners!) {
                listener(...args);
            }
        }
    }
}

export type TypedEventHandler<TSender, TEvent> = (sender: TSender, e: TEvent) => void;

export class TypedEvent<TSender, TEvent> {
    private _listeners: TypedEventHandler<TSender, TEvent>[] = [];

    on(handler: TypedEventHandler<TSender, TEvent>) {
        this._listeners.push(handler);
    }
    off(handler: TypedEventHandler<TSender, TEvent>) {
        this._listeners = this._listeners.filter((x) => x !== handler);
    }
    emit(sender: TSender, e: TEvent) {
        for (const handler of this._listeners) {
            handler(sender, e);
        }
    }
    clear() {
        this._listeners = [];
    }
}
