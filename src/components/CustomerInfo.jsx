import { useEffect, useMemo, useState } from 'react'
import { Avatar, Button, Card, Form, Input, Space, Typography, message } from 'antd'
import { EditOutlined, SaveOutlined, UserOutlined } from '@ant-design/icons'
import useLocalStorage from '../hooks/useLocalStorage.js'

const { Text } = Typography

const buildAvatarUrl = (phone) =>
  `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(phone || 'guest')}`

function CustomerInfo() {
  const [form] = Form.useForm()
  const [customerInfo, setCustomerInfo] = useLocalStorage('customerInfo', null)
  const [isEditing, setIsEditing] = useState(!customerInfo)

  const avatarUrl = useMemo(
    () => buildAvatarUrl(customerInfo?.phone || 'guest'),
    [customerInfo?.phone],
  )

  useEffect(() => {
    if (customerInfo) {
      form.setFieldsValue({
        name: customerInfo.name,
        phone: customerInfo.phone,
      })
    }
  }, [customerInfo, form])

  const handleSubmit = async (values) => {
    const payload = {
      ...values,
      avatarUrl: buildAvatarUrl(values.phone || 'guest'),
    }
    setCustomerInfo(payload)
    setIsEditing(false)
    message.success('Đã lưu thông tin khách hàng')
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  return (
    <Card title="Thông tin khách hàng" variant="borderless" className="card-elevated">
      <Space orientation="vertical" size={16} style={{ width: '100%' }}>
        <Space align="center">
          <Avatar size={64} src={avatarUrl} icon={<UserOutlined />} />
          <div>
            <Text strong>{customerInfo?.name || 'Chưa có tên'}</Text>
            <br />
            <Text type="secondary">{customerInfo?.phone || 'Chưa có số điện thoại'}</Text>
          </div>
        </Space>

        <Form
          layout="vertical"
          form={form}
          onFinish={handleSubmit}
          initialValues={{ name: '', phone: '' }}
          requiredMark={false}
          style={{ display: isEditing ? 'block' : 'none' }}
        >
          <Form.Item
            label="Họ và tên"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
          >
            <Input placeholder="Nhập tên khách hàng" />
          </Form.Item>
          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại' },
              { pattern: /^0\d{9,10}$/, message: 'Số điện thoại không hợp lệ' },
            ]}
          >
            <Input placeholder="098xxxxxxx" />
          </Form.Item>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} block>
            Lưu thông tin
          </Button>
        </Form>

        {!isEditing && (
          <Button type="default" icon={<EditOutlined />} onClick={handleEdit} block>
            Sửa thông tin
          </Button>
        )}
      </Space>
    </Card>
  )
}

export default CustomerInfo

