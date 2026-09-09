## ERD

```text
┌──────────────────────┐
│       ANGGOTA        │
├──────────────────────┤
│ id PK                │
│ nama NOT NULL        │
└──────────┬───────────┘
           │
           │  anggota_a_id
           │  anggota_b_id
           ▼
┌──────────────────────────────┐
│   HUBUNGAN_HORIZONTAL        │
├──────────────────────────────┤
│ id PK                        │
│ anggota_a_id FK NOT NULL     │
│ anggota_b_id FK NOT NULL     │
│ tanggal_mulai NOT NULL       │
│ tanggal_mulai_sah NOT NULL   │
│ tanggal_berakhir NULL        │
│ tanggal_berakhir_sah NULL    │
│ jenis_akhir NULL             │
└──────────────┬───────────────┘
               │
               │  hubungan_horizontal_id
               ▼
┌──────────────────────────────┐
│    HUBUNGAN_VERTICAL         │
├──────────────────────────────┤
│ id PK                        │
│ anak_id FK NOT NULL          │
│ hubungan_horizontal_id FK    │
│ tanggal_lahir NOT NULL       │
└──────────────────────────────┘


┌──────────────────────────────┐
│            HARTA             │
├──────────────────────────────┤
│ id PK                        │
│ anggota_id FK NOT NULL       │
│ nama NOT NULL                │
│ nilai_beli NOT NULL          │
│ nilai_sekarang NOT NULL      │
└──────────────┬───────────────┘
               │
               │ harta_id
               ▼
┌──────────────────────────────┐
│       PEMILIK_HARTA          │
├──────────────────────────────┤
│ id PK                        │
│ harta_id FK NOT NULL         │
│ anggota_id FK NOT NULL       │
│ persentase NOT NULL          │
└──────────────────────────────┘
```

**Nullable cuma:**

* `tanggal_berakhir`
* `tanggal_berakhir_sah`
* `jenis_akhir`

`hubungan_horizontal_id` di vertical **NOT NULL**.

`pewarisId` cukup state aplikasi, bukan entity database.

---

# Overall Business Rules

### 1. Family Graph

* Semua individu direpresentasikan sebagai `ANGGOTA`.
* `HUBUNGAN_HORIZONTAL` merepresentasikan hubungan perkawinan.
* `HUBUNGAN_VERTICAL` merepresentasikan anak dari pasangan pada hubungan horizontal.
* Hubungan keluarga seperti **ayah, ibu, cucu, kakek, nenek** dapat diturunkan dari graph tersebut.
* Status hukum seperti **ahli waris** dan **mahjub** tidak disimpan sebagai data master.

### 2. Perkawinan

Satu `HUBUNGAN_HORIZONTAL` merepresentasikan satu lifecycle perkawinan.

```text
jenis_akhir:
NULL
CERAI_HIDUP
CERAI_MATI
```

Status pasangan pada saat pewaris meninggal ditentukan dari **timeline perkawinan**, bukan dari label manual seperti `EX_SPOUSE`.

### 3. Harta

* `HARTA.anggota_id` = pemilik awal harta.
* `PEMILIK_HARTA` = kepemilikan aktual.
* Satu harta bisa dimiliki beberapa anggota.
* Total kepemilikan harus 100%.
* `nilai_beli` menyimpan nilai saat diperoleh.
* `nilai_sekarang` menjadi nilai valuasi untuk simulasi.
* Perubahan kepemilikan, termasuk hibah, tercermin pada kepemilikan aktual.

### 4. Menentukan Pewaris

User memilih satu anggota sebagai **pewaris**.

Sistem kemudian mengambil:

* kondisi keluarga pewaris;
* status perkawinan pada tanggal kematian;
* keturunan;
* kepemilikan harta;
* dan fakta relevan lainnya.

### 5. Menentukan Harta Warisan

Tidak semua harta otomatis menjadi warisan.

```text
seluruh harta
↓
tentukan kepemilikan pewaris
↓
ambil bagian milik pewaris
↓
perhitungkan kewajiban/pengurang yang relevan
↓
HARTA WARIS BERSIH
```

### 6. Menentukan Ahli Waris

Kandidat berasal dari:

**Hubungan darah**

* anak
* ayah
* ibu
* saudara
* kakek
* nenek
* cucu

**Hubungan perkawinan**

* suami
* istri

Kemudian sistem mengevaluasi:

```text
Kandidat
↓
punya hubungan kewarisan?
↓
masih hidup saat pewaris meninggal?
↓
ada sebab penghalang?
↓
terhalang (mahjub)?
↓
AHLI WARIS FINAL
```

### 7. Mahjub

**Mahjub** = calon ahli waris yang secara hubungan sebenarnya termasuk kelompok ahli waris, tetapi hak warisnya terhalang karena keberadaan ahli waris lain atau kondisi kewarisan tertentu.

Contoh sederhana:

```text
Pewaris
├── Ayah
└── Kakek

→ Kakek dapat mahjub oleh Ayah
```

Jadi engine harus membedakan:

```text
bukan ahli waris
≠
ahli waris tetapi mahjub
≠
ahli waris yang mendapat bagian
```

### 8. Perhitungan Waris

Setelah ahli waris final ditentukan:

```text
HARTA WARIS BERSIH
        ↓
tentukan furudh
        ↓
tentukan ashabah / sisa
        ↓
penyesuaian jika diperlukan
        ↓
BAGIAN MASING-MASING
```

Contoh rule dasar:

* Suami: `1/2` atau `1/4`
* Istri/para istri: `1/4` atau `1/8`
* Anak laki-laki dan perempuan sebagai ashabah: **2 : 1**
* Ayah, ibu, saudara, dan keturunan mempunyai rule kondisional masing-masing.

Engine nantinya harus menangani kasus seperti **furudh, ashabah, mahjub, 'awl, dan radd** sesuai rule waris yang dipakai.

### 9. Output

Hasil simulasi minimal:

```text
PEWARIS
Harta waris bersih

AHLI WARIS
├── Nama
├── Hubungan
├── Bagian
└── Nominal

MAHJUB
├── Nama
├── Hubungan
└── Alasan terhalang
```

**Prinsip arsitektur utamanya:**

> **Database menyimpan fakta keluarga dan harta. Business/rules engine menyimpulkan siapa ahli waris, siapa mahjub, dan berapa bagiannya.**
