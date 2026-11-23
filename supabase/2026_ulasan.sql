alter table usulan add column if not exists rating int;
alter table usulan add column if not exists peran text not null default '';
alter table usulan add column if not exists tampil boolean not null default false;
