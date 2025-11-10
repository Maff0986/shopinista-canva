import path from "path";
import { fileURLToPath } from "url";
import { LimitChunkCountPlugin } from "webpack";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function buildConfig() {
  return {
    mode: "production",
    entry: "./src/app.js",
    output: {
      filename: "app.js",
      path: path.resolve(__dirname, "dist"),
      clean: true
    },
    plugins: [
      new LimitChunkCountPlugin({ maxChunks: 1 })
    ]
  };
}
