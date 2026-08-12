const { spawn } = require("node:child_process");
const path = require("node:path");

const execPath = process.env.npm_execpath || "";
const [name, ...args] = process.argv.slice(2);

if (!/pnpm/.test(execPath)) {
  if (name) {
    console.error(
      `Este proyecto solo se ejecuta con pnpm.\nUsa: pnpm ${name} ${args.join(" ")}`
    );
  } else {
    console.error("Este proyecto solo se instala con pnpm. Usa: pnpm install");
  }
  process.exit(1);
}

if (!name) process.exit(0);

const bin = path.join(
  __dirname,
  "..",
  "node_modules",
  ".bin",
  process.platform === "win32" ? `${name}.cmd` : name
);

const child = spawn(bin, args, {
  stdio: "inherit",
  shell: process.platform === "win32",
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});