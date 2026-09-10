import { useRef } from 'react'
import { exportToFile, importFromFile } from '../../db/import-export'

export function ImportExport() {
  const fileRef = useRef<HTMLInputElement>(null)

  const handleImport = async (file: File) => {
    const ok = confirm(
      'Mengimpor file akan menggantikan semua data yang ada saat ini. Lanjutkan?'
    )
    if (!ok) return

    try {
      await importFromFile(file)
      alert('Data berhasil diimpor.')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal mengimpor data')
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleImport(file)
        }}
      />
      <button
        onClick={exportToFile}
        className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
        title="Simpan data ke file JSON"
      >
        ⬇️ Export
      </button>
      <button
        onClick={() => fileRef.current?.click()}
        className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
        title="Muat data dari file JSON"
      >
        ⬆️ Import
      </button>
    </>
  )
}