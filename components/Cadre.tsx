/* Cadre d'image à format fixe : l'image est toujours recadrée dans le même rapport,
   quelle que soit la longueur du texte à côté. */
const formats = {
  '16/10': 'aspect-[16/10]',
  '16/9': 'aspect-video',
  '4/3': 'aspect-[4/3]',
  '3/4': 'aspect-[3/4]',
  '1/1': 'aspect-square',
  '2/3': 'aspect-[2/3]',
} as const;

export function Cadre({
  src,
  alt = '',
  format = '16/10',
  className = '',
  position = 'center',
  gris = false,
}: {
  src?: string | null;
  alt?: string | null;
  format?: keyof typeof formats;
  className?: string;
  position?: string;
  gris?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden bg-cream ${formats[format]} ${className}`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt ?? ''}
          loading="lazy"
          className={`absolute inset-0 h-full w-full object-cover transition duration-500 ${gris ? 'grayscale hover:grayscale-0' : ''}`}
          style={{ objectPosition: position }}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/medias/site/jogoo/icone-jogoo.png" alt="" className="h-1/3 w-auto opacity-15" />
        </div>
      )}
    </div>
  );
}
