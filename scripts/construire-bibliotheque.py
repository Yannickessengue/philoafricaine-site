#!/usr/bin/env python3
"""Construit la bibliothèque privée de JOGOO AI (content/jogoo-ai/bibliotheque.enc).

Entrées (hors dépôt, jamais versées sur GitHub en clair) :
  --textes  dossier de fichiers .txt extraits des PDF autorisés (texte intégral)
  --meta    fichier JSON décrivant ces textes : {"fichier.txt": {titre, auteur, annee, source, type}}
  --notices fichier JSON des ouvrages protégés : [[domaine, chemin, auteur], ...] (notice seule)
Clé : variable d'environnement JOGOO_AI_CORPUS_CLE (32 octets en base64), la même que dans Vercel.

Règles : le dossier des inédits d'Eboussi Boulaga (« Adyas books ») n'est jamais versé,
sauf les numéros publiés de Terroirs et le texte de Marc Maesschalck (décision de Y. Essengue, 11/11/2026).
"""
import argparse, base64, gzip, hashlib, json, os, re, sys
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

ap = argparse.ArgumentParser()
ap.add_argument('--textes', required=True); ap.add_argument('--meta', required=True); ap.add_argument('--notices', required=True)
ap.add_argument('--sortie', default=os.path.join(os.path.dirname(__file__), '..', 'content', 'jogoo-ai', 'bibliotheque.enc'))
a = ap.parse_args()
cle = base64.b64decode(os.environ['JOGOO_AI_CORPUS_CLE'])

def propre(t):
    t = re.sub(r'\S+@\S+\.\w+', ' ', t)                       # adresses e-mail
    t = re.sub(r'\+?\d[\d .]{8,}\d', ' ', t)                  # numéros de téléphone
    t = re.sub(r'TERROIRS - AGAMBEN_Mise en page \d+ [\d/]+ [\d:]+ Page \d+', ' ', t)
    t = re.sub(r'(\w)-\n\s*(\w)', r'\1\2', t)                 # césures
    t = re.sub(r'[ \t]+', ' ', t)
    t = re.sub(r'\n[ \t]*(?=\S)', '\n', t)
    return re.sub(r'\n{3,}', '\n\n', t).strip()

notices = []
meta = json.load(open(a.meta))
for fichier, m in meta.items():
    texte = propre(open(os.path.join(a.textes, fichier), encoding='utf-8', errors='replace').read())
    notices.append({'id': 'bib-' + hashlib.sha1(fichier.encode()).hexdigest()[:10], 'type': m.get('type', 'Ouvrage'),
        'titre': m['titre'], 'auteur': m.get('auteur', ''), 'annee': m.get('annee', ''), 'source': m.get('source', 'Bibliothèque du Groupe JOGOO'),
        'url': '', 'langue': 'Français', 'acces': 'Texte intégral (bibliothèque du Groupe)', 'resume': m.get('resume', ''),
        'motsCles': m.get('motsCles', []), 'texte': texte})
DOM = {'afr': 'philosophie africaine et pensée africaine', 'theo': 'théologie africaine et cultures africaines', 'gen': 'philosophie générale'}
titres_integraux = {re.sub(r'\W+', '', n['titre'].lower()) for n in notices}
for dom, chemin, auteur in json.load(open(a.notices)):
    if 'adyas' in chemin.lower(): continue
    titre = re.sub(r'\.pdf$', '', re.split(r'[\\/]', chemin)[-1], flags=re.I).replace('_', ' ').strip()
    titre = re.sub(r'\s*\((z-lib|Z-Library|z-library)[^)]*\)|-?libgen\.\w+|@\w+|\s{2,}', ' ', titre).strip(' -')
    notices.append({'id': 'not-' + hashlib.sha1(chemin.encode()).hexdigest()[:10], 'type': 'Ouvrage', 'titre': titre, 'auteur': auteur or '',
        'annee': '', 'source': f'Bibliothèque du Groupe JOGOO ({DOM[dom]})', 'url': '', 'langue': '', 'acces': 'Notice seule (bibliothèque du Groupe)',
        'resume': '', 'motsCles': [DOM[dom]], 'texte': f"{titre}. {auteur or 'Auteur à préciser'}. Ouvrage présent dans la bibliothèque du Groupe JOGOO, domaine : {DOM[dom]}. Texte non consultable par l'assistant (droits réservés) : notice seule."})
brut = gzip.compress(json.dumps(notices, ensure_ascii=False).encode('utf-8'), 9)
iv = os.urandom(12); ct = AESGCM(cle).encrypt(iv, brut, None)       # ct = chiffré + étiquette (16 derniers octets)
open(a.sortie, 'wb').write(iv + ct[-16:] + ct[:-16])
print(f"{sum(1 for n in notices if n['acces'].startswith('Texte'))} textes intégraux, {sum(1 for n in notices if n['acces'].startswith('Notice'))} notices, {len(brut)//1024} Ko compressés -> {a.sortie}")
