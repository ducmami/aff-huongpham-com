PLAN TỔNG THỂ LÀM WEBSITE AFFILIATE – 1 PAGE – ANT DESIGN 6 + REACT

# I. Công Nghệ & Yêu Cầu

- React + Vite (hoặc Next.js nhưng bạn yêu cầu FE only → React Vite là tốt nhất)
- Ant Design 6
- LocalStorage để lưu thông tin khách hàng
- Chưa cần backend
- Full responsive (mobile & PC)
- PWA để có thể cài thành App trên mobile
- Primary color = xanh (#1677ff của Ant Design)

# II. Cấu Trúc Thư Mục

```
src/
 ├─ components/
 │   ├─ CustomerInfo.jsx
 │   ├─ AffiliateInput.jsx
 │   └─ AdsContainer.jsx
 ├─ hooks/
 │   └─ useLocalStorage.js
 ├─ pages/
 │   └─ Home.jsx
 ├─ assets/
 │   └─ placeholder-avatar.png (optional)
 ├─ App.jsx
 ├─ main.jsx
public/
 ├─ manifest.json
 ├─ icons/ (icon PWA)


```

# III. Chi Tiết Tính Năng

## 1. Thông tin khách hàng (góc trái)
### UI:
- Card của Ant Design
- Hiển thị:
  - Avatar (auto generate bằng API như Dicebear hoặc Avatar của AntD)
  - Tên
  - Số điện thoại
- Nếu chưa có dữ liệu:
  - Hiển thị Form:
  - Input tên
  - Input số điện thoại
  - Avatar random
- Nút Lưu thông tin
  - Lưu vào localStorage:
```
customerInfo = {
  name,
  phone,
  avatarUrl
}

```

### Logic:
- Lấy từ localStorage khi load page
- Nếu có thì hiển thị info
- Nếu không → hiển thị form nhập

## 2. Input để nhập link Affiliate
### UI:
- Form + Input + Button
- Khi người dùng nhập link → lưu vào state
- Có thể hiển thị preview link (không bắt buộc)
## 3. Khu vực quảng cáo

- Phía dưới toàn bộ giao diện:
- Container rộng 100%
- Responsive grid:
- Mobile: 1 cột
- Tablet: 2 cột
- Desktop: 3–4 cột
- Placeholder box để bạn chèn hình / banner sau

4. Responsive Layout

- Dùng Ant Design Grid (Row, Col)
- Trên mobile: CustomerInfo 100% width, nằm trên cùng
- PC: CustomerInfo nằm bên trái dạng sidebar (~300px), phần còn lại hiển thị nội dung
5. PWA để cài thành app
Cần:
manifest.json
service-worker.js (auto từ Vite plugin)
Dùng plugin:
```
npm install vite-plugin-pwa --save-dev

```
```
import { VitePWA } from 'vite-plugin-pwa'

plugins: [
  VitePWA({
    registerType: 'autoUpdate',
    manifest: {
      name: "Affiliate App",
      short_name: "Affiliate",
      theme_color: "#1677ff",
      icons: [...]
    }
  })
]

```

# IV. Layout Wireframe (Mô tả UI)

## Desktop
```
---------------------------------------------------------
| [Sidebar 300px] |         Affiliate Input + Ads        |
|  CustomerInfo   | ------------------------------------|
|                 |   [Input link affiliate]             |
|                 | ------------------------------------|
|                 |   [Ads Grid]                         |
---------------------------------------------------------

```

## Mobile

```
----------------------
| Customer Info      |
----------------------
| Input Affiliate    |
----------------------
| Ads Grid           |
----------------------

```

# V. Chi Tiết Component

Trạng thái:

customerInfo

Nếu chưa có → hiển thị Form

Nếu có → hiển thị avatar + tên + phone + nút "Sửa"

API generate avatar (Dicebear):
```
https://api.dicebear.com/7.x/bottts/svg?seed=abc


```

2. AffiliateInput.jsx

Input + Button copy

Lưu link vào state hoặc localStorage tùy bạn

3. AdsContainer.jsx

Grid responsive:
```
<Row gutter={[16,16]}>
  <Col xs={24} sm={12} md={8} lg={6}>
     <div className="ad-box"></div>
  </Col>
  ...
</Row>

```