import type { NextConfig } from "next";

function configuredSiteHostname() {
  try {
    return process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname : undefined;
  } catch {
    return undefined;
  }
}

const siteHostname = configuredSiteHostname();
const allowedDevOrigins = [...new Set(["localhost", "127.0.0.1", siteHostname].filter((value): value is string => Boolean(value)))];

const nextConfig: NextConfig = {
  // The mobile QR uses this machine's LAN address during local development.
  // Next blocks dev-only chunks from non-localhost origins unless explicitly allowed.
  allowedDevOrigins,
};

export default nextConfig;
