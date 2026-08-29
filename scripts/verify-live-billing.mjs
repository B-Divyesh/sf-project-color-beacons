import assert from 'node:assert/strict';

const slug = 'project-color-beacons';
const apiBase = 'https://api.sociobot.in/api/v1';
const checkoutUrl = `${apiBase}/products/${slug}/checkout`;

const catalogueResponse = await fetch(`${apiBase}/products`, { cache: 'no-store' });
assert.equal(catalogueResponse.status, 200, 'Sociobot product catalogue must answer with HTTP 200');

const catalogue = await catalogueResponse.json();
const matches = catalogue.data?.filter((product) => product.slug === slug) ?? [];
assert.equal(matches.length, 1, 'Sociobot must list exactly one Project Color Beacons product');
assert.deepEqual(matches[0], {
  checkout_url: checkoutUrl,
  currency: 'USD',
  name: 'Project Color Beacons',
  price_minor: 2400,
  product_url: 'https://project-color-beacons.sociobot.in/',
  slug
});

const checkoutResponse = await fetch(checkoutUrl, { redirect: 'manual' });
assert.equal(checkoutResponse.status, 303, 'Checkout must redirect to the hosted payment page');
const location = checkoutResponse.headers.get('location');
assert.ok(location, 'Checkout redirect must include a location');
assert.equal(new URL(location).origin, 'https://checkout.dodopayments.com');

console.log('Live billing passed: one $24 product and a hosted checkout redirect.');
