import { createFileRoute } from "@tanstack/react-router";

import { PageSkeleton } from "@/components/common/skeletons";
import { StaticPageView } from "@/components/pages/static-page-view";
import { staticPageQuery } from "@/services/public-queries";
import { breadcrumbSchema, buildSeo } from "@/utils/seo";

const SLUG = "disclaimer";

export const Route = createFileRoute("/disclaimer")({
  loader: ({ context }) => context.queryClient.ensureQueryData(staticPageQuery(SLUG)),
  pendingComponent: PageSkeleton,
  errorComponent: ({ error }) => (
    <div role="alert" className="mx-auto max-w-6xl px-4 py-20 text-sm">
      {error.message}
    </div>
  ),
  head: ({ loaderData }) =>
    buildSeo({
      title: loaderData?.metaTitle ?? loaderData?.title ?? "Disclaimer",
      description: loaderData?.metaDescription ?? "Egg rates published on EggRateToday are indicative market figures and should not be treated as trading advice.",
      path: "/disclaimer",
      schema: breadcrumbSchema([
        { name: "Home", href: "/" },
        { name: loaderData?.title ?? "Disclaimer", href: "/disclaimer" },
      ]),
    }),
  component: () => <StaticPageView slug={SLUG} />,
});
