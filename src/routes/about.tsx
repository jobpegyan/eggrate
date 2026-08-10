import { createFileRoute } from "@tanstack/react-router";

import { PageSkeleton } from "@/components/common/skeletons";
import { StaticPageView } from "@/components/pages/static-page-view";
import { staticPageQuery } from "@/services/public-queries";
import { breadcrumbSchema, buildSeo } from "@/utils/seo";

const SLUG = "about";

export const Route = createFileRoute("/about")({
  loader: ({ context }) => context.queryClient.ensureQueryData(staticPageQuery(SLUG)),
  pendingComponent: PageSkeleton,
  errorComponent: ({ error }) => (
    <div role="alert" className="mx-auto max-w-6xl px-4 py-20 text-sm">
      {error.message}
    </div>
  ),
  head: ({ loaderData }) =>
    buildSeo({
      title: loaderData?.metaTitle ?? loaderData?.title ?? "About EggRateToday",
      description: loaderData?.metaDescription ?? "Who we are, where our daily egg rates come from and how each price is verified before publication.",
      path: "/about",
      schema: breadcrumbSchema([
        { name: "Home", href: "/" },
        { name: loaderData?.title ?? "About EggRateToday", href: "/about" },
      ]),
    }),
  component: () => <StaticPageView slug={SLUG} />,
});
