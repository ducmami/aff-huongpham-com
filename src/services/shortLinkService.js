import { CLEAN_LINK_ENDPOINT } from '../constants/affiliate.js'

export const createShortLink = async (targetUrl) => {
  const endpoint = new URL(CLEAN_LINK_ENDPOINT)
  endpoint.pathname = '/check'
  endpoint.searchParams.set('command', 'short')
  endpoint.searchParams.set('url', targetUrl)

  const response = await fetch(endpoint.toString())
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload?.error || 'Short link request failed')
  }

  const shortUrl = payload?.short_url

  if (!shortUrl) {
    throw new Error('Short link url missing in response')
  }

  return shortUrl
}
