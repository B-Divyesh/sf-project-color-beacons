import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { displayPrice, registeredBillingProduct } from '../../shared/billing';
import { APP_VERSION, BUILD_DATE } from '../../shared/build-info.mjs';

const readRepositoryFile = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

describe('release regression configuration', () => {
  it('gives every registered claim exactly one tagged browser test', () => {
    const claims = JSON.parse(readRepositoryFile('.factory/claims.json')) as Array<{ id: string }>;
    const browserTests = readRepositoryFile('tests/claims.spec.ts');
    for (const { id } of claims) {
      const matches = browserTests.match(new RegExp(`@claim:${id}(?![a-z0-9-])`, 'g')) ?? [];
      expect(matches, id).toHaveLength(1);
    }
    const taggedIds = [...browserTests.matchAll(/@claim:([a-z0-9-]+)/g)].map((match) => match[1]);
    expect(new Set(taggedIds)).toEqual(new Set(claims.map(({ id }) => id)));
  });

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

  it('rewrites only known app routes so unknown URLs use the HTTP 404 override', () => {
    const config = JSON.parse(readRepositoryFile('site/public/staticwebapp.config.json')) as {
      navigationFallback?: unknown;
      routes?: Array<{ route?: string; rewrite?: string }>;
      responseOverrides?: Record<string, { rewrite?: string }>;
    };
    expect(config.navigationFallback).toBeUndefined();
    expect(config.routes).toEqual(expect.arrayContaining([
      { route: '/demo', rewrite: '/index.html' },
      { route: '/privacy', rewrite: '/index.html' },
      { route: '/terms', rewrite: '/index.html' }
    ]));
    expect(config.responseOverrides?.['404']).toEqual({ rewrite: '/404.html' });
  });

  it('builds the standalone 404 footer from the same build identity as the site shell', () => {
    const template = readRepositoryFile('site/public/404.html.template');
    const output = readRepositoryFile('site/public/404.html');
    const shell = readRepositoryFile('site/src/main.ts');
    expect(template).toContain('Version __APP_VERSION__ · Build __BUILD_DATE__');
    expect(output).toContain(`Version ${APP_VERSION} · Build ${BUILD_DATE}`);
    expect(shell).toContain("from '../../shared/build-info.mjs'");
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
