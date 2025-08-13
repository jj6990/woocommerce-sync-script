# WooCommerce REST API v3 - Postman Collection

This Postman collection provides a comprehensive set of API endpoints for interacting with the WooCommerce REST API v3. It includes all the endpoints used in your WooCommerce sync script and additional useful endpoints for complete store management.

## Files Included

- `WooCommerce_API_Collection.postman_collection.json` - The main Postman collection
- `WooCommerce_API_Environment.postman_environment.json` - Environment variables for easy configuration

## Setup Instructions

### 1. Import the Collection

1. Open Postman
2. Click "Import" button
3. Select the `WooCommerce_API_Collection.postman_collection.json` file
4. The collection will be imported with all endpoints organized in folders

### 2. Import the Environment

1. In Postman, click "Import" again
2. Select the `WooCommerce_API_Environment.postman_environment.json` file
3. The environment will be available in the environment dropdown

### 3. Configure Your WooCommerce Site

1. Select the "WooCommerce API Environment" from the environment dropdown
2. Click the "eye" icon next to the environment name to edit variables
3. Update the following variables:

#### Required Variables:
- **`base_url`**: Your WooCommerce site URL + API path
  - Example: `https://your-site.com/wp-json/wc/v3`
  - Replace `your-site.com` with your actual domain

- **`consumer_key`**: Your WooCommerce API consumer key
  - Get this from WooCommerce → Settings → Advanced → REST API
  - Create a new API key if you don't have one

- **`consumer_secret`**: Your WooCommerce API consumer secret
  - This is generated along with the consumer key

#### Optional Variables (for testing):
- **`product_id`**: ID of an existing product for testing
- **`product_sku`**: SKU of an existing product for testing
- **`category_id`**: ID of an existing category for testing
- **`order_id`**: ID of an existing order for testing
- **`customer_id`**: ID of an existing customer for testing
- **`search_term`**: Search term for testing product search

### 4. Test the Connection

1. Select the "Get System Status" request from the "System Status" folder
2. Click "Send" to test if your API credentials are working
3. You should receive a JSON response with system information

## Collection Structure

### Products Folder
- **Get All Products** - Retrieve all products with pagination
- **Get Product by ID** - Get a specific product by its ID
- **Find Product by SKU** - Search for a product by SKU (matches your sync script)
- **Create Product** - Create a new product
- **Update Product** - Update an existing product
- **Delete Product** - Delete a product (move to trash or force delete)
- **Get Products by Category** - Filter products by category
- **Search Products** - Search products by name, description, or SKU

### Categories Folder
- **Get All Categories** - Retrieve all product categories
- **Get Category by ID** - Get a specific category by ID
- **Create Category** - Create a new product category

### Orders Folder
- **Get All Orders** - Retrieve all orders with pagination
- **Get Order by ID** - Get a specific order by ID
- **Create Order** - Create a new order
- **Update Order** - Update an existing order

### Customers Folder
- **Get All Customers** - Retrieve all customers
- **Get Customer by ID** - Get a specific customer by ID
- **Create Customer** - Create a new customer

### System Status Folder
- **Get System Status** - Get WooCommerce system information
- **Get System Tools** - Get available system tools

## Authentication

The collection uses Basic Authentication with your WooCommerce API credentials:
- **Username**: Your consumer key
- **Password**: Your consumer secret

This is automatically configured for all requests using environment variables.

## Key Features

### Environment Variables
All requests use environment variables for easy configuration:
- `{{base_url}}` - Your WooCommerce API base URL
- `{{consumer_key}}` - Your API consumer key
- `{{consumer_secret}}` - Your API consumer secret
- `{{product_id}}`, `{{product_sku}}`, etc. - Test data variables

### Pre-request Scripts
The collection includes a pre-request script that validates environment variables and warns you if they're not set up correctly.

### Example Request Bodies
All POST and PUT requests include example JSON bodies that you can modify for your specific needs.

### Pagination Support
GET requests that return lists include pagination parameters (`per_page`, `page`) for handling large datasets.

## Usage Examples

### Finding a Product by SKU (like your sync script)
1. Go to the "Products" folder
2. Select "Find Product by SKU"
3. Update the `product_sku` environment variable or modify the query parameter
4. Click "Send"

### Creating a New Product
1. Go to the "Products" folder
2. Select "Create Product"
3. Modify the request body with your product data
4. Click "Send"

### Updating Product Stock
1. First, find your product using "Find Product by SKU"
2. Copy the product ID from the response
3. Update the `product_id` environment variable
4. Use "Update Product" with a body like:
```json
{
  "stock_quantity": 50,
  "manage_stock": true,
  "in_stock": true
}
```

## Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Check your consumer key and secret
   - Ensure they're correctly set in the environment variables
   - Verify the API key has the correct permissions

2. **404 Not Found**
   - Check your `base_url` - make sure it includes `/wp-json/wc/v3`
   - Verify your WooCommerce site is accessible

3. **403 Forbidden**
   - Check API key permissions in WooCommerce admin
   - Ensure the API key has read/write access as needed

4. **Rate Limiting**
   - WooCommerce may limit API requests
   - Add delays between requests if needed
   - Consider using the bulk operations from your sync script

### Getting API Credentials

1. Go to your WordPress admin panel
2. Navigate to WooCommerce → Settings → Advanced → REST API
3. Click "Add Key"
4. Set permissions (Read/Write for full access)
5. Copy the Consumer Key and Consumer Secret

## Integration with Your Sync Script

This Postman collection complements your `woocommerce-sync.ts` script by providing:

1. **Manual Testing** - Test API endpoints before implementing in code
2. **Debugging** - Verify API responses and troubleshoot issues
3. **Documentation** - See exactly what endpoints and parameters are available
4. **Development** - Use as a reference when adding new features to your sync script

The collection includes all the endpoints your sync script uses:
- Product search by SKU
- Product creation and updates
- Bulk operations (though Postman handles these individually)

## Security Notes

- Never commit your actual API credentials to version control
- Use environment variables for sensitive data
- Consider using different API keys for development and production
- Regularly rotate your API keys for security

## Support

If you encounter issues:
1. Check the WooCommerce REST API documentation
2. Verify your API credentials and permissions
3. Test with the "Get System Status" endpoint first
4. Check your WooCommerce and WordPress versions are compatible
