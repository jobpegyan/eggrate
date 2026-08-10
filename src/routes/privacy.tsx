import { createFileRoute } from "@tanstack/react-router";

import { PageSkeleton } from "@/components/common/skeletons";
import { StaticPageView } from "@/components/pages/static-page-view";
import { staticPageQuery } from "@/services/public-queries";
import { breadcrumbSchema, buildSeo } from "@/utils/seo";

const SLUG = "privacy";

export const Route = createFileRoute("/privacy")({
  loader: ({ context }) => context.queryClient.ensureQueryData(staticPageQuery(SLUG)),
  pendingComponent: PageSkeleton,
  errorComponent: ({ error }) => (
    <div role="alert" className="mx-auto max-w-6xl px-4 py-20 text-sm">
      {error.message}
    </div>
  ),
  head: ({ loaderData }) =>
    buildSeo({
      title: loaderData?.metaTitle ?? loaderData?.title ?? "Privacy Policy",
      description: loaderData?.metaDescription ?? "How EggRateToday collects, uses and protects your data, including cookies and third-party advertising.",
      path: "/privacy",
      schema: breadcrumbSchema([
        { name: "Home", href: "/" },
        { name: loaderData?.title ?? "Privacy Policy", href: "/privacy" },
      ]),
    }),
  component: () => <StaticPageView slug={SLUG} />,
});
