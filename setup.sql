-- CLIENTS TABLE
create table clients (
  id          text primary key,
  name        text not null,
  password    text not null,
  gtm_enabled boolean default true,
  created_at  timestamptz default now()
);

-- ORDERS TABLE
create table orders (
  id           uuid primary key default gen_random_uuid(),
  client_id    text references clients(id),
  name         text not null,
  phone        text not null,
  city         text,
  size         text,
  quantity     int default 1,
  product_name text,
  source       text,
  status       text default 'pending',
  created_at   timestamptz default now()
);

-- PRICES TABLE
create table prices (
  id        uuid primary key default gen_random_uuid(),
  client_id text references clients(id),
  source    text not null,
  price     int not null,
  unique(client_id, source)
);

-- RLS
alter table clients enable row level security;
alter table orders  enable row level security;
alter table prices  enable row level security;

create policy "allow all" on clients
  for all to anon using (true) with check (true);
create policy "allow all" on orders
  for all to anon using (true) with check (true);
create policy "allow all" on prices
  for all to anon using (true) with check (true);

-- SEED
insert into clients (id, name, password, gtm_enabled) values
  ('amourshop', 'Amourshop', 'amourshop123', true),
  ('zit108',    'Zit 108',   'zit108123',    true);
