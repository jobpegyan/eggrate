import { Container, Section } from "@/components/common/section";
import { AdSlot } from "@/components/ads/ad-slot";
import type { ContentBlock } from "@/lib/state-content";

/** Long-form, programmatically generated state guide with an in-content ad. */
export function StateContent({ blocks }: { blocks: ContentBlock[] }) {
  if (blocks.length === 0) return null;
  const midpoint = Math.ceil(blocks.length / 2);

  return (
    <Section as="article">
      <Container>
        <div className="prose-none max-w-3xl">
          {blocks.map((block, index) => (
            <div key={block.id} id={block.id}>
              <h2 className="mt-10 scroll-mt-24 font-display text-2xl font-semibold tracking-tight text-foreground first:mt-0 sm:text-3xl">
                {block.heading}
              </h2>
              {block.paragraphs.map((paragraph, position) => (
                <p
                  key={`${block.id}-${position}`}
                  className="mt-4 text-[15px] leading-7 text-muted-foreground"
                >
                  {paragraph}
                </p>
              ))}
              {index === midpoint - 1 ? (
                <AdSlot position="in_content" className="mt-10 px-0" minHeight={250} />
              ) : null}
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
