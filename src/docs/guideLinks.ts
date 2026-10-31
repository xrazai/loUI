/**
 * Storybook renders the guides in `docs/guides/*.md` (the same files that feed `llms-full.txt`).
 * Their relative links (`./principles.md`) become Storybook docs links.
 */
export function guideLinks(markdown: string): string {
  return markdown.replace(/\]\(\.\/([a-z-]+)\.md\)/g, (_match, slug: string) => {
    const id = slug === 'introduction' ? 'introduction' : `guides-${slug}`;
    return `](?path=/docs/${id}--docs)`;
  });
}
