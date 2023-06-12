import { type UnMarkThis, type ThisReturn, unmark_this } from "~/code/bundle";
import type { Interpolate } from "~/code/funcs/interpolator";

export class InterFunc<O extends Interpolate, P> implements Interpolate {
    last_output: O | undefined = undefined;
    private last_props: P | undefined = undefined;
    private last_expected: number | undefined = undefined;
    private func: (props: P) => O;

    constructor(func: (props: P) => O) {
        this.func = func;
    }

    calc(props: P): O {
        const func_len = this.func.length;
        if (this.last_output) {
            if (this.last_props === props) return this.last_output;
            if (func_len === 0 && this.last_expected === 0)
                return this.last_output;
        }
        this.last_expected = func_len;
        this.last_props = props;
        const output = this.func(props);
        this.last_output = output;
        return output;
    }

    interpolate(t: number, to: UnMarkThis<this>): this & ThisReturn {
        if (!this.last_output) return to as this & ThisReturn;
        if (!to.last_output) return to as this & ThisReturn;
        const this_last_output = this.last_output;
        return new InterFunc((props: P) => {
            const to_O = to.calc(props);
            return unmark_this(this_last_output.interpolate(t, to_O));
        }) as this & ThisReturn;
    }

    to_start(): this & ThisReturn {
        if (!this.last_output) return this as this & ThisReturn;
        const to_start = this.last_output.to_start();
        return new InterFunc(() => unmark_this(to_start)) as this & ThisReturn;
    }

    can_interpolate(value: unknown): boolean {
        return value instanceof InterFunc;
    }

    similarity(to: UnMarkThis<this>): number {
        if (!this.last_output) return 0;
        if (!to.last_output) return 0;
        return this.last_output.similarity(to.last_output);
    }
}
