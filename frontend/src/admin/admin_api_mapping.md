# Admin API Connection Mapping

This document details the connectivity between the NAME Admin Dashboard and the FastAPI backend.

**Backend Base URL**: `https://clara-xpfh.onrender.com`

## 1. Core Analytics & Dashboard
| Feature | Endpoint | Method | Component | Status |
| :--- | :--- | :--- | :--- | :--- |
| Total Stats | `/admin/stats` | GET | `AdminDashboard` | CONNECTED |
| Revenue Metrics | `/admin/revenue` | GET | `AdminDashboard`, `AdminAnalytics` | CONNECTED |
| Active Orders | `/admin/orders` | GET | `AdminDashboard` | CONNECTED |

## 2. Inventory & Product Management
| Feature | Endpoint | Method | Component | Status |
| :--- | :--- | :--- | :--- | :--- |
| Fetch Products | `/products` | GET | `AdminInventory` | CONNECTED |
| Create Product | `/admin/product` | POST | `AdminInventory` | CONNECTED |
| Update Product | `/admin/product/{id}` | PUT | `AdminInventory` | CONNECTED |
| Delete Product | `/admin/product/{id}` | DELETE | `AdminInventory` | CONNECTED |
| Create Variant | `/admin/product/{id}/variant` | POST | `AdminInventory` | CONNECTED |
| Bulk Stock Update | `/admin/variants/bulk-stock` | PATCH | `AdminInventory` | CONNECTED |
| Update Price | `/admin/variant/{id}/price` | PUT | `AdminInventory` | CONNECTED |
| Upload Media | `/upload/image` | POST | `AdminInventory` | CONNECTED |
| Fetch Categories | `/categories` | GET | `AdminInventory` | CONNECTED |

## 3. Order Fulfillment
| Feature | Endpoint | Method | Component | Status |
| :--- | :--- | :--- | :--- | :--- |
| Order List | `/admin/orders` | GET | `AdminOrders` | CONNECTED |
| Order Detail | `/admin/order/{id}` | GET | `AdminOrders` | CONNECTED |
| Update Status | `/admin/orders/{id}/status` | PATCH | `AdminOrders` | CONNECTED |
| Refund Payment | `/admin/refund` | POST | `AdminOrders` | CONNECTED |

## 4. Customer Intelligence
| Feature | Endpoint | Method | Component | Status |
| :--- | :--- | :--- | :--- | :--- |
| List Customers | `/admin/users` | GET | `AdminCustomers` | CONNECTED |
| User Profile | `/admin/user/{id}/profile` | GET | `AdminCustomers` | CONNECTED |

## 5. Community & Reviews
| Feature | Endpoint | Method | Component | Status |
| :--- | :--- | :--- | :--- | :--- |
| List Reviews | `/admin/reviews` | GET | `AdminReviews` | CONNECTED |
| Delete Review | `/admin/review/{id}` | DELETE | `AdminReviews` | CONNECTED |
| Review Stats | `/admin/reviews/stats` | GET | `AdminAnalytics` | CONNECTED |

## 6. Promotions & Marketing
| Feature | Endpoint | Method | Component | Status |
| :--- | :--- | :--- | :--- | :--- |
| List Promos | `/admin/promos` | GET | `AdminPromos` | CONNECTED |
| Create Promo | `/admin/promo` | POST | `AdminPromos` | CONNECTED |
| Disable/Delete | `/admin/promo/{id}` | DELETE | `AdminPromos` | CONNECTED |

---

### Unused/Available Endpoints (In Documentation)
- `/admin/admin/collection-image`: (Available for dedicated collection banners)
- `/admin/admin/lookbook-image`: (Available for lookbook management)
- `/admin/newsletter/send`: (Logic implemented in `adminService`, ready for `AdminNewsletter` trigger)
- `/reserve`: (Public-facing stock reservation)
- `/ai/chat`: (Backend AI logic for customer support)
