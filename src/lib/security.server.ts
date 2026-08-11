/**
 * SSRF (Server-Side Request Forgery) Protection Utility for Data Source Connector.
 * Validates external target URLs to prevent requests to local, private, or metadata IPs.
 */

export function validatePublicUrl(targetUrl: string): { isValid: boolean; error?: string; cleanUrl?: string } {
  if (!targetUrl || typeof targetUrl !== "string") {
    return { isValid: false, error: "URL is required" };
  }

  const trimmed = targetUrl.trim();

  try {
    const parsed = new URL(trimmed);

    // 1. Only allow HTTP and HTTPS protocols
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { isValid: false, error: "Only HTTP and HTTPS protocols are allowed" };
    }

    const hostname = parsed.hostname.toLowerCase();

    // 2. Reject localhost and local domain aliases
    if (
      hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal")
    ) {
      return { isValid: false, error: "Access to local hostnames is strictly forbidden" };
    }

    // 3. Reject IPv4 loopback, private, link-local, and cloud metadata addresses
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = hostname.match(ipv4Regex);

    if (match) {
      const [, p1, p2, p3, p4] = match.map(Number);

      // Loopback (127.0.0.0/8 or 0.0.0.0)
      if (p1 === 127 || p1 === 0) {
        return { isValid: false, error: "Access to loopback IP addresses is forbidden" };
      }

      // Private IPv4 ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)
      if (
        p1 === 10 ||
        (p1 === 172 && p2 >= 16 && p2 <= 31) ||
        (p1 === 192 && p2 === 168)
      ) {
        return { isValid: false, error: "Access to private network IP addresses is forbidden" };
      }

      // Link-local / Cloud Metadata (169.254.0.0/16)
      if (p1 === 169 && p2 === 254) {
        return { isValid: false, error: "Access to cloud metadata endpoints is forbidden" };
      }
    }

    // 4. Reject IPv6 loopback and private addresses
    if (hostname === "::1" || hostname.startsWith("fe80:") || hostname.startsWith("fc00:") || hostname.startsWith("fd00:")) {
      return { isValid: false, error: "Access to private IPv6 addresses is forbidden" };
    }

    return { isValid: true, cleanUrl: parsed.href };
  } catch (err: any) {
    return { isValid: false, error: "Invalid target URL format" };
  }
}
