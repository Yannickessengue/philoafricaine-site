import { makeRouteHandler } from '@keystatic/next/route-handler';
import config from '../../../../keystatic.config';
import { espaceRedactionOuvert } from '@/lib/espace-redaction';

const handler = makeRouteHandler({ config });
const ferme = () => new Response('Not Found', { status: 404 });

// Fermé tant que l'Espace rédaction n'est pas relié à GitHub (voir lib/espace-redaction.ts)
export const GET = espaceRedactionOuvert ? handler.GET : ferme;
export const POST = espaceRedactionOuvert ? handler.POST : ferme;
