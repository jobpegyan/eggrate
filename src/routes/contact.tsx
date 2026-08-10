import { createFileRoute } from "@tanstack/react-router";

import { PageSkeleton } from "@/components/common/skeletons";
import { StaticPageView } from "@/components/pages/static-page-view";
import { staticPageQuery } from "@/services/public-queries";
import { breadcrumbSchema, buildSeo } from "@/utils/seo";

const SLUG = "contact";

export const Route = createFileRoute("/contact")({
  loader: ({ context }) => context.queryClient.ensureQueryData(staticPageQuery(SLUG)),
  pendingComponent: PageSkeleton,
  errorComponent: ({ error }) => (
    <div role="alert" className="mx-auto max-w-6xl px-4 py-20 text-sm">
      {error.message}
    </div>
  ),
  head: ({ loaderData }) =>
    buildSeo({
      title: loaderData?.metaTitle ?? loaderData?.title ?? "Contact EggRateToday",
      description: loaderData?.metaDescription ?? "Reach the EggRateToday desk for corrections, market submissions, advertising or partnership enquiries.",
      path: "/contact",
      schema: breadcrumbSchema([
        { name: "Home", href: "/" },
        { name: loaderData?.title ?? "Contact EggRateToday", href: "/contact" },
      ]),
    }),
  component: () => <StaticPageView slug={SLUG} />,
});
