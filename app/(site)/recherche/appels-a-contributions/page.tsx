import { EnTete } from '@/components/ui';
import { CarteAppel, getAppels } from '@/components/Appels';

export const metadata = { title: 'Appels à contributions' };
export const revalidate = 86400;

export default async function Appels() {
  const appels = await getAppels();
  const ouverts = appels.filter((a) => a.ouvert);
  const clos = appels.filter((a) => !a.ouvert);
  return (
    <>
      <EnTete kicker="Recherche" titre="Appels à contributions" intro="Journées d’étude, colloques et ouvrages collectifs du Groupe JOGOO et de ses partenaires." icone="action" />
      <div className="mx-auto max-w-5xl px-5 py-16">
        <p className="kicker mb-2">En ce moment</p>
        <h2 className="display-title text-3xl text-terra sm:text-4xl">Appels ouverts</h2>
        {ouverts.length ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">{ouverts.map((a) => <CarteAppel key={a.slug} a={a} />)}</div>
        ) : (
          <p className="mt-6 text-ink-soft">
            Aucun appel ouvert pour le moment. Les propositions d’articles pour la Revue JOGOO, Eboussi Studies et Philo Africaine Magazine sont reçues au fil de l’eau :{' '}
            <a className="font-semibold text-terra-deep underline underline-offset-2" href="mailto:philoafricaine@gmail.com">philoafricaine@gmail.com</a>.
          </p>
        )}
        {clos.length > 0 && (
          <>
            <hr className="rule-dotted my-14" />
            <h2 className="display-title text-2xl text-terra sm:text-3xl">Appels clos</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">{clos.map((a) => <CarteAppel key={a.slug} a={a} />)}</div>
          </>
        )}
      </div>
    </>
  );
}
