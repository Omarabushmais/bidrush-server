# 🔨 BidRush Server (Express + PostgreSQL)

This is the **backend** for the **BidRush** auction application. It provides APIs for user authentication, auction management, real-time bidding, and image uploads.

## 🏗️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js (v5)
- **Database**: PostgreSQL (via `pg`)
- **Authentication**: JWT (`jsonwebtoken`) + `bcrypt`
- **File Uploads**: `multer`
- **Email**: `nodemailer`
- **Utilities**: `dotenv`, `cors`, `morgan`

## 🚀 Getting Started

```bash
# 1. Install dependencies
cd BidRush_Server
npm install

# 2. Set up the Database
# Create a PostgreSQL database (e.g., `bidrush_db`)
# Run the provided schema file to create tables:
psql -d bidrush_db -f Schema_of_BidRush.sql

# 3. Configure Environment Variables
# Create a .env file in the root directory and add:
PORT=5000
DATABASE_URL=postgres://user:password@localhost:5432/bidrush_db
JWT_SECRET=your_super_secret_key
NODE_ENV=development
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
FRONT_URL=front URL

# 4. Start the server
npm start
```

## 🗂️ Project Structure
```
BidRush_Server/
├── controllers/
│   ├── auctionController.js  # Auction logic (CRUD)
│   ├── authController.js     # Signup & Login logic
│   └── bidController.js      # Bidding logic
├── middleware/
│   ├── authorization.js      # JWT Token verification
│   └── upload.js             # Image upload config (Multer)
├── routes/
│   ├── auctions.js           # Auction endpoints
│   ├── authRoutes.js         # Auth endpoints
│   └── bids.js               # Bidding endpoints
├── Public/
│   └── uploads/              # Stored auction images
├── db.js                     # Database connection
├── index.js                  # App entry point
├── Schema_of_BidRush.sql     # Database Schema
└── package.json
```

## 📡 API Endpoints

The API runs on: `http://localhost:5000`

### 🔐 Auth Routes

**Base URL**: `/auth`

| Method | Endpoint | Description | Guard |
| :--- | :--- | :--- | :--- |
| POST | `/register` | Register a new user | Public |
| POST | `/login` | Log in existing user | Public |
| GET | `/profile` | Get logged-in user details | 🔐 Token |
| PUT | `/profile` | Update logged-in user details | 🔐 Token |
| GET | `/users` | Get all users (Admin/Dash) | 🔐 Token |
| DELETE | `/delete/:id` | Delete a user | 🔐 Token |
| PUT | `/suspend/:id` | Suspend a user status | 🔐 Token |
| POST | `/forgot-password` | Request password reset email | Public |
| POST | `/reset-password/:id/:token` | Reset password | Public |

#### 🔸 POST `/auth/register`
```json
{
  "fullname": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123",
  "phone_number": "0791234567"
}
```

#### 🔸 POST `/auth/login`
```json
// Request
{
  "email": "john@example.com",
  "password": "securepassword123"
}
// Response
{
  "token": "eyJhbGciOi...",
  "role": "user",
  "username": "johndoe",
  "userId": 25
}
```

#### 🔸 GET `/auth/profile`
```
Returns the logged-in user's details. Headers: Authorization: Bearer <token>
```

#### 🔸 PUT `/auth/profile`
```json
//Updates the logged-in user's profile info.
{
  "fullname": "John Updated",
  "username": "john_new",
  "email": "john@example.com",
  "phone_number": "0799999999"
}
```

#### 🔸 GET `/auth/users`
```
Returns a list of all users (for admin dashboard). Headers: Authorization: Bearer <token>
```

#### 🔸 DELETE `/auth/delete/:id`
```
Deletes a specific user by ID. Headers: Authorization: Bearer <token>
```

#### 🔸 PUT `/auth/suspend/:id`
```
Changes a user's status to 'suspended'. Headers: Authorization: Bearer <token>
```

#### 🔸 POST `/auth/forgot-password`
```json
//Sends a reset link to the user's email.
{
  "email": "john@example.com"
}
```

#### 🔸 POST `/auth/reset-password/:id/:token`
```json
//Resets the password using the link from email.
{
  "password": "newSecurePassword123"
}
```

### 🔨 Auction Routes

**Base URL**: `/auctions`

| Method | Endpoint | Description | Guard |
| :--- | :--- | :--- | :--- |
| POST | `/create` | Create a new auction | 🔐 Token |
| GET | `/` | Get all active auctions | Public |
| GET | `/user/my-auctions` | Get auctions created by the logged-in user | 🔐 Token |
| GET | `/:id` | Get specific auction details | Public |
| PUT | `/edit/:id` | Update auction details | 🔐 Token |
| DELETE | `/delete/:id` | Delete an auction | 🔐 Token |
| DELETE | `/image/:imageId` | Delete a specific image from an auction | 🔐 Token |

#### 🔸 POST `/auctions/create`
**Note:** Request must be `multipart/form-data` to handle images.
```json
{
  "title": "Gaming PC Setup",
  "description": "High-end gaming rig with RTX 4090.",
  "category": "Electronics",
  "starting_price": 1500.00,
  "bid_increment": 50.00,
  "start_time": "2026-03-01T10:00:00",
  "end_time": "2026-03-07T20:00:00",
  "images": [File1, File2, File3]  // Max 5 images
}
```

#### 🔸 GET `/auctions`
```json
//Returns a list of all active auctions.
[
  {
    "id": 10,
    "title": "Gaming PC Setup",
    "current_price": 1550.00,
    "username": "seller_joe",
    "image": "/uploads/image1.jpg"
  }
]
```

#### 🔸 GET `/auctions/user/my-auctions`
```json
//Returns all auctions (active or ended) created by the logged-in user. Headers: Authorization: Bearer <token>
[
  {
    "id": 10,
    "title": "Gaming PC Setup",
    "status": "active",
    "current_price": 1550.00,
    "start_time": "2026-03-01T10:00:00.000Z",
    "end_time": "2026-03-07T20:00:00.000Z"
  }
]
```

#### 🔸 GET `/auctions/:id`
```json
//Returns detailed information about a single auction.
{
  "id": 10,
  "seller_id": 5,
  "title": "Gaming PC Setup",
  "description": "High-end gaming rig...",
  "category": "Electronics",
  "starting_price": 1500.00,
  "current_price": 1550.00,
  "bid_increment": 50.00,
  "status": "active",
  "start_time": "2026-03-01T10:00:00.000Z",
  "end_time": "2026-03-07T20:00:00.000Z",
  "seller_name": "seller_joe",
  "images": [
    { "id": 1, "image_url": "/uploads/img1.png" },
    { "id": 2, "image_url": "/uploads/img2.png" }
  ]
}
```

#### 🔸 DELETE `/auctions/delete/:id`
```
Deletes an auction. Headers: Authorization: Bearer <token>
```

#### 🔸 DELETE `/auctions/image/:imageId`
```
Deletes a single image from an auction gallery. Headers: Authorization: Bearer <token>
```

#### 🔸 PUT `auctions/edit/:id`
```json
//Updates an existing auction. Send multipart/form-data if updating images.
{
  "title": "Gaming PC (Updated)",
  "description": "Updated description text.",
  "category": "Electronics",
  "starting_price": 1600.00,
  "bid_increment": 50.00,
  "start_time": "2026-03-01T10:00:00",
  "end_time": "2026-03-07T20:00:00",
  "images": [NewFile1] // Optional: append new images
}
```

### 💰 Bid Routes

**Base URL**: `/bids`

| Method | Endpoint | Description | Guard |
| :--- | :--- | :--- | :--- |
| POST | `/create` | Place a new bid | 🔐 Token |
| GET | `/` | Get all bids (Admin/Debug) | Public |
| GET | `/auction/:auctionId` | Get all bids for a specific auction | Public |
| PUT | `/update/:id` | Update an existing bid amount | 🔐 Token |
| DELETE | `/delete/:id` | Delete a bid (Admin Only) | 🔐 Token |
| GET | `/user/my-bids` | Get the logged-in user's bid history | 🔐 Token |

#### 🔸 POST `/bids/create`
```json
//Place a bid on an active auction
{
  "auction_id": 12,
  "amount": 750
}
```

#### 🔸 GET `/bids`
```
Get all bids
```

#### 🔸 GET `/bids/auction/:auctionId`
```
Get all bids for a specific auction
```

#### 🔸 PUT `/bids/update/:id`
```json
Update your bid amount
{
  "amount": 820
}
```

#### 🔸 DELETE `/bids/delete/:id`
```
Delete a bid by ID
```

#### 🔸 GET `/bids/user/my-bids`
```
Get all bids placed by the user
```