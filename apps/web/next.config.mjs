import process from "node:process";

const getSupabaseConnectSources = () => {
  const fallbackSources = ["https://*.supabase.co", "wss://*.supabase.co"];
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    return fallbackSources;
  }

  try {
    const { host, origin, protocol } = new URL(supabaseUrl);
    const websocketProtocol = protocol === "http:" ? "ws:" : "wss:";

    return [origin, `${websocketProtocol}//${host}`, ...fallbackSources];
  } catch {
    return fallbackSources;
  }
};

const isProduction = process.env.NODE_ENV === "production";
const developmentConnectSources = isProduction
  ? []
  : [
      "http://localhost:*",
      "http://127.0.0.1:*",
      "ws://localhost:*",
      "ws://127.0.0.1:*",
    ];
const scriptSources = [
  "'self'",
  "'unsafe-inline'",
  ...(isProduction ? [] : ["'unsafe-eval'"]),
].join(" ");

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  `script-src ${scriptSources}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self' data:",
  "worker-src 'self' blob:",
  `connect-src 'self' ${[
    ...getSupabaseConnectSources(),
    ...developmentConnectSources,
  ].join(" ")}`,
].join("; ");

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy,
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        headers: securityHeaders,
        source: "/(.*)",
      },
    ];
  },
  poweredByHeader: false,
  transpilePackages: ["@workspace/ui"],
};

export default nextConfig;
