export class ArrayMap<K, V> extends Map<K, Array<V>> {
    constructor() {
        super();
    }

    push(key: K, value: V): void {
        const arr = this.get(key);
        if (arr) {
            arr.push(value);
        } else {
            this.set(key, [value]);
        }
    }

    pop(key: K): V | undefined {
        const arr = this.get(key);
        return arr ? arr.pop() : undefined;
    }

    shift(key: K): V | undefined {
        const arr = this.get(key);
        return arr ? arr.shift() : undefined;
    }

    length(key: K): number {
        const arr = this.get(key);
        return arr ? arr.length : 0;
    }

    last(key: K): V | undefined {
        const arr = this.get(key);
        return arr && arr.length > 0 ? arr[arr.length - 1] : undefined;
    }

    extend(key: K, values: V[]): void {
        const arr = this.get(key);
        if (arr) {
            arr.push(...values);
        } else {
            this.set(key, values);
        }
    }
}
