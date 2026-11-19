import assert from 'node:assert/strict';
import test from 'node:test';
import { validateMailingSignup } from '../mailing-signup.ts';
import { subscribersCsv } from './subscriber-model.ts';
import { appAdminHref, hasFeature } from './app-model.ts';

const input = { email: ' Person@Example.com ', name: ' Maya ', consent: true, consentVersion: 'v1' };
test('signup requires explicit consent and a valid email', () => {
  for (const value of [null, {}, { ...input, consent: false }, { ...input, consent: 'true' }, { ...input, email: 'invalid' }, { ...input, email: 'a@b@c.com' }, { ...input, email: 'x'.repeat(255) }, { ...input, name: 'x'.repeat(101) }]) assert.equal(validateMailingSignup(value), null);
  assert.deepEqual(validateMailingSignup(input), { email: 'person@example.com', name: 'Maya', consentVersion: 'v1', website: '' });
});
test('signup retains the honeypot for the route to discard', () => {
  assert.equal(validateMailingSignup({ ...input, website: 'bot.example' }).website, 'bot.example');
});
test('app navigation preserves app ownership and missing modules are disabled', () => {
  const app = { id: 'rs', slug: 'relaxation-station', name: 'Relaxation Station', features: ['mailing_lists'] };
  assert.equal(appAdminHref(app), '/admin?app=relaxation-station&view=letters');
  assert.equal(appAdminHref(app, 'settings'), '/admin?app=relaxation-station&view=settings');
  assert.equal(hasFeature(app, 'feedback'), false);
});
test('CSV escapes quotes and prevents formula execution in contact fields', () => {
  const row = { person: { display_name: '=HYPERLINK("x")', email: '+test@example.com' }, status: 'subscribed', consentedAt: '2026-09-22', source: 'website', consentCopyVersion: 'v1' };
  const csv = subscribersCsv([row]);
  assert.ok(csv.includes('"\'=HYPERLINK(""x"")"'));
  assert.ok(csv.includes('"\'+test@example.com"'));
  assert.ok(csv.includes('\r\n'));
});

test('signup origins are scoped to their app and exact HTTPS website', async () => {
  const { mailingSignupCorsHeaders } = await import('../mailing-signup-origins.ts');
  const request = (origin) => new Request('https://sow.garden/api/mailing-lists/relaxation-station/updates/subscribe', { headers: origin ? { origin } : {} });
  const headers = mailingSignupCorsHeaders(request('https://relaxation-station.xyz'), 'relaxation-station', 'production');
  assert.equal(headers.get('access-control-allow-origin'), 'https://relaxation-station.xyz');
  assert.equal(headers.get('access-control-allow-credentials'), null);
  assert.equal(mailingSignupCorsHeaders(request('https://www.relaxation-station.xyz'), 'relaxation-station', 'production').get('access-control-allow-origin'), 'https://www.relaxation-station.xyz');
  assert.ok(headers.get('vary').includes('Origin'));
  for (const origin of [null, 'null', 'http://relaxation-station.xyz', 'https://relaxation-station.xyz.evil.test', 'http://127.0.0.1:3000']) {
    assert.equal(mailingSignupCorsHeaders(request(origin), 'relaxation-station', 'production'), null);
  }
  assert.equal(mailingSignupCorsHeaders(request('https://relaxation-station.xyz'), 'sow', 'production'), null);
  assert.equal(mailingSignupCorsHeaders(request('https://relaxation-station.xyz'), 'unknown-app', 'production'), null);
  assert.ok(mailingSignupCorsHeaders(request('https://www.ramblepatch.com'), 'ramble-patch', 'production'));
  assert.ok(mailingSignupCorsHeaders(request('https://ramblepatch.com'), 'ramble-patch', 'production'));
  assert.equal(mailingSignupCorsHeaders(request('https://www.ramblepatch.com'), 'sow', 'production'), null);
  assert.equal(mailingSignupCorsHeaders(request('https://www.ramblepatch.com.evil.test'), 'ramble-patch', 'production'), null);
  assert.ok(mailingSignupCorsHeaders(request('http://localhost:3001'), 'ramble-patch', 'development'));
  assert.equal(mailingSignupCorsHeaders(request('http://localhost:3001'), 'ramble-patch', 'production'), null);
  assert.ok(mailingSignupCorsHeaders(request('https://sow.garden'), 'sow', 'production'));
  assert.ok(mailingSignupCorsHeaders(request('http://127.0.0.1:3000'), 'relaxation-station', 'development'));
  assert.equal(mailingSignupCorsHeaders(request('http://127.0.0.1:3000'), 'sow', 'development'), null);
});
