import million from "million/compiler";

await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {};

export default million.next(config, { auto: { rsc: true }, mute: true });
