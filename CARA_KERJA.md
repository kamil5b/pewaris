# Pewaris - Cara Kerja

## Apa itu Pewaris?

Pewaris adalah aplikasi untuk menghitung waris伊斯兰 (harta peninggalan) berdasarkan hukum Islam di Indonesia. Aplikasi ini membantu menentukan siapa yang berhak menerima warisan, berapa bagian masing-masing, dan siapa yang terhalang (mahjub).

---

## Cara Menggunakan

### 1. Masukkan Data Keluarga

Buat "pohon keluarga" dengan menambahkan:

- **Anggota keluarga** - nama, jenis kelamin, tanggal lahir, tanggal kematian (jika sudah meninggal)
- **Perkawinan** - siapa yang menikah dengan siapa, tanggal menikah sah, status perkawinan
- **Anak** - siapa anak dari pasangan mana

Semua hubungan keluarga (ayah, ibu, saudara, kakek, nenek, cucu) **diturunkan secara otomatis** dari data ini.

### 2. Masukkan Data Harta (Tirkah)

Catat harta peninggalan pewaris:

- **Nama harta** (contoh: Rumah, Mobil, Tanah)
- **Nilai beli** (harga saat diperoleh)
- **Nilai sekarang** (harga valuasi terkini)
- **Kepemilikan** - siapa yang memiliki harta tersebut dan berapa persen

**Catatan:** Yang menjadi objek waris adalah **tirkah** (harta peninggalan yang benar-benar menjadi milik pewaris).

### 3. Jalankan Simulasi

Pilih siapa yang meninggal (**pewaris**) dan **tanggal kematian pewaris**. Sistem akan:

1. Menentukan **kandidat** ahli waris
2. Memeriksa **kelayakan** (syarat sebagai ahli waris)
3. Menentukan **mahjub** (terhalang)
4. Menghitung **bagian** masing-masing
5. Menampilkan hasil perhitungan

---

## Bagaimana Sistem Bekerja

### Data Keluarga (ERD)

Sistem menyimpan data dalam bentuk:

```
ANGGOTA (orang)
    ├── ID
    ├── Nama
    ├── Jenis Kelamin (Laki-laki / Perempuan)
    ├── Tanggal Lahir
    └── Tanggal Meninggal (NULL jika masih hidup)

HUBUNGAN_HORIZONTAL (perkawinan)
    ├── Anggota A ID
    ├── Anggota B ID
    ├── Tanggal Mulai
    ├── Tanggal Mulai Sah
    ├── Tanggal Berakhir (NULL jika masih menikah)
    ├── Tanggal Berakhir Sah
    └── Jenis Akhir (Cerai Hidup / Cerai Mati)

HUBUNGAN_VERTICAL (anak)
    ├── Anak ID
    ├── Hubungan Perkawinan Orang Tua ID
    ├── Hubungan Nasab dengan Ayah (Ya / Tidak)
    └── Anak Angkat (Ya / Tidak)

HARTA (barang)
    ├── Pemilik Awal ID
    ├── Nama Harta
    ├── Nilai Beli
    └── Nilai Sekarang

PEMILIK_HARTA (kepemilikan)
    ├── Harta ID
    ├── Anggota ID
    └── Persentase Kepemilikan
```

### Status Perkawinan

Sistem memeriksa status perkawinan berdasarkan **tanggal sah**:

- **Masih menikah** = `tanggal_berakhir_sah` kosong ATAU `tanggal_berakhir_sah` setelah tanggal kematian pewaris
- **Sudah cerai** = `tanggal_berakhir_sah` sebelum tanggal kematian pewaris

**Penting:** Status hukum ditentukan oleh tanggal sah, bukan tanggal faktual.

---

## Klasifikasi Ahli Waris

Berdasarkan KHI (Kompendium Hukum Islam), ahli waris dikelompokkan menjadi:

### Kelompok 1: Anak dan Keturunannya

| Ahli Waris | Keterangan |
|------------|------------|
| Anak laki-laki | Dari pewaris |
| Anak perempuan | Dari pewaris |
| Cucu laki-laki (anak laki-laki) | Melalui anak laki-laki |
| Cucu perempuan (anak laki-laki) | Melalui anak laki-laki |
| Cucu laki-laki (anak perempuan) | Melalui anak perempuan |
| Cucu perempuan (anak perempuan) | Melalui anak perempuan |

### Kelompok 2: Orang Tua dan Keturunannya

| Ahli Waris | Keterangan |
|------------|------------|
| Ayah | Orang tua laki-laki |
| Ibu | Orang tua perempuan |
| Saudara laki-laki kandung | Anak ayah dan ibu yang sama |
| Saudara perempuan kandung | Anak ayah dan ibu yang sama |
| Saudara laki-laki seayah | Anak ayah dari ibu berbeda |
| Saudara perempuan seayah | Anak ayah dari ibu berbeda |
| Saudara laki-laki seibu | Anak ibu dari ayah berbeda |
| Saudara perempuan seibu | Anak ibu dari ayah berbeda |
| Kakek (ayah dari ayah) | Melalui garis ayah |
| Nenek (ibu dari ayah) | Melalui garis ayah |
| Kakek (ayah dari ibu) | Melalui garis ibu |
| Nenek (ibu dari ibu) | Melalui garis ibu |

### Kelompok 3: Suami/Istri

| Ahli Waris | Keterangan |
|------------|------------|
| Suami | Jika pewaris perempuan |
| Istri | Jika pewaris laki-laki |

---

## Syarat Ahli Waris

Berdasarkan Pasal 172-173 KHI, syarat menjadi ahli waris:

1. **Ada hubungan darah atau perkawinan** dengan pewaris
2. **Masih hidup** pada saat pewaris meninggal
3. **Beragama Islam** (pewaris maupun ahli waris)
4. **Tidak ada sebab penghalang** (mahjub)

### Pengecualian (Pasal 173 KHI)

Ahli waris tidak berhak menerima warisan jika:

1. Pembunuhan yang disengaja
2. Berbeda agama (pewaris kafir, ahli waris Muslim, atau sebaliknya)
3. Perbudakan
4. Nikah mut'ah (nikah sementara)

---

## Mahjub (Terhalang)

**Mahjub** = ahli waris yang secara hubungan sebenarnya berhak, tetapi terhalang karena keberadaan ahli waris lain.

Contoh:
- **Kakek terhalang oleh Ayah** - Jika ayah masih hidup, kakek tidak mendapat bagian
- **Saudara terhalang oleh Anak** - Jika ada anak, saudara tidak mendapat bagian

---

## Ahli Waris Pengganti (Pasal 185 KHI)

Jika ahli waris meninggal **lebih dahulu** dari pewaris, bagian warisannya dapat digantikan oleh anaknya (cucu pewaris), dengan ketentuan:

1. Yang meninggal lebih dahulu **bukan pembunuh** pewaris
2. Cucu **memenuhi syarat** sebagai ahli waris pengganti
3. Bagian pengganti **tidak boleh melebihi** bagian ahli waris yang sederajat

**Contoh:**
```
Pewaris: Siti (meninggal 2024)
├── Anak: Budi (meninggal 2020, SEBELUM Siti)
│   └── Cucu: Andi (anak Budi)
└── Anak: Dewi (masih hidup)
```

Budi meninggal lebih dahulu → Andi menjadi ahli waris pengganti untuk bagian Budi.

**Catatan Penting:** Implementasi Pasal 185 masih memiliki **perdebatan interpretasi** di praktik hukum Indonesia mengenai:
- Subjek yang berhak menjadi pengganti
- Derajat hubungan yang diizinkan
- Pengecualian (hijab)
- Metode penghitungan

---

## Pembagian Warisan

### Tirkah (Harta Warisan)

Yang menjadi objek waris adalah **tirkah** (harta peninggalan yang benar-benar menjadi milik pewaris), bukan sekadar nilai aset.

```
Seluruh Harta
     ↓
Tentukan Kepemilikan Pewaris
     ↓
Ambil Bagian Milik Pewaris
     ↓
Perhitungkan Kewajiban/Pengurang
     ↓
TIRKAH (Harta Waris Bersih)
```

### Furudh (Bagian Tetap)

| Ahli Waris | Kondisi | Bagian |
|------------|---------|--------|
| Suami | Ada anak | 1/4 |
| Suami | Tidak ada anak | 1/2 |
| Istri | Ada anak (dibagi jumlah istri) | 1/4 ÷ n |
| Istri | Tidak ada anak (dibagi jumlah istri) | 1/2 ÷ n |
| Ayah | Ada anak | 1/6 |
| Ayah | Tidak ada anak | 1/3 |
| Ibu | Ada anak | 1/6 |
| Ibu | Tidak ada anak | 1/3 |
| Anak perempuan 1 orang | Tidak ada anak laki-laki | 1/2 |
| Anak perempuan 2+ | Tidak ada anak laki-laki | 2/3 total |
| Cucu perempuan 1 | Tanpa cucu laki-laki | 1/6 |
| Cucu perempuan 2+ | Tanpa cucu laki-laki | 1/3 total |
| Saudara kandung perempuan 1 | Tanpa anak | 1/2 |
| Saudara kandung perempuan 2+ | Tanpa anak | 2/3 total |
| Saudara seayah perempuan 1 | Tanpa anak + tanpa kandung perempuan | 1/2 |
| Saudara seayah perempuan 2+ | Tanpa anak + tanpa kandung perempuan | 2/3 total |
| Saudara seibu (1) | Tanpa anak | 1/6 |
| Saudara seibu (2+) | Tanpa anak | 1/3 total |
| Kakek | Selalu (bila tidak terhalang) | 1/6 |
| Nenek | Sesuai garis | 1/6 atau 1/3 |

### Ashabah (Bagian Sisa)

Sisa harta setelah dikurangi furudh dibagikan kepada **ahli waris ashabah** berdasarkan urutan prioritas:

1. **Anak laki-laki** (bersama anak perempuan, rasio 2:1)
2. **Cucu laki-laki** dari anak laki-laki (pengganti)
3. **Saudara laki-laki kandung**
4. **Saudara laki-laki seayah**
5. **Paman**

Contoh: Jika ada 1 anak laki-laki dan 1 anak perempuan yang berbagi sisa:
- Total bagian = 2 + 1 = 3
- Anak laki-laki mendapat 2/3 dari sisa
- Anak perempuan mendapat 1/3 dari sisa

### Awl (Pengurangan Proporsional)

Jika total bagian melebihi 1 (100%), semua bagian dikurangi secara proporsional berdasarkan asal masalah/furudh.

### Radd (Pengembalian Sisa)

Kondisi radd **tidak sesederhana "tidak ada anak"**. Sisa harta dapat dikembalikan kepada ahli waris furudh dengan ketentuan:

1. Tidak ada ahli waris ashabah (anak/keturunan)
2. Ahli waris furudh yang menerima radd **tidak termasuk suami/istri**
3. Memenuhi syarat lain berdasarkan hukum Islam

---

## Contoh Skenario

### Skenario 1: Suami + 2 Anak

```
Pewaris: Siti (meninggal 2024)
├── Suami: Ahmad
├── Anak: Budi (laki-laki)
└── Anak: Dewi (perempuan)

Tirkah: Rp 1.000.000.000
```

**Hasil:**
- Ahmad (suami): 1/4 = Rp 250.000.000
- Budi (anak laki-laki): 2/3 dari sisa = Rp 500.000.000
- Dewi (anak perempuan): 1/3 dari sisa = Rp 250.000.000

### Skenario 2: Suami saja (tidak ada anak)

```
Pewaris: Siti (meninggal 2024)
└── Suami: Ahmad

Tirkah: Rp 1.000.000.000
```

**Hasil:**
- Ahmad (suami): 1/2 = Rp 500.000.000

### Skenario 3: Anak meninggal sebelum pewaris (Pasal 185)

```
Pewaris: Siti (meninggal 2024)
├── Suami: Ahmad
├── Anak: Budi (meninggal 2020, SEBELUM Siti)
│   └── Cucu: Andi (anak Budi)
└── Anak: Dewi (masih hidup)

Tirkah: Rp 1.000.000.000
```

**Proses:**
1. Budi meninggal lebih dahulu → cek Pasal 185
2. Andi memenuhi syarat sebagai ahli waris pengganti
3. Andi mengambil bagian Budi dengan ketentuan Pasal 185

**Hasil:**
- Ahmad (suami): 1/4 = Rp 250.000.000
- Dewi (anak perempuan): bagian anak perempuan
- Andi (cucu pengganti): bagian Budi dengan ketentuan Pasal 185

**Catatan:** Perhitungan pasti untuk Andi masih dalam perdebatan interpretasi hukum.

---

## Fitur Utama

1. **Visualisasi Keluarga** - Tampilan pohon keluarga yang interaktif
2. **Manajemen Harta** - Catat dan kelola tirkah (harta peninggalan)
3. **Simulasi Waris** - Hitung warisan berdasarkan hukum Islam
4. **Penyimpanan Otomatis** - Data tersimpan secara otomatis
5. **Ekspor/Impor** - Simpan dan muat data

---

## Catatan Penting

- Semua perhitungan menggunakan **matematika exact** (tidak ada pembulatan)
- Sistem dapat menangani kasus **cerai hidup** dan **cerai mati**
- **Tanggal kematian** anggota keluarga mempengaruhi perhitungan
- **Ahli waris pengganti** (Pasal 185) memiliki rule tersendiri
- **Mahjub** (terhalang) ditentukan berdasarkan keberadaan ahli waris lain
- **Tirkah** adalah objek waris yang sebenarnya, bukan sekadar nilai aset
