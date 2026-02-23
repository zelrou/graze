// https://playwright.dev/docs/chrome-extensions
// https://github.com/wxt-dev/examples/blob/main/examples/playwright-e2e-testing/e2e/fixtures.ts
import { test as base, chromium, type BrowserContext } from "@playwright/test";
import path from "path";
const isDevEnv = process.env.DEV
const outputPath = isDevEnv 
  ? ".output/chrome-mv3-dev"
  : '.output/chrome-mv3'

const pathToExtension = path.resolve(outputPath);
console.log('testing dir:', pathToExtension)

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
}>({
  context: async ({ }, use) => {
    // https://playwright.dev/docs/api/class-browsertype#browser-type-launch-persistent-context
    const context = await chromium.launchPersistentContext("", {
      headless: false,
      slowMo:  isDevEnv ? 1000 : undefined,
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
        `--disable-gpu`,
      ],
    });
    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    let background: { url(): string };

    if (pathToExtension.endsWith("-mv3")
      || pathToExtension.endsWith("-mv3-dev")) {
      [background] = context.serviceWorkers();
      if (!background)
        background = await context.waitForEvent("serviceworker");
    } else {
      [background] = context.backgroundPages();
      if (!background)
        background = await context.waitForEvent("backgroundpage");
    }
    const extensionId = background.url().split("/")[2];
    await use(extensionId);
  },
});
export const expect = test.expect;
