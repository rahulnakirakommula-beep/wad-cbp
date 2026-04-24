import { expect, test } from '@playwright/test';

const activeTags = [
  { _id: '1', tagId: 'frontend', displayName: 'Frontend', category: 'skill', isActive: true },
  { _id: '2', tagId: 'backend', displayName: 'Backend', category: 'skill', isActive: true },
  { _id: '3', tagId: 'machine-learning', displayName: 'Machine Learning', category: 'skill', isActive: true },
  { _id: '4', tagId: 'cybersecurity', displayName: 'Cybersecurity', category: 'skill', isActive: true },
  { _id: '5', tagId: 'cloud', displayName: 'Cloud', category: 'skill', isActive: true },
  { _id: '6', tagId: 'hackathons', displayName: 'Hackathons', category: 'sector', isActive: true }
];

const feedSections = {
  closingSoon: [
    {
      _id: 'listing-close-1',
      orgName: 'Acme Labs',
      title: 'Frontend Internship',
      description: 'React internship',
      type: 'internship',
      externalUrl: 'https://example.com/frontend',
      sourceId: 'source-1',
      status: 'open',
      priority: 'high',
      stipendType: 'paid',
      locationType: 'remote',
      domainTags: ['frontend'],
      timeline: { deadline: '2026-05-01T00:00:00.000Z' }
    }
  ],
  recommended: [
    {
      _id: 'listing-rec-1',
      orgName: 'Blue Labs',
      title: 'Recommended AI Fellowship',
      description: 'AI fellowship',
      type: 'fellowship',
      externalUrl: 'https://example.com/ai',
      sourceId: 'source-1',
      status: 'open',
      priority: 'dont-miss',
      stipendType: 'paid',
      locationType: 'remote',
      domainTags: ['machine-learning', 'frontend'],
      timeline: { deadline: '2026-05-20T00:00:00.000Z' }
    }
  ],
  dontMiss: [
    {
      _id: 'listing-miss-1',
      orgName: 'Rocket Club',
      title: 'Hackathon Special',
      description: 'Urgent opportunity',
      type: 'hackathon',
      externalUrl: 'https://example.com/hack',
      sourceId: 'source-1',
      status: 'open',
      priority: 'dont-miss',
      stipendType: 'unknown',
      locationType: 'hybrid',
      domainTags: ['hackathons'],
      timeline: { deadline: '2026-05-03T00:00:00.000Z' }
    }
  ],
  browseAll: []
};

const browsePage1 = {
  listings: [
    {
      _id: 'browse-1',
      orgName: 'Acme Labs',
      title: 'Remote Internship',
      description: 'Remote role',
      type: 'internship',
      externalUrl: 'https://example.com/browse-1',
      sourceId: 'source-1',
      status: 'open',
      priority: 'high',
      stipendType: 'paid',
      locationType: 'remote',
      domainTags: ['frontend'],
      timeline: { deadline: '2026-05-10T00:00:00.000Z' }
    }
  ],
  totalCount: 2,
  totalPages: 2,
  currentPage: 1
};

const browsePage2 = {
  listings: [
    {
      _id: 'browse-2',
      orgName: 'Orbit Systems',
      title: 'Remote Internship 2',
      description: 'Second remote role',
      type: 'internship',
      externalUrl: 'https://example.com/browse-2',
      sourceId: 'source-1',
      status: 'open',
      priority: 'normal',
      stipendType: 'paid',
      locationType: 'remote',
      domainTags: ['frontend'],
      timeline: { deadline: '2026-05-18T00:00:00.000Z' }
    }
  ],
  totalCount: 2,
  totalPages: 2,
  currentPage: 2
};

const profileResponse = {
  _id: 'user-1',
  name: 'Student Tester',
  email: 'student@test.edu',
  role: 'student',
  status: 'active',
  onboardingComplete: true,
  profile: {
    name: 'Student Tester',
    branch: 'CSE',
    currentYear: 2
  },
  interests: ['frontend', 'backend'],
  notificationPrefs: {
    deadlineReminders: true,
    seasonAlerts: true,
    dontMissAlerts: true,
    cancellationAlerts: true,
    emailEnabled: true
  },
  isEmailVerified: true
};

const notificationsPage = {
  notifications: [
    {
      _id: 'notif-1',
      type: 'deadline_3day',
      status: 'unread',
      createdAt: new Date().toISOString(),
      payload: {
        title: 'Frontend Internship closes in 3 days',
        message: "Don't forget to apply.",
        actionUrl: '/app/listing/listing-close-1'
      }
    },
    {
      _id: 'notif-2',
      type: 'season_open',
      status: 'read',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      payload: {
        title: 'AI season is opening',
        message: 'Listings in AI are starting to open.',
        actionUrl: '/app/listing/listing-rec-1'
      }
    }
  ],
  totalPages: 1,
  currentPage: 1,
  totalCount: 2
};

async function mockAppApis(page) {
  let notificationsState = notificationsPage.notifications.map((notification) => ({ ...notification }));

  await page.route('**/api/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        _id: 'user-1',
        name: 'Student Tester',
        email: 'student@test.edu',
        role: 'student',
        status: 'active',
        isEmailVerified: true,
        profile: { branch: 'CSE', currentYear: 2 },
        interests: [],
        notificationPrefs: profileResponse.notificationPrefs,
        onboardingComplete: false,
        token: 'fake-jwt-token'
      })
    });
  });

  await page.route('**/api/tags?active=true', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(activeTags) });
  });

  await page.route('**/api/user/onboarding', async (route) => {
    const request = route.request();
    const payload = JSON.parse(request.postData() || '{}');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        _id: 'user-1',
        name: 'Student Tester',
        email: 'student@test.edu',
        role: 'student',
        status: 'active',
        onboardingComplete: true,
        isEmailVerified: true,
        profile: { name: 'Student Tester', branch: payload.branch, currentYear: payload.currentYear },
        interests: payload.interests,
        notificationPrefs: payload.notificationPrefs
      })
    });
  });

  await page.route('**/api/feed/sections', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(feedSections) });
  });

  await page.route('**/api/feed/browse**', async (route) => {
    const url = new URL(route.request().url());
    const pageNumber = url.searchParams.get('page');
    const body = pageNumber === '2' ? browsePage2 : browsePage1;
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });

  await page.route('**/api/activity/summary', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ saved: 2, applied: 1, missed: 0 })
    });
  });

  await page.route('**/api/activity', async (route) => {
    if (route.request().method() === 'POST') {
      const payload = JSON.parse(route.request().postData() || '{}');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          _id: `activity-${payload.listingId}`,
          listingId: payload.listingId,
          status: payload.status
        })
      });
      return;
    }

    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
  });

  await page.route('**/api/notifications/unread-count', async (route) => {
    const unreadCount = notificationsState.filter((notification) => notification.status === 'unread').length;
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ count: unreadCount }) });
  });

  await page.route('**/api/notifications**', async (route) => {
    const request = route.request();
    if (request.method() === 'GET') {
      const url = new URL(request.url());
      const status = url.searchParams.get('status') || 'all';
      const filtered = status === 'unread'
        ? notificationsState.filter((notification) => notification.status === 'unread')
        : notificationsState;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          notifications: filtered,
          totalPages: 1,
          currentPage: 1,
          totalCount: filtered.length
        })
      });
      return;
    }
    await route.continue();
  });

  await page.route('**/api/notifications/read-all', async (route) => {
    notificationsState = notificationsState.map((notification) => ({ ...notification, status: 'read' }));
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'ok' }) });
  });

  await page.route('**/api/notifications/*/read', async (route) => {
    const id = route.request().url().split('/').slice(-2)[0];
    notificationsState = notificationsState.map((notification) => (
      notification._id === id ? { ...notification, status: 'read' } : notification
    ));
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'ok' }) });
  });

  await page.route('**/api/user/profile**', async (route) => {
    const request = route.request();
    if (request.method() === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(profileResponse) });
      return;
    }

    const payload = JSON.parse(request.postData() || '{}');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ...profileResponse,
        name: payload.name ?? profileResponse.name,
        profile: {
          ...profileResponse.profile,
          name: payload.name ?? profileResponse.profile.name,
          branch: payload.branch ?? profileResponse.profile.branch,
          currentYear: payload.currentYear ?? profileResponse.profile.currentYear
        },
        interests: payload.interests ?? profileResponse.interests,
        notificationPrefs: payload.notificationPrefs ?? profileResponse.notificationPrefs
      })
    });
  });

  await page.route('**/api/user/password', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'ok' }) });
  });
}

test.describe('COA browser flows', () => {
  test('student login completes onboarding and reaches feed', async ({ page }) => {
    await mockAppApis(page);

    await page.goto('/login');
    await page.locator('input[type="email"]').fill('student@test.edu');
    await page.locator('input[type="password"]').fill('Password123');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page).toHaveURL(/\/onboarding$/);
    await expect(page.getByText('Academic Focus')).toBeVisible();

    await page.locator('input[type="number"]').fill('2');
    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(page.getByText('Focus Domains')).toBeVisible();
    for (const tag of ['Frontend', 'Backend', 'Machine Learning', 'Cybersecurity', 'Cloud']) {
      await page.getByText(tag, { exact: true }).click();
    }

    await expect(page.getByText('5 of 5 selected')).toBeVisible();
    await expect(page.getByText('Maximum of 5 reached. Remove one to select another focus area.')).toBeVisible();
    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(page.getByText('Notification Preferences')).toBeVisible();
    await page.getByText('Email notifications').click();
    await page.getByRole('button', { name: 'Enter Platform' }).click();

    await expect(page).toHaveURL(/\/app\/feed$/);
    await expect(page.getByText('Browse All')).toBeVisible();
  });

  test('feed browse filters persist in URL and load more appends results', async ({ page }) => {
    await mockAppApis(page);

    await page.addInitScript(() => {
      localStorage.setItem('coa_token', 'fake-jwt-token');
      localStorage.setItem('coa_user', JSON.stringify({
        _id: 'user-1',
        name: 'Student Tester',
        email: 'student@test.edu',
        role: 'student',
        status: 'active',
        isEmailVerified: true,
        profile: { branch: 'CSE', currentYear: 2 },
        interests: ['frontend'],
        notificationPrefs: {
          deadlineReminders: true,
          seasonAlerts: true,
          dontMissAlerts: true,
          cancellationAlerts: true,
          emailEnabled: true
        },
        onboardingComplete: true
      }));
    });

    await page.goto('/app/feed?domain=Development&type=internship');
    await expect(page.getByText('Remote Internship')).toBeVisible();

    await expect(page).toHaveURL(/domain=Development/);
    await expect(page).toHaveURL(/type=internship/);

    await page.reload();
    await expect(page).toHaveURL(/domain=Development/);
    await expect(page.getByText('Remote Internship')).toBeVisible();

    await page.getByRole('button', { name: 'Load more' }).click();
    await expect(page.getByText('Remote Internship 2')).toBeVisible();
  });

  test('notifications and settings flows behave in browser', async ({ page }) => {
    await mockAppApis(page);

    await page.addInitScript(() => {
      localStorage.setItem('coa_token', 'fake-jwt-token');
      localStorage.setItem('coa_user', JSON.stringify({
        _id: 'user-1',
        name: 'Student Tester',
        email: 'student@test.edu',
        role: 'student',
        status: 'active',
        isEmailVerified: true,
        profile: { branch: 'CSE', currentYear: 2 },
        interests: ['frontend', 'backend'],
        notificationPrefs: {
          deadlineReminders: true,
          seasonAlerts: true,
          dontMissAlerts: true,
          cancellationAlerts: true,
          emailEnabled: true
        },
        onboardingComplete: true
      }));
    });

    await page.goto('/app/notifications');
    await expect(page.getByRole('heading', { name: 'Notifications' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Unread/ })).toBeVisible();

    await page.goto('/app/settings');
    await expect(page.getByText('Settings')).toBeVisible();
    await page.locator('input').first().fill('Student Tester Updated');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Profile updated')).toBeVisible();

    await page.getByText('Backend', { exact: true }).click();
    await expect(page.getByText('Saving…')).toBeVisible();

    await page.getByText('Email enabled').click();
    await page.getByRole('button', { name: 'Change Password' }).click();
    await page.locator('input[type="password"]').nth(0).fill('Password123');
    await page.locator('input[type="password"]').nth(1).fill('NewPassword123');
    await page.locator('input[type="password"]').nth(2).fill('NewPassword123');
    await page.getByRole('button', { name: 'Update Password' }).click();
    await expect(page.getByText('Password changed successfully')).toBeVisible();
  });
});
