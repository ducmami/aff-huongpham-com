import { Card, Col, Row, Typography } from 'antd'

const { Text } = Typography

const defaultAds = Array.from({ length: 8 }).map((_, index) => ({
  id: index + 1,
  label: `Sản phẩm ${index + 1}`,
}))

function AdsContainer() {
  return (
    <Card title="Sản phẩm nổi bật" variant="borderless" className="card-elevated">
      <Row gutter={[16, 16]}>
        {defaultAds.map((item) => (
          <Col key={item.id} xs={24} sm={12} md={8} lg={6}>
            <div className="ad-box">
              <Text strong>{item.label}</Text>
              <Text type="secondary">Thông tin sản phẩm</Text>
            </div>
          </Col>
        ))}
      </Row>
    </Card>
  )
}

export default AdsContainer

