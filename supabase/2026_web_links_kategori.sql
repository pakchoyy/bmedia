alter table web_links add column if not exists kategori text not null default 'Lainnya';
alter table web_links add column if not exists cover text;

-- Lengkapi data awal
update web_links set kategori = 'Matematika', cover = '/web/polypad.jpg' where name = 'Polypad';
update web_links set kategori = 'Simulasi & 3D', cover = '/web/phet.jpg', name = 'PhET Simulasi' where name = 'PhET Simulasi';
update web_links set kategori = 'Matematika', cover = '/web/geogebra.jpg' where name = 'GeoGebra';
update web_links set kategori = 'Matematika', cover = '/web/desmos.jpg' where name = 'Desmos';
update web_links set kategori = 'Coding & Seni', cover = '/web/scratch.jpg' where name = 'Scratch';
update web_links set kategori = 'Coding & Seni', cover = '/web/musiclab.jpg' where name = 'Chrome Music Lab';

insert into web_links (name, url, description, mapel, kategori, cover, sort)
select v.* from (values
 ('Wordwall','https://wordwall.net/id','Buat kuis, roda putar, tebak kata, dan pasangkan jawaban dari daftar soal sendiri. Satu soal bisa diubah ke banyak bentuk permainan. Versi gratis: 5 aktivitas.','Semua mapel','Buat Kuis & Game','/web/wordwall.jpg',10),
 ('Kahoot!','https://kahoot.com/','Kuis adu cepat satu kelas: soal tampil di layar, murid menjawab dari HP masing-masing lewat kode PIN. Ada papan skor langsung.','Semua mapel','Buat Kuis & Game','/web/kahoot.jpg',11),
 ('Blooket','https://www.blooket.com/','Kuis berbentuk mini game (tower defense, balapan, kafe) yang dimainkan murid dari perangkat masing-masing. Banyak set soal siap pakai.','Semua mapel','Buat Kuis & Game','/web/blooket.jpg',12),
 ('Baamboozle','https://www.baamboozle.com/','Kuis tim untuk satu layar: kelas dibagi kelompok dan bergantian memilih kotak soal. Cocok untuk IFP tanpa HP murid.','Semua mapel','Buat Kuis & Game','/web/baamboozle.jpg',13),
 ('Wayground (Quizizz)','https://wayground.com/','Kuis dan pelajaran interaktif yang dikerjakan murid sesuai kecepatan masing-masing, lengkap dengan laporan nilai per soal. Dulu bernama Quizizz.','Semua mapel','Buat Kuis & Game','/web/wayground.jpg',14),
 ('Educaplay','https://www.educaplay.com/','Buat teka-teki silang, mencari kata, peta interaktif, dan isian dari materi sendiri. Bisa dibagikan lewat link.','Semua mapel','Buat Kuis & Game','/web/educaplay.jpg',15),
 ('Interacty','https://interacty.me/id','Pembuat konten interaktif: kuis, memori, puzzle, roda putar, dan kartu balik dengan templat siap pakai.','Semua mapel','Buat Kuis & Game','/web/interacty.jpg',16),
 ('ZEP Quiz','https://quiz.zep.us/en','Kuis langsung satu kelas dengan tampilan game 2D: murid bergerak ke jawaban yang dipilih. Seru ditampilkan di layar besar.','Semua mapel','Buat Kuis & Game','/web/zep.jpg',17),
 ('Google Earth','https://earth.google.com/web/','Jelajahi bumi dalam 3D: gunung, kota, dan tempat bersejarah. Cocok untuk IPS dan geografi di layar IFP.','IPS & Geografi','Simulasi & 3D','/web/earth.jpg',20),
 ('BioDigital Human','https://www.biodigital.com/','Model 3D tubuh manusia yang bisa diputar dan dibuka per sistem organ. Perlu daftar akun gratis.','IPA (Biologi)','Simulasi & 3D','/web/biodigital.jpg',21),
 ('Sketchfab','https://sketchfab.com/','Ribuan model 3D (hewan, fosil, candi, alat) yang bisa diputar di browser. Cari dengan kata kunci bahasa Inggris.','IPA & IPS','Simulasi & 3D','/web/sketchfab.jpg',22),
 ('Topmarks','https://www.topmarks.co.uk/','Kumpulan game matematika untuk SD: berhitung, perkalian, nilai tempat, dan jam. Tampilan sederhana, cocok untuk IFP. Berbahasa Inggris.','Matematika','Matematika','/web/topmarks.jpg',30),
 ('MathGames','https://www.mathgames.com/','Ratusan latihan matematika berbentuk game, dikelompokkan per kelas dan topik. Berbahasa Inggris.','Matematika','Matematika','/web/mathgames.jpg',31),
 ('Education.com','https://www.education.com/','Game, lembar kerja, dan latihan untuk TK sampai kelas 5 (matematika, membaca, sains). Sebagian konten berbayar. Berbahasa Inggris.','Matematika & Literasi','Matematika','/web/educationcom.jpg',32),
 ('Padlet','https://padlet.com/','Papan dinding digital: murid menempel tulisan, gambar, atau video bersama-sama. Cocok untuk curah pendapat dan galeri karya. Versi gratis: 3 papan.','Semua mapel','Kolaborasi & Desain','/web/padlet.jpg',40),
 ('Nearpod','https://nearpod.com/','Presentasi interaktif: guru mengendalikan slide, murid menjawab polling, menggambar, dan kuis dari perangkatnya.','Semua mapel','Kolaborasi & Desain','/web/nearpod.jpg',41),
 ('Plickers','https://get.plickers.com/','Kuis tanpa HP murid: murid mengangkat kartu kode, guru memindai seluruh kelas dengan kamera HP. Cocok untuk kelas tanpa perangkat.','Semua mapel','Kolaborasi & Desain','/web/plickers.jpg',42),
 ('Canva','https://www.canva.com/id_id/','Desain presentasi, poster, LKPD, dan video dengan ribuan templat. Gratis untuk guru lewat Canva untuk Pendidikan.','Semua mapel','Kolaborasi & Desain','/web/canva.jpg',43)
) v(name, url, description, mapel, kategori, cover, sort)
where not exists (select 1 from web_links w where w.url = v.url);
