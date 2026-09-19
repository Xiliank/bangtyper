import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const releaseDir = path.join(root, "release");
const src = path.join(releaseDir, "win-unpacked");
const out = path.join(releaseDir, "bangtyper-win-unpacked.zip");

if (!fs.existsSync(src)) {
  console.error("Missing", src, "— run pack:win:dir first");
  process.exit(1);
}

if (fs.existsSync(out)) fs.unlinkSync(out);

const zip = spawnSync("zip", ["-r", "-q", out, "win-unpacked"], {
  cwd: releaseDir,
  stdio: "inherit",
});

if (zip.status !== 0) {
  console.error("zip failed; is the zip package installed?");
  process.exit(1);
}

const mb = (fs.statSync(out).size / 1024 / 1024).toFixed(1);
console.log(`Wrote ${out} (${mb} MB)`);
