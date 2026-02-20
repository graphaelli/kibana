#!/usr/bin/env node

/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

/**
 * OAuth Authorization Demo Script
 *
 * Demonstrates the OAuth 2.0 Authorization Code flow with PKCE for Kibana.
 * This script:
 * 1. Generates PKCE code verifier and challenge
 * 2. Starts a local callback server
 * 3. Opens the browser to request authorization
 * 4. Receives the authorization code via redirect
 * 5. Exchanges the code for an access token
 * 6. Uses the token to run a query via the Kibana API
 * 7. Displays the results
 *
 * Usage:
 *   node scripts/oauth_demo.js [options] [kibana_url]
 *
 * Options:
 *   -k, --insecure    Allow connections to SSL sites without valid certificates
 *   -h, --help        Show this help message
 *
 * Example:
 *   node scripts/oauth_demo.js http://localhost:5601
 *   node scripts/oauth_demo.js https://my-kibana.example.com
 *   node scripts/oauth_demo.js --insecure https://localhost:5601
 */

const http = require('http');
const https = require('https');
const crypto = require('crypto');
const { URL, URLSearchParams } = require('url');
const { exec } = require('child_process');

const CALLBACK_PORT = 8765;
const CALLBACK_PATH = '/oauth/callback';
const SCOPES = ['read:discover', 'read:dashboards', 'read:data_views'];

function parseArgs(args) {
  const result = {
    kibanaUrl: 'http://localhost:5601',
    insecure: false,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '-k' || arg === '--insecure') {
      result.insecure = true;
    } else if (arg === '-h' || arg === '--help') {
      result.help = true;
    } else if (!arg.startsWith('-')) {
      result.kibanaUrl = arg;
    }
  }

  return result;
}

function showHelp() {
  console.log(`
OAuth Authorization Demo Script

Demonstrates the OAuth 2.0 Authorization Code flow with PKCE for Kibana.

Usage:
  node scripts/oauth_demo.js [options] [kibana_url]

Options:
  -k, --insecure    Allow connections to SSL sites without valid certificates
                    (useful for development with self-signed certs)
  -h, --help        Show this help message

Examples:
  node scripts/oauth_demo.js # defaults to http://localhost:5601
  node scripts/oauth_demo.js https://my-kibana.example.com
  node scripts/oauth_demo.js --insecure https://localhost:5601
`);
}

function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let result = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += chars[randomBytes[i] % chars.length];
  }
  return result;
}

function generateCodeVerifier() {
  return generateRandomString(64);
}

function generateCodeChallenge(verifier) {
  return crypto.createHash('sha256').update(verifier).digest('base64url');
}

function generateState() {
  return generateRandomString(32);
}

function openBrowser(url) {
  const platform = process.platform;
  let command;

  if (platform === 'darwin') {
    command = `open "${url}"`;
  } else if (platform === 'win32') {
    command = `start "${url}"`;
  } else {
    command = `xdg-open "${url}"`;
  }

  return new Promise((resolve, reject) => {
    exec(command, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

function httpRequest(url, options, body, { insecure = false } = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const isHttps = parsedUrl.protocol === 'https:';
    const lib = isHttps ? https : http;

    const requestOptions = { ...options };
    if (insecure && isHttps) {
      requestOptions.rejectUnauthorized = false;
    }

    const req = lib.request(
      url,
      requestOptions,
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
          });
        });
      }
    );

    req.on('error', reject);

    if (body) {
      req.write(body);
    }

    req.end();
  });
}

async function startCallbackServer(expectedState) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url, `http://localhost:${CALLBACK_PORT}`);

      if (url.pathname === CALLBACK_PATH) {
        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state');
        const error = url.searchParams.get('error');
        const errorDescription = url.searchParams.get('error_description');

        if (error) {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <head><title>Authorization Denied</title></head>
              <body style="font-family: sans-serif; padding: 40px; text-align: center;">
                <h1 style="color: #c00;">Authorization Denied</h1>
                <p><strong>Error:</strong> ${error}</p>
                <p>${errorDescription || 'The user denied the authorization request.'}</p>
                <p style="color: #666;">You can close this window.</p>
              </body>
            </html>
          `);
          server.close();
          reject(new Error(`Authorization denied: ${error} - ${errorDescription}`));
          return;
        }

        if (state !== expectedState) {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <head><title>Error</title></head>
              <body style="font-family: sans-serif; padding: 40px; text-align: center;">
                <h1 style="color: #c00;">State Mismatch</h1>
                <p>The state parameter does not match. This could indicate a CSRF attack.</p>
              </body>
            </html>
          `);
          server.close();
          reject(new Error('State mismatch - possible CSRF attack'));
          return;
        }

        if (!code) {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <head><title>Error</title></head>
              <body style="font-family: sans-serif; padding: 40px; text-align: center;">
                <h1 style="color: #c00;">Missing Authorization Code</h1>
                <p>No authorization code was received.</p>
              </body>
            </html>
          `);
          server.close();
          reject(new Error('No authorization code received'));
          return;
        }

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <head><title>Authorization Successful</title></head>
            <body style="font-family: sans-serif; padding: 40px; text-align: center;">
              <h1 style="color: #0a0;">Authorization Successful!</h1>
              <p>The authorization code has been received.</p>
              <p style="color: #666;">You can close this window and return to the terminal.</p>
            </body>
          </html>
        `);

        server.close();
        resolve(code);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      }
    });

    server.listen(CALLBACK_PORT, () => {
      console.log(`\n📡 Callback server listening on http://localhost:${CALLBACK_PORT}${CALLBACK_PATH}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        reject(new Error(`Port ${CALLBACK_PORT} is already in use. Please free it and try again.`));
      } else {
        reject(err);
      }
    });
  });
}

async function exchangeCodeForToken(kibanaUrl, code, codeVerifier, redirectUri, { insecure = false } = {}) {
  const tokenUrl = `${kibanaUrl}/oauth/token`;

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  }).toString();

  console.log('\n🔄 Exchanging authorization code for access token...');

  const response = await httpRequest(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  }, body, { insecure });

  if (response.statusCode !== 200) {
    let errorBody;
    try {
      errorBody = JSON.parse(response.body);
    } catch {
      throw new Error(`Token exchange failed with status ${response.statusCode}: ${response.body}`);
    }
    throw new Error(
      `Token exchange failed: ${errorBody.error || 'unknown_error'}` +
        (errorBody.error_description ? ` - ${errorBody.error_description}` : '') +
        (errorBody.message ? ` - ${errorBody.message}` : '')
    );
  }

  return JSON.parse(response.body);
}

async function runDiscoverQuery(kibanaUrl, accessToken, { insecure = false } = {}) {
  console.log('\n🔍 Running a discover query...');

  // First, get available data views
  const dataViewsUrl = `${kibanaUrl}/api/data_views`;

  const dvResponse = await httpRequest(dataViewsUrl, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'kbn-xsrf': 'true',
    },
  }, null, { insecure });

  if (dvResponse.statusCode !== 200) {
    console.log(`\n⚠️  Could not fetch data views (status ${dvResponse.statusCode})`);
    console.log('Response:', dvResponse.body);
    return null;
  }

  const dataViews = JSON.parse(dvResponse.body);
  console.log(`\n📊 Found ${dataViews.data_view?.length || 0} data view(s)`);

  if (dataViews.data_view && dataViews.data_view.length > 0) {
    console.log('\nData Views:');
    dataViews.data_view.slice(0, 5).forEach((dv, i) => {
      console.log(`  ${i + 1}. ${dv.name || dv.title} (${dv.id})`);
    });
    if (dataViews.data_view.length > 5) {
      console.log(`  ... and ${dataViews.data_view.length - 5} more`);
    }
  }

  return dataViews;
}

async function listDashboards(kibanaUrl, accessToken, { insecure = false } = {}) {
  console.log('\n📋 Fetching dashboards...');

  const dashboardsUrl = `${kibanaUrl}/api/saved_objects/_find?type=dashboard&per_page=10`;

  const response = await httpRequest(dashboardsUrl, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'kbn-xsrf': 'true',
    },
  }, null, { insecure });

  if (response.statusCode !== 200) {
    console.log(`\n⚠️  Could not fetch dashboards (status ${response.statusCode})`);
    console.log('Response:', response.body);
    return null;
  }

  const result = JSON.parse(response.body);
  console.log(`\n📊 Found ${result.total || 0} dashboard(s)`);

  if (result.saved_objects && result.saved_objects.length > 0) {
    console.log('\nDashboards:');
    result.saved_objects.forEach((dashboard, i) => {
      console.log(`  ${i + 1}. ${dashboard.attributes?.title || 'Untitled'} (${dashboard.id})`);
    });
  }

  return result;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  const { kibanaUrl, insecure } = args;

  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║           Kibana OAuth Authorization Demo                      ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log(`\nKibana URL: ${kibanaUrl}`);
  if (insecure) {
    console.log('⚠️  SSL certificate verification disabled (--insecure)');
  }
  console.log(`Requested scopes: ${SCOPES.join(', ')}`);

  // Step 1: Generate PKCE values
  console.log('\n🔐 Generating PKCE code verifier and challenge...');
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = generateState();

  console.log(`   Code Verifier: ${codeVerifier.substring(0, 20)}...`);
  console.log(`   Code Challenge: ${codeChallenge}`);
  console.log(`   State: ${state}`);

  // Step 2: Build authorization URL
  const redirectUri = `http://localhost:${CALLBACK_PORT}${CALLBACK_PATH}`;
  const authUrl = new URL(`${kibanaUrl}/oauth/authorize`);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', SCOPES.join(' '));
  authUrl.searchParams.set('code_challenge', codeChallenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('client_name', 'OAuth Demo Script');

  console.log(`\n🌐 Authorization URL:\n   ${authUrl.toString()}`);

  // Step 3: Start callback server and open browser
  const callbackPromise = startCallbackServer(state);

  console.log('\n🚀 Opening browser for authorization...');
  console.log('   (If the browser does not open, please visit the URL above manually)');

  try {
    await openBrowser(authUrl.toString());
  } catch (err) {
    console.log(`\n⚠️  Could not open browser automatically: ${err.message}`);
    console.log('   Please open the authorization URL manually in your browser.');
  }

  console.log('\n⏳ Waiting for authorization...');

  // Step 4: Wait for authorization code
  let authorizationCode;
  try {
    authorizationCode = await callbackPromise;
    console.log(`\n✅ Received authorization code: ${authorizationCode.substring(0, 20)}...`);
  } catch (err) {
    console.error(`\n❌ ${err.message}`);
    process.exit(1);
  }

  // Step 5: Exchange code for token
  let tokenResponse;
  try {
    tokenResponse = await exchangeCodeForToken(kibanaUrl, authorizationCode, codeVerifier, redirectUri, { insecure });
    console.log('\n✅ Access token received!');
    console.log(`   Token type: ${tokenResponse.token_type}`);
    console.log(`   Expires in: ${tokenResponse.expires_in} seconds`);
    console.log(`   Scopes: ${tokenResponse.scope}`);
    console.log(`   Access token: ${tokenResponse.access_token.substring(0, 30)}...`);
  } catch (err) {
    console.error(`\n❌ Token exchange failed: ${err.message}`);
    process.exit(1);
  }

  // Step 6: Use the token to access Kibana APIs
  console.log('\n' + '─'.repeat(60));
  console.log('Testing API access with the obtained token...');
  console.log('─'.repeat(60));

  try {
    await listDashboards(kibanaUrl, tokenResponse.access_token, { insecure });
  } catch (err) {
    console.log(`\n⚠️  Dashboard query failed: ${err.message}`);
  }

  try {
    await runDiscoverQuery(kibanaUrl, tokenResponse.access_token, { insecure });
  } catch (err) {
    console.log(`\n⚠️  Discover query failed: ${err.message}`);
  }

  console.log('\n' + '═'.repeat(60));
  console.log('🎉 OAuth demo completed successfully!');
  console.log('═'.repeat(60));
  console.log(`\nYou can use this access token to make authenticated requests:`);
  console.log(`\n  curl -H "Authorization: Bearer ${tokenResponse.access_token}" \\`);
  console.log(`       "${kibanaUrl}/api/saved_objects/_find?type=dashboard"`);
  console.log(`\nThe token expires in ${Math.round(tokenResponse.expires_in / 60)} minutes.`);
  console.log(`\nTo revoke the grant, visit: ${kibanaUrl}/security/oauth_grants`);
}

main().catch((err) => {
  console.error('\n❌ Fatal error:', err.message);
  process.exit(1);
});
