export const BILLING_PRODUCT_SLUG = 'project-color-beacons';
export const BILLING_PRODUCTS_URL = 'https://api.sociobot.in/api/v1/products';

export type BillingProduct = {
  slug: string;
  checkout_url: string;
  price_minor: number;
  currency: string;
};

type BillingResponse = { data?: BillingProduct[] };

/**
 * The public catalogue is the source of truth for whether a checkout can be
 * offered.  A product-specific checkout URL may return 404 while a product is
 * being provisioned, so never render that URL optimistically.
 */
export async function registeredBillingProduct(fetcher: typeof fetch = fetch): Promise<BillingProduct | null> {
  const response = await fetcher(BILLING_PRODUCTS_URL, { credentials: 'omit' });
  if (!response.ok) return null;
  const body = await response.json() as BillingResponse;
  return body.data?.find((product) => product.slug === BILLING_PRODUCT_SLUG && Boolean(product.checkout_url)) ?? null;
}

/** Local previews and Tauri's local origin cannot pass the billing API's CORS
 * policy. They deliberately render the honest unavailable state instead. */
export async function registeredBillingProductForCurrentOrigin(): Promise<BillingProduct | null> {
  if (typeof location !== 'undefined' && location.protocol !== 'https:') return null;
  return registeredBillingProduct();
}

export function displayPrice(product: BillingProduct): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: product.currency || 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(product.price_minor / 100);
}
