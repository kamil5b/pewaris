# Tabel Lengkap Ahli Waris Islam (KHI)

Dokumen ini menjadi dasar pembuatan calculation engine. Setiap baris harus bisa di-derive langsung menjadi code.

---

## 1. Klasifikasi Ahli Waris

### 1.1 Ashabah (Pihak Keluarga Laki-laki yang Menyambung)

| Kode | Ahli Waris | Keterangan | Syarat Bertemu Pewaris |
|------|-----------|------------|----------------------|
| A1 | Anak laki-laki | Anak kandung pewaris (laki-laki) | Melalui pewaris langsung |
| A2 | Anak laki-laki dari anak laki-laki | Cucu laki-laki garis patrilineal | Melalui anak laki-laki pewaris |
| A3 | Anak laki-laki dari anak laki-laki dari ... | Keturunan patrilineal lebih jauh | Melalui garis laki-laki berturut-turut |
| A4 | Saudara laki-laki kandung | Anak dari ayah dan ibu yang sama | Ayah dan ibu sama |
| A5 | Anak laki-laki dari saudara laki-laki kandung | Keponakan laki-laki (garis patrilineal) | Melalui saudara laki-laki kandung |
| A6 | Saudara laki-laki seayah (sebapak) | Anak dari ayah yang sama, ibu berbeda | Ayah sama, ibu berbeda |
| A7 | Anak laki-laki dari saudara laki-laki seayah | Keponakan dari garis seayah | Melalui saudara laki-laki seayah |
| A8 | Paman (saudara laki-laki ayah) | Saudara laki-laki dari ayah pewaris | Melalui kakek |
| A9 | Anak laki-laki dari paman | Sepupu laki-laki (garis patrilineal) | Melalui paman |

### 1.2 Dhawu al-Furudh (Ahli Waris Bagian Tetap)

| Kode | Ahli Waris | Bagian | Kondisi | Pasal |
|------|-----------|--------|---------|-------|
| F1 | Suami | 1/4 | Ada anak/cucu pengganti dari pewaris | 174 |
| F2 | Suami | 1/2 | Tidak ada anak/cucu pengganti dari pewaris | 174 |
| F3 | Istri (1 orang) | 1/8 | Ada anak/cucu pengganti dari pewaris | 175 |
| F4 | Istri (1 orang) | 1/4 | Tidak ada anak/cucu pengganti dari pewaris | 175 |
| F5 | Ayah | 1/6 | Ada anak dari pewaris | 176 |
| F6 | Ibu | 1/6 | Ada anak dari pewaris (2 atau lebih) | 177 |
| F7 | Ibu | 1/3 | Tidak ada anak dari pewaris | 177 |
| F8 | Ibu | 1/6 | Hanya 1 anak dari pewaris | 177 |
| F9 | Anak perempuan (1 orang) | 1/2 | Tidak ada anak laki-laki dari pewaris | 178 |
| F10 | Anak perempuan (2 atau lebih) | 2/3 | Tidak ada anak laki-laki dari pewaris | 178 |
| F11 | Cucu perempuan dari anak laki-laki (1 orang) | 1/6 | Ada anak perempuan lain dari pewaris | 179 |
| F12 | Cucu perempuan dari anak laki-laki (2 atau lebih) | 1/3 | Tidak ada cucu perempuan lain dari garis yang sama | 179 |
| F13 | Saudara kandung perempuan (1 orang) | 1/2 | Tidak ada anak dari pewaris | 180 |
| F14 | Saudara kandung perempuan (2 atau lebih) | 2/3 | Tidak ada anak dari pewaris | 180 |
| F15 | Saudara seayah perempuan (1 orang) | 1/2 | Tidak ada anak dari pewaris dan tidak ada saudara kandung perempuan | 181 |
| F16 | Saudara seayah perempuan (2 atau lebih) | 2/3 | Tidak ada anak dari pewaris dan tidak ada saudara kandung perempuan | 181 |
| F17 | Saudara seibu (laki-laki/perempuan) | 1/6 per orang | Tidak ada anak dari pewaris | 182 |
| F18 | Saudara seibu (2 atau lebih) | 1/3 total | Tidak ada anak dari pewaris | 182 |
| F19 | Kakek (ayah dari ayah) | 1/6 | Ada anak dari pewaris | 183 |
| F20 | Nenek (ibu dari ayah) | 1/6 | Ada anak dari pewaris (2 atau lebih) | 184 |
| F21 | Nenek (ibu dari ayah) | 1/3 | Tidak ada anak dari pewaris | 184 |
| F22 | Nenek (ibu dari ayah) | 1/6 | Hanya 1 anak dari pewaris | 184 |

### 1.3 Ahli Waris Pengganti (Pasal 185)

| Kode | Kondisi | Pengganti | Aturan |
|------|---------|----------|--------|
| R1 | Anak pewaris meninggal sebelum pewaris | Anak dari anak tersebut (cucu pewaris) | Cucu mengambil bagian orang tua yang meninggal |
| R2 | Cucu pengganti meninggal sebelum pewaris | Anak dari cucu tersebut | Berlaku terus sampai generasi terbatas |

**Batasan Pengganti (Pasal 185):**
1. Yang meninggal lebih dahulu **bukan pembunuh** pewaris
2. Cucu pengganti memenuhi syarat sebagai ahli waris
3. Bagian pengganti **tidak boleh melebihi** bagian ahli waris yang sederajat dengan yang diganti

---

## 2. Syarat Ahli Waris (Pasal 172-173 KHI)

### 2.1 Syarat Utama
1. **Ada hubungan darah atau perkawinan** dengan pewaris
2. **Masih hidup** pada saat pewaris meninggal
3. **Beragama Islam** (pewaris maupun ahli waris)
4. **Tidak ada sebab penghalang** (mahjub)

### 2.2 Penghalang (Pasal 173 KHI)
1. Pembunuhan yang disengaja
2. Berbeda agama (pewaris kafir, ahli waris Muslim, atau sebaliknya)
3. Perbudakan
4. Nikah mut'ah (nikah sementara)

---

## 3. Mahjub (Terhalang) - Pasal 186 KHI

### 3.1 Mahjub oleh Anak Laki-laki
| Yang Terhalang | Alasan |
|---------------|--------|
| Anak perempuan | Terhalang oleh anak laki-laki yang lebih dekat |
| Cucu perempuan dari anak laki-laki | Terhalang oleh anak laki-laki |
| Saudara kandung laki-laki | Terhalang oleh anak laki-laki |
| Saudara kandung perempuan | Terhalang oleh anak laki-laki |
| Saudara seayah laki-laki | Terhalang oleh anak laki-laki |
| Saudara seayah perempuan | Terhalang oleh anak laki-laki |
| Kakek (ayah dari ayah) | Terhalang oleh anak laki-laki |
| Nenek (ibu dari ayah) | Terhalang oleh anak laki-laki |
| Nenek (ayah dari ibu) | Terhalang oleh anak laki-laki |
| Nenek (ibu dari ibu) | Terhalang oleh anak laki-laki |

### 3.2 Mahjub oleh Anak Perempuan
| Yang Terhalang | Alasan |
|---------------|--------|
| Cucu perempuan dari anak laki-laki (jika ada anak perempuan lain) | Terhalang oleh anak perempuan yang lebih dekat |
| Kakek (ayah dari ayah) | Terhalang oleh anak perempuan |
| Nenek (ibu dari ayah) | Terhalang oleh anak perempuan |
| Nenek (ayah dari ibu) | Terhalang oleh anak perempuan |
| Nenek (ibu dari ibu) | Terhalang oleh anak perempuan |

### 3.3 Mahjub oleh Suami
| Yang Terhalang | Alasan |
|---------------|--------|
| Kakek (ayah dari ayah) | Terhalang oleh suami |

### 3.4 Mahjub oleh Istri
| Yang Terhalang | Alasan |
|---------------|--------|
| Nenek (ibu dari ayah) | Terhalang oleh istri |
| Nenek (ayah dari ibu) | Terhalang oleh istri |
| Nenek (ibu dari ibu) | Terhalang oleh istri |

### 3.5 Mahjub oleh Saudara Kandung Laki-laki
| Yang Terhalang | Alasan |
|---------------|--------|
| Saudara seayah laki-laki | Terhalang oleh saudara kandung |
| Saudara seayah perempuan | Terhalang oleh saudara kandung |
| Kakek (ayah dari ayah) | Terhalang oleh saudara kandung |

### 3.6 Mahjub oleh Saudara Kandung Perempuan
| Yang Terhalang | Alasan |
|---------------|--------|
| Saudara seayah perempuan | Terhalang oleh saudara kandung |

### 3.7 Mahjub oleh Saudara Seayah Laki-laki
| Yang Terhalang | Alasan |
|---------------|--------|
| Kakek (ayah dari ayah) | Terhalang oleh saudara seayah |

### 3.8 Mahjub oleh Nenek (Ibu dari Ayah)
| Yang Terhalang | Alasan |
|---------------|--------|
| Nenek (ayah dari ibu) | Terhalang oleh nenek dari garis ayah |
| Nenek (ibu dari ibu) | Terhalang oleh nenek dari garis ayah |

---

## 4. Urutan Prioritas Ashabah

1. Anak laki-laki → Anak laki-laki dari anak laki-laki → dst.
2. Saudara laki-laki kandung → Anak laki-laki dari saudara laki-laki kandung → dst.
3. Saudara laki-laki seayah → Anak laki-laki dari saudara laki-laki seayah → dst.
4. Paman (saudara laki-laki ayah) → Anak laki-laki dari paman → dst.

---

## 5. Interaksi Furudh dan Ashabah

### 5.1 Kombinasi yang Mungkin
| Kombinasi | Ahli Waris | Perhitungan |
|-----------|-----------|-------------|
| Furudh saja | Suami + Istri (tanpa anak) | Furudh: suami 1/2 atau istri 1/4; sisa → radd |
| Ashabah saja | Anak laki-laki (tanpa perempuan) | Semua bagian ke anak laki-laki |
| Furudh + Ashabah | Suami + Anak | Furudh: suami 1/4; Ashabah: anak laki-laki 2:1 perempuan |
| Furudh + Ashabah + Pengganti | Suami + Anak + Cucu pengganti | Furudh: suami 1/4; Ashabah: anak + cucu pengganti |

### 5.2 Radd (Pengembalian Sisa)
- **Syarat**: Tidak ada ahli waris ashabah dan sisa > 0
- **Penerima**: Ahli waris furudh (kecuali suami/istri)
- **Pengecualian**: Tidak berlaku jika ada ahli waris ashabah

### 5.3 Awl (Pengurangan Proporsional)
- **Syarat**: Total bagian furudh > 1 (100%)
- **Metode**: Setiap bagian furudh dikurangi secara proporsional
- **Catatan**: Hanya berlaku untuk bagian furudh, bukan ashabah

---

## 6. Contoh Perhitungan

### 6.1 Skenario Dasar: Suami + 2 Anak
```
Pewaris: Siti (meninggal 2024)
├── Suami: Ahmad
├── Anak: Budi (laki-laki)
└── Anak: Dewi (perempuan)

Tirkah: Rp 1.000.000.000
```

**Proses:**
1. Kandidat: Ahmad (suami), Budi (anak laki-laki), Dewi (anak perempuan)
2. Kelayakan: Semua hidup dan Muslim
3. Mahjub: Tidak ada yang terhalang
4. Furudh: Ahmad mendapat 1/4 = Rp 250.000.000
5. Ashabah: Budi mendapat 2/3 dari sisa = Rp 500.000.000
6. Ashabah: Dewi mendapat 1/3 dari sisa = Rp 250.000.000

**Hasil:**
- Ahmad: Rp 250.000.000 (1/4)
- Budi: Rp 500.000.000 (2/3 dari sisa)
- Dewi: Rp 250.000.000 (1/3 dari sisa)

### 6.2 Skenario dengan Pengganti (Pasal 185)
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
- Ahmad: Rp 250.000.000 (1/4)
- Dewi: Rp 333.333.333 (1/3 dari sisa)
- Andi: Rp 416.666.667 (2/3 dari sisa sebagai pengganti Budi)

**Catatan:** Perhitungan pasti untuk Andi masih dalam perdebatan interpretasi hukum.

---

## 7. Implementasi Engine

### 7.1 Pipeline Perhitungan
```
BoardData + SimulationContext
        │
        ▼
┌─────────────────────┐
│ 1. resolveCandidates│ ← Temukan semua kandidat dari graph
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 2. checkEligibility │ ← Periksa syarat Pasal 172-173
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 3. determineMahjub  │ ← Terapkan aturan Pasal 186
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 4. handleReplacemen │ ← Terapkan Pasal 185 (pengganti)
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 5. classifyHeirs    │ ← Kelompokkan: furudh, ashabah, pengganti
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 6. calculateFurudh  │ ← Hitung bagian tetap
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 7. calculateAshabah │ ← Hitung bagian sisa
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 8. handleAwl        │ ← Kurangi proporsional jika perlu
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 9. handleRadd       │ ← Kembalikan sisa ke furudh
└──────────┬──────────┘
           ▼
     InheritanceResult
```

### 7.2 Struktur Data

```ts
type HeirClassification = {
  anggotaId: string
  role: 'FURUDH' | 'ASHABAH' | 'PENGGANTI'
  furudhType?: string  // 'SUAMI', 'ISTRI', 'AYAH', 'IBU', 'ANAK_PEREMPUAN', etc.
  share?: Fraction     // Bagian furudh jika ada
  replacedBy?: string  // ID pengganti jika ada
  mahjubOleh?: string[] // ID yang memahjub
}
```

### 7.3 Aturan Penting
1. **Gunakan tanggal sah** untuk status perkawinan
2. **Tanggal kematian** anggota mempengaruhi kelayakan
3. **Ahli waris pengganti** memiliki batasan bagian
4. **Radd** hanya untuk ahli waris furudh (bukan suami/istri)
5. **Awl** hanya berlaku untuk bagian furudh

---

## 8. Referensi

1. KHI (Kompendium Hukum Islam) Pasal 172-186
2. JDIH Mahkamah Agung RI - Putusan terkait ahli waris
3. Badilag - Materi pembahasan ahli waris
4. SEMA No. 3 Tahun 2015 - Pembatasan ahli waris pengganti
