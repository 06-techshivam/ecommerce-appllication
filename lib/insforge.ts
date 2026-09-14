import { createClient } from "@insforge/sdk";

// In Node environment (SSR / Server components), prioritize IPv4 to prevent NAT64 timeouts
if (typeof process !== "undefined" && process.versions && process.versions.node) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const dns = require("node:dns");
    if (typeof dns.setDefaultResultOrder === "function") {
      dns.setDefaultResultOrder("ipv4first");
    }
  } catch {
    // Ignore in edge/browser runtimes
  }
}

const baseUrl =
  process.env.NEXT_PUBLIC_INSFORGE_URL ||
  "https://w2f3s8c4.ap-southeast.insforge.app";

const anonKey =
  process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY ||
  "anon_0920ce46d43ca5c8ea9d7bc15a72c3c966953fcdadccf6c5b44a9f2d6caea0b0";

export const insforge = createClient({
  baseUrl,
  anonKey,
});

export default insforge;

