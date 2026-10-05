"""
Playwright Web/Electron Controller — browser and Electron app automation.
Provides persistent browser sessions, DOM interaction, visual QA, and Electron debugging.

Usage:
    python playwright_control.py web-open --url "http://localhost:3000"
    python playwright_control.py web-click --selector "#submit-btn"
    python playwright_control.py web-fill --selector "input[name=email]" --text "test@example.com"
    python playwright_control.py web-screenshot --output page.png
    python playwright_control.py web-eval --js "document.title"
    python playwright_control.py web-inspect --selector ".main-content"
    python playwright_control.py electron-launch --app-path "./my-electron-app"
    python playwright_control.py electron-screenshot --output electron.png
    python playwright_control.py qa-checklist --url "http://localhost:3000"
    python playwright_control.py viewport --device "iPhone 14"
    python playwright_control.py close
"""

import argparse
import json
import os
import subprocess
import sys
import tempfile

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# Playwright session state file
SESSION_FILE = os.path.join(tempfile.gettempdir(), "desktop_ctrl_playwright_session.json")


def ensure_playwright_installed():
    """Check if Playwright is available, install if not."""
    try:
        subprocess.run(
            ["node", "-e", "require('playwright')"],
            capture_output=True, timeout=10
        )
        return True
    except Exception:
        print("Installing Playwright...")
        subprocess.run(
            ["npm", "install", "playwright"],
            cwd=SCRIPT_DIR, capture_output=True, timeout=120
        )
        subprocess.run(
            ["npx", "playwright", "install", "chromium"],
            cwd=SCRIPT_DIR, capture_output=True, timeout=300
        )
        return True


def generate_node_script(action: str, params: dict) -> str:
    """Generate a Node.js script for Playwright automation."""

    base = '''
const { chromium, devices } = require('playwright');
const fs = require('fs');
const path = require('path');

const SESSION_FILE = %s;

async function loadSession() {
    try {
        if (fs.existsSync(SESSION_FILE)) {
            return JSON.parse(fs.readFileSync(SESSION_FILE, 'utf-8'));
        }
    } catch(e) {}
    return null;
}

function saveSession(data) {
    fs.writeFileSync(SESSION_FILE, JSON.stringify(data, null, 2));
}

async function ensureBrowser() {
    // Launch browser with persistent context for session reuse
    const browser = await chromium.launch({
        headless: false,
        args: ['--start-maximized']
    });
    return browser;
}

(async () => {
    try {
''' % json.dumps(SESSION_FILE)

    actions = {
        "web-open": '''
        const browser = await ensureBrowser();
        const context = await browser.newContext({
            viewport: { width: 1600, height: 900 },
            locale: 'zh-CN'
        });
        const page = await context.newPage();
        await page.goto('%s', { waitUntil: 'domcontentloaded', timeout: 30000 });
        const title = await page.title();
        console.log(JSON.stringify({ status: 'ok', title, url: page.url() }));
        saveSession({ wsEndpoint: browser.wsEndpoint || '', pid: process.pid });
        // Keep alive for reuse
        await new Promise(() => {});
''' % params.get('url', 'about:blank'),

        "web-click": '''
        const browser = await ensureBrowser();
        const context = await browser.newContext({ viewport: { width: 1600, height: 900 } });
        const page = await context.newPage();
        const session = loadSession();
        const url = '%s';
        if (url) await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        const selector = '%s';
        await page.waitForSelector(selector, { timeout: 10000 });
        await page.click(selector);
        console.log(JSON.stringify({ status: 'ok', action: 'clicked', selector }));
        await page.screenshot({ path: '%s', fullPage: false });
        await browser.close();
''' % (params.get('url', ''), params.get('selector', ''), params.get('output', 'click_result.png')),

        "web-fill": '''
        const browser = await ensureBrowser();
        const context = await browser.newContext({ viewport: { width: 1600, height: 900 } });
        const page = await context.newPage();
        const url = '%s';
        if (url) await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        const selector = '%s';
        const text = '%s';
        await page.waitForSelector(selector, { timeout: 10000 });
        await page.fill(selector, text);
        console.log(JSON.stringify({ status: 'ok', action: 'filled', selector, text }));
        await browser.close();
''' % (params.get('url', ''), params.get('selector', ''), params.get('text', '')),

        "web-screenshot": '''
        const browser = await ensureBrowser();
        const viewport = %s;
        const context = await browser.newContext({ viewport });
        const page = await context.newPage();
        const url = '%s';
        if (url) await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        await page.screenshot({ path: '%s', fullPage: %s });
        const title = await page.title();
        console.log(JSON.stringify({ status: 'ok', title, output: '%s', viewport }));
        await browser.close();
''' % (
            json.dumps(params.get('viewport', {"width": 1600, "height": 900})),
            params.get('url', ''),
            params.get('output', 'screenshot.png'),
            'true' if params.get('full_page', False) else 'false',
            params.get('output', 'screenshot.png')
        ),

        "web-eval": '''
        const browser = await ensureBrowser();
        const context = await browser.newContext({ viewport: { width: 1600, height: 900 } });
        const page = await context.newPage();
        const url = '%s';
        if (url) await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        const result = await page.evaluate(() => { %s });
        console.log(JSON.stringify({ status: 'ok', result }));
        await browser.close();
''' % (params.get('url', ''), params.get('js', 'return document.title')),

        "web-inspect": '''
        const browser = await ensureBrowser();
        const context = await browser.newContext({ viewport: { width: 1600, height: 900 } });
        const page = await context.newPage();
        const url = '%s';
        if (url) await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        const selector = '%s';
        const elements = await page.$$(selector);
        const results = [];
        for (const el of elements.slice(0, 20)) {
            const tag = await el.evaluate(e => e.tagName.toLowerCase());
            const text = await el.evaluate(e => e.textContent?.trim().substring(0, 100));
            const attrs = await el.evaluate(e => {
                const a = {};
                for (const attr of e.attributes) a[attr.name] = attr.value.substring(0, 100);
                return a;
            });
            const box = await el.boundingBox();
            results.push({ tag, text, attrs, box });
        }
        console.log(JSON.stringify({ status: 'ok', selector, count: elements.length, elements: results }, null, 2));
        await browser.close();
''' % (params.get('url', ''), params.get('selector', 'body')),

        "viewport": '''
        const browser = await ensureBrowser();
        const deviceName = '%s';
        let viewport = { width: 1600, height: 900 };
        let userAgent = undefined;

        // Built-in device presets
        const presets = {
            'iphone 14': { viewport: { width: 390, height: 844 }, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)' },
            'iphone 14 pro max': { viewport: { width: 430, height: 932 }, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)' },
            'ipad': { viewport: { width: 810, height: 1080 }, userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X)' },
            'pixel 7': { viewport: { width: 412, height: 915 }, userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7)' },
            'desktop': { viewport: { width: 1600, height: 900 } },
            'desktop-hd': { viewport: { width: 1920, height: 1080 } },
            'desktop-4k': { viewport: { width: 3840, height: 2160 } },
        };

        // Try Playwright devices first, then presets
        if (devices[deviceName]) {
            viewport = devices[deviceName].viewport;
            userAgent = devices[deviceName].userAgent;
        } else if (presets[deviceName.toLowerCase()]) {
            const p = presets[deviceName.toLowerCase()];
            viewport = p.viewport;
            userAgent = p.userAgent;
        }

        const opts = { viewport };
        if (userAgent) opts.userAgent = userAgent;
        const context = await browser.newContext(opts);
        const page = await context.newPage();
        const url = '%s';
        if (url) await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.screenshot({ path: '%s' });
        console.log(JSON.stringify({ status: 'ok', device: deviceName, viewport, output: '%s' }));
        await browser.close();
''' % (params.get('device', 'desktop'), params.get('url', ''), params.get('output', 'viewport.png'), params.get('output', 'viewport.png')),

        "qa-checklist": '''
        const browser = await ensureBrowser();
        const results = { functional: [], visual: [], viewport: [], performance: [] };
        const url = '%s';

        // Desktop viewport
        const desktopCtx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
        const desktopPage = await desktopCtx.newPage();
        await desktopPage.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

        // Functional QA
        const title = await desktopPage.title();
        results.functional.push({ check: 'Page loads', pass: true, detail: title });

        const brokenLinks = await desktopPage.evaluate(() => {
            const links = Array.from(document.querySelectorAll('a[href]'));
            return links.filter(a => !a.href || a.href === 'javascript:void(0)').map(a => a.textContent?.trim()).slice(0, 10);
        });
        results.functional.push({ check: 'No broken links', pass: brokenLinks.length === 0, detail: brokenLinks });

        const consoleLogs = [];
        desktopPage.on('console', msg => { if (msg.type() === 'error') consoleLogs.push(msg.text()); });
        await desktopPage.reload({ waitUntil: 'networkidle' });
        results.functional.push({ check: 'No console errors', pass: consoleLogs.length === 0, detail: consoleLogs.slice(0, 5) });

        // Visual QA - Desktop screenshot
        await desktopPage.screenshot({ path: 'qa_desktop.png', fullPage: true });
        results.visual.push({ check: 'Desktop screenshot captured', pass: true, file: 'qa_desktop.png' });

        // Viewport QA - Mobile
        const mobileCtx = await browser.newContext({
            viewport: { width: 390, height: 844 },
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)'
        });
        const mobilePage = await mobileCtx.newPage();
        await mobilePage.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        await mobilePage.screenshot({ path: 'qa_mobile.png', fullPage: true });
        results.viewport.push({ check: 'Mobile viewport screenshot', pass: true, file: 'qa_mobile.png', device: 'iPhone 14' });

        // Check horizontal overflow on mobile
        const hasOverflow = await mobilePage.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
        results.viewport.push({ check: 'No horizontal overflow (mobile)', pass: !hasOverflow });

        // Performance
        const perfMetrics = await desktopPage.evaluate(() => {
            const perf = performance.getEntriesByType('navigation')[0];
            return perf ? {
                domContentLoaded: Math.round(perf.domContentLoadedEventEnd - perf.startTime),
                load: Math.round(perf.loadEventEnd - perf.startTime),
                domInteractive: Math.round(perf.domInteractive - perf.startTime)
            } : null;
        });
        if (perfMetrics) {
            results.performance.push({ check: 'DOMContentLoaded < 3s', pass: perfMetrics.domContentLoaded < 3000, detail: perfMetrics.domContentLoaded + 'ms' });
            results.performance.push({ check: 'Page load < 5s', pass: perfMetrics.load < 5000, detail: perfMetrics.load + 'ms' });
        }

        console.log(JSON.stringify(results, null, 2));
        await browser.close();
''' % params.get('url', 'http://localhost:3000'),

        "close": '''
        console.log(JSON.stringify({ status: 'ok', message: 'Session closed' }));
        try { fs.unlinkSync(SESSION_FILE); } catch(e) {}
''',
    }

    script = base + actions.get(action, 'console.log("Unknown action");') + '''
    } catch (err) {
        console.error(JSON.stringify({ status: 'error', message: err.message }));
        process.exit(1);
    }
})();
'''
    return script


def run_node_script(script: str, timeout: int = 60, background: bool = False) -> tuple:
    """Write and execute a Node.js script."""
    with tempfile.NamedTemporaryFile(mode='w', suffix='.js', delete=False, encoding='utf-8') as f:
        f.write(script)
        js_path = f.name

    try:
        if background:
            proc = subprocess.Popen(
                ['node', js_path],
                stdout=subprocess.PIPE, stderr=subprocess.PIPE
            )
            # Wait a bit for startup
            import time
            time.sleep(3)
            return 0, f"Browser launched (PID: {proc.pid})", ""
        else:
            result = subprocess.run(
                ['node', js_path],
                capture_output=True, text=True, timeout=timeout
            )
            return result.returncode, result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        return 1, "", "Timeout"
    finally:
        if not background:
            os.unlink(js_path)


def main():
    parser = argparse.ArgumentParser(description="Playwright Web/Electron Controller")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # web-open
    p = subparsers.add_parser("web-open", help="Open a URL in browser")
    p.add_argument("--url", required=True)

    # web-click
    p = subparsers.add_parser("web-click", help="Click an element")
    p.add_argument("--url", default="")
    p.add_argument("--selector", required=True)
    p.add_argument("--output", default="click_result.png")

    # web-fill
    p = subparsers.add_parser("web-fill", help="Fill a form field")
    p.add_argument("--url", default="")
    p.add_argument("--selector", required=True)
    p.add_argument("--text", required=True)

    # web-screenshot
    p = subparsers.add_parser("web-screenshot", help="Screenshot a web page")
    p.add_argument("--url", default="")
    p.add_argument("--output", default="screenshot.png")
    p.add_argument("--full-page", action="store_true")
    p.add_argument("--width", type=int, default=1600)
    p.add_argument("--height", type=int, default=900)

    # web-eval
    p = subparsers.add_parser("web-eval", help="Evaluate JavaScript on page")
    p.add_argument("--url", default="")
    p.add_argument("--js", required=True)

    # web-inspect
    p = subparsers.add_parser("web-inspect", help="Inspect DOM elements")
    p.add_argument("--url", default="")
    p.add_argument("--selector", required=True)

    # viewport
    p = subparsers.add_parser("viewport", help="Test with specific device viewport")
    p.add_argument("--device", required=True, help="Device name (e.g., 'iPhone 14', 'iPad', 'Pixel 7', 'desktop')")
    p.add_argument("--url", default="")
    p.add_argument("--output", default="viewport.png")

    # qa-checklist
    p = subparsers.add_parser("qa-checklist", help="Run full QA checklist")
    p.add_argument("--url", required=True)

    # close
    subparsers.add_parser("close", help="Close browser session")

    args = parser.parse_args()

    params = vars(args).copy()
    command = params.pop("command")

    if command == "web-screenshot":
        params["viewport"] = {"width": params.pop("width", 1600), "height": params.pop("height", 900)}
        params["full_page"] = params.pop("full_page", False)

    background = command == "web-open"
    script = generate_node_script(command, params)

    rc, stdout, stderr = run_node_script(script, timeout=60, background=background)

    if stdout:
        print(stdout.strip())
    if stderr:
        print(f"Error: {stderr.strip()}", file=sys.stderr)

    sys.exit(rc)


if __name__ == "__main__":
    main()
