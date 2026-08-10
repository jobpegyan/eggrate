import * as React from "react";

/** True only after hydration — gate browser-only rendering with this. */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => setHydrated(true), []);
  return hydrated;
}