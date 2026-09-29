-- ============================================================
-- Kid Arcade — Optimasi performa database (Supabase / Postgres)
-- Cara pakai: buka Supabase Dashboard → SQL Editor → tempel semua
-- isi file ini → Run. Aman dijalankan berkali-kali (pakai IF NOT EXISTS).
-- ============================================================

-- 1) Pencarian username pakai ILIKE di banyak tempat (login, simpan skor,
--    ganti avatar/stiker, ambil progres). Tanpa index yang cocok, tiap
--    pemanggilan itu men-scan SELURUH tabel players baris demi baris.
--    Index trigram membuat ILIKE cepat tanpa perlu mengubah kode aplikasi.
create extension if not exists pg_trgm;

create index if not exists idx_players_username_trgm
  on players using gin (username gin_trgm_ops);

-- 2) Leaderboard & pengecekan lencana sering ORDER BY total_stars DESC.
create index if not exists idx_players_total_stars
  on players (total_stars desc);

-- 3) Riwayat skor per pemain: WHERE player_name = ... ORDER BY completed_at DESC
create index if not exists idx_game_scores_player_name_time
  on game_scores (player_name, completed_at desc);

-- 4) Leaderboard per jenis game + rentang tanggal (minggu ini / bulan ini)
create index if not exists idx_game_scores_type_time
  on game_scores (game_type, completed_at desc);

-- ============================================================
-- 5) (Opsional, disarankan) Cegah "Budi" dan "budi" dianggap 2 akun
--    berbeda, sekaligus jauh mempercepat pencarian username exact-match.
--    JALANKAN DULU query pengecekan di bawah sebelum bikin unique index:
--    kalau ada baris yang muncul, berarti ada akun duplikat (beda huruf
--    besar/kecil saja) yang perlu digabung/dihapus manual dulu.
-- ------------------------------------------------------------
-- select lower(username) as username_lower, count(*)
-- from players
-- group by lower(username)
-- having count(*) > 1;
--
-- Kalau hasilnya kosong, baru jalankan ini:
-- create unique index if not exists idx_players_username_ci
--   on players (lower(username));
-- ============================================================

-- 6) Leaderboard yang efisien: agregasi (SUM/COUNT/GROUP BY) dikerjakan
--    di database, bukan di browser. Ini pasangan dari perbaikan di
--    app/components/Leaderboard.tsx, yang sebelumnya menarik SEMUA baris
--    dari game_scores tanpa batas setiap 10 detik — makin banyak game
--    dimainkan, makin berat. Fungsi ini hanya mengirim `p_limit` baris
--    hasil akhir lewat jaringan, memakai index nomor (3) dan (4) di atas.
create or replace function get_leaderboard(
  p_game_type text default null,
  p_since timestamptz default null,
  p_limit int default 20
)
returns table (player_name text, stars bigint, games bigint)
language sql
stable
as $$
  select
    gs.player_name,
    coalesce(sum(gs.stars), 0) as stars,
    count(*) as games
  from game_scores gs
  where (p_game_type is null or p_game_type = 'all' or gs.game_type = p_game_type)
    and (p_since is null or gs.completed_at >= p_since)
  group by gs.player_name
  order by stars desc, games desc
  limit p_limit;
$$;

-- 7) Cek index yang sudah terpasang di kedua tabel (untuk verifikasi)
-- select tablename, indexname, indexdef
-- from pg_indexes
-- where tablename in ('players', 'game_scores')
-- order by tablename, indexname;
