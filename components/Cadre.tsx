/* Cadre d'image à format fixe : l'image est toujours recadrée dans le même rapport,
   quelle que soit la longueur du texte à côté. */
const formats = {
  '16/10': 'aspect-[16/10]',
  '16/9': 'aspect-video',
  '21/9': 'aspect-[21/9]',
  '4/3': 'aspect-[4/3]',
  '3/4': 'aspect-[3/4]',
  '4/5': 'aspect-[4/5]',
  '1/1': 'aspect-square',
  '2/3': 'aspect-[2/3]',
} as const;

export type Format = keyof typeof formats;

export function Cadre({
  src, alt = '', format = '16/10', className = '', position = 'center', priorite = false,
}: {
  src?: string | null; alt?: string | null; format?: Format; className?: string; position?: string; priorite?: boolean;
}) {
  return (
    <div className={`photo relative overflow-hidden bg-paper-deep ${formats[format]} ${className}`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt ?? ''} loading={priorite ? 'eager' : 'lazy'} decoding="async"
          className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: position }} />
      ) : (
        <div className="absolute inset-0 flex items-end p-6">
          <span className="aube w-full opacity-70" aria-hidden />
        </div>
      )}
    </div>
  );
}
