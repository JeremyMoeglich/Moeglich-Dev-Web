import million from "million/compiler";

await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
    typescript: {
        ignoreBuildErrors: true,
    },
};

export default million.next(config, { auto: { rsc: true }, mute: true });
