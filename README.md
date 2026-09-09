# Pewaris

Kalkulator Waris Islam — tentukan ahli waris, mahjub, dan pembagian harta secara akurat berdasarkan hukum waris Islam.

## 🚀 Features

- **Family Canvas** — visualisasi pohon keluarga dengan drag & drop
- **Harta Management** — kelola harta dan kepemilikan
- **Inheritance Calculation** — furudh, ashabah, mahjub, 'awl, radd
- **Auditable Results** — setiap langkah perhitungan dapat dijelaskan
- **Local Persistence** — data tersimpan di browser (IndexedDB)
- **Export/Import** — backup dan restore data sebagai JSON

## 🧞 Commands

| Command         | Action                                       |
| :-------------- | :------------------------------------------- |
| `bun install`   | Installs dependencies                        |
| `bun dev`       | Starts local dev server at `localhost:4321`  |
| `bun build`     | Build your production site to `./dist/`      |
| `bun preview`   | Preview your build locally, before deploying |
| `bun test`      | Run unit tests                               |

## 📁 Project Structure

```text
src/
├── domain/           # Pure TypeScript entities (Anggota, Harta, Fraction)
├── inheritance/      # Rules engine (furudh, ashabah, mahjub, awl, radd)
├── store/            # Zustand stores (family, asset, simulation, canvas)
├── db/               # IndexedDB persistence layer
├── canvas/           # Canvas 2D renderer, layout, interactions
├── components/
│   ├── canvas/       # FamilyCanvas, Toolbar, ContextMenu, Modals
│   ├── harta/        # HartaPanel, HartaForm, HartaListItem
│   ├── results/      # ResultsPanel, AhliWarisList, MahjubList
│   └── ui/           # Modal, shared UI components
├── layouts/
│   └── Layout.astro
└── pages/
    └── index.astro
```

## 👤 User Journey

### 1. Tambah Anggota Keluarga

Klik **+ Anggota** → isi nama → pilih jenis kelamin (Laki-laki / Perempuan) → klik **Tambah**.

Kartu anggota muncul di canvas. Anggota pertama ditempatkan di tengah.

### 2. Hubungkan Anggota

**Perkawinan:**
Klik kanan pada anggota → pilih **💍 Tambah Perkawinan** → pilih pasangan → klik **Hubungkan**.

Garis hijau muncul menandakan hubungan aktus. Garis putus-putus menandakan sudah berakhir.

**Anak:**
Klik kanan pada anggota → pilih **👶 Tambah Anak** → pilih nama anak → pilih hubungan perkawinan orang tua → klik **Hubungkan**.

### 3. Pindahkan Kartu

Drag kartu anggota untuk memindahkannya. Posisi tersimpan otomatis.

### 4. Kelola Harta

Buka panel **Harta** di sebelah kanan → klik **+ Harta** → isi nama harta, nilai beli, dan nilai sekarang.

### 5. Jalankan Simulasi

Buka panel **Hasil** → pilih **Pewaris** dari dropdown → atur **Tanggal Kematian** → klik **Hitung Waris**.

### 6. Lihat Hasil

- **Harta Waris Bersih** — total harta yang dibagikan
- **Ahli Waris** — siapa dapat berapa, dengan alasan (klik untuk detail)
- **Mahjub** — siapa yang terhalang dan kenapa
- **Langkah Perhitungan** — expand untuk melihat proses perhitungan

### 7. Toolbar

| Tombol | Fungsi | Shortcut |
| :----- | :----- | :------- |
| ↖ Select | Klik untuk pilih, drag untuk geser kartu | `1` |
| ✋ Hand | Drag untuk menggeser canvas | `2` |
| ⤴ Connect | Mode koneksi (untuk pengembangan) | `3` |
| 🗑️ Clear | Hapus semua data | — |

### 8. Backup & Restore

Data tersimpan otomatis di browser. Untuk backup:
- Buka panel Harta atau gunakan export function
- Export sebagai JSON
- Import di perangkat lain

## 🏗️ Architecture

> **Canvas is a UI for manipulating facts. It is not the source of truth for inheritance decisions.**

```text
Canvas (UI) → Zustand (State) → Domain Model → Rules Engine → Result
                                  ↓
                              IndexedDB (Persistence)
```

- **Domain Model** — pure TypeScript, no UI dependencies
- **Rules Engine** — pure functions, independently testable
- **Canvas** — visual rendering only, no inheritance logic

## 📄 License

MIT
