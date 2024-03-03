export type EasingFunctionName =
    | "easeOutQuad"
    | "easeInOutQuad"
    | "easeInCubic"
    | "easeOutCubic"
    | "easeInOutCubic"
    | "easeOutQuart"
    | "easeInOutQuart"
    | "easeOutQuint"
    | "easeInOutQuint"
    | "easeOutSine"
    | "easeInOutSine"
    | "easeOutExpo"
    | "easeInOutExpo"
    | "easeOutCirc"
    | "easeInOutCirc"
    | "easeOutElastic"
    | "easeInOutElastic"
    | "easeOutBack"
    | "easeInOutBack"
    | "easeOutBounce"
    | "easeInOutBounce"
    | "easeInQuad"
    | "easeInQuart"
    | "easeInQuint"
    | "easeInSine"
    | "easeInExpo"
    | "easeInCirc"
    | "easeInElastic"
    | "easeInBack"
    | "easeInBounce"
    | "linear";

export const easingFunctions: Record<
    EasingFunctionName,
    (t: number) => number
> = {
    easeOutQuad: (t) => t * (2 - t),
    easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
    easeInCubic: (t) => t * t * t,
    easeInOutCubic: (t) =>
        t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) ** 2 + 1,
    easeOutQuart: (t) => 1 - --t * t * t * t,
    easeInOutQuart: (t) =>
        t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t,
    easeOutQuint: (t) => 1 + --t * t * t * t * t,
    easeInOutQuint: (t) =>
        t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t,
    easeOutSine: (t) => Math.sin(t * (Math.PI / 2)),
    easeInOutSine: (t) => 0.5 * (1 - Math.cos(t * Math.PI)),
    easeOutExpo: (t) => (t === 1 ? t : 1 - 2 ** (-10 * t)),
    easeInOutExpo: (t) =>
        t === 1
            ? t
            : t < 0.5
              ? 0.5 * 2 ** (20 * t - 10)
              : 1 - 0.5 * 2 ** (-20 * t + 10),
    easeOutCirc: (t) => Math.sqrt(1 - (t - 1) ** 2),
    easeInOutCirc: (t) =>
        t < 0.5
            ? 0.5 * (1 - Math.sqrt(1 - 4 * t ** 2))
            : 0.5 * (Math.sqrt(-(2 * t - 3) * (2 * t - 1)) + 1),
    easeOutElastic: (t) =>
        2 ** (-10 * t) * Math.sin(((t - 0.075) * (2 * Math.PI)) / 0.3) + 1,
    easeInOutElastic: (t) =>
        t < 0.5
            ? 0.5 *
              2 ** (20 * t - 10) *
              Math.sin(((20 * t - 11.125) * (2 * Math.PI)) / 4.5)
            : 0.5 *
              (2 ** (-20 * t + 10) *
                  Math.sin(((20 * t - 11.125) * (2 * Math.PI)) / 4.5) +
                  2),
    easeOutBack: (t) => 1 + --t * t * ((2.70158 + 1) * t + 2.70158),
    easeInOutBack: (t) =>
        t < 0.5
            ? 0.5 * 2 * t ** 2 * ((3.5949095 + 1) * 2 * t - 3.5949095)
            : 0.5 *
              ((2 * t - 2) ** 2 * ((3.5949095 + 1) * (t * 2 - 2) + 3.5949095) +
                  2),
    easeOutBounce: (t) => {
        const n1 = 7.5625;
        const d1 = 2.75;
        if (t < 1 / d1) {
            return n1 * t * t;
        }
        if (t < 2 / d1) {
            return n1 * (t -= 1.5 / d1) * t + 0.75;
        }
        if (t < 2.5 / d1) {
            return n1 * (t -= 2.25 / d1) * t + 0.9375;
        }
        return n1 * (t -= 2.625 / d1) * t + 0.984375;
    },
    easeInOutBounce: (t) => {
        const n1 = 7.5625;
        const d1 = 1;
        const d2 = 2.75;
        if (t < d1 / d2) {
            return 0.5 * n1 * t * t;
        }
        if (t < (2 * d1) / d2) {
            return 0.5 * n1 * (t -= 1.5 / d2) * t + 0.75;
        }
        if (t < (2.5 * d1) / d2) {
            return 0.5 * n1 * (t -= 2.25 / d2) * t + 0.9375;
        }
        return 0.5 * n1 * (t -= 2.625 / d2) * t + 0.984375;
    },
    easeInQuad: (t) => t * t,
    easeInQuart: (t) => t * t * t * t,
    easeInQuint: (t) => t * t * t * t * t,
    easeInSine: (t) => 1 - Math.cos((t * Math.PI) / 2),
    easeInExpo: (t) => (t === 0 ? 0 : 2 ** (10 * (t - 1))),
    easeInCirc: (t) => 1 - Math.sqrt(1 - t ** 2),
    easeInElastic: (t) =>
        Math.sin(((13 * Math.PI) / 2) * t) * 2 ** (10 * (t - 1)),
    easeInBack: (t) => t * t * ((2.70158 + 1) * t - 2.70158),
    easeInBounce: (t) => 1 - easingFunctions.easeOutBounce(1 - t),
    linear: (t) => t,
    easeOutCubic: (t) => --t * t * t + 1,
};
