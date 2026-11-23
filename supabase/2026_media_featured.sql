-- Tanda "Pilihan Main-yuk" untuk karya kontributor yang dipilih admin (jalankan sekali di Neon)
alter table media add column if not exists featured boolean not null default false;
