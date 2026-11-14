import { neonConfig } from "@neondatabase/serverless";

// Neon est joint en HTTP ; une coupure réseau passagère (DNS, connexion qui
// expire) fait échouer `fetch` avant même l'envoi de la requête. On réessaie
// uniquement ces échecs de connexion — jamais une réponse HTTP reçue, ni une
// coupure survenue pendant l'envoi — pour ne pas rejouer une écriture.
const CONNECT_CODES = new Set(["UND_ERR_CONNECT_TIMEOUT", "ECONNREFUSED", "ENOTFOUND", "EAI_AGAIN"]);
const RETRIES = 2;
const baseFetch = globalThis.fetch;

function isConnectFailure(err: unknown): boolean {
  const cause = (err as { cause?: unknown })?.cause;
  if (cause instanceof AggregateError) return true;
  const code = (cause as { code?: string })?.code;
  return typeof code === "string" && CONNECT_CODES.has(code);
}

neonConfig.fetchFunction = async (input: RequestInfo | URL, init?: RequestInit) => {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    try {
      return await baseFetch(input, init);
    } catch (err) {
      lastErr = err;
      if (!isConnectFailure(err) || attempt === RETRIES) throw err;
      await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
    }
  }
  throw lastErr;
};
