-- ============================================================
-- Kid Arcade — Row Level Security untuk tabel `players` & `game_scores`
-- Jalankan di Supabase Dashboard → SQL Editor → Run.
-- Aman dijalankan berkali-kali (pakai IF EXISTS / OR REPLACE).
-- ============================================================
--
-- KONTEKS PENTING (dibaca dulu sebelum jalankan):
-- App ini TIDAK pakai Supabase Auth — login cuma cocokkan nama (tanpa
-- password), jadi tidak ada `auth.uid()` yang bisa dipakai RLS untuk
-- bilang "baris ini milik siapa". Karena itu, pendekatan yang dipakai
-- di sini BUKAN "kunci per-user", tapi "kunci NILAI yang boleh masuk":
--   1. Semua ORANG (anon) tetap boleh INSERT/UPDATE lewat aplikasi
--      seperti biasa — tidak perlu ubah kode aplikasi sama sekali.
--   2. Tapi nilai yang boleh ditulis DIBATASI ketat (bintang 0-3,
--      akurasi 0-100, dst) lewat RLS.
--   3. Yang RLS sendiri tidak sanggup cegah (kolom total_stars di
--      tabel players cuma boleh NAIK maks. 3 per panggilan, sesuai
--      "1 game = maks 3 bintang") ditutup pakai TRIGGER, karena RLS
--      tidak bisa membandingkan nilai lama vs baru dalam satu syarat.
-- Hasilnya: orang iseng yang coba panggil API Supabase langsung dari
-- luar aplikasi (bukan lewat game) TIDAK BISA lagi menyuntik skor palsu
-- besar-besaran atau merusak data, tapi cara main yang sah tetap jalan
-- normal tanpa perlu sentuh kode di app/ atau hooks/.
--
-- Yang SENGAJA belum ditutup (baca "Catatan jujur" di akhir file):
-- karena tidak ada password, satu anak masih bisa mengetik nama anak
-- lain untuk "menjadi" dia. Itu bukan celah database — itu keputusan
-- desain login aplikasinya, di luar cakupan RLS. Ini bukan bug yang
-- saya buat/temukan sekarang, tapi tetap saya sampaikan karena kamu
-- perlu tahu batasnya.
-- ============================================================

-- ---------- 0) Pastikan semua kolom yang dipakai kode aplikasi benar-benar ada ----------
-- Kalau kamu sempat dapat error "column ... does not exist" saat jalankan file
-- ini sebelumnya: itu artinya skema tabel di database belum lengkap dibanding
-- yang diasumsikan kode di lib/supabase.ts & hooks/useGameComplete.ts. Bagian
-- ini menambah kolom yang HILANG saja (aman — tidak mengubah/menghapus kolom
-- atau data yang sudah ada, dan tidak error kalau kolomnya sudah ada).
alter table players add column if not exists avatar text default '👦';
alter table players add column if not exists total_stars integer default 0;
alter table players add column if not exists total_games_played integer default 0;
alter table players add column if not exists badges text[] default '{}'::text[];
alter table players add column if not exists stickers text[] default '{}'::text[];
alter table players add column if not exists owned_items text[] default '{}'::text[];
alter table players add column if not exists streak integer default 0;
alter table players add column if not exists last_played_at timestamptz default now();
alter table players add column if not exists created_at timestamptz default now();

alter table game_scores add column if not exists stars integer default 0;
alter table game_scores add column if not exists score integer default 0;
alter table game_scores add column if not exists correct_answers integer default 0;
alter table game_scores add column if not exists total_questions integer default 0;
alter table game_scores add column if not exists accuracy integer default 0;
alter table game_scores add column if not exists time_spent integer default 0;
alter table game_scores add column if not exists max_combo integer default 0;
alter table game_scores add column if not exists level_reached integer default 1;
alter table game_scores add column if not exists extras jsonb default '{}'::jsonb;
alter table game_scores add column if not exists completed_at timestamptz default now();

-- Isi nilai default untuk baris LAMA yang kolomnya baru saja dibuat (kolom baru
-- otomatis NULL untuk baris lama meski ada `default` — default cuma berlaku
-- untuk baris BARU). Tanpa ini, pemain lama bisa gagal lolos syarat RLS di
-- bawah karena nilainya NULL alih-alih array/angka kosong.
update players set badges = '{}'::text[] where badges is null;
update players set stickers = '{}'::text[] where stickers is null;
update players set owned_items = '{}'::text[] where owned_items is null;
update players set total_stars = 0 where total_stars is null;
update players set total_games_played = 0 where total_games_played is null;
update players set streak = 0 where streak is null;

-- ---------- 1) Aktifkan RLS ----------
alter table players enable row level security;
alter table game_scores enable row level security;

-- ---------- 2) SELECT: semua orang boleh baca (leaderboard, progres) ----------
drop policy if exists "players_select_public" on players;
create policy "players_select_public" on players
  for select using (true);

drop policy if exists "game_scores_select_public" on game_scores;
create policy "game_scores_select_public" on game_scores
  for select using (true);

-- ---------- 3) INSERT pemain baru: cuma boleh dengan nilai awal wajar ----------
-- Cocok dengan 2 tempat yang bikin pemain baru:
--  - lib/supabase.ts (loginPlayer): total_stars 0, total_games_played 0, badges []
--  - hooks/useGameComplete.ts (saat game pertama): total_stars = stars (0-3),
--    total_games_played 1, badges paling banyak 1 (lencana dari game itu)
drop policy if exists "players_insert_sane_defaults" on players;
create policy "players_insert_sane_defaults" on players
  for insert
  with check (
    length(coalesce(username, '')) between 1 and 40
    and coalesce(total_stars, 0) between 0 and 3
    and coalesce(total_games_played, 0) between 0 and 1
    and coalesce(array_length(badges, 1), 0) <= 1
    and coalesce(array_length(stickers, 1), 0) <= 1
    and length(coalesce(avatar, '')) <= 8
  );

-- ---------- 4) UPDATE players: batasi rentang nilai absolut ----------
-- Ini menutup "asal masuk akal", bukan "kenaikannya wajar" — itu tugas
-- trigger di bagian 6, karena RLS saja tidak bisa lihat nilai SEBELUM
-- update dalam satu syarat yang sama dengan nilai SESUDAHNYA.
drop policy if exists "players_update_bounded" on players;
create policy "players_update_bounded" on players
  for update
  using (true)
  with check (
    coalesce(total_stars, 0) between 0 and 200000
    and coalesce(total_games_played, 0) between 0 and 200000
    and coalesce(streak, 0) between 0 and 100000
    and length(coalesce(avatar, '')) <= 8
    and coalesce(array_length(stickers, 1), 0) <= 60
    and coalesce(array_length(badges, 1), 0) <= 300
  );

-- Sengaja TIDAK ada policy DELETE untuk players → dari luar aplikasi,
-- tidak ada yang bisa menghapus data pemain sama sekali.

-- ---------- 5) INSERT game_scores: setiap baris skor harus masuk akal ----------
-- Kolom ini sesuai persis dengan yang dikirim hooks/useGameComplete.ts.
drop policy if exists "game_scores_insert_sane" on game_scores;
create policy "game_scores_insert_sane" on game_scores
  for insert
  with check (
    length(coalesce(player_name, '')) between 1 and 40
    and length(coalesce(game_type, '')) between 1 and 60
    and coalesce(stars, 0) between 0 and 3
    and coalesce(score, 0) between 0 and 1000000
    and coalesce(accuracy, 0) between 0 and 100
    and coalesce(total_questions, 0) between 0 and 500
    -- correct_answers TIDAK dibatasi relatif terhadap total_questions:
    -- di hooks/useGameComplete.ts, kolom ini kadang diisi dari extra.score
    -- (bisa ratusan/ribuan untuk game seperti MathScrabble) kalau game
    -- tidak mengirim extra.correctAnswers secara eksplisit. Diberi batas
    -- sendiri yang longgar (sama seperti kolom score) supaya tidak salah
    -- menolak skor sah dari game-game itu.
    and coalesce(correct_answers, 0) between 0 and 1000000
    and coalesce(max_combo, 0) between 0 and 5000
    and coalesce(time_spent, 0) between 0 and 100000
    and coalesce(level_reached, 1) between 0 and 1000
    and pg_column_size(coalesce(extras, '{}'::jsonb)) < 20000
  );

-- Sengaja TIDAK ada policy UPDATE/DELETE untuk game_scores → begitu
-- tersimpan, riwayat skor tidak bisa diubah/dihapus dari luar aplikasi.
-- Ini juga menutup celah "hapus jejak" kalau ada yang mencoba curang.

-- ---------- 6) Trigger: total_stars & total_games_played cuma boleh naik wajar ----------
-- Satu kali menang game = maksimal 3 bintang, 1 game. Trigger ini menolak
-- lonjakan tidak wajar (mis. seseorang coba set total_stars +50000 sekali
-- panggil), sambil tetap izinkan update yang tidak menyentuh kolom ini
-- sama sekali (misalnya ganti avatar/stiker).
create or replace function enforce_players_stat_limits()
returns trigger
language plpgsql
as $$
begin
  if (new.total_stars - old.total_stars) not between 0 and 3 then
    raise exception 'Kenaikan total_stars tidak wajar dalam satu update (% -> %)', old.total_stars, new.total_stars;
  end if;

  if (new.total_games_played - old.total_games_played) not between 0 and 1 then
    raise exception 'Kenaikan total_games_played tidak wajar dalam satu update (% -> %)', old.total_games_played, new.total_games_played;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_players_stat_limits on players;
create trigger trg_enforce_players_stat_limits
  before update on players
  for each row
  execute function enforce_players_stat_limits();

-- ============================================================
-- Cara verifikasi setelah dijalankan:
--   select tablename, policyname, cmd from pg_policies
--   where tablename in ('players','game_scores') order by tablename, cmd;
--
--   select tgname, tgrelid::regclass from pg_trigger
--   where tgname = 'trg_enforce_players_stat_limits';
-- ============================================================
--
-- Catatan jujur (baca ini):
-- 1. Tanpa password, nama pemain bisa dipakai siapa saja yang tahu nama
--    itu — ini batas desain aplikasinya, bukan hal yang bisa ditutup RLS.
--    Kalau suatu saat mau ditutup, opsi paling ringan: tambah PIN 4 digit
--    per anak (kolom baru + dicek di loginPlayer), tanpa perlu sistem
--    login penuh ala Supabase Auth.
-- 2. Saya PILIH pendekatan "batasi nilai + trigger" dibanding "kunci semua
--    tulis-menulis lewat fungsi RPC", karena hooks/useGameComplete.ts
--    punya 60+ aturan lencana yang beda-beda per game (baca extras jsonb
--    dengan bentuk berbeda tiap game) — memindah semua itu ke SQL
--    berisiko salah ketik logic dan malah bikin lencana tidak pernah
--    keluar. Kompromi ini menutup risiko yang paling nyata (skor/bintang
--    dipalsukan besar-besaran) tanpa menyentuh kode aplikasi sama sekali.
-- 3. Saya tidak punya database Supabase sungguhan untuk menjalankan file
--    ini di sini (tidak ada akses internet). Sudah saya tulis hati-hati
--    dan sintaksnya saya cek manual sesuai dokumentasi PostgreSQL/Supabase,
--    tapi tetap jalankan dulu di project Supabase kamu, lalu coba semua
--    alur (login, main game, ganti avatar, lihat leaderboard) sebelum
--    dipakai murid-murid.
-- ============================================================
