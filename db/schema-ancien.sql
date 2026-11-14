-- Commentaires des éditos — pseudonymat libre, modération a posteriori.
-- Exécuter : node scripts/db-migrate.mjs

create table if not exists edito_comments (
  id           bigint generated always as identity primary key,
  slug         text        not null,
  parent_id    bigint      references edito_comments (id) on delete cascade,
  author_name  text        not null check (char_length(btrim(author_name)) between 2 and 60),
  author_email text        check (author_email is null or author_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  body         text        not null check (char_length(btrim(body)) between 2 and 4000),
  client_id    text        not null check (char_length(client_id) between 8 and 64),
  ip_hash      text,
  status       text        not null default 'visible' check (status in ('visible', 'hidden')),
  created_at   timestamptz not null default now(),
  deleted_at   timestamptz
);

create index if not exists edito_comments_slug_idx    on edito_comments (slug, created_at);
create index if not exists edito_comments_parent_idx  on edito_comments (parent_id);
create index if not exists edito_comments_ip_idx      on edito_comments (ip_hash, created_at);

create table if not exists edito_comment_reactions (
  comment_id bigint      not null references edito_comments (id) on delete cascade,
  client_id  text        not null,
  kind       text        not null check (kind in ('like', 'love', 'think', 'clap')),
  created_at timestamptz not null default now(),
  primary key (comment_id, client_id, kind)
);

create index if not exists edito_comment_reactions_comment_idx on edito_comment_reactions (comment_id);

-- ─────────────────────────────────────────────────────────────
-- Éditos gérés depuis le back-office (/admin)
-- ─────────────────────────────────────────────────────────────
create table if not exists editos (
  id             bigint generated always as identity primary key,
  slug           text        not null unique,
  status         text        not null default 'draft' check (status in ('draft', 'published')),
  iso            date        not null default current_date,
  date_label     text        not null default '',
  kicker         text,
  title          text        not null default '',
  subtitle       text,
  standfirst     text        not null default '',
  author_line    text        not null default '',
  author_photo   text,
  epigraph_text  text,
  epigraph_source text,
  image_src      text,
  image_alt      text,
  og_image       text,
  pdf_url        text,
  cover_url      text,
  sections       jsonb       not null default '[]'::jsonb,
  conclusion     jsonb       not null default '[]'::jsonb,
  refs           jsonb       not null default '[]'::jsonb,
  share_text     text,
  share_hashtags jsonb       not null default '[]'::jsonb,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  published_at   timestamptz
);

create index if not exists editos_status_iso_idx on editos (status, iso desc);

-- Colonnes ajoutées après coup (idempotent).
alter table editos add column if not exists author_photo text;

-- ─────────────────────────────────────────────────────────────
-- Lettre d’information
-- ─────────────────────────────────────────────────────────────
create table if not exists newsletter_subscribers (
  id            bigint generated always as identity primary key,
  email         text        not null unique,
  status        text        not null default 'confirmed'
                  check (status in ('pending', 'confirmed', 'unsubscribed')),
  token         text        not null,
  source        text,
  ip_hash       text,
  created_at    timestamptz not null default now(),
  confirmed_at  timestamptz,
  unsubscribed_at timestamptz
);

create index if not exists newsletter_status_idx on newsletter_subscribers (status, created_at desc);
create index if not exists newsletter_token_idx  on newsletter_subscribers (token);

create table if not exists newsletter_campaigns (
  id           bigint generated always as identity primary key,
  subject      text        not null,
  intro        text,
  recipients   int         not null default 0,
  delivered    int         not null default 0,
  failed       int         not null default 0,
  sent_at      timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════
-- Back-office : contenus éditoriaux gérés depuis /admin
-- ═══════════════════════════════════════════════════════════════

-- Réglages clé/valeur (contact, réseaux, textes courts)
create table if not exists settings (
  key   text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

-- Agenda / événements
create table if not exists agenda_items (
  id          bigint generated always as identity primary key,
  iso         date not null,
  date_label  text not null default '',
  title       text not null default '',
  place       text,
  sort        int  not null default 0,
  tbc         boolean not null default false,
  created_at  timestamptz not null default now()
);
alter table agenda_items add column if not exists tbc boolean not null default false;
create index if not exists agenda_iso_idx on agenda_items (iso);

-- Actualités (billets)
create table if not exists news_posts (
  id            bigint generated always as identity primary key,
  slug          text unique not null,
  title         text not null default '',
  author        text,
  iso           date not null default current_date,
  body          jsonb not null default '[]'::jsonb,
  status        text not null default 'draft' check (status in ('draft','published')),
  image         text,
  image_alt     text,
  image_credit  text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
alter table news_posts add column if not exists image text;
alter table news_posts add column if not exists image_alt text;
alter table news_posts add column if not exists image_credit text;

-- Auteurs (fiches, pour les publications)
create table if not exists authors (
  id     bigint generated always as identity primary key,
  slug   text unique not null,
  name   text not null default '',
  life   text,
  place  text,
  bio    text,
  photo  text,
  credit text,
  created_at timestamptz not null default now()
);

-- Recensions / notes de lecture
create table if not exists recensions (
  id           bigint generated always as identity primary key,
  slug         text unique not null,
  author_slug  text,
  author       text not null default '',
  work         text,
  publisher    text,
  year         int,
  tags         jsonb not null default '[]'::jsonb,
  featured     boolean not null default false,
  link_label   text,
  link_href    text,
  excerpt      text not null default '',
  body         jsonb not null default '[]'::jsonb,
  status       text not null default 'published' check (status in ('draft','published')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Appels à contributions
create table if not exists appels_contributions (
  id          bigint generated always as identity primary key,
  slug        text unique not null,
  type        text not null default 'Journée d’étude',
  title       text not null default '',
  date_label  text,
  place       text,
  deadline    text not null default '',
  pitch       text not null default '',
  contact     text,
  file_href   text,
  file_label  text,
  open        boolean not null default true,
  sort        int not null default 0,
  created_at  timestamptz not null default now()
);

-- Appels à postes
create table if not exists postes (
  id        bigint generated always as identity primary key,
  n         int not null default 0,
  title     text not null default '',
  open      boolean not null default false,
  missions  jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- Médiathèque : vidéos
create table if not exists videos (
  id           bigint generated always as identity primary key,
  group_label  text not null default '',
  group_note   text,
  title        text not null default '',
  href         text not null default '',
  sort         int not null default 0,
  created_at   timestamptz not null default now()
);

-- Flash d’entrée : les textes-manifestes de /flash
create table if not exists flash_texts (
  id            bigint generated always as identity primary key,
  n             int not null default 0,
  title         text not null default '',
  author        text,
  place         text,
  pull          text,
  image         text,
  image_alt     text,
  image_caption text,
  image_credit  text,
  body          jsonb not null default '[]'::jsonb,
  updated_at    timestamptz not null default now()
);

-- Candidatures aux appels à postes
create table if not exists applications (
  id             bigint generated always as identity primary key,
  poste_id       bigint,                       -- null = candidature spontanée
  poste_n        int,
  poste_title    text not null default 'Candidature spontanée',
  full_name      text not null,
  email          text not null,
  phone          text,
  message        text not null default '',
  cv_url         text not null,
  cv_name        text,
  letter_url     text,
  letter_name    text,
  portfolio_url  text,
  portfolio_name text,
  links          jsonb not null default '[]'::jsonb,
  status         text not null default 'new'
                 check (status in ('new', 'review', 'shortlist', 'rejected', 'archived')),
  note           text,
  ip_hash        text,
  created_at     timestamptz not null default now()
);
create index if not exists applications_created_idx on applications (created_at desc);
create index if not exists applications_status_idx  on applications (status);

-- Statistiques de fréquentation (mesure première partie, sans cookie ni donnée personnelle).
-- visitor_day = empreinte qui tourne chaque jour (non reliable d’un jour à l’autre).
create table if not exists page_views (
  id           bigint generated always as identity primary key,
  path         text not null,
  ref_host     text,
  visitor_day  text not null,
  device       text,            -- mobile | desktop | tablet
  country      text,            -- code ISO à 2 lettres si disponible
  created_at   timestamptz not null default now()
);
create index if not exists page_views_created_idx on page_views (created_at desc);
create index if not exists page_views_path_idx    on page_views (path);
create index if not exists page_views_visitor_idx on page_views (visitor_day, created_at);
