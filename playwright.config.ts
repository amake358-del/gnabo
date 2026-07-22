import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  globalSetup: './tests/global-setup.ts',
  timeout: 90000,
  expect: {
    timeout: 15000,
    toHaveScreenshot: { maxDiffPixelRatio: 0.02 },
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 2 : 1,
  reporter: [
    ['html', { outputFolder: 'test-reports/html', open: 'never' }],
    ['list'],
    ['json', { outputFile: 'test-reports/results.json' }],
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on',
    video: 'on',
    screenshot: 'on',
    actionTimeout: 15000,
  },
  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        launchOptions: {
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors'],
        },
      },
      testMatch: '**/functional/**',
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
        launchOptions: {
          args: ['--ignore-certificate-errors'],
        },
      },
      testMatch: '**/functional/**',
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
      },
      testMatch: '**/functional/**',
    },
    // Mobile viewports
    {
      name: 'mobile-iphone-se',
      use: {
        ...devices['iPhone SE'],
        viewport: { width: 375, height: 667 },
      },
      testMatch: ['**/responsive/**', '**/mobile/**'],
    },
    {
      name: 'mobile-iphone-14',
      use: {
        ...devices['iPhone 14'],
        viewport: { width: 390, height: 844 },
      },
      testMatch: ['**/responsive/**', '**/mobile/**'],
    },
    {
      name: 'mobile-android-small',
      use: {
        ...devices['Pixel 5'],
        viewport: { width: 360, height: 800 },
      },
      testMatch: ['**/responsive/**', '**/mobile/**'],
    },
    {
      name: 'mobile-android-large',
      use: {
        ...devices['Galaxy S9+'],
        viewport: { width: 412, height: 915 },
      },
      testMatch: ['**/responsive/**', '**/mobile/**'],
    },
    // Tablet viewports
    {
      name: 'tablet-portrait',
      use: {
        ...devices['iPad Mini'],
        viewport: { width: 768, height: 1024 },
      },
      testMatch: ['**/responsive/**', '**/tablet/**'],
    },
    {
      name: 'tablet-landscape',
      use: {
        ...devices['iPad Mini landscape'],
        viewport: { width: 1024, height: 768 },
      },
      testMatch: ['**/responsive/**', '**/tablet/**'],
    },
    {
      name: 'tablet-large',
      use: {
        ...devices['iPad Pro 11'],
        viewport: { width: 820, height: 1180 },
      },
      testMatch: ['**/responsive/**', '**/tablet/**'],
    },
    {
      name: 'tablet-pro',
      use: {
        ...devices['iPad Pro 12.9'],
        viewport: { width: 1024, height: 1366 },
      },
      testMatch: ['**/responsive/**', '**/tablet/**'],
    },
    // Desktop viewports
    {
      name: 'desktop-small',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1366, height: 768 },
      },
      testMatch: ['**/responsive/**', '**/desktop/**'],
    },
    {
      name: 'desktop-medium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
      testMatch: ['**/responsive/**', '**/desktop/**'],
    },
    {
      name: 'desktop-large',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
      testMatch: ['**/responsive/**', '**/desktop/**'],
    },
    // PWA tests
    {
      name: 'pwa-chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        launchOptions: {
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors'],
        },
      },
      testMatch: '**/pwa/**',
    },
    {
      name: 'pwa-mobile',
      use: {
        ...devices['Pixel 5'],
        viewport: { width: 390, height: 844 },
      },
      testMatch: '**/pwa/**',
    },
    // Visual regression
    {
      name: 'visual-chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        launchOptions: {
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors'],
        },
      },
      testMatch: '**/visual/**',
    },
    {
      name: 'visual-mobile',
      use: {
        ...devices['iPhone 14'],
        viewport: { width: 390, height: 844 },
      },
      testMatch: '**/visual/**',
    },
    // Accessibility
    {
      name: 'a11y',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        launchOptions: {
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors'],
        },
      },
      testMatch: '**/accessibility/**',
    },
    // Performance
    {
      name: 'performance',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        launchOptions: {
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors'],
        },
      },
      testMatch: '**/performance/**',
    },
  ],
})
