import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSeoTemplate, getRedirect } from "./seo.server";

export const fetchSeoTemplate = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ pageType: z.string() }).parse(data))
  .handler(({ data }) => getSeoTemplate(data.pageType));

export const fetchRedirect = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ path: z.string() }).parse(data))
  .handler(({ data }) => getRedirect(data.path));
