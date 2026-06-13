# Reflection Paper - Meiske Handayani (10231052)

Dalam proyek ini, saya menjalankan peran sebagai Lead QA & Documentation yang bertanggung jawab untuk melakukan pengujian integrasi antar layanan, memastikan konsistensi data, serta menyusun berbagai dokumentasi teknis seperti API contract, deployment guide, dan dokumen pengujian. Tugas utama saya adalah memastikan seluruh komponen sistem dapat bekerja secara terintegrasi sesuai dengan rancangan yang telah ditetapkan, serta menjamin komunikasi antar service melalui API berjalan dengan baik.

## Keputusan Teknis yang Diambil

Selama pengerjaan proyek, terdapat beberapa keputusan teknis yang saya terapkan untuk mendukung kualitas sistem. Salah satunya adalah menyusun skenario pengujian end-to-end yang tidak hanya berfokus pada pengujian masing-masing endpoint secara terpisah, tetapi juga memverifikasi alur komunikasi antar service. Pendekatan ini dilakukan untuk memastikan bahwa kegagalan pada satu layanan dapat segera terdeteksi sebelum berdampak pada layanan lainnya.

Selain itu, saya melakukan pengujian secara berkala setiap kali terjadi perubahan pada frontend, backend, maupun konfigurasi deployment. Langkah ini membantu memastikan bahwa seluruh komponen sistem tetap terhubung dengan baik dan berfungsi sebagaimana mestinya setelah adanya pembaruan.

Untuk mendukung proses pemantauan sistem, saya juga memanfaatkan logging, health check, dan berbagai tools observability. Dengan adanya mekanisme tersebut, proses identifikasi dan penelusuran masalah menjadi lebih cepat, baik saat aplikasi dijalankan di lingkungan lokal maupun pada container.

## Tantangan yang Dihadapi

Dalam pelaksanaannya, terdapat beberapa kendala yang saya temui. Salah satunya adalah token JWT yang terkadang kedaluwarsa saat proses pengujian berlangsung, sehingga akses ke endpoint yang memerlukan autentikasi menjadi terhambat dan memerlukan pembaruan token.

Saya juga menghadapi tantangan pada pipeline CI/CD yang cukup sensitif terhadap perubahan file konfigurasi `.yml`. Ketika beberapa anggota tim melakukan modifikasi pada konfigurasi yang sama, konflik sering kali muncul dan memerlukan penyesuaian sebelum proses deployment dapat dilanjutkan.

Selain itu, merge conflict pada pull request yang belum terselesaikan beberapa kali menghambat proses integrasi dan pengujian sistem secara menyeluruh. Keterbatasan resource Docker juga menjadi kendala tersendiri, terutama ketika build gagal akibat ruang penyimpanan yang penuh atau volume lama yang belum dibersihkan.

Pada pengujian antar service, kegagalan sesekali terjadi karena service tujuan belum sepenuhnya siap atau sedang mengalami gangguan. Meskipun demikian, penerapan mekanisme retry dan graceful degradation cukup membantu dalam mengurangi dampak permasalahan tersebut. Tantangan lainnya adalah menjaga dokumentasi tetap selaras dengan perkembangan sistem, karena perubahan endpoint yang tidak segera terdokumentasi dapat menyebabkan skrip pengujian menjadi kurang relevan.

## Pembelajaran yang Diperoleh

Dari pengalaman ini, saya memperoleh beberapa pelajaran penting. Pertama, koordinasi dan komunikasi dalam tim memiliki peran yang sangat besar terhadap kelancaran proses pengujian. QA perlu mengetahui perkembangan setiap pull request agar proses verifikasi dapat dilakukan pada waktu yang tepat.

Kedua, pengujian yang dilakukan secara berkelanjutan terbukti lebih efektif dibandingkan menunggu seluruh fitur selesai dikembangkan. Dengan melibatkan QA sejak awal proses pengembangan, potensi masalah integrasi dapat ditemukan lebih cepat.

Ketiga, dokumentasi yang selalu diperbarui sangat membantu seluruh anggota tim dalam memahami perubahan sistem, terutama ketika terdapat penambahan service baru atau perubahan konfigurasi deployment.

Terakhir, saya menyadari bahwa monitoring dan debugging merupakan bagian penting dalam menjaga kualitas aplikasi. Pemanfaatan log, health check, dan tools observability memungkinkan proses identifikasi masalah dilakukan dengan lebih cepat dan akurat, sehingga mendukung stabilitas sistem secara keseluruhan.
