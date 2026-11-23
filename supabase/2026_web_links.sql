create table if not exists web_links (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null,
  description text not null default '',
  mapel text not null default 'Umum',
  sort int not null default 0,
  created_at timestamptz not null default now()
);
insert into web_links (name, url, description, mapel, sort)
select * from (values
 ('Polypad','https://polypad.amplify.com/','Alat peraga maya: bangun ruang, pecahan, ubin aljabar, garis bilangan. Cocok untuk belajar kubus dan jaring-jaring.','Matematika',1),
 ('PhET Simulasi','https://phet.colorado.edu/in/','Ratusan simulasi interaktif fisika, kimia, biologi, dan matematika dari University of Colorado. Ada bahasa Indonesia.','IPA & Matematika',2),
 ('GeoGebra','https://www.geogebra.org/','Geometri, grafik fungsi, dan bangun 3D yang bisa diputar. Banyak aktivitas siap pakai buatan guru dunia.','Matematika',3),
 ('Desmos','https://www.desmos.com/calculator?lang=id','Kalkulator grafik untuk menggambar fungsi dan melihat perubahannya.','Matematika',4),
 ('Scratch','https://scratch.mit.edu/','Belajar coding dengan menyusun balok. Murid bisa membuat game dan animasi sendiri.','Coding',5),
 ('Chrome Music Lab','https://musiclab.chromeexperiments.com/','Eksperimen musik di browser: ritme, melodi, dan gelombang suara. Tanpa daftar akun.','Seni Musik',6)
) v(name,url,description,mapel,sort)
where not exists (select 1 from web_links);
