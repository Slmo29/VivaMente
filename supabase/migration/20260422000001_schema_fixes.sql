-- Aggiunge le colonne mancanti senza rompere dati esistenti

alter table users
  add column if not exists current_streak    integer not null default 0,
  add column if not exists last_activity_date date;

alter table medaglie
  add column if not exists giorni integer;
