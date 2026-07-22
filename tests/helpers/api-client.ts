export async function request<T>(
  method: string,
  url: string,
  headers: Record<string, string> = {},
  body?: string
): Promise<{ data: T; message?: string } & Record<string, any>> {
  const cookie = process.env.TEST_COOKIE || ''
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : {}),
      ...headers,
    },
    body,
    credentials: 'include',
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`)
  return json
}

export async function getEntreprises(): Promise<{ id: string; name: string; slug: string }[]> {
  const api = process.env.TEST_API_URL || 'http://localhost:3001/api/v1'
  try {
    const res = await fetch(`${api}/settings/company`, {
      credentials: 'include',
      headers: process.env.TEST_COOKIE ? { Cookie: process.env.TEST_COOKIE } : {},
    })
    if (!res.ok) return []
    const json = await res.json()
    return [{ id: '1', name: json.data?.company_name || 'Gnabo Multi-Services', slug: 'main' }]
  } catch {
    return [{ id: '1', name: 'Gnabo Multi-Services', slug: 'main' }]
  }
}
