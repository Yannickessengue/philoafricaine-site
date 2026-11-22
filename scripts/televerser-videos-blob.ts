/**
 * Téléverse les vidéos des « 10 minutes du chant du coq » sur Vercel Blob,
 * pour qu'elles ne pèsent pas dans le dépôt Git.
 *
 * À lancer une fois par épisode, depuis une machine disposant du jeton :
 *
 *   BLOB_READ_WRITE_TOKEN=... npx tsx scripts/televerser-videos-blob.ts
 *
 * Les fichiers sont pris sur le site de test, où ils sont déjà en ligne, et
 * déposés sous minutes/<nom>. Le script affiche ensuite l'URL de base à
 * renseigner dans la variable d'environnement MEDIAS_BLOB_BASE sur Vercel.
 *
 * Rien à changer dans les contenus : ils continuent de pointer vers
 * /medias/minutes/<nom>, que la route du même nom redirige vers le stockage.
 */
import { put } from '@vercel/blob';

const SOURCE = process.env.SOURCE_VIDEOS ?? 'https://philoafricaine-site.vercel.app/medias/minutes';

const FICHIERS = [
  'ubuntu-du-mot-a-la-notion.mp4',
  'ubuntu-du-mot-a-la-notion-fr.mp4',
  'ubuntu-du-mot-a-la-notion-es.mp4',
  'ubuntu-du-mot-a-la-notion-pt.mp4',
  'ubuntu-du-mot-a-la-notion-de.mp4',
  'ubuntu-du-mot-a-la-notion-sw.mp4',
];

async function principal() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    console.error('BLOB_READ_WRITE_TOKEN manquant.');
    process.exit(1);
  }
  const bases = new Set<string>();
  for (const nom of FICHIERS) {
    const reponse = await fetch(`${SOURCE}/${nom}`);
    if (!reponse.ok) {
      console.error(`× ${nom} : ${reponse.status} à la lecture`);
      continue;
    }
    const corps = Buffer.from(await reponse.arrayBuffer());
    const { url } = await put(`minutes/${nom}`, corps, {
      access: 'public',
      token,
      contentType: 'video/mp4',
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 60 * 60 * 24 * 365,
    });
    bases.add(new URL(url).origin);
    console.log(`✓ ${nom} — ${(corps.length / 1024 / 1024).toFixed(1)} Mo`);
  }
  console.log('\nÀ renseigner sur Vercel (Settings → Environment Variables) :');
  for (const b of bases) console.log(`MEDIAS_BLOB_BASE=${b}`);
}

principal().catch((e) => {
  console.error(e);
  process.exit(1);
});
