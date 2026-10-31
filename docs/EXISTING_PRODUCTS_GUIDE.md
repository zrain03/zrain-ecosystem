# Zrain Admin — Panduan Isi Produk & Migrasi Enam Produk

Semua pembinaan ada di **folder/repository zrain-ecosystem yang sama**.

## Gunakan Import Existing 6 Products, bukan isi manual

1. Buka `http://localhost:5000/admin` semasa Java backend dan local web server berjalan.
2. Login menggunakan akaun admin lokal yang awak cipta.
3. Di bahagian **Your products**, klik **Import the 6 existing products**.
4. Keenam-enam produk di bawah akan dimasukkan automatik sebagai **Draft**. Klik **Edit** untuk semak setiap satu.
5. Klik **Publish** hanya selepas maklumat sesuatu produk sudah disemak.
6. Jika masih ada rekod ujian **Zrain Console** yang awak buat sendiri, ia bukan satu daripada enam produk rasmi. Pilih **Archive** untuk menyembunyikannya daripada katalog dinamik.
7. Import boleh diulang dengan selamat: slug sedia ada akan dilangkau, tidak ditimpa.

**Penting:** Langkah ini hanya mengubah H2 database lokal. Data akan hilang jika backend dihentikan. Ia **tidak** mengubah website `zrain.web.app` atau enam kad lama sekarang. Untuk pelancaran sebenar, ulang pada database PostgreSQL kekal, semak enam produk diterbitkan dan hanya kemudian tukar public catalog kepada data dinamik. Jangan padam kad lama sebelum ujian dan deploy berjaya.

## Enam produk: semua nilai yang akan diimport

### 1. Guess The Flag

| Perkara | Nilai |
| --- | --- |
| Product Name | Guess The Flag |
| Internal ID (auto) | `guess-the-flag` |
| Description | Geography and flag challenges with 190 country flags. |
| Category | Games |
| Logo | Guess The Flag logo |
| Logo image path | `/icons/guess-the-flag.webp` |
| Main button type | Play / open inside Zrain Console |
| Main button label | Play Now |
| Main destination | https://guesstheflag-zrain.web.app/ |
| Second button | Get on Google Play |
| Second destination | https://play.google.com/store/apps/details?id=com.zrain.guesstheflag |

### 2. Memory Rush

| Perkara | Nilai |
| --- | --- |
| Product Name | Memory Rush |
| Internal ID (auto) | `memory-rush` |
| Description | Challenge your memory with Grid, Number and Pattern Recall. |
| Category | Games |
| Logo | Memory Rush logo |
| Logo image path | `/icons/memory-rush.webp` |
| Main button type | Play / open inside Zrain Console |
| Main button label | Play Now |
| Main destination | https://memoryrush-zrain.web.app/ |
| Second button | Get on Google Play |
| Second destination | https://play.google.com/store/apps/details?id=com.zrain.memoryrush |

### 3. Zrain Auth Starter

| Perkara | Nilai |
| --- | --- |
| Product Name | Zrain Auth Starter |
| Internal ID (auto) | `zrain-auth-starter` |
| Description | Reusable Java Spring Boot authentication template with JWT and role-based access. |
| Category | Developer Tools |
| Logo | Official Zrain logo |
| Logo image path | `/zrain-logo.webp` |
| Main button type | Open the GitHub repository / template |
| Main button label | View on GitHub |
| Main destination | https://github.com/zrain03/zrain-auth-starter |
| Second button | Try Demo |
| Second destination | https://zrain03.github.io/zrain-auth-starter/ |

### 4. Zrain Monitor

| Perkara | Nilai |
| --- | --- |
| Product Name | Zrain Monitor |
| Internal ID (auto) | `zrain-monitor` |
| Description | Monitor public HTTPS services, review incidents and check uptime. |
| Category | Developer Tools |
| Logo | Official Zrain logo |
| Logo image path | `/zrain-logo.webp` |
| Main button type | Open a web app or website |
| Main button label | Open Web App |
| Main destination | https://zrain-monitor.web.app/ |
| Second button | None |
| Second destination | Leave blank |

### 5. Zrain UI

| Perkara | Nilai |
| --- | --- |
| Product Name | Zrain UI |
| Internal ID (auto) | `zrain-ui` |
| Description | Shared design system and UI components for Zrain products. |
| Category | Developer Tools |
| Logo | Official Zrain logo |
| Logo image path | `/zrain-logo.webp` |
| Main button type | Open the GitHub repository / template |
| Main button label | View on GitHub |
| Main destination | https://github.com/zrain03/zrain-ui |
| Second button | View Showcase |
| Second destination | https://zrain.web.app/zrain-ui-showcase.html |

### 6. Zrain Links

| Perkara | Nilai |
| --- | --- |
| Product Name | Zrain Links |
| Internal ID (auto) | `zrain-links` |
| Description | Create custom short links, QR previews and visits links. |
| Category | Online Services |
| Logo | Official Zrain logo |
| Logo image path | `/zrain-logo.webp` |
| Main button type | Open a web app or website |
| Main button label | Open Web App |
| Main destination | https://zrain-links.web.app/ |
| Second button | None |
| Second destination | Leave blank |

## Kenapa Display Order ada, tetapi tidak perlu diisi?

Display Order bermaksud **kedudukan produk di dalam kategori yang sama**.

Contoh kategori Games:

1. Guess The Flag di atas.
2. Memory Rush di bawahnya.
3. Kalau awak tambah game ketiga, ia akan muncul selepas Memory Rush.

Sistem masih menyimpan nombor susunan secara dalaman untuk menentukan kedudukan itu, tetapi **awak tidak perlu melihat atau mengisinya**.

- Data import mengekalkan turutan sedia ada.
- Produk baharu automatik ditempatkan selepas produk lain dalam kategori tersebut.
- Edit nama/penerangan tidak mengubah kedudukan.
- Jika kategori ditukar, produk ditempatkan pada akhir kategori baharu.
- Pada masa depan boleh tambah butang Move Up/Move Down tanpa nombor.

Jadi, Display Order dibuang daripada borang. Ia bukan URL, bukan nombor versi dan bukan bilangan produk.

## Cara isi produk baharu pada borang yang telah dikemas kini

1. **Product name** — nama aplikasi yang akan ditunjukkan kepada orang awam.
2. **What does it do?** — satu ayat penerangan.
3. **Choose a category** — pilih kategori tempat ia patut muncul.
4. **Choose a logo** — pilih logo Zrain/Guess The Flag/Memory Rush atau masukkan direct image URL yang sudah dihoskan. **Upload terus dari komputer belum tersedia**.
5. **What should the main button do?** — memilih Console, website, GitHub, Play Store, documentation atau showcase.
6. **Where does the button go?** — URL HTTPS yang betul bagi pilihan (5).

**Optional**: Buka "Optional: second button and advanced settings" hanya jika mahu butang kedua atau label butang istimewa. Internal product ID (slug) dijana automatik daripada nama. **Save as Draft** bermaksud disimpan tetapi belum terpapar di public catalog; tekan **Publish** pada senarai produk apabila sudah bersedia.

## Release gate

Website public sedia ada masih menggunakan enam kad asal dalam HTML dan Console. Dynamic catalog masih **disabled** dalam `public/api-config.js`. Jangan hapus/matikan fallback itu sehingga:
- Hosted Spring Boot API + PostgreSQL berfungsi dan admin sudah disahkan.
- Keenam-enam produk berjaya diimport dan disemak pada persistent database.
- Public catalog Worker + storage tersedia, menggunakan snapshot yang sah.
- Semua tindakan butang dan Console berfungsi pada desktop dan mobile.
- Tests dan deployment/rollback disahkan.

Ini mengelakkan produk tiba-tiba hilang bagi pengunjung ketika migrasi.
