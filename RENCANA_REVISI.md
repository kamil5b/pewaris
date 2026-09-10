# Rencana Revisi Sistem Pewaris

Berdasarkan REVISION.md, berikut rencana perubahan yang perlu dilakukan.

---

## Status Saat Ini

| Komponen | Status | Catatan |
|----------|--------|---------|
| Domain model (Anggota) | Sudah benar | Sudah punya `tanggalLahir`, `tanggalKematian` di Anggota |
| Domain model (HubunganVertical) | Masih punya `tanggalLahir` | Seharusnya tidak perlu, tanggal lahir sudah di Anggota |
| `relationship.ts` | Berfungsi | Traverse graph untuk cari spouse, children, parents, siblings |
| `candidates.ts` | Sederhana | Hanya cari spouse + children + cucu pengganti |
| `eligibility.ts` | Sederhana | Hanya cek apakah hidup (tanggalKematian) |
| `mahjub.ts` | **Kosong (stub)** | Selalu return `[]` — belum ada blocking rules |
| `furudh.ts` | Sebagian | Hanya hitung spouse (1/4 atau 1/2) |
| `ashabah.ts` | Sebagian | Hanya hitung anak (2:1) |
| `awl.ts` | Berfungsi | Proporsional reduction |
| `radd.ts` | Sebagian | Hanya return ke furudh non-spouse |
| `calculate.ts` | Sebagian | Pipeline sederhana |

---

## Rencana Perubahan

### Tahap 1: Data Model Cleanup

**Tujuan:** Sesuaikan ERD dengan revisi — hapus `tanggalLahir` dari HubunganVertical, tambah `is_nasab_ayah` dan `is_adopted`.

| File | Perubahan |
|------|-----------|
| `hubungan-vertical.ts` | Hapus `tanggalLahir`, tambah `isNasabAyah: boolean`, `isAdopted: boolean` |
| `schemas.ts` | Update `hubunganVerticalSchema` — hapus `tanggalLahir`, tambah `isNasabAyah`, `isAdopted` |
| `relationship.ts` | `findChildren` — gunakan `anggota.tanggalLahir` untuk filter, bukan `v.tanggalLahir`; tambah filter `isAdopted` |
| `ConnectModal.tsx` | Hapus field `tanggalLahirAnak` (tanggal lahir sudah di data Anggota); tambah checkbox `is_nasab_ayah` dan `is_adopted` |
| `family-store.ts` | Cek apakah ada referensi ke `tanggalLahir` di HubunganVertical |
| `canvas/nodes.ts` | Cek apakah ada referensi ke `tanggalLahir` di HubunganVertical |
| `canvas/layout.ts` | Cek apakah ada referensi ke `tanggalLahir` di HubunganVertical |
| `calculate.test.ts` | Update objek HubunganVertical — hapus `tanggalLahir`, tambah `isNasabAyah`, `isAdopted` |

**Risiko:** `ConnectModal` perlu diubah — tanggal lahir anak sudah ada di Anggota, jadi tidak perlu diulang saat membuat hubungan. Checkbox `is_nasab_ayah` dan `is_adopted` perlu UI.

---

### Tahap 2: Perluasan `relationship.ts`

**Tujuan:** Tambah fungsi untuk resolve semua jenis hubungan KHI.

Fungsi baru yang perlu ditambah:

| Fungsi | Input | Output | Keterangan |
|--------|-------|--------|------------|
| `findSpouse(id, board, tanggalKematian)` | Sudah ada | `string \| null` | Suami/istri tunggal (sudah berfungsi) |
| `findSpouses(id, board, tanggalKematian)` | Baru | `string[]` | Semua istri/suami aktif (untuk poligami) |
| `findParentsOf(id, board)` | Sudah ada | `{ ayahId, ibuId }` | Sudah berfungsi |
| `findSiblings(id, board)` | Sudah ada | `string[]` | Perlu diperbaiki — harus handle saudara kandung DAN seayah |
| `findSiblingsKandung(id, board)` | Baru | `string[]` | Saudara yang ayah DAN ibu sama |
| `findSiblingsSeayah(id, board)` | Baru | `string[]` | Saudara yang ayah sama, ibu beda |
| `findSiblingsSeibu(id, board)` | Baru | `string[]` | Saudara yang ibu sama, ayah beda |
| `findGrandfather(id, board)` | Baru | `string \| null` | Ayah dari ayah |
| `findGrandmothers(id, board)` | Baru | `string[]` | Ibu dari ayah, ayah dari ibu, ibu dari ibu |
| `findGrandchildren(id, board)` | Baru | `string[]` | Anak dari anak |
| `findPaman(id, board)` | Baru | `string[]` | Saudara laki-laki dari ayah |
| `findCucuPengganti(id, board, tanggalKematian)` | Baru | `string[]` | Cucu yang menggantikan anak yang meninggal lebih dulu |

---

### Tahap 3: Perluasan `candidates.ts`

**Tujuan:** Resolve SEMUA kandidat ahli waris dari graph, bukan hanya spouse + children.

**Penting — Business Rules Anak:**
- Anak **angkat** (`isAdopted = true`) → **bukan ahli waris nasab** dari orang tua angkat
- Anak dengan `isNasabAyah = false` → **tidak mewarisi ayah** melalui nasab tersebut
- Anak dengan `isNasabAyah = true` → **dapat mewarisi ayah** (tetap cek mahjub)
- **Ibu selalu punya hubungan nasab** — tidak perlu `isNasabIbu` (sudah di-cover oleh HUBUNGAN_VERTICAL)
- Perceraian orang tua **tidak menghapus nasab** anak
- Anak di luar nikah yang tidak ada hubungan nasab → hanya mewarisi dari **ibu**

Pipeline kandidat:

```
1. Spouse (jika ada pernikahan aktif, gunakan tanggal_mulai_sah / tanggal_berakhir_sah)
2. Anak laki-laki + perempuan
   ├── Filter: isAdopted = true → skip (bukan ahli waris nasab)
   ├── Filter: isNasabAyah = false → skip untuk pewaris ayah
   └── isNasabAyah = true → termasuk
3. Cucu pengganti (anak meninggal → cucu ambil bagian, cek Pasal 185)
4. Ayah (hanya jika ada hubungan nasab / HUBUNGAN_VERTICAL)
5. Ibu (selalu ada hubungan nasab melalui HUBUNGAN_VERTICAL)
6. Saudara kandung (laki-laki + perempuan)
7. Saudara seayah (laki-laki + perempuan)
8. Saudara seibu (laki-laki + perempuan)
9. Kakek (ayah dari ayah)
10. Nenek (3 garis: ibu dari ayah, ayah dari ibu, ibu dari ibu)
11. Paman (saudara laki-laki ayah)
```

**Output per kandidat:**
```ts
type Candidate = {
  anggotaId: string
  kategori: 'PASANGAN' | 'ANAK' | 'ANAK_PENGGANTI' | 'ORANG_TUA' | 'SAUDARA' | 'KAKEK_NENEK' | 'PAMAN'
  kategoriDetail: string  // e.g. 'SAUDARA_KANDUNG_LAKI_LAKI'
  isNasabAyah?: boolean   // dari HUBUNGAN_VERTICAL, untuk anak
  isAdopted?: boolean     // dari HUBUNGAN_VERTICAL, untuk anak
}
```

---

### Tahap 4: Perluasan `eligibility.ts`

**Tujuan:** Cek semua syarat Pasal 172-173 KHI.

| Syarat | Implementasi |
|--------|-------------|
| Hubungan darah/perkawinan | Sudah di-cover oleh candidates (dari graph) |
| Masih hidup | Sudah di-cover (`anggota.tanggalKematian`) |
| Beragama Islam | **Belum ada field `agama` di Anggota** — perlu ditambahkan atau asumsikan semua Muslim untuk MVP |
| Tidak ada penghalang | Di-handle di `mahjub.ts` |

**Anak — filter nasab:**
- Anak dengan `isAdopted = true` → **bukan ahli waris nasab** dari orang tua angkat (cek wasiat wajibah nanti)
- Anak dengan `isNasabAyah = false` → **tidak mewarisi ayah** melalui nasab tersebut
- Anak dengan `isNasabAyah = true` → **dapat mewarisi ayah** (tetap cek mahjub)
- **Ibu selalu punya hubungan nasab** — tidak perlu `isNasabIbu`

**Keputusan:** Untuk MVP, asumsikan semua anggota Muslim. Tambah field `agama` nanti jika diperlukan.

---

### Tahap 5: Rebuild `mahjub.ts`

**Tujuan:** Implementasi Pasal 186 KHI.

Struktur data input:
- List kandidat yang sudah di-eligible
- Data graph (board)
- Pewaris ID

Struktur data output:
```ts
type MahjubResult = {
  anggotaId: string
  terhalangOleh: string  // ID yang memahjub
  alasan: string
}
```

Aturan mahjub yang perlu diimplement (berdasarkan TABEL_AHLI_WARIS.md):

| Pemahjub | Yang Terhalang |
|----------|---------------|
| Anak laki-laki | Anak perempuan, cucu perempuan, saudara, kakek, nenek |
| Anak perempuan | Cucu perempuan (jika ada anak perempuan lain), kakek, nenek |
| Suami | Kakek |
| Istri | Semua nenek |
| Saudara kandung laki-laki | Saudara seayah, kakek |
| Saudara kandung perempuan | Saudara seayah perempuan |
| Saudara seayah laki-laki | Kakek |

---

### Tahap 6: Implementasi Pasal 185 (Ahli Waris Pengganti)

**Tujuan:** Handle cucu yang menggantikan anak yang meninggal sebelum pewaris.

Pipeline:
```
Untuk setiap anak pewaris:
  Jika anak meninggal SEBELUM pewaris:
    1. Cek apakah anak itu pembunuh pewaris → skip
    2. Cari cucu (anak dari anak tersebut)
    3. Untuk setiap cucu:
       a. Cek apakah cucu hidup saat pewaris meninggal
       b. Cek apakah cucu Muslim
       c. Tandai sebagai PENGGANTI dari anak tersebut
       d. Hitung batas bagian: tidak boleh melebihi bagian anak yang sederajat
```

**Batasan:** Bagian pengganti tidak boleh melebihi bagian ahli waris yang sederajat dengan yang diganti.

---

### Tahap 7: Perluasan `furudh.ts`

**Tujuan:** Hitung semua bagian tetap sesuai KHI.

**Catatan Penting — Poligami:**
- Jika ada **banyak istri aktif**, bagian istri dibagi proporsional
- Contoh: 2 istri, ada anak → masing-masing istri dapat `(1/8) / 2 = 1/16`
- Contoh: 3 istri, tidak ada anak → masing-masing istri dapat `(1/4) / 3 = 1/12`
- Hitung jumlah istri aktif dari `findSpouses()` (bukan `findSpouse()` yang hanya return 1)

| Furudh | Kondisi | Bagian | Pasal |
|--------|---------|--------|-------|
| Suami (ada anak) | Anak atau cucu pengganti ada | 1/4 | 174 |
| Suami (tidak ada anak) | Tidak ada anak/cucu pengganti | 1/2 | 174 |
| Istri (ada anak) | Anak atau cucu pengganti ada | 1/8 dibagi jumlah istri aktif | 175 |
| Istri (tidak ada anak) | Tidak ada anak/cucu pengganti | 1/4 dibagi jumlah istri aktif | 175 |
| Ayah (ada anak) | Anak pewaris ada | 1/6 | 176 |
| Ibu (2+ anak) | 2 atau lebih anak pewaris | 1/6 | 177 |
| Ibu (1 anak) | Hanya 1 anak pewaris | 1/6 | 177 |
| Ibu (tidak ada anak) | Tidak ada anak pewaris | 1/3 | 177 |
| Anak perempuan 1 (tidak ada anak laki-laki) | Tidak ada anak laki-laki | 1/2 | 178 |
| Anak perempuan 2+ (tidak ada anak laki-laki) | Tidak ada anak laki-laki | 2/3 total | 178 |

**TODO (MVP nanti):** Hutang pewaris perlu dikurangkan dari tirkah sebelum dibagi.
**TODO (MVP nanti):** Wasiat perlu di-handle (batas 1/3 dari tirkah, Pasal 200).
**TODO (MVP nanti):** Wasiat wajibah anak angkat perlu di-handle (Pasal 209, batas 1/3).

---

### Tahap 8: Perluasan `ashabah.ts`

**Tujuan:** Handle semua skenario ashabah, bukan hanya anak.

Skenario ashabah:
1. Anak laki-laki saja → 100% ke anak laki-laki
2. Anak laki-laki + perempuan → 2:1
3. Saudara laki-laki kandung (tanpa anak) → 100% ke saudara
4. Campuran saudara → proporsional
5. Kakek sebagai ashabah (jika tidak ada furudh)

---

### Tahap 9: Update `calculate.ts`

**Tujuan:** Pipeline baru yang lengkap.

```
1. resolveCandidates (perluas)
2. checkEligibility (perluas)
3. determineMahjub (rebuild)
4. handleReplacement (Pasal 185 — baru)
5. classifyHeirs (tentukan: furudh, ashabah, pengganti)
6. calculateFurudh (perluas)
7. calculateAshabah (perluas)
8. handleAwl (pertahankan)
9. handleRadd (pertahankan + perluas kondisi)
10. return result
```

---

### Tahap 10: Test Cases

| No | Seskario | Yang Diuji |
|----|----------|-----------|
| 1 | Suami + 2 anak | Furudh suami 1/4, ashabah anak 2:1 |
| 2 | Suami saja | Furudh suami 1/2, radd |
| 3 | Istri + 2 anak | Furudh istri 1/8 |
| 4 | Anak meninggal + cucu | Pasal 185 pengganti |
| 5 | Anak laki-laki + perempuan | Anak perempuan furudh 1/2 |
| 6 | Ayah + Ibu + Suami + Anak | Semua furudh aktif |
| 7 | Saudara kandung (tanpa anak) | Ashabah saudara |
| 8 | Kakek terhalang oleh Ayah | Mahjub |
| 9 | Awl: bagian > 1 | Pengurangan proporsional |
| 10 | Cerai sebelum pewaris mati | Spouse tidak dapat bagian |

---

## Keputusan Desain

1. **Field `agama`**: MVP asumsikan semua Muslim. Tidak perlu field `agama` di Anggota. (TODO: tambah field `agama` jika diperlukan nanti)
2. **Istri ganda**: **Di-handle** — bagian istri dibagi proporsional jika ada banyak istri aktif (KHI Pasal 175: `1/8 × jumlah istri` jika ada anak, `1/4 × jumlah istri` jika tidak ada anak)
3. **Anak angkat**: **Belum di-handle** untuk MVP. Tambah comment di code bahwa wasiat wajibah (Pasal 209, batas 1/3) perlu diimplementasi nanti.
4. **Hutang pewaris**: **Out of scope**. Tambah comment di code bahwa hutang perlu dikurangkan dari tirkah sebelum dibagi nanti.
5. **Wasiat**: **Belum di-handle**. Tambah comment di code bahwa wasiat (batas 1/3 dari tirkah, Pasal 200) perlu diimplementasi nanti.

---

## Urutan Pengerjaan

```
Tahap 1 (Data Model Cleanup)
    ↓
Tahap 2 (relationship.ts)
    ↓
Tahap 3 (candidates.ts)
    ↓
Tahap 4 (eligibility.ts)
    ↓
Tahap 5 (mahjub.ts)
    ↓
Tahap 6 (Pasal 185)
    ↓
Tahap 7 (furudh.ts)
    ↓
Tahap 8 (ashabah.ts)
    ↓
Tahap 9 (calculate.ts)
    ↓
Tahap 10 (Tests)
```

**Estimasi:** 10 tahap, setiap tahap bisa di-merge setelah test pass.

---

## Keputusan Desain

1. **Field `agama`**: MVP asumsikan semua Muslim. Tidak perlu field `agama` di Anggota. (TODO: tambah field `agama` jika diperlukan nanti)
2. **Istri ganda**: **Di-handle** — bagian istri dibagi proporsional jika ada banyak istri aktif (KHI Pasal 175: `1/8 × jumlah istri` jika ada anak, `1/4 × jumlah istri` jika tidak ada anak)
3. **Anak angkat**: **Belum di-handle** untuk MVP. Tambah comment di code bahwa wasiat wajibah (Pasal 209, batas 1/3) perlu diimplementasi nanti.
4. **Hutang pewaris**: **Out of scope**. Tambah comment di code bahwa hutang perlu dikurangkan dari tirkah sebelum dibagi nanti.
5. **Wasiat**: **Belum di-handle**. Tambah comment di code bahwa wasiat (batas 1/3 dari tirkah, Pasal 200) perlu diimplementasi nanti.

---

## Pertanyaan yang Perlu Dijawab Sebelum Implement

1. **Field `agama`**: Apakah perlu ditambahkan ke Anggota untuk cek Muslim? Atau asumsikan semua Muslim untuk MVP?
2. **Istri ganda**: KHI mengatur bagian istri dibagi proporsional jika ada banyak istri. Apakah perlu di-handle?
3. **Anak angkat**: Apakah diakui sebagai ahli waris dalam konteks ini?
4. **Hutang pewaris**: Apakah perlu dikurangi dari tirkah sebelum dibagi?
5. **Wasiat**: Apakah perlu di-handle?

**Status: Semua pertanyaan sudah dijawab di atas (Keputusan Desain).**
