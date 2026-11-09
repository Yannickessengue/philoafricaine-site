import { toutesLesNotes } from '@/lib/notes';
import { EnTete } from '@/components/ui';
import { Html } from '@/components/Html';
import { CarteNote, FiltreNotes } from '@/components/FiltreNotes';
import { fragment } from '@/lib/gabarits';

export const metadata = { title: 'Publications', description: 'Notes de lecture, recensions signalées et accès aux catalogues de nos projets.' };

export default async function Publications() {
  const notes = await toutesLesNotes();
  const selection = notes.filter((n) => n.une);
  return (
    <>
      <EnTete kicker="Portail · 5" titre="Publications" intro="Notes de lecture, recensions signalées et accès aux catalogues de nos projets." icone="book" />
      <div className="mx-auto max-w-5xl px-5 py-16">
        {selection.length > 0 && (
          <>
            <div className="mb-8">
              <p className="kicker mb-2">À la une</p>
              <h2 className="display-title text-3xl text-terra sm:text-4xl">Sélection</h2>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {selection.map((n) => (
                <CarteNote key={n.slug} n={n} grande />
              ))}
            </div>
          </>
        )}
        <FiltreNotes notes={notes} />
        <Html html={fragment('publications-catalogues')} />
      </div>
    </>
  );
}
