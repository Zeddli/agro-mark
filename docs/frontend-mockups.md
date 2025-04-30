# AgroMark Frontend Mockups

This document outlines the key screens and user interface components for the AgroMark platform.

## Key Screens

### 1. Landing Page & Marketplace
```
┌────────────────────────────────────────────────────────────────┐
│ ┌──────────┐ AgroMark            Search...       [Connect Wallet] │
│ └──────────┘                                                    │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                                                         │  │
│  │               Featured Products & Categories            │  │
│  │                                                         │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐      │
│  │ Category  │ │ Category  │ │ Category  │ │ Category  │      │
│  │   Icon    │ │   Icon    │ │   Icon    │ │   Icon    │      │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘      │
│                                                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ Product Card│  │ Product Card│  │ Product Card│            │
│  │  [Image]    │  │  [Image]    │  │  [Image]    │            │
│  │  Title      │  │  Title      │  │  Title      │            │
│  │  Price      │  │  Price      │  │  Price      │            │
│  │  Seller     │  │  Seller     │  │  Seller     │            │
│  │  Rating ★★★★☆│  │  Rating ★★★☆☆│  │  Rating ★★★★★│            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                                                         │  │
│  │                    Load More Products                   │  │
│  │                                                         │  │
│  └─────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

### 2. Product Detail View
```
┌────────────────────────────────────────────────────────────────┐
│ ┌──────────┐ AgroMark            Search...       [User Menu ▼] │
│ └──────────┘                                                    │
├────────────────────────────────────────────────────────────────┤
│  ← Back to Marketplace                                         │
│                                                                │
│  ┌───────────────────┐  ┌─────────────────────────────────┐   │
│  │                   │  │ Organic Red Apples              │   │
│  │                   │  │                                 │   │
│  │                   │  │ Price: 5.2 USDC per kg          │   │
│  │     Product       │  │ Available: 500 kg               │   │
│  │      Images       │  │ Category: Fruits                │   │
│  │                   │  │                                 │   │
│  │    [Thumbnail]    │  │ ┌────────────────────────────┐ │   │
│  │    [Thumbnail]    │  │ │ Quantity: [___] kg         │ │   │
│  │    [Thumbnail]    │  │ │                            │ │   │
│  └───────────────────┘  │ │ [Add to Cart]  [Buy Now]   │ │   │
│                         │ └────────────────────────────┘ │   │
│                         │                                 │   │
│                         │ Seller: FarmFresh              │   │
│                         │ Rating: ★★★★☆ (4.2/5)           │   │
│                         │ Location: California, USA       │   │
│                         └─────────────────────────────────┘   │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Product Description                                     │  │
│  │                                                         │  │
│  │ Fresh organic red apples harvested this week from our   │  │
│  │ family farm. These apples are grown without pesticides  │  │
│  │ or chemical fertilizers. Perfect for eating fresh,      │  │
│  │ baking, or making cider.                               │  │
│  │                                                         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Shipping Options                                        │  │
│  │                                                         │  │
│  │ ○ Standard (5-7 days): 10 USDC                         │  │
│  │ ○ Express (2-3 days): 25 USDC                          │  │
│  │ ○ Local Pickup: Free                                   │  │
│  │                                                         │  │
│  └─────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

### 3. Seller Dashboard
```
┌────────────────────────────────────────────────────────────────┐
│ ┌──────────┐ AgroMark            Search...       [User Menu ▼] │
│ └──────────┘                                                    │
├────────────────────────────────────────────────────────────────┤
│  ┌────────────────┐                                            │
│  │ Dashboard      │  ┌─────────────────────────────────────┐  │
│  │ Products       │  │ Sales Overview                      │  │
│  │ Orders         │  │                                     │  │
│  │ Reviews        │  │ [Chart: Weekly Sales]               │  │
│  │ Statistics     │  │                                     │  │
│  │ Settings       │  │ Total Sales: 1,250 USDC             │  │
│  └────────────────┘  │ Pending Orders: 5                   │  │
│                      │ Completed Orders: 28                │  │
│                      └─────────────────────────────────────┘  │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Recent Orders                                           │  │
│  │                                                         │  │
│  │ #1242 | Buyer: CryptoFarmer | Status: Paid | 25 USDC    │  │
│  │ Organic Tomatoes (10kg) | Action: [Mark as Shipped]     │  │
│  │ ─────────────────────────────────────────────────────── │  │
│  │ #1241 | Buyer: FreshBuyer | Status: Delivered | 42 USDC  │  │
│  │ Free-range Eggs (5 dozen) | Action: [Complete]          │  │
│  │ ─────────────────────────────────────────────────────── │  │
│  │ #1240 | Buyer: VeggieKing | Status: Completed | 78 USDC  │  │
│  │ Mixed Vegetables (15kg) | Action: [View Details]        │  │
│  │                                                         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Inventory Management                             [+ Add] │  │
│  │                                                         │  │
│  │ Organic Apples | 500kg remaining | 5.2 USDC/kg | Active  │  │
│  │ Action: [Edit] [Deactivate]                             │  │
│  │ ─────────────────────────────────────────────────────── │  │
│  │ Free-range Eggs | 25 dozen remaining | 8.5 USDC/dozen   │  │
│  │ Action: [Edit] [Deactivate]                             │  │
│  │                                                         │  │
│  └─────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

### 4. Checkout & Payment Flow
```
┌────────────────────────────────────────────────────────────────┐
│ ┌──────────┐ AgroMark            Search...       [User Menu ▼] │
│ └──────────┘                                                    │
├────────────────────────────────────────────────────────────────┤
│  ← Back to Cart                                                │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Checkout                                                │  │
│  │                                                         │  │
│  │ 1. [✓] Review Items                                     │  │
│  │ 2. [•] Shipping Information                             │  │
│  │ 3. [ ] Payment                                          │  │
│  │ 4. [ ] Confirmation                                     │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Shipping Address                                        │  │
│  │                                                         │  │
│  │ Name:      [______________________________]             │  │
│  │ Address 1: [______________________________]             │  │
│  │ Address 2: [______________________________]             │  │
│  │ City:      [__________] State: [__] Zip: [_____]        │  │
│  │ Country:   [______________________________]             │  │
│  │ Phone:     [______________________________]             │  │
│  │                                                         │  │
│  │            [Save Address]                               │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Order Summary                                           │  │
│  │                                                         │  │
│  │ Organic Red Apples (10 kg):           52.00 USDC        │  │
│  │ Shipping (Standard):                  10.00 USDC        │  │
│  │ Platform Fee (2.5%):                   1.55 USDC        │  │
│  │ ─────────────────────────────────────────────────────── │  │
│  │ Total:                                63.55 USDC        │  │
│  │                                                         │  │
│  │         [Continue to Payment]                           │  │
│  └─────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

### 5. Wallet Connection & Authentication
```
┌────────────────────────────────────────────────────────────────┐
│ ┌──────────┐ AgroMark            Search...       [Connect Wallet] │
│ └──────────┘                                                    │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                                                         │  │
│  │                   Connect Your Wallet                   │  │
│  │                                                         │  │
│  │  Choose a wallet to connect to AgroMark:                │  │
│  │                                                         │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │  │
│  │  │  Phantom    │  │  Solflare   │  │   Slope     │     │  │
│  │  │   Wallet    │  │   Wallet    │  │   Wallet    │     │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │  │
│  │                                                         │  │
│  │  By connecting your wallet, you agree to our            │  │
│  │  Terms of Service and Privacy Policy                    │  │
│  │                                                         │  │
│  │                                                         │  │
│  │  New to Solana? Learn how to create a wallet →          │  │
│  │                                                         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

## Mobile Responsive Design

All screens will be optimized for mobile devices with the following considerations:

1. **Navigation**: Hamburger menu for main navigation on small screens
2. **Product Cards**: Single column layout on mobile devices
3. **Forms**: Full-width input fields with larger touch targets
4. **Images**: Responsive sizing with lazy loading
5. **Checkout**: Multi-step process with one section visible at a time

## Accessibility Features

1. **Color Contrast**: WCAG 2.1 AA compliant color contrast ratios
2. **Screen Readers**: Proper ARIA labels and semantic HTML
3. **Keyboard Navigation**: Full functionality without mouse input
4. **Font Sizing**: Scalable typography with relative units
5. **Error Handling**: Clear error messages with visual indicators

## Offline Support

1. **Product Browsing**: Cached products viewable offline
2. **Transaction Queue**: Ability to prepare transactions offline for later submission
3. **Form Persistence**: Saved draft listings that sync when connectivity returns
4. **Status Indicators**: Clear visual indicators of online/offline status
5. **Service Worker**: PWA implementation with background sync

## Internationalization

The UI will support multiple languages with right-to-left (RTL) layout support for appropriate languages. Initial languages:

1. English (default)
2. Spanish
3. Mandarin Chinese
4. Hindi
5. Arabic (with RTL support)

## Design System

1. **Colors**:
   - Primary: #3B82F6 (Blue)
   - Secondary: #10B981 (Green)
   - Accent: #F59E0B (Amber)
   - Neutral: #1F2937 (Dark Gray)
   - Background: #F9FAFB (Light Gray)

2. **Typography**:
   - Headings: Inter (sans-serif)
   - Body: Roboto (sans-serif)
   - Monospace: Roboto Mono (for prices and technical information)

3. **Components**:
   - Buttons: Rounded with hover and active states
   - Cards: Subtle shadows with hover interactions
   - Forms: Floating labels with validation states
   - Modals: Centered with backdrop overlay

4. **Iconography**:
   - Custom agriculture-themed icon set
   - Supplemented with Heroicons for UI elements

This frontend design supports all key features of the AgroMark platform while ensuring accessibility, performance, and usability across devices. 