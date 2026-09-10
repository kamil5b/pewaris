ada beberapa revisi yang menurut gue **wajib** sebelum dokumen itu dijadikan dasar development.

### Yang paling penting

| Bagian sekarang                                     | Revisi                                                                                              | Kenapa                                                                                                                                                                |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **“Hubungan keluarga → ahli waris”**                | Pisahkan *kandidat* dan *ahli waris final*                                                          | KHI Pasal 174 mengelompokkan ahli waris, tetapi kalau semua kelompok ada, yang berhak hanya anak, ayah, ibu, janda/duda. ([JDIH Mahkamah Agung RI][1])                |
| **Syarat ahli waris cuma “punya hubungan + hidup”** | Tambahkan **agama/identitas sebagai Muslim, sebab penghalang, dan mahjub** sesuai rule yang dipakai | Pasal 172 menyangkut agama pewaris/ahli waris; Pasal 173 mengatur penghalang tertentu. ([JDIH Mahkamah Agung RI][1])                                                  |
| **Daftar ahli waris**                               | Jangan cuma “anak, ayah, ibu, saudara, kakek, nenek, cucu”                                          | Secara klasifikasi KHI jauh lebih luas. Materi Badilag bahkan merinci kelompok laki-laki/perempuan secara lebih lengkap. ([Badilag][2])                               |
| **Skenario 3: Andi otomatis dapat Rp750 juta**      | **Hapus/revisi total**                                                                              | Ahli waris pengganti Pasal 185 punya rule tersendiri dan batas bagian; praktiknya juga dipengaruhi interpretasi/yurisprudensi. ([Badilag][3])                         |
| **“Cucu = anak dari anak”**                         | Bedakan **relasi genealogis** dengan **kedudukan sebagai ahli waris pengganti**                     | Cucu secara graph memang anak dari anak, tapi status warisnya tidak otomatis sama dengan “mengambil seluruh bagian orang tuanya”. ([Badilag][4])                      |
| **Suami + anak → cukup hitung 1/4 lalu anak 2:1**   | Tambahkan rule ahli waris lain yang mungkin hadir                                                   | Bagian anak tidak boleh dihitung terisolasi dari seluruh komposisi ahli waris.                                                                                        |
| **Awl = “semua bagian dikurangi proporsional”**     | Boleh sebagai konsep, tapi jadikan **calculation rule**, bukan business rule umum                   | Implementasinya harus berdasarkan asal masalah/furudh, bukan sekadar floating-point proportional scaling.                                                             |
| **Radd = “kalau tidak ada anak”**                   | **Revisi**                                                                                          | Kondisi radd tidak sesederhana “tidak ada anak”; perlu menentukan siapa yang menerima radd dan pengecualiannya.                                                       |
| **Status perkawinan**                               | Gunakan `tanggal_mulai_sah` / `tanggal_berakhir_sah` untuk status hukum                             | Lo sudah punya field itu, jadi rule jangan hanya membaca tanggal faktual.                                                                                             |
| **“tanggal warisan”**                               | Ganti istilah menjadi **tanggal kematian pewaris**                                                  | Secara domain lebih tepat: hak waris terbuka karena kematian pewaris.                                                                                                 |
| **Harta**                                           | Tambahkan konsep **tirkah/estate**, jangan langsung `nilai_sekarang → dibagi`                       | Objek waris adalah harta peninggalan yang benar-benar menjadi tirkah pewaris. MA juga menekankan objek tirkah harus dibuktikan sebagai milik pewaris. ([MariNews][5]) |

### Ada satu temuan yang sangat penting: ahli waris pengganti

Ini ternyata **lebih kompleks dari yang kita tulis sebelumnya**.

Pasal 185 KHI menyatakan ahli waris yang meninggal lebih dahulu dapat digantikan anaknya, kecuali yang terkena Pasal 173, dan bagian pengganti tidak boleh melebihi bagian ahli waris yang sederajat dengan yang diganti. ([Badilag][3])

Mahkamah Agung juga punya yurisprudensi yang menyatakan **cucu laki-laki maupun perempuan dari anak laki-laki maupun perempuan pewaris dapat menjadi ahli waris pengganti**. ([JDIH Mahkamah Agung RI][6])

Bahkan materi MA tahun 2026 menyebut pembatasan sampai **derajat cucu** dalam konteks SEMA No. 3 Tahun 2015. ([MariNews][5])

Jadi contoh lo:

```text
Siti
└── Budi (meninggal sebelum Siti)
    └── Andi
```

**tidak boleh di-engine sebagai:**

```text
jatah Budi = X
Andi = X
```

Harus ada rule khusus:

```text
Budi meninggal lebih dahulu
        ↓
cek Pasal 185
        ↓
cek apakah Andi memenuhi posisi pengganti
        ↓
tentukan kedudukan Andi
        ↓
hitung batas bagian pengganti
```

Dan ini memang area yang masih punya **perdebatan interpretasi** di praktik hukum Indonesia; Badilag sendiri pada 2026 masih membahas ketidakjelasan Pasal 185 mengenai subjek, derajat, hijab, dan metode penghitungan. ([Badilag][4])

### Yang juga perlu ditambahkan ke model data

Ada satu hal yang gue rasa **belum kelihatan di ERD lo: tanggal kematian anggota**.

Karena engine lo membutuhkan fakta:

```text
Budi meninggal 2020
Siti meninggal 2024
Andi hidup 2024
```

dan itu krusial untuk Pasal 185 maupun menentukan siapa yang hidup saat pewaris meninggal. Yurisprudensi MA bahkan menekankan pentingnya kejelasan waktu kematian pewaris dan calon ahli waris pengganti dalam kasus tertentu. ([JDIH Mahkamah Agung RI][7])

Jadi `ANGGOTA` minimal menurut gue perlu:

```text
ANGGOTA
-------
id
nama
jenis_kelamin
tanggal_lahir
tanggal_meninggal NULL
```

**Bukan `tanggal_lahir` di vertical saja.** Kalau tanggal lahir memang fakta milik orang, secara data lebih natural berada di `ANGGOTA`; `HUBUNGAN_VERTICAL` tidak perlu memiliki tanggal lahir. Ini juga menghindari duplikasi kalau orang yang sama muncul di beberapa relasi.

### Kesimpulan

Dokumen lo **fondasinya sudah bagus**, tapi sebelum dijadikan spec engineering gue akan revisi 5 area:

1. **Definisi kandidat → ahli waris → mahjub**
2. **Daftar lengkap kategori ahli waris**
3. **Ahli waris pengganti Pasal 185**
4. **Furudh / ashabah / awl / radd sebagai calculation rules yang lebih formal**
5. **Data kematian + pemisahan tirkah dari sekadar nilai aset**

Dan gue **nggak akan menganggap contoh Skenario 3 valid dulu**. Itu justru contoh yang harus kita desain rule engine-nya dengan hati-hati karena Pasal 185 adalah bagian yang paling gampang bikin aplikasi menghasilkan kesimpulan hukum yang salah. ([Badilag][4])

Kalau tujuan akhirnya **MVP yang bisa benar-benar dihitung**, next step paling bernilai adalah bikin **tabel seluruh calon ahli waris + syarat + bagian + siapa yang memahjub + rule pengganti**. Itu baru bisa kita turunkan langsung menjadi calculation engine.

---

# ERD Revisi

```text
ANGGOTA
---------
id PK
nama
jenis_kelamin
tanggal_lahir
tanggal_meninggal NULL
```

```text
HUBUNGAN_HORIZONTAL
-------------------
id PK
anggota_a_id FK → ANGGOTA
anggota_b_id FK → ANGGOTA
tanggal_mulai NULL
tanggal_mulai_sah NULL
tanggal_berakhir NULL
tanggal_berakhir_sah NULL
jenis_akhir NULL
```

```text
HUBUNGAN_VERTICAL
-----------------
id PK
anak_id FK → ANGGOTA
hubungan_horizontal_id FK → HUBUNGAN_HORIZONTAL
is_nasab_ayah
is_adopted
```

```text
HARTA
-----
id PK
anggota_id FK → ANGGOTA
nama
nilai_beli
nilai_sekarang
```

```text
PEMILIK_HARTA
-------------
id PK
harta_id FK → HARTA
anggota_id FK → ANGGOTA
persentase
```

### Catatan `tanggal_waris`

`tanggal_waris` **bukan bagian dari `ANGGOTA` dan bukan kolom ERD di atas**.

Itu merupakan parameter saat melakukan perhitungan:

```text
pewarisId
tanggalWaris
```

Sedangkan:

```text
ANGGOTA.tanggal_meninggal
```

adalah fakta kapan orang tersebut meninggal.

---

# Business Rules — Anak

## 1. Anak di luar nikah, orang tua tidak pernah menikah

Contoh:

```text
Ahmad ─── Siti
   │       │
   └── Budi
```

Jika Budi terbukti sebagai anak biologis Ahmad dan Siti, tetapi Ahmad dan Siti tidak pernah menikah:

* Budi **mewarisi dari Siti/ibu**.
* Budi **tidak otomatis menjadi ahli waris Ahmad/ayah berdasarkan nasab kewarisan KHI**.
* Hubungan biologis dengan Ahmad tidak boleh langsung diterjemahkan menjadi hak faraidh ayah hanya karena hubungan biologis tersebut terbukti.

KHI Pasal 186 menyatakan anak yang lahir di luar perkawinan mempunyai hubungan saling mewarisi dengan ibu dan keluarga pihak ibu.

---

## 2. Anak di luar nikah, kemudian orang tua menikah

Contoh:

```text
Budi lahir       : 2010
Ahmad-Siti nikah : 2012
```

Di `HUBUNGAN_VERTICAL`:

```text
is_nasab_ayah = true / false
is_adopted    = true / false
```

Rule:

### Jika `is_nasab_ayah = true`

Budi mempunyai hubungan nasab ayah dengan Ahmad untuk keperluan engine.

→ Budi **dapat menjadi ahli waris Ahmad**, kemudian tetap harus dicek apakah mahjub.

### Jika `is_nasab_ayah = false`

Budi **tidak menjadi ahli waris Ahmad melalui hubungan nasab tersebut**.

### Penting

Engine **tidak menentukan `is_nasab_ayah` hanya berdasarkan tanggal**:

```text
tanggal_lahir anak
<
tanggal_mulai_sah
```

Itu hanya menunjukkan bahwa anak lahir sebelum perkawinan sah.

Status nasab adalah fakta/status hubungan yang harus ditentukan berdasarkan dasar hukum atau pembuktian yang relevan. Putusan MK 46/PUU-VIII/2010 mengakui hubungan perdata dengan laki-laki yang dapat dibuktikan sebagai ayah biologisnya melalui ilmu pengetahuan/teknologi atau alat bukti lain menurut hukum.

---

## 3. Orang tua pada kasus no. 2 kemudian bercerai

Perceraian **tidak menghapus nasab anak**.

Jadi kalau:

```text
is_nasab_ayah = true
```

dan Ahmad-Siti kemudian bercerai:

```text
Budi
├── tetap punya hubungan dengan ibu
└── tetap punya hubungan dengan ayah
```

Ketika Ahmad meninggal:

→ Budi tetap dapat menjadi ahli waris Ahmad.

Ketika Siti meninggal:

→ Budi tetap dapat menjadi ahli waris Siti.

Yang berakhir karena perceraian adalah **hubungan perkawinan Ahmad-Siti**, bukan hubungan anak dengan orang tua.

---

## 4. Anak ternyata bukan anak biologis ayah, tetapi ibu kemudian menikah dengan laki-laki tersebut

Contoh:

```text
Budi adalah anak Siti.
Ahmad bukan ayah biologis Budi.
Siti kemudian menikah dengan Ahmad.
```

Maka:

```text
is_nasab_ayah = false
is_adopted    = false
```

→ Budi **tidak menjadi ahli waris Ahmad sebagai anak kandung/nasab** hanya karena Ahmad menikahi Siti.

Kalau kemudian hubungan tersebut merupakan **anak angkat**:

```text
is_adopted = true
```

maka masuk ke rule anak angkat.

---

## 5. Anak angkat

Anak angkat **bukan ahli waris berdasarkan nasab** dari orang tua angkat.

Jadi:

```text
is_adopted = true
```

tidak berarti:

```text
anak angkat → ahli waris otomatis
```

Dari orang tua angkat:

```text
waris sebagai anak kandung = tidak
```

Namun KHI Pasal 209 mengenal **wasiat wajibah** bagi anak angkat/orang tua angkat dalam kondisi yang diatur, dengan batas maksimal **1/3** dari harta warisan.

Hubungan nasab dengan orang tua kandung tetap dihitung dari graph asalnya.

---

## 6. Anak sah, orang tua kemudian bercerai

Contoh:

```text
Ahmad ─── Siti
   │
   └── Budi

kemudian Ahmad-Siti cerai
```

Budi tetap:

```text
ahli waris Ahmad → Ya
ahli waris Siti  → Ya
```

Perceraian orang tua **tidak memutus hubungan nasab maupun hak kewarisan anak terhadap kedua orang tuanya**.

---

# Ringkasan Rule untuk Engine

```text
HUBUNGAN_VERTICAL
        │
        ├── is_adopted = true
        │       ↓
        │   bukan ahli waris nasab orang tua angkat
        │       ↓
        │   cek wasiat wajibah
        │
        └── is_adopted = false
                ↓
          cek hubungan nasab
                │
                ├── is_nasab_ayah = true
                │       ↓
                │   anak dapat mewarisi ayah
                │
                └── is_nasab_ayah = false
                        ↓
                    tidak mewarisi ayah
                    melalui nasab tersebut
```

Sedangkan **ibu tidak membutuhkan `is_nasab_ibu`** dalam model ini karena hubungan vertikal sudah menghubungkan anak dengan pasangan/orang tua dan identitas laki-laki/perempuan bisa ditentukan dari `ANGGOTA.jenis_kelamin`.

Yang paling penting: **`is_nasab_ayah` adalah fakta hubungan yang sudah ditentukan**, sedangkan `ayah`, `ibu`, `anak`, `cucu`, `saudara`, dst. tetap **hasil rekursi graph**.
