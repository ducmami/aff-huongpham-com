import { useMemo, useState } from 'react'
import { Button, Card, Flex, Input, Typography, message, notification } from 'antd'
import { CopyOutlined, LinkOutlined, ThunderboltOutlined, ShoppingCartOutlined } from '@ant-design/icons'
import useLocalStorage from '../hooks/useLocalStorage.js'
import { isValidShopeeDomain, fetchCleanProductLink } from '../services/affiliateService.js'
import { createShortLink } from '../services/shortLinkService.js'

const { Text } = Typography

function AffiliateInput() {
  const [link, setLink] = useState('')
  const [affLink, setAffLink] = useState('')
  const [customerInfo] = useLocalStorage('customerInfo', null)
  const [isGenerating, setIsGenerating] = useState(false)

  const isShopeeLink = useMemo(() => isValidShopeeDomain(link), [link])

  const handleGenerate = async () => {
    if (!link) {
      message.warning('Vui lòng dán link Shopee trước')
      return
    }

    if (!customerInfo?.phone) {
      notification.error({
        message: 'Vui lòng nhập thông tin khách hàng trước',
      })
      return
    }

    if (!isShopeeLink) {
      notification.error({
        message: 'Link không hợp lệ. Chỉ chấp nhận link từ Shopee',
      })
      return
    }

    setIsGenerating(true)
    try {
      const { shopId, itemId, affiliateId } = await fetchCleanProductLink(link)
      const cleanLink = `https://shopee.vn/product/${shopId}/${itemId}`
      const encodedCleanLink = encodeURIComponent(cleanLink)
      const affiliateLink = `https://s.shopee.vn/an_redir?origin_link=${encodedCleanLink}&affiliate_id=${affiliateId}&sub_id=${encodeURIComponent(
        customerInfo.phone,
      )}`

      let shortLink = affiliateLink

      try {
        shortLink = await createShortLink(affiliateLink)
      } catch {
        shortLink = affiliateLink
      }

      setAffLink(shortLink)
      message.success('Đã tạo link AFF')
    } catch (error) {
      notification.error({
        message: 'Không thể lấy thông tin sản phẩm. Vui lòng thử lại',
        description: error?.message,
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async () => {
    if (!affLink) {
      message.warning('Chưa có link AFF để sao chép')
      return
    }
    try {
      await navigator.clipboard.writeText(affLink)
      message.success('Đã sao chép link AFF')
    } catch {
      message.error('Không thể sao chép, vui lòng thử lại')
    }
  }

  const handleBuy = () => {
    if (!affLink) {
      message.warning('Chưa có link AFF để mở')
      return
    }
    window.open(affLink, '_blank', 'noopener')
  }

  return (
    <Card title="Nhập link Shopee để lấy Affiliate" variant="borderless" className="card-elevated">
      <Flex vertical gap={12}>
        <Flex gap={8} align="center" wrap>
          <Input
            size="large"
            prefix={<LinkOutlined />}
            placeholder="Dán link Shopee"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            allowClear
          />
          <Button
            type="primary"
            icon={<ThunderboltOutlined />}
            onClick={handleGenerate}
            loading={isGenerating}
          >
            Lấy AFF
          </Button>
        </Flex>

        <Input
          size="large"
          prefix={<LinkOutlined />}
          value={affLink}
          placeholder="Link AFF sẽ hiển thị tại đây"
          readOnly
        />

        <Flex gap={8} align="center" wrap>
          <Button type="default" icon={<CopyOutlined />} onClick={handleCopy} disabled={!affLink}>
            Sao chép
          </Button>
          <Button
            type="dashed"
            icon={<ShoppingCartOutlined />}
            onClick={handleBuy}
            disabled={!affLink}
          >
            Mua sản phẩm
          </Button>
          <Text type={isShopeeLink ? 'success' : 'warning'}>
            {link
              ? isShopeeLink
                ? 'Link Shopee hợp lệ'
                : 'Link không phải từ Shopee.vn'
              : 'Chưa có link'}
          </Text>
        </Flex>
      </Flex>
    </Card>
  )
}

export default AffiliateInput

