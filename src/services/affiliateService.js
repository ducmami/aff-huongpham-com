import { AFFILIATE_ID, CLEAN_LINK_ENDPOINT, SHOPEE_WHITELIST_DOMAINS } from '../constants/affiliate.js'

const withProtocol = (rawUrl) => {
  if (!rawUrl) return ''
  return rawUrl.startsWith('http://') || rawUrl.startsWith('https://') ? rawUrl : `https://${rawUrl}`
}

export const isValidShopeeDomain = (rawUrl) => {
  if (!rawUrl) return false

  try {
    const parsedUrl = new URL(withProtocol(rawUrl.trim()))
    const { hostname } = parsedUrl
    return SHOPEE_WHITELIST_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
    )
  } catch {
    return false
  }
}

export const fetchCleanProductLink = async (rawUrl) => {
  const normalizedUrl = withProtocol(rawUrl?.trim())
  const endpoint = new URL(CLEAN_LINK_ENDPOINT)
  endpoint.pathname = '/check'
  endpoint.searchParams.set('command', 'clean')
  endpoint.searchParams.set('url', normalizedUrl)

  const response = await fetch(endpoint.toString())
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload?.error || 'Unable to retrieve clean link')
  }

  const shopId = payload?.shopid ?? payload?.shopId
  const itemId = payload?.itemid ?? payload?.itemId

  if (!shopId || !itemId) {
    throw new Error(payload?.error || 'Missing product identifiers')
  }

  return { shopId, itemId, affiliateId: AFFILIATE_ID }
}

