const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "jsdom",
  transform: {
    ...tsJestTransformCfg,
  },
  moduleNameMapper: {
    // This maps the "@" alias to the project root for Jest
    "^@/(.*)$": "<rootDir>/$1",
  },
};
