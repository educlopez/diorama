import { existsSync } from "node:fs";

export function chromePath() {
  if (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
  return [
    "/usr/local/bin/google-chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser"
  ].find((p) => existsSync(p));
}

export function launchArgs(swift) {
  return swift
    ? ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--disable-gpu-sandbox"]
    : ["--ignore-gpu-blocklist", "--enable-webgl"];
}

export async function loadPlaywright() {
  try {
    return await import("playwright-core");
  } catch {
    throw new Error("playwright-core is missing: run npm ci --ignore-scripts in this skill folder");
  }
}

export async function openBrowser(swift) {
  const { chromium } = await loadPlaywright();
  const executablePath = chromePath();
  if (!executablePath) throw new Error("no Chrome or Chromium found: set CHROME_PATH");
  const browser = await chromium.launch({ executablePath, headless: true, args: launchArgs(swift) });
  return { browser, executablePath };
}
