# Reflection Paper - Anjas Geofany Diamare (10231016)

## Peran dan Kontribusi

Sebagai anggota tim yang mengerjakan bagian backend, saya banyak berfokus pada bagaimana aplikasi SowelTask dapat berjalan secara stabil, aman, dan efisien di balik layar. Pekerjaan backend yang saya lakukan tidak hanya sebatas menyediakan data untuk frontend, tetapi juga merancang arsitektur berbasis *microservices* yang tangguh, mulai dari struktur `gateway`, `auth-service`, hingga `task-service`. Saya bertanggung jawab mengatur sistem autentikasi dan otorisasi menggunakan JWT, merancang skema database dengan PostgreSQL dan SQLAlchemy, serta membangun endpoint REST API menggunakan FastAPI untuk manajemen pengguna, *folder*, *task*, dan *reminder*. Selain itu, saya juga mengembangkan fitur pendukung esensial seperti metrik kesehatan (*health monitoring*) untuk memantau latensi, *uptime*, *success rate*, dan konektivitas database.

## Kendala yang Dihadapi

Kendala terbesar saya selama mengerjakan backend adalah mengelola komunikasi antar-*microservices* dan memastikan konsistensi relasi data. Pada awalnya, saya sering kesulitan ketika *request* dari frontend membutuhkan data yang melintasi beberapa servis berbeda. Misalnya, memvalidasi otorisasi pengguna pada *task* atau *folder* yang dikelola oleh `task-service` sementara validasi token aslinya merupakan domain dari `auth-service`.

Saya juga sempat mengalami masalah komunikasi dan ketidaksesuaian format data dengan tim frontend. Contohnya perbedaan penamaan *field* dari skema database Python ke JSON (*snake_case* vs *camelCase* seperti `folder_id` versus `folderId`, atau `created_at` versus `createdAt`). Jika kontrak API (*API contract*) tidak dipatuhi secara ketat, perubahan kecil di backend membuat aplikasi frontend rusak.

Kadang kala saya berpikir bahwa menggunakan arsitektur *monolitik* (*monolith*) akan jauh lebih mudah dan cepat, setidaknya untuk skala awal proyek ini. Dalam sebuah monolit, seluruh logika autentikasi dan manajemen *task* disatukan dalam satu *codebase* dan satu database yang sama. Hal itu membuat validasi relasi pengguna atau pemanggilan antar-fungsi menjadi sangat instan tanpa perlu memusingkan *network request* yang bisa saja gagal, latensi, atau sinkronisasi *state* antar servis.

Meskipun arsitektur *microservices* yang kami pilih terbukti jauh lebih rumit dan menambah beban operasional (*overhead*) di awal, struktur ini memberikan pelajaran berharga yang nyata tentang bagaimana cara menskalakan sistem secara independen dan mengisolasi kegagalan (*fault isolation*) agar tidak menumbangkan seluruh sistem.

Kesalahan lain yang sering saya lakukan pada tahap awal adalah terlalu fokus pada skenario ideal, di mana saya berasumsi server akan selalu hidup dan koneksi tidak pernah putus. Akibatnya, saya kurang memperhatikan penanganan *error* (*error handling*). Ketika database sedang lambat atau ada *service* yang *down*, aplikasi sering kali memberikan respons *Internal Server Error* (500) yang mentah dan menyebabkan *crash* pada *interface* pengguna. Saya baru menyadari bahwa frontend membutuhkan pesan *error* yang spesifik dan terstruktur agar dapat memberikan *feedback* yang baik bagi pengguna.
