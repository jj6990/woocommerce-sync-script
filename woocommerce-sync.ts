import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import dotenv from 'dotenv';

// Configure environment variables
dotenv.config();

// Type definitions
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
    status?: string;
    featured?: boolean;
    virtual?: boolean;
    downloadable?: boolean;
    tax_status?: string;
    tax_class?: string;
    shipping_class?: string;
    shipping_class_id?: number;
    reviews_allowed?: boolean;
    average_rating?: string;
    rating_count?: number;
    total_sales?: number;
    parent_id?: number;
    purchase_note?: string;
    price?: string;
    meta_data?: Array<{
        key: string;
        value: any;
    }>;
    [key: string]: any; // Allow additional properties
}

interface SyncResult {
    success: boolean;
    product?: WooCommerceProduct;
    error?: string;
    sku: string;
}

interface SyncOptions {
    concurrency?: number;
    delay?: number;
}

interface ProductQueryOptions {
    per_page?: number;
    page?: number;
}

interface ApiError {
    response?: {
        status?: number;
        data?: {
            message?: string;
            [key: string]: any;
        };
    };
    message: string;
}

class WooCommerceSync {
    private baseURL: string;
    private consumerKey: string;
    private consumerSecret: string;
    public api: AxiosInstance;

    constructor() {
        // WooCommerce API configuration
        this.baseURL = process.env.WC_BASE_URL || 'https://your-site.com/wp-json/wc/v3';
        this.consumerKey = process.env.WC_CONSUMER_KEY || '';
        this.consumerSecret = process.env.WC_CONSUMER_SECRET || '';
        
        if (!this.consumerKey || !this.consumerSecret) {
            throw new Error('WooCommerce API credentials not found. Please set WC_CONSUMER_KEY and WC_CONSUMER_SECRET in your .env file');
        }

        // Create axios instance with authentication
        this.api = axios.create({
            baseURL: this.baseURL,
            auth: {
                username: this.consumerKey,
                password: this.consumerSecret
            },
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 30000, // 30 second timeout
        });

        // Add request/response interceptors for better error handling
        this.setupInterceptors();
    }

    /**
     * Setup axios interceptors for better error handling and logging
     */
    private setupInterceptors(): void {
        // Request interceptor
        this.api.interceptors.request.use(
            (config) => {
                console.log(`🌐 ${config.method?.toUpperCase()} ${config.url}`);
                return config;
            },
            (error) => {
                console.error('❌ Request error:', error.message);
                return Promise.reject(error);
            }
        );

        // Response interceptor
        this.api.interceptors.response.use(
            (response: AxiosResponse) => {
                console.log(`✅ ${response.status} ${response.statusText}`);
                return response;
            },
            (error: ApiError) => {
                const status = error.response?.status;
                const message = error.response?.data?.message || error.message;
                console.error(`❌ Response error ${status}: ${message}`);
                return Promise.reject(error);
            }
        );
    }

    /**
     * Find product by SKU
     * @param sku - Product SKU to search for
     * @returns Product object or null if not found
     */
    async findProductBySku(sku: string): Promise<WooCommerceProduct | null> {
        try {
            console.log(`🔍 Searching for product with SKU: ${sku}`);
            
            const response = await this.api.get<WooCommerceProduct[]>('/products', {
                params: {
                    sku: sku,
                    per_page: 1
                }
            });

            if (response.data && response.data.length > 0) {
                const product = response.data[0];
                if (product) {
                    console.log(`✅ Found product: ${product.name} (ID: ${product.id})`);
                    return product;
                }
            }
            
            console.log(`❌ No product found with SKU: ${sku}`);
            return null;
        } catch (error) {
            const apiError = error as ApiError;
            console.error(`❌ Error searching for product with SKU ${sku}:`, apiError.response?.data || apiError.message);
            throw error;
        }
    }

    /**
     * Create a new product
     * @param productData - Product data object
     * @returns Created product object
     */
    async createProduct(productData: WooCommerceProduct): Promise<WooCommerceProduct> {
        try {
            console.log(`🆕 Creating new product with SKU: ${productData.sku}`);
            
            const response = await this.api.post<WooCommerceProduct>('/products', productData);
            
            console.log(`✅ Product created successfully: ${response.data.name} (ID: ${response.data.id})`);
            return response.data;
        } catch (error) {
            const apiError = error as ApiError;
            console.error(`❌ Error creating product with SKU ${productData.sku}:`, apiError.response?.data || apiError.message);
            throw error;
        }
    }

    /**
     * Update an existing product
     * @param productId - Product ID to update
     * @param productData - Updated product data
     * @returns Updated product object
     */
    async updateProduct(productId: number, productData: WooCommerceProduct): Promise<WooCommerceProduct> {
        try {
            console.log(`🔄 Updating product ID: ${productId} with SKU: ${productData.sku}`);
            
            const response = await this.api.put<WooCommerceProduct>(`/products/${productId}`, productData);
            
            console.log(`✅ Product updated successfully: ${response.data.name} (ID: ${response.data.id})`);
            return response.data;
        } catch (error) {
            const apiError = error as ApiError;
            console.error(`❌ Error updating product ID ${productId}:`, apiError.response?.data || apiError.message);
            throw error;
        }
    }

    /**
     * Sync a single product by SKU (create or update)
     * @param productData - Product data to sync
     * @returns Synced product object
     */
    async syncProductBySku(productData: WooCommerceProduct): Promise<WooCommerceProduct> {
        if (!productData.sku) {
            throw new Error('Product SKU is required for syncing');
        }

        try {
            // Validate product data
            this.validateProductData(productData);
            
            // Check if product exists
            const existingProduct = await this.findProductBySku(productData.sku);
            
            if (existingProduct && existingProduct.id) {
                // Update existing product
                return await this.updateProduct(existingProduct.id, productData);
            } else {
                // Create new product
                return await this.createProduct(productData);
            }
        } catch (error) {
            console.error(`❌ Error syncing product with SKU ${productData.sku}:`, (error as Error).message);
            throw error;
        }
    }

    /**
     * Sync multiple products by SKU with improved concurrency control
     * @param productsData - Array of product data objects
     * @param options - Sync options
     * @returns Array of synced products
     */
    async syncMultipleProducts(productsData: WooCommerceProduct[], options: SyncOptions = {}): Promise<SyncResult[]> {
        const { concurrency = 3, delay = 1000 } = options;
        const results: SyncResult[] = [];
        
        console.log(`🚀 Starting bulk sync of ${productsData.length} products with concurrency: ${concurrency}...`);
        
        // Process products in batches
        for (let i = 0; i < productsData.length; i += concurrency) {
            const batch = productsData.slice(i, i + concurrency);
            const batchPromises = batch.map(async (productData, batchIndex) => {
                const globalIndex = i + batchIndex;
                
                try {
                    console.log(`\n📦 Processing product ${globalIndex + 1}/${productsData.length}`);
                    const result = await this.syncProductBySku(productData);
                    return { success: true, product: result, sku: productData.sku };
                } catch (error) {
                    return { 
                        success: false, 
                        error: (error as Error).message, 
                        sku: productData.sku 
                    };
                }
            });
            
            // Wait for current batch to complete
            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);
            
            // Add delay between batches (except for the last batch)
            if (i + concurrency < productsData.length) {
                console.log(`⏳ Waiting ${delay}ms before next batch...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        
        const successCount = results.filter(r => r.success).length;
        console.log(`\n✅ Bulk sync completed. Success: ${successCount}/${results.length}`);
        
        // Log failed items
        const failedItems = results.filter(r => !r.success);
        if (failedItems.length > 0) {
            console.log(`❌ Failed items:`, failedItems.map(item => item.sku));
        }
        
        return results;
    }

    /**
     * Validate product data structure
     * @param productData - Product data to validate
     * @returns True if valid
     */
    validateProductData(productData: WooCommerceProduct): boolean {
        const requiredFields: (keyof WooCommerceProduct)[] = ['name', 'sku'];
        
        for (const field of requiredFields) {
            if (!productData[field]) {
                throw new Error(`Required field '${String(field)}' is missing`);
            }
        }
        
        // Validate price format if provided
        if (productData.regular_price && typeof productData.regular_price !== 'string') {
            throw new Error('regular_price must be a string');
        }
        
        return true;
    }

    /**
     * Get all products with pagination support
     * @param options - Query options
     * @returns Array of products
     */
    async getAllProducts(options: ProductQueryOptions = {}): Promise<WooCommerceProduct[]> {
        const { per_page = 100, page = 1 } = options;
        
        try {
            console.log(`📋 Fetching products (page ${page}, ${per_page} per page)...`);
            
            const response = await this.api.get<WooCommerceProduct[]>('/products', {
                params: { per_page, page }
            });
            
            console.log(`✅ Retrieved ${response.data.length} products`);
            return response.data;
        } catch (error) {
            const apiError = error as ApiError;
            console.error('❌ Error fetching products:', apiError.response?.data || apiError.message);
            throw error;
        }
    }

    /**
     * Delete a product by ID
     * @param productId - Product ID to delete
     * @param force - Force delete (default: false)
     * @returns Deleted product object
     */
    async deleteProduct(productId: number, force: boolean = false): Promise<WooCommerceProduct> {
        try {
            console.log(`🗑️ Deleting product ID: ${productId} (force: ${force})`);
            
            const response = await this.api.delete<WooCommerceProduct>(`/products/${productId}`, {
                params: { force }
            });
            
            console.log(`✅ Product deleted successfully: ${response.data.name} (ID: ${response.data.id})`);
            return response.data;
        } catch (error) {
            const apiError = error as ApiError;
            console.error(`❌ Error deleting product ID ${productId}:`, apiError.response?.data || apiError.message);
            throw error;
        }
    }
}

// Example usage and helper functions
async function main(): Promise<void> {
    try {
        const sync = new WooCommerceSync();
        
        // Example: Sync a single product
        const sampleProduct: WooCommerceProduct = {
            name: "Sample Product",
            sku: "SAMPLE-001",
            regular_price: "29.99",
            stock_quantity: 100,
            manage_stock: true
        };

        console.log('🔄 Syncing sample product (price and stock only)...');
        const result = await sync.syncProductBySku(sampleProduct);
        console.log('📄 Sync result:', JSON.stringify(result, null, 2));

        // Example: Sync multiple products (price and stock only)
        const multipleProducts: WooCommerceProduct[] = [
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
        
        console.log('\n🔄 Syncing multiple products...');
        const bulkResults = await sync.syncMultipleProducts(multipleProducts, {
            concurrency: 2,
            delay: 1500
        });
        console.log('📄 Bulk sync results:', JSON.stringify(bulkResults, null, 2));
        
    } catch (error) {
        console.error('💥 Main execution error:', (error as Error).message);
        process.exit(1);
    }
}

// Export the class for use in other modules
export default WooCommerceSync;
export type { WooCommerceProduct, SyncResult, SyncOptions, ProductQueryOptions };

// Run main function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}
