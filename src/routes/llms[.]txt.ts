import { createFileRoute } from "@tanstack/react-router";
import { SITE } from "@/lib/constants";

export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: async () => {
        const content = `# EggRateToday — Today's Egg Rate in India

> Daily verified NECC wholesale & retail egg prices for every major state and city across India, updated every morning.

## Core Pages & Features
- [Today's National Egg Rate](${SITE.baseUrl}/): Live national average egg prices (per piece, dozen, 30-egg tray, 210-egg peti).
- [State-wise Egg Rates](${SITE.baseUrl}/states): Comprehensive daily egg prices across all states in India.
- [City-wise Egg Rates](${SITE.baseUrl}/cities): City-level egg rate listings for Delhi, Mumbai, Hyderabad, Namakkal, Bengaluru, Kolkata, Pune, and more.
- [Egg Rate History & Trends](${SITE.baseUrl}/trends): Interactive price charts, historical data, and rate fluctuations over time.
- [AI Market Analysis](${SITE.baseUrl}/egg-market-analysis): AI-driven daily egg market summary, price forecasts, and market insights.
- [Compare City Rates](${SITE.baseUrl}/compare/mumbai-vs-pune): Side-by-side comparison of wholesale & retail rates between any two cities.

## Data Structure & Units
- **Per Piece**: Base price per single egg.
- **Per Dozen**: Price for 12 eggs.
- **Per Tray**: Standard wholesale tray of 30 eggs.
- **Per Peti**: Standard wholesale crate of 210 eggs.
- **Per 100 Eggs**: NECC standard benchmark rate for 100 eggs.
- **Price Types**: Wholesale (mandi/NECC declared) and Retail (market consumer price).

## Information Sources
- National Egg Coordination Committee (NECC)
- Local wholesale mandi declarations
- Daily verified editor updates
`;

        return new Response(content, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
