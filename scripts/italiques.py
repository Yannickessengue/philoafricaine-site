"""Titres de livres en italique dans les contenus (.mdoc) et les fragments HTML. Idempotent.
Usage : python3 scripts/italiques.py"""
import re, glob

TITRES = ["La Crise du Muntu", "La crise du Muntu", "Christianisme sans fétiche", "Lignes de résistance",
          "La Démocratie de transit au Cameroun", "La démocratie de transit au Cameroun",
          "Les Conférences nationales en Afrique noire", "Les conférences nationales en Afrique noire",
          "L’Affaire de la philosophie africaine", "L’affaire de la philosophie africaine", "À contretemps", "Muntu in Crisis",
          "L’Encre des savants", "L’encre des savants", "Politiques de l’inimitié", "Beyond the Postcolony", "Remember Kamerun",
          "L’Idée d’une philosophie négro-africaine", "L’idée d’une philosophie négro-africaine",
          "Philosophie négro-africaine de l’existence", "La Philosophie bantoue", "La philosophie bantoue", "Triturations",
          "Critique de la raison nègre", "De la postcolonie", "Sortir de la grande nuit", "Brutalisme",
          "Essai sur la problématique philosophique dans l’Afrique actuelle", "Sur la « philosophie africaine »",
          "Bantu Philosophy", "Nations nègres et culture", "Cahier d’un retour au pays natal", "Discours sur le colonialisme",
          "Peau noire, masques blancs", "Les Damnés de la terre", "L’Aventure ambiguë", "The Invention of Africa", "L’Invention de l’Afrique"]
# Sous-titres usuels, pris dans l'italique quand ils suivent le titre
SOUS = [". Authenticité africaine et philosophie", ". Révélation et domination", ". Au-delà des querelles", ". L’enjeu de Dieu en Afrique",
        ". Une affaire à suivre", ". African Authenticity and Philosophy"]
MOTIF = re.compile("(" + "|".join(re.escape(t) for t in sorted(TITRES, key=len, reverse=True)) + ")(" + "|".join(re.escape(x) for x in SOUS) + ")?")

def mdoc(s):
    parts = s.split('\n---\n', 1)
    if len(parts) < 2: return s
    out = []
    for ligne in parts[1].split('\n'):
        if '{%' in ligne or ligne.lstrip().startswith(('![', '<')):
            out.append(ligne); continue
        def rep(m, L=ligne):
            avant = L[:m.start()]
            if avant.count('*') % 2 == 1 or avant.endswith('_') or re.search(r'\]\([^)]*$', avant): return m.group(0)
            return '*' + m.group(0) + '*'
        out.append(MOTIF.sub(rep, ligne))
    return parts[0] + '\n---\n' + '\n'.join(out)

def html(s):
    def rep(m):
        avant = s[:m.start()]
        if avant.rfind('<') > avant.rfind('>'): return m.group(0)            # dans une balise (attribut)
        ouv = re.findall(r'<(/?)(em|i|cite|title|script|style|h1|h2)\b', avant[-4000:])
        etat = {}
        for ferm, nom in ouv: etat[nom] = not ferm
        if any(etat.values()): return m.group(0)
        return '<em>' + m.group(0) + '</em>'
    return MOTIF.sub(rep, s)

n = 0
for f in glob.glob('content/**/*.mdoc', recursive=True):
    a = open(f, encoding='utf-8').read(); b = mdoc(a)
    if a != b: open(f, 'w', encoding='utf-8').write(b); n += 1
for f in glob.glob('design/fragments/*.html'):
    a = open(f, encoding='utf-8').read(); b = html(a)
    if a != b: open(f, 'w', encoding='utf-8').write(b); n += 1
print(n, 'fichiers modifiés')
