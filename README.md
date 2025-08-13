# WooCommerce Product Sync

A TypeScript-based Node.js library for syncing WooCommerce products by SKU using the REST API. Built for Node.js 22.18.0+ with full TypeScript support.

## Features

- ✅ **TypeScript Support** - Full type safety and IntelliSense
- 🔄 **Product Sync** - Create or update products by SKU
- 📦 **Bulk Operations** - Sync multiple products with concurrency control
- 🔍 **Product Search** - Find products by SKU
- 🗑️ **Product Management** - Delete products with force option
- 📋 **Pagination Support** - Get all products with pagination
- 🛡️ **Error Handling** - Comprehensive error handling and logging
- ⚡ **Performance** - Configurable concurrency and rate limiting

## Prerequisites

- Node.js 22.18.0 or higher
- WooCommerce store with REST API enabled
- WooCommerce API credentials (Consumer Key & Secret)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd wordpress-api
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your WooCommerce credentials:
```env
WC_BASE_URL=https://your-site.com/wp-json/wc/v3
WC_CONSUMER_KEY=your_consumer_key_here
WC_CONSUMER_SECRET=your_consumer_secret_here
```

## Usage

### Development

For development with hot reload:
```bash
npm run dev
```

### Production

Build and run:
```bash
npm run build
npm start
```

### Type Checking

Check TypeScript types without building:
```bash
npm run type-check
```

## API Reference

### Basic Usage

```typescript
import WooCommerceSync from './woocommerce-sync.js';

const sync = new WooCommerceSync();

// Sync a single product
const product = {
    name: "Sample Product",
    sku: "SAMPLE-001",
    regular_price: "29.99",
    stock_quantity: 100,
    manage_stock: true
};

const result = await sync.syncProductBySku(product);
```

### Bulk Sync

```typescript
const products = [
    {
        name: "Product A",
        sku: "PROD-A-001",
        regular_price: "19.99",
        stock_quantity: 50,
        manage_stock: true
    },
    {
        name: "Product B",
        sku: "PROD-B-002",
        regular_price: "24.99",
        stock_quantity: 75,
        manage_stock: true
    }
];

const results = await sync.syncMultipleProducts(products, {
    concurrency: 2,
    delay: 1500
});
```

### Find Product

```typescript
const product = await sync.findProductBySku("PROD-001");
if (product) {
    console.log(`Found: ${product.name}`);
}
```

### Get All Products

```typescript
const products = await sync.getAllProducts({
    per_page: 50,
    page: 1
});
```

### Delete Product

```typescript
await sync.deleteProduct(123, true); // force delete
```

## TypeScript Interfaces

### WooCommerceProduct

```typescript
interface WooCommerceProduct {
    id?: number;
    name: string;
    sku: string;
    type?: string;
    regular_price?: string;
    sale_price?: string;
    description?: string;
    short_description?: string;
    categories?: Array<{ id: number }>;
    images?: Array<{ src: string }>;
    manage_stock?: boolean;
    stock_quantity?: number;
    in_stock?: boolean;
    weight?: string;
    dimensions?: {
        length: string;
        width: string;
        height: string;
    };
    // ... and more
}
```

### SyncOptions

```typescript
interface SyncOptions {
    concurrency?: number; // Default: 3
    delay?: number;       // Default: 1000ms
}
```

### SyncResult

```typescript
interface SyncResult {
    success: boolean;
    product?: WooCommerceProduct;
    error?: string;
    sku: string;
}
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `WC_BASE_URL` | WooCommerce REST API base URL | `https://your-site.com/wp-json/wc/v3` |
| `WC_CONSUMER_KEY` | WooCommerce Consumer Key | Required |
| `WC_CONSUMER_SECRET` | WooCommerce Consumer Secret | Required |

### API Configuration

The library automatically configures:
- 30-second request timeout
- Basic authentication
- Request/response interceptors for logging
- JSON content type headers

## Error Handling

The library provides comprehensive error handling:

```typescript
try {
    const result = await sync.syncProductBySku(product);
} catch (error) {
    if (error.response?.status === 404) {
        console.log('Product not found');
    } else if (error.response?.status === 401) {
        console.log('Authentication failed');
    } else {
        console.error('Sync failed:', error.message);
    }
}
```

## Performance Tips

1. **Concurrency Control**: Adjust the `concurrency` option based on your server's capacity
2. **Rate Limiting**: Use the `delay` option to prevent hitting API rate limits
3. **Batch Processing**: The library automatically processes products in batches
4. **Error Recovery**: Failed products are logged separately for easy retry

## Development

### Project Structure

```
wordpress-api/
├── woocommerce-sync.ts    # Main TypeScript source
├── tsconfig.json          # TypeScript configuration
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables (create this)
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

### Available Scripts

- `npm run dev` - Run in development mode with tsx
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run the built JavaScript
- `npm run type-check` - Check TypeScript types
- `npm run clean` - Clean build directory

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run type-check` to ensure type safety
5. Run `npm run build` to ensure the build works
6. Submit a pull request

## License

MIT License - see LICENSE file for details.
