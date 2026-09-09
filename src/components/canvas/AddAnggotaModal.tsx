import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { useFamilyStore } from '../../store/family-store'
import { v4 as uuidv4 } from 'uuid'
import type { Gender } from '../../domain/anggota'

type AddAnggotaModalProps = {
  isOpen: boolean
  onClose: () => void
}

export function AddAnggotaModal({ isOpen, onClose }: AddAnggotaModalProps) {
  const addAnggota = useFamilyStore((s) => s.addAnggota)

  const [nama, setNama] = useState('')
  const [gender, setGender] = useState<Gender>('LAKI_LAKI')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!nama.trim()) {
      return
    }

    addAnggota({
      id: uuidv4(),
      nama: nama.trim(),
      gender,
    })

    setNama('')
    setGender('LAKI_LAKI')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tambah Anggota Baru">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Nama</label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan nama"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Jenis Kelamin</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="LAKI_LAKI"
                  checked={gender === 'LAKI_LAKI'}
                  onChange={() => setGender('LAKI_LAKI')}
                  className="text-blue-500"
                />
                <span className="text-sm">♂ Laki-laki</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="PEREMPUAN"
                  checked={gender === 'PEREMPUAN'}
                  onChange={() => setGender('PEREMPUAN')}
                  className="text-pink-500"
                />
                <span className="text-sm">♀ Perempuan</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
          >
            Tambah
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
          >
            Batal
          </button>
        </div>
      </form>
    </Modal>
  )
}
