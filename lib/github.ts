/** Petit accès à l'API GitHub (contenus du dépôt), pour les commentaires. */
const REPO = process.env.GITHUB_REPO || 'Yannickessengue/philoafricaine-site';
const BRANCHE = process.env.GITHUB_BRANCH || 'main';

export const githubActif = () => Boolean(process.env.GITHUB_TOKEN);

const entetes = () => ({
  Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'philoafricaine-site',
});

export async function lireJson<T>(chemin: string): Promise<{ data: T | null; sha?: string }> {
  const r = await fetch(`https://api.github.com/repos/${REPO}/contents/${chemin}?ref=${BRANCHE}`, { headers: entetes(), cache: 'no-store' });
  if (r.status === 404) return { data: null };
  if (!r.ok) throw new Error(`GitHub ${r.status}`);
  const j = await r.json();
  return { data: JSON.parse(Buffer.from(j.content, 'base64').toString('utf8')), sha: j.sha };
}

export async function ecrireJson(chemin: string, data: unknown, message: string, sha?: string) {
  const r = await fetch(`https://api.github.com/repos/${REPO}/contents/${chemin}`, {
    method: 'PUT',
    headers: { ...entetes(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, branch: BRANCHE, sha, content: Buffer.from(JSON.stringify(data, null, 2) + '\n').toString('base64') }),
  });
  if (!r.ok) throw new Error(`GitHub ${r.status}: ${await r.text()}`);
}
