import Markdown, {
  type Components,
  type Options,
} from "react-markdown";

const components: Components = {
  h2: ({ children }) => (
    <h2 className="mb-3 mt-8 font-headline text-xl font-bold first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-7 font-headline text-lg font-bold">{children}</h3>
  ),
  p: ({ children }) => <p className="my-5">{children}</p>,
  ul: ({ children }) => (
    <ul className="my-5 list-disc space-y-2 pl-5 marker:text-primary">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-5 list-decimal space-y-2 pl-5 marker:font-bold marker:text-primary">
      {children}
    </ol>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-6 rounded-r-2xl border-l-4 border-primary bg-primary/5 px-4 py-1 text-on-surface-variant">
      {children}
    </blockquote>
  ),
  strong: ({ children }) => (
    <strong className="font-bold text-primary">{children}</strong>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="font-bold text-primary underline underline-offset-4"
    >
      {children}
    </a>
  ),
};

type MarkdownContentProps = Omit<Options, "components">;

export default function MarkdownContent(props: MarkdownContentProps) {
  return <Markdown {...props} components={components} />;
}
