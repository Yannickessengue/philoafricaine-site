"""Extrait et nettoie les fragments HTML du site d'origine -> design/fragments/"""
import re, json, os, html, urllib.parse
from bs4 import BeautifulSoup
import pathlib
D=str(pathlib.Path(__file__).resolve().parent.parent/'design')
OUT=D+'/fragments'; os.makedirs(OUT,exist_ok=True)
BLOB='https://p9j35g5xmy0ec6oh.public.blob.vercel-storage.com'
def url(u):
    m=re.match(r'/_next/image\?url=([^&]+)',html.unescape(u))
    if m: u=urllib.parse.unquote(m.group(1))
    if u.startswith(BLOB): u='/medias/blob'+u[len(BLOB):]
    elif u.startswith('/jogoo/'): u='/medias/site'+u
    elif u.startswith('https://philoafricaine.org/') or u.startswith('https://www.philoafricaine.org/'):
        u=re.sub(r'^https://(www\.)?philoafricaine\.org','',u)
        if u.startswith('/jogoo/'): u='/medias/site'+u
    return u
def clean(h):
    h=re.sub(r'<!--\$?!?-->|<!--/\$-->|<!-- -->','',h)
    s=BeautifulSoup(h,'html.parser')
    for t in s.find_all(True):
        for a in ('srcset','sizes','data-nimg','decoding'):
            if a in t.attrs: del t.attrs[a]
        if t.name=='img':
            t['src']=url(t.get('src',''))
            st=t.get('style','')
            st=st.replace('color:transparent','').strip(';')
            if st: t['style']=st
            elif 'style' in t.attrs: del t.attrs['style']
            t['loading']='lazy'; t['decoding']='async'
        if t.name=='a' and t.get('href'):
            t['href']=url(t['href'])
        if t.name in ('source','video','iframe') and t.get('src'): t['src']=url(t['src'])
    return str(s)
def save(name,h): open(f'{OUT}/{name}.html','w').write(clean(h))

home=open(D+'/accueil.html').read()
s=BeautifulSoup(home,'html.parser')
hd=clean(str(s.find('header')))
hd=hd.replace('<header class=','<header data-entete="" class=',1)
hd=hd.replace('aria-label="Rechercher sur le site"','aria-label="Rechercher sur le site" data-action="recherche"')
hd=hd.replace('aria-haspopup="listbox"','aria-haspopup="listbox" data-action="langue"')
hd=hd.replace('aria-label="Ouvrir le menu"','aria-label="Ouvrir le menu" data-action="menu"')
hd=hd.replace('<nav aria-label="Navigation principale"','<nav data-nav="" aria-label="Navigation principale"')
open(OUT+'/header.html','w').write(hd)
save('footer',str(s.find('footer')))
main=s.find('main')
kids=[k for k in main.children if getattr(k,'name',None)]
for i,k in enumerate(kids):
    cls=' '.join(k.get('class',[]))
    print(i,k.name,cls[:80])
    h2=clean(str(k))
    if i==0: h2=h2.replace('<div aria-label','<div data-loader="" aria-label',1)
    h2=h2.replace('<div aria-hidden="true" class="h-[4.25rem]','<div data-compte="2026-10-12T09:00:00+02:00" aria-hidden="true" class="h-[4.25rem]')
    open(f'{OUT}/home-{i:02d}.html','w').write(h2)
# pages statiques
st=json.load(open(D+'/static.json'))
idx={}
for p,v in st.items():
    n='page'+p.replace('/','__')
    save(n,v['html']); idx[p]={'f':n,'title':v['title'],'desc':v['desc']}
json.dump(idx,open(OUT+'/index.json','w'),ensure_ascii=False,indent=1)
# découpes pour l'accueil
h=open(OUT+'/home-04.html').read()
i=h.find('<div class="flex h-full flex-col border border-ink/12 bg-white">'); j=h.rfind('</div></section>')
open(OUT+'/home-04-colonnes.html','w').write(h[i:j])
h7=open(OUT+'/home-07.html').read(); k=h7.find('<div class="md:border-l')
open(OUT+'/home-07-droite.html','w').write(h7[k:h7.rfind('</div></section>')])
# publications : bloc « Catalogues & sommaires »
h=open(D+'/publications.html').read()
i=h.find('<div class="mb-6 mt-20"><h2 class="display-title text-3xl text-terra sm:text-4xl">Catalogues')
e=h.find('</div></div><!--$-->',i)
open(OUT+'/publications-catalogues.html','w').write(clean(h[i:e+6]))
# médiathèque : bloc « À venir »
h=open(D+'/mediatheque.html').read()
i=h.find('<div class=""><p class="kicker mb-2">Prochainement')
e=h.find('<!--$-->',i)
blk=h[i:e]
blk=blk[:blk.rfind('</div>')]  # retire la fermeture du conteneur
open(OUT+'/mediatheque-avenir.html','w').write(clean(blk))
# plan du site
s=BeautifulSoup(open(D+'/plan-du-site.html').read(),'html.parser')
m=s.find('main')
open(OUT+'/plan-du-site.html','w').write(clean(''.join(str(c) for c in m.children)))
# Revue JOGOO : bandeau (en-tête + menu) et pied propres au sous-site
h=open(OUT+'/page__sous-sites__revue-jogoo.html').read()
i=h.find('<section'); open(OUT+'/revue-bandeau.html','w').write(h[:i])
j=h.find('<section class="mt-16 bg-terra-deep text-paper">'); open(OUT+'/revue-pied.html','w').write(h[j:])
# colonnes du sommaire (remplacées par les contenus de l'administration)
a=h.find('<section class="mx-auto max-w-6xl px-6 py-14"><div class="grid gap-5 lg:grid-cols-3">')
b=h.find('</section>',a)+len('</section>')
open(OUT+'/revue-accueil-avant.html','w').write(h[:a]); open(OUT+'/revue-accueil-apres.html','w').write(h[b:])
# Accueil : coq du visuel à son orientation d'origine ; coq de l'intro animée tourné vers la gauche (demande du 9 nov. 2026)
h=open(OUT+'/home-01.html').read()
h=h.replace('loading="lazy"','loading="eager"')
open(OUT+'/home-01.html','w').write(h)
h=open(OUT+'/home-00.html').read()
h=h.replace('class="jogoo-loader-watermark pointer-events-none','class="jogoo-loader-watermark -scale-x-100 pointer-events-none')
open(OUT+'/home-00.html','w').write(h)
# Sous-sites d'origine découpés en sections (réutilisées dans les nouveaux sous-sites)
for nom, f in [('magazine', 'page__sous-sites__philo-africaine-magazine'), ('numero', 'page__sous-sites__philo-africaine-magazine__numero-001'), ('editions', 'page__sous-sites__editions-jogoo'), ('sankofa', 'page__sous-sites__sankofa-communications')]:
    s = BeautifulSoup(open(f'{OUT}/{f}.html').read(), 'html.parser')
    for i, c in enumerate([c for c in s.children if getattr(c, 'name', None)]):
        open(f'{OUT}/ancien-{nom}-{i}.html', 'w').write(str(c))

# ——— Eboussi Studies rejoint le Fonds Eboussi Boulaga ; JOGOO AI prend sa place (demande du 9 nov. 2026) ———
import glob as _g
ES = '/sous-sites/fonds-eboussi-boulaga/eboussi-studies'
CARTE_AI = ('<a class="group flex h-full flex-col border border-ink/12 bg-white transition-all hover:-translate-y-1 hover:border-ink/20 hover:shadow-[0_12px_28px_-12px_rgba(0,0,0,0.25)]" href="/sous-sites/jogoo-ai">'
  '<span class="block h-1 w-full bg-terra"></span><div class="flex h-full flex-col p-6"><div class="flex items-start justify-between gap-3">'
  '<span class="flex h-14 items-center"><img alt="Logo de JOGOO AI" class="w-auto object-contain object-left max-h-14 max-w-[170px]" loading="lazy" decoding="async" src="/medias/site/jogoo/picto-jogoo-ai.png"/></span>'
  '<span class="kicker mt-1 shrink-0">B.4</span></div><span class="display-title mt-4 text-xl text-ink group-hover:text-terra">JOGOO AI</span>'
  '<span class="mt-1 text-xs uppercase tracking-wide text-ink/45">Assistant de recherche en philosophie africaine</span>'
  '<span class="mt-3 font-serif text-sm italic text-ink/70">Explorer. Comprendre. Analyser. Citer.</span>'
  '<span class="mt-3 line-clamp-4 text-sm leading-relaxed text-ink-soft">Interroger des textes, découvrir des auteurs, clarifier des concepts et construire ses pistes de recherche, avec un assistant documentaire qui privilégie les sources vérifiables.</span>'
  '<span class="mt-auto pt-5 text-sm font-semibold text-terra-deep">Découvrir le sous-site<span class="ml-1 inline-block transition-transform group-hover:translate-x-1">→</span></span></div></a>')
LI_AI = ('<a class="group flex flex-1 items-center gap-4 px-6 py-3 transition-colors hover:bg-cream/50" href="/sous-sites/jogoo-ai"><span class="flex h-10 w-12 shrink-0 items-center justify-center">'
  '<img alt="Logo de JOGOO AI" class="h-auto max-h-10 w-auto max-w-12 object-contain" loading="lazy" decoding="async" src="/medias/site/jogoo/picto-jogoo-ai.png"/></span>'
  '<span class="min-w-0"><span class="display-title block text-base text-ink group-hover:text-terra">JOGOO AI</span><span class="block text-xs text-ink-soft">Assistant de recherche en philosophie africaine</span></span></a>')
for f in _g.glob(OUT + '/*.html'):
    h = open(f).read(); h0 = h
    nom = os.path.basename(f)
    if nom == 'home-06.html':
        h = re.sub(r'<a class="group flex h-full flex-col[^"]*" href="/sous-sites/eboussi-studies">.*?</a>', CARTE_AI, h, count=1, flags=re.S)
    if nom in ('home-04-colonnes.html', 'home-04.html'):
        h = re.sub(r'<a class="group flex flex-1 items-center[^"]*" href="/sous-sites/eboussi-studies">.*?</a>', LI_AI, h, count=1, flags=re.S)
    # listes de sous-sites (pied du portail, colophon du Fonds)
    h = re.sub(r'(<a[^>]*?)href="/sous-sites/eboussi-studies"([^>]*)>(Revue )?Eboussi Studies</a>', r'\1href="/sous-sites/jogoo-ai"\2>JOGOO AI</a>', h) if nom in ('footer.html',) or 'fonds-eboussi' in nom else h
    # tout autre lien : la revue, désormais dans le Fonds
    h = h.replace('href="/sous-sites/eboussi-studies"', f'href="{ES}"')
    if h != h0: open(f, 'w').write(h)
# La page autonome de la revue disparaît (redirection 301 vers le Fonds) ; bouton devenu inutile retiré
f = OUT + '/page__sous-sites__fonds-eboussi-boulaga__eboussi-studies.html'
h = open(f).read()
h = h.replace('<a class="btn" href="/sous-sites/fonds-eboussi-boulaga/eboussi-studies">Sous-site de la revue</a>', '')
open(f, 'w').write(h)
idx = json.load(open(OUT + '/index.json'))
idx.pop('/sous-sites/eboussi-studies', None)
json.dump(idx, open(OUT + '/index.json', 'w'), ensure_ascii=False, indent=1)

# Plus de traits de couleur au-dessus des blocs (demande du 9 nov. 2026, 16 h 26)
for f in _g.glob(OUT + '/*.html'):
    h = open(f).read(); h0 = h
    h = re.sub(r'<span class="block h-1 w-full bg-(terra|ink|gold)"></span>', '', h)
    h = h.replace('<div class="h-1 bg-[linear-gradient(90deg,var(--color-terra-deep)_0%,var(--color-terra)_45%,var(--color-gold)_100%)]"></div>', '')
    h = re.sub(r'<span (aria-hidden="true" )?class="mt-3 block h-0.5 w-10 bg-terra"></span>', '', h)
    if h != h0: open(f, 'w').write(h)
# Accueil, colonne « Les sous-sites » : noms seuls, sans sous-titres
f = OUT + '/home-04-colonnes.html'
h = open(f).read()
h = re.sub(r'(<span class="display-title block text-base text-ink group-hover:text-terra">[^<]*</span>)<span class="block text-xs text-ink-soft">[^<]*</span>', r'\1', h)
open(f, 'w').write(h)
# Miniatures des sous-sites agrandies (demande du 9 nov. 2026, 16 h 45)
for nom in ('home-04-colonnes.html', 'home-04.html'):
    f = OUT + '/' + nom
    h = open(f).read()
    h = h.replace('<span class="flex h-10 w-12 shrink-0 items-center justify-center">', '<span class="flex h-16 w-20 shrink-0 items-center justify-center">')
    h = h.replace('class="h-auto max-h-10 w-auto max-w-12 object-contain"', 'class="h-auto max-h-16 w-auto max-w-20 object-contain"')
    open(f, 'w').write(h)
# Images recompressées : PNG sans transparence devenus JPEG (scripts/compresser-images.py)
import json as _json, os as _os
_ren = _json.load(open(_os.path.join(_os.path.dirname(__file__), 'images-renommees.json')))
for f in _g.glob(OUT + '/*.html'):
    h = open(f).read(); h0 = h
    for a, b in _ren.items(): h = h.replace(a, b)
    if h != h0: open(f, 'w').write(h)
# Pied de page : lien de réglage des cookies (demande du 9 nov. 2026, 17 h 35)
f = OUT + '/footer.html'
h = open(f).read()
if 'data-action="cookies"' not in h:
    h = h.replace('<a class="hover:text-gold" href="/credits">Crédits</a>', '<a class="hover:text-gold" href="/credits">Crédits</a><button type="button" class="uppercase tracking-[inherit] hover:text-gold" data-action="cookies">Cookies</button>', 1)
    open(f, 'w').write(h)
# Mentions légales : précisions sur les cookies et le consentement
f = OUT + '/page__mentions-legales.html'
h = open(f).read()
_ancre = 'peut être adressée à <a href="mailto:philoafricaine@gmail.com">philoafricaine@gmail.com</a>.</p>'
if _ancre in h and 'Contenus extérieurs' not in h:
    h = h.replace(_ancre, _ancre + '<p class="mt-3">Le site ne dépose aucun cookie publicitaire ni de mesure d’audience. Les cookies essentiels mémorisent seulement la langue, l’introduction déjà vue et votre choix de cookies. <strong>Contenus extérieurs</strong> : les vidéos (YouTube, WebTV de l’université de Rouen) et la page Facebook ne se chargent qu’après votre accord, car ces services peuvent déposer leurs propres cookies. Votre choix est conservé six mois ; vous pouvez le modifier à tout moment : <button type="button" data-action="cookies" class="font-semibold text-terra-deep underline underline-offset-2 hover:text-terra">régler les cookies</button>.</p>', 1)
    open(f, 'w').write(h)
# « Sous-sites » devient « Nos projets » dans tous les textes visibles (demande du 9 nov. 2026, 18 h 59).
# Les adresses (/sous-sites/...) et les ancres restent inchangées.
_PROJETS = [
    ('Les autres sous-sites', 'Nos autres projets'),
    ('aria-label="Les sous-sites"', 'aria-label="Nos projets"'),
    ('>Les sous-sites<', '>Nos projets<'),
    ('>Sous-sites<', '>Nos projets<'),
    ('Sous-sites autonomes', 'Projets autonomes'),
    ('de ses sous-sites', 'de ses projets'),
    ('Chaque sous-site', 'Chaque projet'),
    ('d’où son sous-site propre', 'd’où son espace propre'),
    ('Découvrir le sous-site', 'Découvrir le projet'),
    ('>Rubriques du sous-site<', '>Rubriques du projet<'),
    ('Les contenus du sous-site', 'Les contenus du projet'),
    ('>Sous-site : ', '>Projet : '),
    ('Sous-site de la revue', 'Projet de la revue'),
]
import re as _re
for f in _g.glob(OUT + '/*.html'):
    h = open(f).read(); h0 = h
    for a, b in _PROJETS: h = h.replace(a, b)
    h = _re.sub(r'>Sous-site (B\.\d)', r'>Projet \1', h)
    h = _re.sub(r'<span>Sous-site (B\.\d)', r'<span>Projet \1', h)
    if h != h0: open(f, 'w').write(h)
# Lettre d’information : devenue hebdomadaire
f = OUT + '/home-09.html'
h = open(f).read()
h = h.replace('>Lettre d’information</h2>', '>La lettre du lundi</h2>')
h = _re.sub(r'Une lettre unique, avec préférences par entité[^<]*<', 'Chaque lundi, l’édito de la semaine, les nouvelles publications, les appels en cours et l’agenda du Groupe JOGOO et de ses projets. <a href="/lettre" target="_blank" class="font-semibold text-terra-deep underline underline-offset-2 hover:text-terra">Voir la prochaine lettre</a><', h)
open(f, 'w').write(h)
# Accueil : « Philosophie africaine » retravaillé (couleurs, police, trait dessiné) et coq animé (9 nov. 2026, 19 h 35)
f = OUT + '/home-01.html'
h = open(f).read()
h = h.replace(
    '<h1 class="display-title mt-2 text-[2.5rem] leading-[0.92] text-ink sm:text-5xl md:text-6xl lg:text-7xl">Philosophie<br/>africaine</h1>',
    '<h1 class="titre-accueil mt-2"><span class="titre-philo">Philosophie</span> <span class="titre-afr">africaine<svg class="titre-trait" viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true"><path d="M4 16 C 70 6, 170 3, 296 11"/><path d="M40 21 C 120 14, 210 13, 280 17"/></svg></span></h1>',
)
h = h.replace('<div class="relative mx-auto w-full max-w-md shadow-[0_24px_50px_-20px_rgba(60,35,5,0.45)]">', '<div class="coq-flotte relative mx-auto w-full max-w-md shadow-[0_24px_50px_-20px_rgba(60,35,5,0.45)]">')
open(f, 'w').write(h)
# Logos des projets harmonisés (recadrés, surface visuelle égalisée — voir lib/liste-sous-sites.ts)
_LOGOS = {
    'logo-revue-jogoo.png': ('revue', 0.98), 'logo-editions-jogoo.png': ('editions', 1.03), 'logo-fonds-eboussi.jpg': ('fonds', 0.86),
    'picto-jogoo-ai.png': ('ai', 0.78), 'logo-sankofa-full.png': ('sankofa', 0.9), 'logo-philo-africaine-magazine.png': ('magazine', 0.7),
}
for nom in ('home-04-colonnes.html', 'home-04.html'):
    f = OUT + '/' + nom
    h = open(f).read()
    def _logo(m):
        tag = m.group(0)
        src = _re.search(r'src="/medias/site/jogoo/([^"]+)"', tag)
        if not src or src.group(1) not in _LOGOS: return tag
        cle, e = _LOGOS[src.group(1)]
        tag = _re.sub(r'\s(width|height)="\d+"', '', tag)
        tag = tag.replace(f'src="/medias/site/jogoo/{src.group(1)}"', f'src="/medias/site/jogoo/projets/{cle}.png" style="height:{round(3.4 * e, 2)}rem"')
        return tag.replace('h-auto max-h-16 w-auto max-w-20', 'w-auto max-w-20')
    h = _re.sub(r'<img alt="Logo[^>]*>', _logo, h)
    open(f, 'w').write(h)
# Le coq regarde toujours vers la gauche ; le bout de la queue, coupé dans le dessin d’origine, s’estompe
for f in _g.glob(OUT + '/*.html'):
    h = open(f).read(); h0 = h
    h = h.replace('src="/medias/site/jogoo/coq-penseur-t.png"', 'src="/medias/site/jogoo/coq-penseur-gauche.png"')
    if h != h0: open(f, 'w').write(h)
# Fonds Eboussi Boulaga (10 nov. 2026) : le colloque et la revue Eboussi Studies descendent en bas de l’accueil du Fonds ;
# secrétaire exécutif ; photo de « Le Fonds » remplacée par un portrait net tiré de Mosaïques (Akometam, 2013)
f = OUT + '/page__sous-sites__fonds-eboussi-boulaga.html'
h = open(f).read()
if 'id="fonds-bas"' not in h:
    s = BeautifulSoup(h, 'html.parser')
    colloque = s.find('section', class_='colloque')
    revue = next((d for d in s.find_all('div', class_='feature') if 'couverture-eboussi-studies' in str(d)), None)
    pied = s.find('footer', class_='fonds-colophon')
    if colloque and revue and pied:
        enveloppe = revue.parent  # <div class="wrap"> qui ne contient que la revue
        bas = s.new_tag('div', id='fonds-bas', style='margin-bottom:-5rem')
        enveloppe.extract(); colloque.extract()
        bas.append(enveloppe); bas.append(colloque)
        s.find('div', class_='fonds').append(bas)
        h = str(s)
        open(f, 'w').write(h)
f = OUT + '/page__sous-sites__fonds-eboussi-boulaga__le-fonds.html'
h = open(f).read()
h = h.replace('<div><b>Edith Ekodo Mvondo</b><span>Secrétaire exécutive du Fonds depuis sa fondation</span></div>',
              '<div><b>Adoulou N. Bitang</b><span>Secrétaire exécutif</span></div>')
h = _re.sub(r'<figure class="wide-ph">.*?</figure>',
    '<figure class="wide-ph color" style="max-width:420px"><div class="frame" style="height:auto;aspect-ratio:433/537"><img alt="Fabien Eboussi Boulaga, pensif, la main au menton, à Akometam en octobre 2013" decoding="async" loading="lazy" src="/medias/site/jogoo/fonds-eboussi/eboussi-akometam-2013.jpg" style="position:absolute;height:100%;width:100%;left:0;top:0;right:0;bottom:0"/></div><figcaption>Fabien Eboussi Boulaga à Akometam, en octobre 2013. © Perez · Mosaïques, numéro spécial</figcaption></figure>',
    h, count=1, flags=_re.S)
open(f, 'w').write(h)
