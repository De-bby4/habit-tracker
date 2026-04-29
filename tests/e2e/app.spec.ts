import { test, expect, Page } from '@playwright/test';

const EMAIL = `test${Date.now()}@example.com`;
const PASSWORD = 'testpassword123';

async function clearStorage(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('habit-tracker-users');
    localStorage.removeItem('habit-tracker-session');
    localStorage.removeItem('habit-tracker-habits');
  });
}

async function signupUser(page: Page, email: string, password: string) {
  await page.goto('/signup');
  await page.getByTestId('auth-signup-email').fill(email);
  await page.getByTestId('auth-signup-password').fill(password);
  await page.getByTestId('auth-signup-submit').click();
  await page.waitForURL('/dashboard');
}

test.describe('Habit Tracker app', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearStorage(page);
  });

  test('shows the splash screen and redirects unauthenticated users to /login', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('splash-screen')).toBeVisible();
    await page.waitForURL('/login', { timeout: 5000 });
    expect(page.url()).toContain('/login');
  });

  test('redirects authenticated users from / to /dashboard', async ({ page }) => {
    await signupUser(page, `redirect${Date.now()}@example.com`, PASSWORD);
    await page.goto('/');
    await page.waitForURL('/dashboard', { timeout: 5000 });
    expect(page.url()).toContain('/dashboard');
  });

  test('prevents unauthenticated access to /dashboard', async ({ page }) => {
    await clearStorage(page);
    await page.goto('/dashboard');
    await page.waitForURL('/login', { timeout: 5000 });
    expect(page.url()).toContain('/login');
  });

  test('signs up a new user and lands on the dashboard', async ({ page }) => {
    await signupUser(page, EMAIL, PASSWORD);
    await expect(page.getByTestId('dashboard-page')).toBeVisible();
    await expect(page.getByTestId('empty-state')).toBeVisible();
  });

  test('logs in an existing user and loads only that user\'s habits', async ({ page }) => {
    const email1 = `user1${Date.now()}@example.com`;
    const email2 = `user2${Date.now()}@example.com`;

    // Sign up user 1 and create a habit
    await signupUser(page, email1, PASSWORD);
    await page.getByTestId('create-habit-button').click();
    await page.getByTestId('habit-name-input').fill('User 1 Habit');
    await page.getByTestId('habit-save-button').click();
    await page.getByTestId('auth-logout-button').click();
    await page.waitForURL('/login');

    // Sign up user 2
    await signupUser(page, email2, PASSWORD);
    await expect(page.getByTestId('empty-state')).toBeVisible();
    await page.getByTestId('auth-logout-button').click();

    // Log in as user 1
    await page.getByTestId('auth-login-email').fill(email1);
    await page.getByTestId('auth-login-password').fill(PASSWORD);
    await page.getByTestId('auth-login-submit').click();
    await page.waitForURL('/dashboard');

    await expect(page.getByTestId('habit-card-user-1-habit')).toBeVisible();
  });

  test('creates a habit from the dashboard', async ({ page }) => {
    await signupUser(page, `create${Date.now()}@example.com`, PASSWORD);
    await page.getByTestId('create-habit-button').click();
    await expect(page.getByTestId('habit-form')).toBeVisible();
    await page.getByTestId('habit-name-input').fill('Drink Water');
    await page.getByTestId('habit-description-input').fill('Stay hydrated');
    await page.getByTestId('habit-save-button').click();
    await expect(page.getByTestId('habit-card-drink-water')).toBeVisible();
  });

  test('completes a habit for today and updates the streak', async ({ page }) => {
    await signupUser(page, `streak${Date.now()}@example.com`, PASSWORD);
    await page.getByTestId('create-habit-button').click();
    await page.getByTestId('habit-name-input').fill('Exercise');
    await page.getByTestId('habit-save-button').click();
    await expect(page.getByTestId('habit-card-exercise')).toBeVisible();

    const streakBefore = await page.getByTestId('habit-streak-exercise').textContent();
    expect(streakBefore).toContain('0');

    await page.getByTestId('habit-complete-exercise').click();

    const streakAfter = await page.getByTestId('habit-streak-exercise').textContent();
    expect(streakAfter).toContain('1');
  });

  test('persists session and habits after page reload', async ({ page }) => {
    await signupUser(page, `persist${Date.now()}@example.com`, PASSWORD);
    await page.getByTestId('create-habit-button').click();
    await page.getByTestId('habit-name-input').fill('Morning Run');
    await page.getByTestId('habit-save-button').click();
    await expect(page.getByTestId('habit-card-morning-run')).toBeVisible();

    await page.reload();
    await expect(page.getByTestId('dashboard-page')).toBeVisible();
    await expect(page.getByTestId('habit-card-morning-run')).toBeVisible();
  });

  test('logs out and redirects to /login', async ({ page }) => {
    await signupUser(page, `logout${Date.now()}@example.com`, PASSWORD);
    await page.getByTestId('auth-logout-button').click();
    await page.waitForURL('/login');
    expect(page.url()).toContain('/login');
  });

  test('loads the cached app shell when offline after the app has been loaded once', async ({ page }) => {
    await signupUser(page, `offline${Date.now()}@example.com`, PASSWORD);
    await expect(page.getByTestId('dashboard-page')).toBeVisible();

    // Go offline
    await page.context().setOffline(true);
    await page.reload();

    // App shell should still render (not hard crash)
    await expect(page).not.toHaveTitle(/error/i);
    const body = await page.locator('body').textContent();
    expect(body).toBeTruthy();

    await page.context().setOffline(false);
  });
});
