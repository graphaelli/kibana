/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import crypto from 'crypto';

const CODE_VERIFIER_REGEX = /^[A-Za-z0-9._~-]{43,128}$/;

export function verifyCodeChallenge(
  codeVerifier: string,
  codeChallenge: string,
  method: 'S256'
): boolean {
  if (!CODE_VERIFIER_REGEX.test(codeVerifier)) {
    return false;
  }

  if (method !== 'S256') {
    return false;
  }

  const computedChallenge = computeCodeChallenge(codeVerifier);
  return timingSafeEqual(computedChallenge, codeChallenge);
}

export function computeCodeChallenge(codeVerifier: string): string {
  return crypto.createHash('sha256').update(codeVerifier).digest('base64url');
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  return crypto.timingSafeEqual(bufA, bufB);
}

export function validateCodeChallenge(codeChallenge: string): boolean {
  return /^[A-Za-z0-9._~-]{43,128}$/.test(codeChallenge);
}

export function validateCodeVerifier(codeVerifier: string): boolean {
  return CODE_VERIFIER_REGEX.test(codeVerifier);
}
