import { createRemoteJWKSet, jwtVerify } from "jose";

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN!;
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE!;

const JWKS = createRemoteJWKSet(new URL(`https://${AUTH0_DOMAIN}/.well-known/jwks.json`));

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: `https://${AUTH0_DOMAIN}/`,
    audience: AUTH0_AUDIENCE,
  });
  return payload;
}
