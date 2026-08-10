import * as React from "react";

import { cn } from "@/lib/utils";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  /** Set for above-the-fold images so they are not deferred. */
  priority?: boolean;
  aspect?: string;
}

/**
 * Image primitive with sane Core Web Vitals defaults: explicit dimensions,
 * lazy loading, async decode and a fade-in once painted.
 */
export function LazyImage({
  src,
  alt,
  priority = false,
  aspect = "aspect-video",
  className,
  ...rest
}: LazyImageProps) {
  const [loaded, setLoaded] = React.useState(false);

  return (
    <div className={cn("overflow-hidden rounded-xl bg-muted", aspect)}>
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : "auto"}
        onLoad={() => setLoaded(true)}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-500",
          loaded ? "opacity-100" : "opacity-0",
          className,
        )}
        {...rest}
      />
    </div>
  );
}