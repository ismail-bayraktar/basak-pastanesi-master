# Shared Packages

This directory contains shared packages used across all Başak Pastanesi applications.

## Packages

### @repo/types
Shared TypeScript type definitions for:
- Product, Category, Order, Cart models
- API request/response types
- Store state interfaces
- Slider and Auth types

### @repo/utils
Common utility functions:
- `cn()` - Tailwind class merging
- `generateSlug()` - URL-friendly slug generation with Turkish character support
- `formatCurrency()`, `formatPrice()` - Currency formatting
- `formatDate()`, `formatDateTime()` - Date formatting
- `getImageUrl()` - Image URL handling

### @repo/constants
Application constants:
- API endpoint paths
- Order status values
- Payment methods
- Product sizes and types

## Usage

In any app (web, admin, api):

```typescript
// Import types
import type { Product, Category } from '@repo/types';

// Import utilities
import { cn, formatPrice, generateSlug } from '@repo/utils';

// Import constants
import { API_ENDPOINTS, ORDER_STATUS } from '@repo/constants';
```

## Development

Build all packages:
```bash
pnpm run build
```

Watch mode for development:
```bash
pnpm run dev
```
