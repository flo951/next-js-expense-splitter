const baseUrl = 'http://localhost:3000'

// E2E Test Login, Create Event, Create 2 People, Create 2 Expenses
test('create user, create event, add people, add expenses', async () => {
  await page.goto(`${baseUrl}/`)
  await expect(page).toMatch('Welcome to Splitify')
  await expect(page).toClick('[data-test-id="sign-up"]')
  await page.waitForNavigation()
  expect(page.url()).toBe(`${baseUrl}/register`)
  await expect(page).toFill('[data-test-id="sign-up-username"]', 'e2etest')
  await expect(page).toFill('[data-test-id="sign-up-password"]', '1234')
  await expect(page).toClick('[data-test-id="complete-signup"]')
  await page.waitForNavigation()
  await expect(page).toMatchElement('[data-test-id="logged-in-user"]', {
    text: 'e2etest',
  })

  await expect(page).toFill('[data-test-id="create-event"]', 'EventTest')
  await expect(page).toClick('[data-test-id="complete-create-event"]')
  await expect(page).toMatchElement('[data-test-id="event-EventTest"]')
  await expect(page).toClick('[data-test-id="event-EventTest"]')
  await page.waitForNavigation()
  const eventId = await page.$eval(
    '[data-test-id="event-EventTest"]',
    (element) => element.getAttribute('data-id'),
  )
  expect(page.url()).toBe(`${baseUrl}/users/${eventId}`)
  await expect(page).toMatchElement('[data-test-id="event-EventTest"]', {
    text: 'EventTest',
  })
  await expect(page).toFill('[data-test-id="create-person"]', 'Luigi')
  await expect(page).toClick('[data-test-id="complete-create-person"]')
  await expect(page).toMatchElement('[data-test-id="name-Luigi"]', {
    text: 'Luigi',
  })
  const luigiId = await page.$eval('[data-test-id="name-Luigi"]', (element) =>
    element.getAttribute('data-id'),
  )

  await expect(page).toFill('[data-test-id="create-person"]', 'Mario')
  await expect(page).toClick('[data-test-id="complete-create-person"]')
  await expect(page).toMatchElement('[data-test-id="name-Mario"]', {
    text: 'Mario',
  })
  const marioId = await page.$eval('[data-test-id="name-Mario"]', (element) =>
    element.getAttribute('data-id'),
  )
  await page.select('[data-test-id="select-person"]', luigiId)
  await expect(page).toFill('[data-test-id="expense-value"]', '300')
  await expect(page).toFill('[data-test-id="expense-name"]', 'Brownies')
  await expect(page).toClick('[data-test-id="complete-expense"]')
  await expect(page).toMatchElement('[data-test-id="expense-value-name"]', {
    text: 'Brownies 300€ paid by Luigi',
  })
  await page.select('[data-test-id="select-person"]', marioId)
  await expect(page).toFill('[data-test-id="expense-value"]', '600')
  await expect(page).toFill('[data-test-id="expense-name"]', 'Fruits')
  await expect(page).toClick('[data-test-id="complete-expense"]')
  await expect(page).toMatchElement('[data-test-id="expense-value-name"]', {
    text: 'Fruits 600€ paid by Mario',
  })
  await expect(page).toClick('[data-test-id="delete-event"]')
  await expect(page).toClick('[data-test-id="logout"]')
})
