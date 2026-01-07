import { AFFILIATE_ID, CLEAN_LINK_ENDPOINT, SHOPEE_WHITELIST_DOMAINS } from '../constants/affiliate.js'

const SHOPEE_FOOD_DOMAINS = ['shopeefood.vn', 'spf.shopee.vn']

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

const getLinkType = (rawUrl) => {
  if (!rawUrl) return null
  try {
    const parsedUrl = new URL(withProtocol(rawUrl.trim()))
    const { hostname } = parsedUrl
    const isShopeeFood = SHOPEE_FOOD_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
    )
    return isShopeeFood ? 'shopee_food' : 'shopee'
  } catch {
    return null
  }
}

export const fetchCleanProductLink = async (rawUrl) => {
  const normalizedUrl = withProtocol(rawUrl?.trim())
  const type = getLinkType(rawUrl)
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

  if (type === 'shopee_food') {
    if (!shopId) {
      throw new Error(payload?.error || 'Missing shop identifier')
    }
    return { shopId, affiliateId: AFFILIATE_ID, type }
  }

  if (!shopId || !itemId) {
    throw new Error(payload?.error || 'Missing product identifiers')
  }

  return { shopId, itemId, affiliateId: AFFILIATE_ID, type }
}

