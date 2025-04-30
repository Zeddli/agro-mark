# AgroMark API Specification

This document outlines the REST API endpoints for the AgroMark platform.

## Base URL

All API endpoints are prefixed with: `/api/v1`

## Authentication

Most endpoints require authentication via JSON Web Tokens (JWT) and Solana wallet signatures.

**Authentication Flow:**

1. Client requests message to sign:
   ```
   GET /api/v1/auth/challenge
   ```

2. Client signs message with Solana wallet

3. Client submits signature:
   ```
   POST /api/v1/auth/verify
   ```

4. Server verifies signature and issues JWT

5. JWT is included in subsequent requests:
   ```
   Authorization: Bearer <token>
   ```

## Endpoints

### Authentication

#### `GET /api/v1/auth/challenge`

Generates a random challenge for the user to sign with their wallet.

**Query Parameters:**
- `walletAddress` (required): Solana wallet address

**Response:**
```json
{
  "message": "Sign this message to authenticate with AgroMark: 12345678",
  "expiresAt": "2023-09-01T12:00:00Z"
}
```

#### `POST /api/v1/auth/verify`

Verifies the signature and issues a JWT.

**Request Body:**
```json
{
  "walletAddress": "DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5TNPN9",
  "signature": "26BLvgkAiqKDPdCMYYkNsCSRe1BBC35CNi3F8pTQ7AsbYmAJhfzY2LnUMvEu9CdiCdMHPbzE6gunsBZLZPhJEDtz",
  "message": "Sign this message to authenticate with AgroMark: 12345678"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2023-09-01T12:00:00Z",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "walletAddress": "DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5TNPN9",
    "username": "farmer_joe",
    "isVerified": true
  }
}
```

### User Management

#### `GET /api/v1/users/me`

Retrieves the current user's profile.

**Authorization:** Required

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "walletAddress": "DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5TNPN9",
  "username": "farmer_joe",
  "email": "joe@example.com",
  "profilePicture": "https://ipfs.io/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
  "bio": "Organic farmer from California",
  "location": "California, USA",
  "isVerified": true,
  "createdAt": "2023-01-15T12:00:00Z",
  "updatedAt": "2023-08-01T09:30:00Z"
}
```

#### `PUT /api/v1/users/me`

Updates the current user's profile.

**Authorization:** Required

**Request Body:**
```json
{
  "username": "organic_joe",
  "email": "new_email@example.com",
  "profilePicture": "https://ipfs.io/ipfs/NewImageHash",
  "bio": "Updated bio information",
  "location": "New York, USA"
}
```

**Response:** Same as `GET /api/v1/users/me`

#### `GET /api/v1/users/:id`

Retrieves a specific user's public profile.

**Parameters:**
- `id`: User ID

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "walletAddress": "DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5TNPN9",
  "username": "farmer_joe",
  "profilePicture": "https://ipfs.io/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
  "bio": "Organic farmer from California",
  "location": "California, USA",
  "isVerified": true,
  "createdAt": "2023-01-15T12:00:00Z",
  "averageRating": 4.8,
  "reviewCount": 24,
  "activeListing": 12
}
```

### Products

#### `GET /api/v1/products`

Lists products with filtering and pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `category` (optional): Filter by category
- `minPrice` (optional): Minimum price
- `maxPrice` (optional): Maximum price
- `currency` (optional): Currency filter
- `seller` (optional): Filter by seller ID
- `search` (optional): Text search query
- `status` (optional): Product status filter
- `sort` (optional): Sorting option (recent, price_asc, price_desc, popular)

**Response:**
```json
{
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "Organic Red Apples",
      "description": "Fresh organic apples from our family farm",
      "price": 5.2,
      "currency": "USDC",
      "quantity": 500,
      "unit": "kg",
      "images": [
        "https://ipfs.io/ipfs/QmImage1",
        "https://ipfs.io/ipfs/QmImage2"
      ],
      "category": {
        "id": "cat123",
        "name": "Fruits"
      },
      "seller": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "username": "farmer_joe",
        "rating": 4.8
      },
      "onChainId": "on-chain-product-id-123",
      "status": "ACTIVE",
      "createdAt": "2023-08-01T12:00:00Z",
      "availableFrom": "2023-08-01T12:00:00Z",
      "availableTo": "2023-09-01T12:00:00Z"
    }
    // More products...
  ],
  "pagination": {
    "total": 150,
    "pages": 8,
    "currentPage": 1,
    "limit": 20
  }
}
```

#### `GET /api/v1/products/:id`

Retrieves a specific product by ID.

**Parameters:**
- `id`: Product ID

**Response:** Single product object as shown in the items array above.

#### `POST /api/v1/products`

Creates a new product listing.

**Authorization:** Required

**Request Body:**
```json
{
  "title": "Organic Red Apples",
  "description": "Fresh organic apples from our family farm",
  "price": 5.2,
  "currency": "USDC",
  "quantity": 500,
  "unit": "kg",
  "images": [
    "https://ipfs.io/ipfs/QmImage1",
    "https://ipfs.io/ipfs/QmImage2"
  ],
  "categoryId": "cat123",
  "tags": ["organic", "fresh", "apples"],
  "availableFrom": "2023-08-01T12:00:00Z",
  "availableTo": "2023-09-01T12:00:00Z"
}
```

**Response:** Created product object

#### `PUT /api/v1/products/:id`

Updates an existing product.

**Authorization:** Required (must be the seller)

**Parameters:**
- `id`: Product ID

**Request Body:** Same as POST but all fields optional

**Response:** Updated product object

#### `DELETE /api/v1/products/:id`

Deletes or deactivates a product.

**Authorization:** Required (must be the seller)

**Parameters:**
- `id`: Product ID

**Response:**
```json
{
  "success": true,
  "message": "Product successfully deactivated"
}
```

### Orders

#### `GET /api/v1/orders`

Lists orders for the current user.

**Authorization:** Required

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `role` (optional): "buyer" or "seller"
- `status` (optional): Order status filter

**Response:**
```json
{
  "items": [
    {
      "id": "order123",
      "buyer": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "username": "farmer_joe"
      },
      "seller": {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "username": "fruit_supplier"
      },
      "status": "PAID",
      "totalAmount": 62.00,
      "escrowAddress": "escrow-pubkey-123",
      "transactionHash": "tx-hash-123",
      "createdAt": "2023-08-15T09:30:00Z",
      "updatedAt": "2023-08-15T10:15:00Z",
      "items": [
        {
          "productId": "550e8400-e29b-41d4-a716-446655440001",
          "title": "Organic Red Apples",
          "quantity": 10,
          "priceAtPurchase": 5.2,
          "currencyAtPurchase": "USDC"
        }
      ],
      "shippingAddress": "123 Farm Rd, Rural Town, CA 90210",
      "shippingMethod": "Standard",
      "trackingNumber": "TRACK123456"
    }
    // More orders...
  ],
  "pagination": {
    "total": 35,
    "pages": 4,
    "currentPage": 1,
    "limit": 10
  }
}
```

#### `GET /api/v1/orders/:id`

Retrieves a specific order.

**Authorization:** Required (must be buyer or seller)

**Parameters:**
- `id`: Order ID

**Response:** Single order object as shown in the items array above.

#### `POST /api/v1/orders`

Creates a new order.

**Authorization:** Required

**Request Body:**
```json
{
  "items": [
    {
      "productId": "550e8400-e29b-41d4-a716-446655440001",
      "quantity": 10
    }
  ],
  "shippingAddress": "123 Farm Rd, Rural Town, CA 90210",
  "shippingMethod": "Standard"
}
```

**Response:** Created order object

#### `PATCH /api/v1/orders/:id/status`

Updates an order's status.

**Authorization:** Required (permissions vary by status change)

**Parameters:**
- `id`: Order ID

**Request Body:**
```json
{
  "status": "SHIPPED",
  "trackingNumber": "TRACK123456"
}
```

**Response:** Updated order object

### Reviews

#### `GET /api/v1/reviews`

Lists reviews with filtering.

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `userId` (optional): Filter by user ID (subject of reviews)
- `authorId` (optional): Filter by author ID

**Response:**
```json
{
  "items": [
    {
      "id": "review123",
      "rating": 5,
      "comment": "Excellent quality produce and fast shipping!",
      "author": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "username": "farmer_joe"
      },
      "recipient": {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "username": "fruit_supplier"
      },
      "createdAt": "2023-08-20T14:30:00Z",
      "onChainId": "on-chain-review-id-123"
    }
    // More reviews...
  ],
  "pagination": {
    "total": 24,
    "pages": 3,
    "currentPage": 1,
    "limit": 10
  }
}
```

#### `POST /api/v1/reviews`

Creates a new review.

**Authorization:** Required

**Request Body:**
```json
{
  "recipientId": "550e8400-e29b-41d4-a716-446655440002",
  "rating": 5,
  "comment": "Excellent quality produce and fast shipping!",
  "orderId": "order123"
}
```

**Response:** Created review object

### Categories

#### `GET /api/v1/categories`

Lists all product categories.

**Response:**
```json
{
  "items": [
    {
      "id": "cat123",
      "name": "Fruits",
      "description": "Fresh fruits from farms worldwide",
      "imageUrl": "https://example.com/images/fruits.jpg"
    },
    {
      "id": "cat124",
      "name": "Vegetables",
      "description": "Fresh vegetables from farms worldwide",
      "imageUrl": "https://example.com/images/vegetables.jpg"
    }
    // More categories...
  ]
}
```

### Shipping

#### `GET /api/v1/shipping/options`

Lists available shipping options.

**Query Parameters:**
- `fromCountry` (required): Origin country code
- `toCountry` (required): Destination country code
- `weight` (required): Package weight in kg

**Response:**
```json
{
  "options": [
    {
      "id": "ship123",
      "name": "Standard",
      "description": "5-7 business days",
      "price": 10.00,
      "estimatedDays": 7
    },
    {
      "id": "ship124",
      "name": "Express",
      "description": "2-3 business days",
      "price": 25.00,
      "estimatedDays": 3
    }
    // More options...
  ]
}
```

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200 OK`: Successful request
- `201 Created`: Resource created
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Permission denied
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

Error responses follow this format:

```json
{
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "The provided parameter is invalid",
    "details": {
      "field": "price",
      "reason": "must be a positive number"
    }
  }
}
```

## Rate Limiting

API requests are limited to 100 requests per minute per IP address. Response headers include:

- `X-RateLimit-Limit`: Request limit
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Time when the limit resets

## Versioning

The API is versioned via the URL path (`/api/v1/`). Breaking changes will be released under new version numbers.

This API specification supports all required features of the AgroMark platform while following RESTful design principles. 