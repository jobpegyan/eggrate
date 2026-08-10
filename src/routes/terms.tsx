import { createFileRoute } from "@tanstack/react-router";

import { PageSkeleton } from "@/components/common/skeletons";
import { StaticPageView } from "@/components/pages/static-page-view";
import { staticPageQuery } from "@/services/public-queries";
import { breadcrumbSchema, buildSeo } from "@/utils/seo";

const SLUG = "terms";

export const Route = createFileRoute("/terms")({
  loader: ({ context }) => context.queryClient.ensureQueryData(staticPageQuery(SLUG)),
  pendingComponent: PageSkeleton,
  errorComponent: ({ error }) => (
    <div role="alert" className="mx-auto max-w-6xl px-4 py-20 text-sm">
      {error.message}
    </div>
  ),
  head: ({ loaderData }) =>
    buildSeo({
      title: loaderData?.metaTitle ?? loaderData?.title ?? "Terms of Service",
      description: loaderData?.metaDescription ?? "The terms that govern your use of EggRateToday, including acceptable use and limitations of liability.",
      path: "/terms",
      schema: breadcrumbSchema([
        { name: "Home", href: "/" },
        { name: loaderData?.title ?? "Terms of Service", href: "/terms" },
      ]),
    }),
  component: () => <StaticPageView slug={SLUG} />,
});
