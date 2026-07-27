# AGENTS.md — apps/docs

Dokumentasi publik `docs.nexotao.com`. Nextra di atas Next.js, deploy ke Vercel.
Baca `AGENTS.md` di root workspace lebih dulu.

## Gate

```sh
npm run check
```

= `typecheck && build`.

## Berkas `.mdx` di sini adalah SITUS LIVE, bukan catatan internal

Ini pembeda paling penting dari repo lain. Pada 28 Juli 2026 semua `.md` yang
di-track dihapus dari kelima repo karena isinya sudah drift. **`.mdx` di
`pages/` sengaja tidak ikut** — itu halaman yang dilihat publik.

Konsekuensinya: jangan pernah menghapus atau merapikan `pages/**/*.mdx` secara
massal dengan alasan "membersihkan dokumentasi". Setiap berkas di sana adalah
URL yang bisa saja sudah di-index mesin pencari dan ditautkan dari tempat lain.

## Bilingual, berpasangan per berkas

Konten ada di `pages/id` dan `pages/en`. Menambah halaman berarti menambah di
**kedua** bahasa; satu sisi saja akan menghasilkan tautan mati saat pengguna
berpindah bahasa.

Repo ini masih memakai Nextra dengan struktur `pages/` (Pages Router) dan Next
generasi lebih lama dibanding repo Node lainnya. Itu disengaja mengikuti Nextra
— jangan "menyeragamkan" ke App Router tanpa diminta.

## Akurasi

Dokumentasi yang salah lebih berbahaya daripada dokumentasi yang tidak ada,
karena pengguna menyalin-tempel dari sini. Sebelum menulis contoh kode,
verifikasi endpoint dan bentuk payload-nya ke `apps/api`. Jangan menyalin dari
dokumen lama.

Jangan menuliskan angka harga permanen di halaman. Tunjuk ke katalog di situs
publik — harga berubah, halaman docs tidak ikut berubah sendiri.
