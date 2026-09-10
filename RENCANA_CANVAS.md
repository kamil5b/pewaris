# Rencana Overhaul Alur Canvas

Dokumen ini adalah rencana (plan) sebelum implementasi overhaul interaksi canvas.
Target: satu kursor/pointer yang menangani semua interaksi, tanpa toolbar tool.

---

## Gambaran Umum Saat Ini

- Ada 3 tool (`SELECT`, `HAND`, `CONNECT`) di `CanvasToolbar` + tombol `+ Anggota` + `Clear`.
- `FamilyCanvas` berperilaku berbeda tergantung `activeTool` dari `canvas-store`.
- Context menu hanya muncul saat **right-click pada node**; `dblclick` tidak terpasang.
- Marquee line (perkawinan) hanya punya `Edit`/`Hapus`; tidak bisa menambah anak dari garis.
- Header hanya judul, tanpa tombol aksi.

---

## Target UX Baru

### 1. Satu Pointer (satu tool)

- Hapus konsep tool switching (`SELECT`/`HAND`/`CONNECT`) dan shortcut `1/2/3`.
- `FamilyCanvas` memakai perilaku gabungan satu kursor:
  - Pointer default (`cursor-default`).
  - Zoom tetap lewat roda (`wheel`).
- Hapus/hapus-pakai `CanvasToolbar` dari `App.tsx`.
- Bersihkan `canvas-store`:
  - Hapus `activeTool`, `setTool` (dan tipe `CanvasTool` bila tidak terpakai lagi).

### 2. Area Kosong (blank canvas)

| Aksi | Perilaku |
|------|----------|
| **Left click + drag** | Pan/menggeser canvas (seperti tool HAND sekarang) |
| **Left click (tanpa drag)** | Kosongkan seleksi node |
| **Right click** | Popup: **"➕ Tambah Anggota"** + **"🗑️ Clear Canvas"** |

Implementasi:
- `mousedown` pada blank → set flag `isPanning = true`.
- `mousemove` saat `isPanning && e.buttons === 1` → `setPan(panX + movementX, panY + movementY)`.
- `mouseup` → `isPanning = false`.
- `contextmenu` pada blank → buka popup dengan item "Tambah Anggota" **dan** "Clear Canvas" (memicu `AddAnggotaModal` / konfirmasi Clear).

### 3. Card / Anggota

| Aksi | Perilaku |
|------|----------|
| **Left click + drag** | Pilih + geser card (drag node) |
| **Double click** | Buka popup context (sama seperti right-click) |
| **Right click** | Buka popup context (item saat ini) |

Popup context node (tetap):
- ⚰️ Jadikan Pewaris
- 💍 Tambah Perkawinan
- 👶 Tambah Anak
- 🗑️ Hapus

Implementasi:
- Tambah event `dblclick` di canvas.
- `dblclick` meng-hit-test node; jika kena node → buka popup **di posisi kursor** (keputusan: posisi kursor, bukan tengah card).
- `contextmenu` tetap seperti sekarang (node → popup; connection → popup hubungan).

### 4. Garis Perkawinan Bisa Menambah Anak

`MarriageConnection` (garis hijau) popup diperluas:

- ✏️ Edit Hubungan *(tetap)*
- 👶 **Tambah Anak ke Perkawinan Ini** *(baru)* — membuka `ConnectModal` mode `PARENT_CHILD` dengan field "Hubungan Perkawinan Orang Tua" sudah terisi otomatis ke perkawinan yang diklik.
- 🗑️ Hapus Hubungan *(tetap)*

Implementasi:
- `ConnectModal` menerima props baru: `presetMarriageId?: string | null`.
  - Saat mode `PARENT_CHILD` + `presetMarriageId` → inisialisasi `hubunganHorizontalId` = preset; field select boleh diubah oleh user.
- `ContextMenu` connection menambah item "Tambah Anak" khusus tipe `HORIZONTAL`.
- `FamilyCanvas` menambah state/flow untuk membuka `ConnectModal` dengan preset.

Garis vertical (garis indigo / parent-child) tetap:
- ✏️ Edit Hubungan
- 🗑️ Hapus Hubungan

### 5. Header: Tombol Aksi

`App.tsx` header berisi **seluruh aksi utama**:

```
┌──────────────────────────────────────────────────────────────┐
│ Pewaris (judul)   [+/− Gores Zoom] [Tambah Anggota] [Clear]  │
│ Kalkulator Waris Islam                                        │
└──────────────────────────────────────────────────────────────┘
```

- **[+] Tambah Anggota** — membuka `AddAnggotaModal`.
- **[🗑️ Clear Canvas]** — menghapus semua data (dengan konfirmasi), pindah dari `CanvasToolbar` ke header **dan** tersedia di area kosong (right-click).
- **[Zoom control]** — tombol `+` / `−` / reset untuk mengubah zoom canvas di header.
- Pindahkan state `AddAnggotaModal` + modal konfirmasi Clear ke `App`.
- Hapus `CanvasToolbar` seluruhnya dari layout.

### 6. Popup/Menu Punya Tombol Tutup ✕

- Semua popup (termasuk context menu) memiliki tombol **✕** untuk menutup.
- Modal (`Modal.tsx`) sudah punya ✕ — tetap.
- `ContextMenu` **ditambah tombol ✕** (sebelumnya tidak ada, menutup hanya lewat klik item/di luar).

### 7. Fix Modal Tidak Tengah (Bug)

- **Bug:** modal `<dialog>` tampil di pojok kiri atas, seharusnya di tengah layar.
- **Perbaikan:** `Modal.tsx` — pastikan `<dialog>` di-center: tambah kelas `m-auto` (atau `fixed inset-0 m-auto`) agar `showModal()` menempatkan dialog di tengah H & V (preflight/fallback reset margin membuatnya menempel kiri-atas).

---

## Dokumen Terkait yang Berubah

- `src/store/canvas-store.ts` — hapus `activeTool`/`setTool`.
- `src/components/canvas/CanvasToolbar.tsx` — hapus (atau kosongkan), pindahkan `AddAnggotaModal`.
- `src/components/App.tsx` — header + tombol "Tambah Anggota" + render `AddAnggotaModal`.
- `src/components/canvas/FamilyCanvas.tsx` — satu pointer, pan, dblclick, preset marriage untuk ConnectModal.
- `src/components/canvas/ConnectModal.tsx` — props `presetMarriageId`.
- `src/components/canvas/ContextMenu.tsx` — tombol ✕; item "Tambah Anak" untuk garis perkawinan; item "Tambah Anggota" + "Clear Canvas" untuk blank.
- `src/components/ui/Modal.tsx` — fix posisi dialog agar di tengah.

---

## Keputusan (semua pertanyaan sudah terjawab)

1. ~~Apakah tombol `Clear` benar-benar dihapus...?~~ → **Diputuskan:** Clear di header + blank right-click (dengan konfirmasi).
2. ~~Apakah perlu indikator zoom / petunjuk singkat tetap tampil di canvas?~~ → **Diputuskan:** tidak perlu —— indikator persen zoom + kontrol sudah ada di header (+/−/reset, tampilkan persen); overlay teks di canvas dibuang.
3. ~~Apakah `dblclick` node membuka popup di posisi kursor atau di tengah card?~~ → **Diputuskan:** posisi kursor.

---

## Urutan Implementasi yang Diusulkan

1. Bersihkan `canvas-store` (hapus tool switching).
2. Rombak `FamilyCanvas`: satu pointer + pan blank + dblclick node.
3. Ubah `ConnectModal` (props preset) + `ContextMenu` (item tambah anak di garis perkawinan) + `FamilyCanvas` (flow preset).
4. Pindahkan `AddAnggotaModal` ke header; buang `CanvasToolbar`.
5. Uji manual: pan blank, drag card, dblclick/right-click node, tambah anak dari garis perkawinan, add anggota dari header & blank popup.