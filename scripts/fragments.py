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
# Fonds Eboussi Boulaga (10 nov. 2026) : emplacement du bloc dynamique « À venir » (agenda + appels du Fonds),
# rempli par app/(site)/[...slug]/page.tsx avec components/AVenirFonds.tsx
for nom, apres in (('page__sous-sites__fonds-eboussi-boulaga.html', 'home-hero'), ('page__sous-sites__fonds-eboussi-boulaga__activites.html', 'fe-header')):
    f = OUT + '/' + nom
    h = open(f).read()
    if 'data-a-venir' not in h:
        s = BeautifulSoup(h, 'html.parser')
        cible = s.find(class_=apres)
        if cible:
            cible.insert_after(s.new_tag('div', attrs={'data-a-venir': 'fonds'}))
            open(f, 'w').write(str(s))
# Fonds Eboussi Boulaga (10 nov. 2026) : vignettes YouTube sur les cartes vidéo (accueil du Fonds et Médiathèque),
# cartes plus compactes (styles dans app/fonds.css, bloc « vignettes »)
for nom in ('page__sous-sites__fonds-eboussi-boulaga.html', 'page__sous-sites__fonds-eboussi-boulaga__mediatheque.html'):
    f = OUT + '/' + nom
    h = open(f).read()
    def _vignette(m):
        a = m.group(0)
        if 'class="th"' in a:
            return a
        v = _re.search(r'youtube\.com/watch\?v=([\w-]{11})', a)
        if not v:
            return a
        return a.replace('<span aria-hidden="true" class="play"></span>',
            f'<span class="th"><img alt="" loading="lazy" decoding="async" src="https://i.ytimg.com/vi/{v.group(1)}/hqdefault.jpg"/><span aria-hidden="true" class="play"></span></span>', 1)
    h = _re.sub(r'<a class="vid"[^>]*>.*?</a>', _vignette, h, flags=_re.S)
    open(f, 'w').write(h)
# Le Groupe (11 nov. 2026) : bandeau vers la page « Notre histoire » (chronologie des activités, collection chronologie)
f = OUT + '/page__le-groupe.html'
h = open(f).read()
if 'href="/notre-histoire"' not in h:
    h = h.replace('</dl></section>', '</dl></section><section class="border-b border-ink/10 bg-terra"><a href="/notre-histoire" class="group mx-auto flex max-w-6xl flex-col gap-2 px-5 py-7 text-white sm:flex-row sm:items-center sm:justify-between"><span><span class="font-brand text-[0.68rem] font-bold uppercase tracking-[0.2em] text-white/75">Mémoire du Groupe · 2010 → aujourd’hui</span><span class="mt-1 block font-brand text-2xl font-bold">Notre histoire : conférences, colloques et journées d’étude, en images</span></span><span class="font-brand text-xs font-bold uppercase tracking-[0.14em] transition-transform group-hover:translate-x-1">Voir la chronologie →</span></a></section>', 1)
    open(f, 'w').write(h)
# Crédits (11 nov. 2026) : historique du site, mention de la première version réalisée par le webmaster
f = OUT + '/page__credits.html'
h = open(f).read()
if 'Historique du site' not in h:
    h = h.replace('Illustration du coq penseur et visuels de citation : Groupe JOGOO.</p>', 'Illustration du coq penseur et visuels de citation : Groupe JOGOO.</p><h3>Historique du site</h3><p>La première version du portail philoafricaine.org (2026) a été conçue et développée par <strong>Claude Hussein Nianga</strong>, webmaster du Groupe JOGOO : architecture des sous-sites, édito de la semaine, Revue JOGOO, Fonds Eboussi Boulaga et back-office. La version actuelle prolonge ce travail ; le Groupe JOGOO le remercie chaleureusement.</p>', 1)
    open(f, 'w').write(h)
# Adhésion (11 nov. 2026) : liens vers la page /adhesion
for nom, avant, apres in [
    ('footer.html', 'href="/contact">Nous rejoindre</a>', 'href="/adhesion">Adhérer au Groupe</a>'),
    ('page__le-groupe.html', 'Comité scientifique, statuts, adhésion et soutien : écrire à <a', 'Pour devenir membre : <a class="text-terra-deep underline underline-offset-2" href="/adhesion">adhérer en ligne ou télécharger la fiche d’adhésion</a>. Comité scientifique, statuts et soutien : écrire à <a'),
]:
    f = OUT + '/' + nom
    h = open(f).read()
    if avant in h and apres not in h:
        open(f, 'w').write(h.replace(avant, apres, 1))
# Lettre d'information (11 nov. 2026) : champ e-mail écrasé sur mobile (flex-1 en colonne) → hauteur minimale
import glob as _g
for f in _g.glob(OUT + '/*.html'):
    h = open(f).read()
    n = h.replace('class="h-12 flex-1 border border-ink/20 bg-white px-4 text-sm outline-none focus:border-terra" id="nl-email"',
                  'class="h-12 min-h-12 w-full flex-1 border border-ink/20 bg-white px-4 text-base outline-none focus:border-terra sm:min-w-0 sm:text-sm" id="nl-email"')
    if n != h: open(f, 'w').write(n)
# Astérisque (11 nov. 2026) : « ✳ » s'affiche en émoji vert sous Windows → « ✱ » (toujours typographique)
for f in _g.glob(OUT + '/*.html'):
    h = open(f).read()
    if '✳' in h: open(f, 'w').write(h.replace('✳️', '✱').replace('✳', '✱'))
# Flèches ↗ et ▶ (11 nov. 2026) : forcer l'affichage texte (U+FE0E) pour éviter les émojis sous Windows
import re as _re
for f in _g.glob(OUT + '/*.html'):
    h = open(f).read()
    n = _re.sub('([\u2197\u25b6])(?!\ufe0e)', '\\1\ufe0e', h)
    if n != h: open(f, 'w').write(n)

# Intro d'accueil : fondu plus court, filigrane chargé immédiatement
_p = OUT + '/home-00.html'
_h = open(_p).read()
_h = _h.replace('transition-opacity duration-400 opacity-100', 'transition-opacity duration-300 opacity-100')
_h = _h.replace('decoding="async" height="1254" loading="lazy" src="/medias/site/jogoo/coq-penseur.jpg"', 'decoding="async" fetchpriority="high" height="1254" loading="eager" src="/medias/site/jogoo/coq-penseur.jpg"')
open(_p, 'w').write(_h)

# Accueil : « S'abonner à notre newsletter » + grand carré rouge « Devenir membre » (vers /adhesion)
_p = OUT + '/home-09.html'
_h = open(_p).read()
if 'data-devenir-membre' not in _h:
    _deb = _h.index('<div class="mx-auto max-w-2xl px-5 py-16 text-center">')
    _fin = _h.index('</form></div>', _deb) + len('</form></div>')
    _form = _h[_h.index('<form', _deb):_h.index('</form>', _deb) + len('</form>')]
    _form = _form.replace('<form class="mx-auto mt-8 max-w-md">', '<form class="mt-7 max-w-lg">')
    _bloc = (
        '<div class="mx-auto grid max-w-5xl gap-6 px-5 py-16 md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] md:items-stretch md:gap-8">'
        '<div class="flex flex-col justify-center border border-ink/10 bg-paper p-7 sm:p-10">'
        '<h2 class="display-title text-3xl text-terra sm:text-4xl">S’abonner à notre newsletter</h2>'
        '<p class="mt-3 max-w-lg text-ink-soft">L’édito de chaque lundi, et aussi les nouvelles publications, les appels en cours, '
        'les conférences à venir et la vie des projets du Groupe JOGOO. '
        '<a href="/lettre" target="_blank" class="font-semibold text-terra-deep underline underline-offset-2 hover:text-terra">Voir la prochaine lettre</a></p>'
        + _form +
        '</div>'
        '<a data-devenir-membre="" href="/adhesion" class="group relative flex aspect-square flex-col justify-between overflow-hidden bg-terra p-8 text-white transition-colors hover:bg-terra-deep md:aspect-auto">'
        '<img alt="" aria-hidden="true" src="/medias/site/jogoo/coq-penseur.jpg" loading="lazy" decoding="async" class="pointer-events-none absolute -bottom-10 -right-10 h-56 w-56 object-contain opacity-15 mix-blend-multiply transition-transform duration-500 group-hover:scale-105"/>'
        '<span class="relative font-brand text-sm font-semibold text-white/80">Groupe JOGOO · année 2026-2027</span>'
        '<span class="relative">'
        '<span class="block font-brand text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-5xl">Devenir<br/>membre</span>'
        '<span class="mt-4 block max-w-[17rem] text-sm leading-relaxed text-white/85">Membre actif, bienfaiteur ou bénévole : rejoignez le Groupe et soutenez ses projets.</span>'
        '<span class="mt-6 inline-flex items-center gap-2 bg-white px-4 py-2.5 font-brand text-xs font-bold uppercase tracking-[0.1em] text-terra-deep transition-colors group-hover:bg-ink group-hover:text-white">Remplir le formulaire d’adhésion</span>'
        '</span></a>'
        '</div>'
    )
    _h = _h[:_deb] + _bloc + _h[_fin:]
    open(_p, 'w').write(_h)

# En-tête : bouton rouge « Adhérer » toujours visible (formulaire d'adhésion)
_p = OUT + '/header.html'
_h = open(_p).read()
if 'data-adherer' not in _h:
    _h = _h.replace('<div class="flex items-center gap-2"><button aria-label="Rechercher sur le site"',
        '<div class="flex items-center gap-2"><a data-adherer="" href="/adhesion" class="hidden h-10 items-center bg-terra px-4 font-brand text-xs font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-terra-deep sm:inline-flex">Adhérer</a><button aria-label="Rechercher sur le site"', 1)
    open(_p, 'w').write(_h)

# En-tête : place pour « Adhérer » (liens un peu plus serrés ; bouton masqué entre lg et xl faute de place)
_p = OUT + '/header.html'
_h = open(_p).read()
_h = _h.replace('class="relative whitespace-nowrap px-2.5 py-2 text-[0.85rem]', 'class="relative whitespace-nowrap px-2 py-2 text-[0.85rem]')
_h = _h.replace('hidden h-10 items-center bg-terra px-4 font-brand text-xs font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-terra-deep sm:inline-flex"',
                'hidden h-10 items-center bg-terra px-4 font-brand text-xs font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-terra-deep sm:inline-flex lg:hidden xl:inline-flex"')
_h = _h.replace('<div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5">', '<div class="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3.5">')
open(_p, 'w').write(_h)

# En-tête : le logo mène déjà à l'accueil ; le lien « Accueil » cède sa place au bouton « Adhérer » sur grand écran
_p = OUT + '/header.html'
_h = open(_p).read()
_h = _h.replace('<a class="relative whitespace-nowrap px-2 py-2 text-[0.85rem] font-medium transition-colors hover:text-terra xl:text-[0.9rem] text-ink" href="/">Accueil</a>',
                '<a class="relative whitespace-nowrap px-2 py-2 text-[0.85rem] font-medium transition-colors hover:text-terra xl:hidden 2xl:inline text-ink" href="/">Accueil</a>')
open(_p, 'w').write(_h)
_p = OUT + '/header.html'
_h = open(_p).read().replace('xl:hidden 2xl:inline text-ink" href="/">Accueil', 'xl:hidden text-ink" href="/">Accueil')
open(_p, 'w').write(_h)
_p = OUT + '/home-09.html'
_h = open(_p).read().replace('>Remplir le formulaire d’adhésion</span>', '>Adhérer en ligne</span>')
open(_p, 'w').write(_h)

# Philo Africaine Magazine trimestriel ; éditeur des revues = Éditions JOGOO (Groupe JOGOO, Yaoundé) ; ISSN en cours
import re as _re, glob as _glob, os as _os
EDITEUR = 'Éditions JOGOO — Groupe JOGOO (ASPHICC-JOGOO), Yaoundé (Cameroun)'
for _p in _glob.glob(OUT + '/*.html') + [OUT + '/index.json']:
    _h = open(_p, encoding='utf-8').read(); _o = _h
    _h = _h.replace('Magazine semestriel', 'Magazine trimestriel').replace('magazine semestriel', 'magazine trimestriel')
    _h = _re.sub(r'édité par «[\s ]*Philosophie Africaine\. Débats (?:&amp;|&) Questions[\s ]*»', 'édité par les Éditions JOGOO (Groupe JOGOO)', _h)
    if 'magazine' in _os.path.basename(_p):
        _h = _h.replace('Semestrielle', 'Trimestrielle')
        _h = _re.sub(r'(Éditeur</dt><dd[^>]*>)\s*Philosophie Africaine\. Débats (?:&amp;|&) Questions', r'\1' + EDITEUR, _h)
    if 'revue-jogoo' in _os.path.basename(_p) or 'revue-accueil' in _os.path.basename(_p):
        _h = _re.sub(r'(Éditeur</dt><dd[^>]*>)\s*Éditions JOGOO\.?', r'\1' + EDITEUR + '.', _h)
        _h = _re.sub(r'(ISSN imprimé)(\s*<[^>]+>\s*)*en préparation', r'\1', _h)
        _h = _h.replace('À obtenir.', 'En cours d’attribution.')
    if _h != _o: open(_p, 'w', encoding='utf-8').write(_h)
_p = OUT + '/page__sous-sites__philo-africaine-magazine.html'
_h = open(_p, encoding='utf-8').read()
_h = _re.sub(r'(Éditeur</dt><dd[^>]*>(?:<[^>]+>)*)Philosophie Africaine\. Débats &amp; Questions', r'\1' + EDITEUR, _h, count=1)
open(_p, 'w', encoding='utf-8').write(_h)
for _p in (OUT + '/page__sous-sites__eboussi-studies.html', OUT + '/page__sous-sites__fonds-eboussi-boulaga__eboussi-studies.html'):
    if _os.path.exists(_p):
        _h = open(_p, encoding='utf-8').read()
        _h = _h.replace('<li>Éditeur : Groupe JOGOO</li>', '<li>Éditeur : ' + EDITEUR + '</li>')
        _h = _h.replace('Éditée par le Groupe JOGOO, adossée', 'Éditée par les Éditions JOGOO (Groupe JOGOO), adossée')
        _h = _h.replace('éditée par le Groupe JOGOO et adossée', 'éditée par les Éditions JOGOO (Groupe JOGOO) et adossée')
        open(_p, 'w', encoding='utf-8').write(_h)

# Revue JOGOO : lecture en ligne libre dès la parution, PDF téléchargeable après six mois, licence CC BY-NC 4.0
_BADGE = '<span class="ml-2 rounded-full bg-gold/20 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-gold-deep">en préparation</span>'
for _p in _glob.glob(OUT + '/*revue*.html'):
    _h = open(_p, encoding='utf-8').read(); _o = _h
    _h = _h.replace('Accès &amp; licence' + _BADGE + '</dt><dd class="text-sm text-ink-soft">Les articles signalés sont disponibles en libre accès. La licence de diffusion et les droits des auteurs sont en cours de décision.</dd>',
                    'Accès &amp; licence</dt><dd class="text-sm text-ink-soft">Lecture en ligne libre et gratuite de tous les articles dès leur parution. Le téléchargement des PDF est ouvert six mois après la parution du numéro (barrière mobile). Licence Creative Commons CC BY-NC 4.0.</dd>')
    _h = _h.replace('<dd>Articles signalés en libre accès</dd>', '<dd>Lecture en ligne libre</dd>')
    if _h != _o: open(_p, 'w', encoding='utf-8').write(_h)

# Revues : normes d'édition du CAMES (NORCAMES/LSH)
_NORMES = ('<dt class="font-brand text-sm font-semibold text-ink">Normes</dt><dd class="text-sm text-ink-soft">Normes d’édition du CAMES pour les lettres et sciences humaines (NORCAMES/LSH, 2016), '
           'pour que les articles publiés soient recevables dans les dossiers d’avancement des enseignants-chercheurs. '
           '<a class="underline" href="/sous-sites/editions-jogoo/politique-editoriale">Modèle Word et règles</a></dd>')
for _p in _glob.glob(OUT + '/*revue*.html'):
    _h = open(_p, encoding='utf-8').read(); _o = _h
    if 'NORCAMES' not in _h:
        _h = _h.replace('<dt class="font-brand text-sm font-semibold text-ink">Frais de publication</dt>', _NORMES + '<dt class="font-brand text-sm font-semibold text-ink">Frais de publication</dt>', 1)
    if _h != _o: open(_p, 'w', encoding='utf-8').write(_h)
