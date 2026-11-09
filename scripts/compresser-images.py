"""Recompression des images de public/medias sans perte visible.
JPEG : redimensionnés (côté max 2000 px), qualité 84 progressive.
PNG sans transparence : convertis en JPEG (références mises à jour).
PNG avec transparence : redimensionnés (côté max 1400 px) et quantifiés (libimagequant, qualité 85-98)."""
import glob, os, sys, subprocess
from PIL import Image
import imagequant
RACINE = sys.argv[1]
MAX_JPG, MAX_PNG, SEUIL = 2000, 1400, 250_000
renommes = {}
avant = apres = 0
def reduit(im, m):
    if max(im.size) > m:
        im = im.copy(); im.thumbnail((m, m), Image.LANCZOS)
    return im
for f in glob.glob(RACINE + '/public/medias/**/*.*', recursive=True):
    ext = f.lower().rsplit('.', 1)[-1]
    if ext not in ('png', 'jpg', 'jpeg'): continue
    s = os.path.getsize(f)
    if s < SEUIL: continue
    im = Image.open(f); im.load()
    alpha = im.mode in ('RGBA', 'LA', 'P') and im.convert('RGBA').getextrema()[3][0] < 255
    if ext in ('jpg', 'jpeg') or not alpha:
        cible = f if ext in ('jpg', 'jpeg') else f[:-4] + '.jpg'
        if cible != f and os.path.exists(cible): cible = f[:-4] + '-c.jpg'
        im2 = reduit(im.convert('RGB'), MAX_JPG)
        tmp = cible + '.tmp'
        im2.save(tmp, 'JPEG', quality=84, optimize=True, progressive=True, subsampling='4:2:0')
        n = os.path.getsize(tmp)
        if n < s:
            os.replace(tmp, cible)
            if cible != f:
                os.remove(f); renommes['/' + os.path.relpath(f, RACINE + '/public')] = '/' + os.path.relpath(cible, RACINE + '/public')
            avant += s; apres += n
        else:
            os.remove(tmp)
    else:
        im2 = reduit(im.convert('RGBA'), MAX_PNG)
        q = imagequant.quantize_pil_image(im2, dithering_level=1.0, max_colors=256, min_quality=85, max_quality=98)
        tmp = f + '.tmp.png'; q.save(tmp, optimize=True)
        n = os.path.getsize(tmp)
        if n < s: os.replace(tmp, f); avant += s; apres += n
        else: os.remove(tmp)
# Mise à jour des références dans les fichiers texte du dépôt
if renommes:
    fichiers = subprocess.run(['git', '-C', RACINE, 'ls-files'], capture_output=True, text=True).stdout.split()
    fichiers += glob.glob(RACINE + '/design/**/*.html', recursive=True)
    for rel in set(fichiers):
        p = rel if rel.startswith('/') else RACINE + '/' + rel
        if not os.path.isfile(p) or p.startswith(RACINE + '/public/') or not p.endswith(('.ts', '.tsx', '.html', '.json', '.mdoc', '.md', '.yaml', '.yml', '.py', '.css')): continue
        t = open(p, encoding='utf8').read(); t0 = t
        for a, b in renommes.items(): t = t.replace(a, b)
        if t != t0: open(p, 'w', encoding='utf8').write(t); print('réf. mise à jour :', rel)
print(f'{len(renommes)} PNG convertis en JPEG ; {avant/1e6:.1f} Mo -> {apres/1e6:.1f} Mo')
