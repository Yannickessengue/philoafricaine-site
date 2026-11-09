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
# Accueil : le coq regarde vers la gauche (demande du 9 nov. 2026), image chargée tout de suite
h=open(OUT+'/home-01.html').read()
h=h.replace('class="block h-auto w-full -scale-x-100"','class="block h-auto w-full"').replace('loading="lazy"','loading="eager"')
open(OUT+'/home-01.html','w').write(h)
