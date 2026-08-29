import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { displayPrice, registeredBillingProduct } from '../../shared/billing';

const readRepositoryFile = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

describe('release regression configuration', () => {
  it('keeps browser specs out of the unit-test command', () => {
    const config = readRepositoryFile('vitest.config.ts');
    expect(config).toContain("include: ['tests/unit/**/*.test.ts']");
    expect(config).toContain("exclude: ['tests/**/*.spec.ts']");
  });

  it('keeps Vitest unit files out of the browser-test command', () => {
    const config = readRepositoryFile('playwright.config.ts');
    expect(config).toContain("testMatch: '**/*.spec.ts'");
  });

  it('marks content-hashed site assets immutable', () => {
    const config = JSON.parse(readRepositoryFile('site/public/staticwebapp.config.json')) as {
      routes?: Array<{ route?: string; headers?: Record<string, string> }>;
    };
    expect(config.routes).toContainEqual({
      route: '/assets/*',
      headers: { 'Cache-Control': 'public, max-age=31536000, immutable' }
    });
  });

  it('accepts a checkout only for this product from the public catalogue', async () => {
    const fetcher = async () => new Response(JSON.stringify({ data: [
      { slug: 'another-product', checkout_url: 'https://example.test/checkout', price_minor: 999, currency: 'USD' },
      { slug: 'project-color-beacons', checkout_url: 'https://api.sociobot.in/api/v1/products/project-color-beacons/checkout', price_minor: 2400, currency: 'USD' }
    ] }), { status: 200 });
    const product = await registeredBillingProduct(fetcher as typeof fetch);
    expect(product?.checkout_url).toBe('https://api.sociobot.in/api/v1/products/project-color-beacons/checkout');
    expect(product && displayPrice(product)).toBe('$24');
  });
});
