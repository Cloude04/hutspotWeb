# HutSpot Event Booking Management System (EBMS)

A comprehensive event booking and management system for HutSpot Food House and Event Place.

## 🎉 New Features

### 🔐 User Authentication System (NEW!)
Professional login and signup system now protects the booking functionality:
- **Login/Signup Required** - Users must create an account before booking
- **Mobile Number Required** - 11-digit mobile number captured during signup
- **Professional UI** - Modern two-panel design, fully responsive
- **Secure Sessions** - User data managed with localStorage
- **Auto-Fill Booking** - Customer info automatically filled from account

📖 **See [AUTHENTICATION_GUIDE.md](AUTHENTICATION_GUIDE.md) for complete authentication documentation**

### 🔗 Integrated Booking System
The index.html and admin.html are **fully connected**! When customers make bookings, they automatically appear in the admin panel for confirmation.

### Quick Start
1. Open `index.html` - Sign up for an account
2. Make a test booking (requires login)
3. Open `admin.html` - See the booking appear (login: admin/password123)
4. Confirm the booking in admin panel
5. Check `test-booking-system.html` to monitor the system

📖 **See [BOOKING_INTEGRATION_GUIDE.md](BOOKING_INTEGRATION_GUIDE.md) for complete booking integration details**

## Project Structure

```
testoutUI/
├── server/
│   ├── app.js                 # Main Express server
│   ├── database/
│   │   ├── init.js           # Database initialization and schema
│   │   └── hutspot.db        # SQLite database file
│   ├── routes/
│   │   ├── auth.js           # User authentication
│   │   ├── bookings.js       # Booking management
│   │   ├── services.js       # Services CRUD
│   │   ├── venues.js         # Venues CRUD
│   │   ├── payments.js       # Payment management
│   │   ├── promos.js         # Promo codes
│   │   └── admin.js          # Admin operations
│   └── utils/
│       └── helpers.js        # Utility functions
├── index.html                # Main customer-facing website
├── admin.html                # Admin dashboard (booking management)
├── test-booking-system.html  # Test page to monitor bookings
├── booking.js                # Booking form logic with localStorage
├── admin.js                  # Admin panel logic with localStorage
├── style.css                 # Styles
├── admin.css                 # Admin styles
├── script.js                 # Frontend JavaScript
├── package.json              # Node dependencies
├── BOOKING_INTEGRATION_GUIDE.md  # Complete integration documentation
└── README.md                 # This file
```

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- npm or yarn
- Web browser (Chrome, Firefox, Edge recommended)

### Quick Setup (LocalStorage Demo)

**No server required!** The booking system now works with localStorage:

1. **Open the files directly in your browser:**
   - `index.html` - Customer booking interface
   - `admin.html` - Admin panel (login: admin/password123)
   - `test-booking-system.html` - System monitor

2. **Test the integration:**
   - Make a booking in index.html
   - See it appear in admin.html instantly
   - Confirm/reject bookings in admin panel

### Full Setup (With Backend Server)

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
Edit `.env` file with your settings:
```
NODE_ENV=development
PORT=5000
ADMIN_EMAIL=admin@hutspot.com
ADMIN_PASSWORD=admin123
```

3. **Start the server:**
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/admin-login` - Admin login

### Bookings
- `POST /api/bookings/create` - Create new booking
- `GET /api/bookings/user/:user_id` - Get user's bookings
- `GET /api/bookings/:booking_id` - Get booking details
- `PUT /api/bookings/:booking_id` - Update booking
- `DELETE /api/bookings/:booking_id` - Cancel booking

### Services
- `GET /api/services` - Get all services
- `POST /api/services/create` - Create service (admin)
- `PUT /api/services/:service_id` - Update service (admin)
- `DELETE /api/services/:service_id` - Delete service (admin)

### Venues
- `GET /api/venues` - Get all venues
- `GET /api/venues/:venue_id` - Get venue details
- `GET /api/venues/availability/:venue_id` - Get available dates
- `POST /api/venues/create` - Create venue (admin)
- `PUT /api/venues/:venue_id` - Update venue (admin)
- `DELETE /api/venues/:venue_id` - Delete venue (admin)

### Payments
- `POST /api/payments/create` - Create payment record
- `GET /api/payments/:payment_id` - Get payment details
- `GET /api/payments/booking/:booking_id` - Get booking payment
- `PUT /api/payments/:payment_id` - Update payment status

### Promos
- `GET /api/promos` - Get active promos
- `POST /api/promos/validate` - Validate promo code
- `POST /api/promos/create` - Create promo (admin)
- `PUT /api/promos/:promo_id` - Update promo (admin)

### Admin
- `GET /api/admin/bookings` - Get all bookings
- `GET /api/admin/bookings/:booking_id` - Get booking details
- `PUT /api/admin/bookings/:booking_id/status` - Update booking status
- `POST /api/admin/reserve-date` - Mark date as reserved
- `GET /api/admin/dashboard/stats` - Get dashboard statistics

## Database Schema

### Users
- id, name, email, password, phone, address, created_at, updated_at

### Event Types
- id, name, description, base_price, created_at

### Venues
- id, name, description, capacity, price_per_hour, price_per_day, amenities, images, is_active, created_at, updated_at

### Services
- id, name, description, price, category, is_active, created_at, updated_at

### Bookings
- id, user_id, event_type, event_date, event_time, venue_id, number_of_guests, special_request, attachment_url, status, created_at, updated_at

### Booking Services
- id, booking_id, service_id, quantity, price, created_at

### Payments
- id, booking_id, amount, down_payment, remaining_balance, payment_method, proof_image_url, status, payment_date, created_at, updated_at

### Promos
- id, code, description, discount_type, discount_value, min_amount, max_uses, current_uses, expiry_date, is_active, created_at, updated_at

### Reserved Dates
- id, date, venue_id, booking_id, status, notes, created_at

### Admin Logs
- id, admin_id, action, resource_type, resource_id, details, created_at

## Features Implemented (Phase 1)

✅ Project structure with Express.js backend
✅ SQLite database with complete schema
✅ User authentication (registration & login)
✅ Admin authentication
✅ Booking management API
✅ Service CRUD operations
✅ Venue management with availability
✅ Payment processing structure
✅ Promo code validation system
✅ Admin dashboard endpoints
✅ Helper utilities for calculations

## Features To Implement (Phase 2+)

- [ ] Step-by-step booking form (frontend)
- [ ] Dynamic pricing calculation
- [ ] Real-time total display
- [ ] Date picker with conflict prevention
- [ ] Enhanced admin dashboard UI
- [ ] Payment verification system
- [ ] Dynamic content management UI
- [ ] Report generation
- [ ] User account management
- [ ] UI/UX improvements

## Notes

- Database is SQLite for simplicity and portability
- Admin credentials: admin@hutspot.com / admin123 (change in production)
- Down payments default to 50% but can be customized
- Dates are stored in YYYY-MM-DD format
- All prices are in PHP currency

## Future Enhancements

- Email notifications for booking confirmations
- SMS updates for payment reminders
- Integration with payment gateways (Stripe, GCash)
- Calendar visualization for availability
- Analytics and reporting dashboard
- Customer reviews and ratings
- Multi-language support
