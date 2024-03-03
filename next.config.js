import million from "million/compiler";

await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  typescript: {
    ignoreBuildErrors: true,
  },
};

// export default million.next(config, { auto: { rsc: true }, mute: true });

// The reason that million has been disabled is a specific bug with million 3
// that breaks when using rsc. A patch already exists for 3.0.4, but it's not yet released.
export default config;
