let counter = 0

export function testUser() {
  const id = `${Date.now()}-${counter++}`
  return {
    name: `Test User ${id}`,
    email: `test-${id}@example.com`,
    password: "TestPassword123!",
  }
}
