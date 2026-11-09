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
