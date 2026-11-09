/** Insère un fragment HTML sans ajouter de boîte de mise en page. */
export function Html({ html, as: Tag = 'div', className }: { html: string; as?: 'div' | 'section'; className?: string }) {
  return <Tag className={className} style={className ? undefined : { display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} />;
}
