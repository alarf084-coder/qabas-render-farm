import { Config } from "@remotion/cli/config";

// Required for reliable WebGL2 / Three.js rendering in headless Linux & cloud environments
Config.setChromiumOpenGlRenderer("swangle");
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
