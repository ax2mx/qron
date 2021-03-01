import livereload from 'rollup-plugin-livereload';
import htmlTemplate from 'rollup-plugin-generate-html-template';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from "rollup-plugin-terser";
import analyze from 'rollup-plugin-analyzer';
import copy from "rollup-plugin-copy-assets";

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

module.exports = {
  input: 'src/index.js',
  output: {
    file: 'docs/bundle.js',
    format: 'iife'
  },
  plugins: [
    !production && livereload(),
    htmlTemplate({
      template: 'src/index.html',
      target: 'index.html',
    }),
    // tells Rollup how to find p5 in node_modules
    resolve(),
    // converts p5 to ES modules
    commonjs(),
    // css({
    //   raw: false,
    //   minified: 'export/custom.min.css',
    // }),
    copy({
      assets: [
        // You can include directories
        "src/images",
        "src/css",
      ],
    }),
    production && terser(), // minify, but only in production
    production && analyze() // analyze, but only in production
  ],
  watch: {
    exclude: 'node_modules/**',
    include: 'src/**'
  }
};
