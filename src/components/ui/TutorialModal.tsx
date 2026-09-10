import { Modal } from './Modal'

type TutorialModalProps = {
  isOpen: boolean
  onClose: () => void
}

export function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Panduan Penggunaan" wide>
      <div className="space-y-5 text-sm text-gray-700 max-h-[60vh] overflow-y-auto pr-1">
        <section>
          <h3 className="font-semibold mb-1">Langkah demi langkah</h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>
              <strong>Daftarkan anggota keluarga.</strong> Klik tombol
              "+ Anggota" di sudut kanan atas, atau klik kanan pada area kosong
              di canvas. Isi nama, tanggal lahir, dan tanggal kematian (jika sudah
              meninggal).
            </li>
            <li>
              <strong>Hubungkan antar anggota.</strong> Klik kanan pada kartu
              seseorang, lalu pilih "Tambah Perkawinan" untuk pasangan, atau
              "Tambah Anak" untuk anak mereka. Melalui garis perkawinan (garis
              hijau), kamu juga bisa klik kanan dan pilih "Tambah Anak".
            </li>
            <li>
              <strong>Tandai pewaris.</strong> Klik kanan pada kartu orang yang
              meninggal, lalu pilih "Jadikan Pewaris". Ini memberitahu sistem siapa
              yang hartanya akan dibagikan.
            </li>
            <li>
              <strong>Isi harta yang ditinggalkan.</strong> Buka tab "Harta"
              di panel kanan, lalu tambahkan harta seperti rumah, tanah, atau mobil.
              Tentukan pemilik aslinya dan siapa pemilik saat ini beserta persentasenya.
            </li>
            <li>
              <strong>Lihat hasil pembagian.</strong> Buka tab "Hasil" untuk
              melihat siapa saja ahli waris dan berapa bagian yang mereka terima.
            </li>
          </ol>
          <p className="mt-2">
            <strong>Tips:</strong> Untuk menggerakkan tampilan, seret area kosong.
            Untuk memperkecil/memperbesar, tekan Ctrl sambil memutar roda mouse.
            Klik dua kali atau klik kanan pada kartu untuk menu pilihan.
          </p>
        </section>

        <section>
          <h3 className="font-semibold mb-1">Yang kami berasumsikan</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Seluruh anggota keluarga beragama Islam.</li>
            <li>Ibu selalu memiliki hubungan darah dengan anaknya.</li>
            <li>
              Nilai harta yang dibagikan adalah nilai penuh, belum dipotong hutang
              pewaris.
            </li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold mb-1">Yang sudah dihitung</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Bagian istri/suami, anak, orang tua, saudara, cucu, paman, dan kakek.</li>
            <li>Aturan sisa harta (ashabah), kelebihan harta (radd), dan penyesuaian bila bagian lebih besar dari harta (awl).</li>
            <li>Ahli waris yang terhalang (mahjub), termasuk cucu pengganti dan istri ganda.</li>
            <li>Kasus perceraian, anak lahir di luar pernikahan sah, dan anak angkat.</li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold mb-1">Yang belum dihitung</h3>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Hutang pewaris</strong> — belum otomatis dikurangkan dari harta.</li>
            <li><strong>Wasiat</strong> — termasuk wasiat khusus untuk anak angkat.</li>
            <li><strong>Perbedaan agama</strong> sebagai penghalang waris.</li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold mb-1">Sumber Hukum</h3>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Kitab Undang-Undang Hukum Islam (KHI)</strong>, bagian warisan:</li>
            <li className="ml-4">Pasal 171–173 — pengertian waris dan siapa saja ahli waris</li>
            <li className="ml-4">Pasal 174–184 — bagian masing-masing ahli waris</li>
            <li className="ml-4">Pasal 185–191 — sisa harta dan keadaan khusus</li>
            <li className="ml-4">Pasal 192–194 — ahli waris yang terhalang</li>
            <li><strong>Undang-Undang No. 3 Tahun 2006</strong> — perubahan atas UU Peradilan Agama yang terkait waris.</li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold mb-1">Penting dibaca</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-500">
            <li>
              Hasil ini <strong>bukan pengganti nasihat ahli hukum atau ulama</strong>.
              Angka yang dihasilkan hanya perkiraan berdasarkan peraturan KHI.
            </li>
            <li>
              Setiap kasus bisa memiliki keadaan lain yang belum dihitung oleh alat
              ini (seperti wasiat, hutang, atau harta bersama suami-istri).
            </li>
            <li>
              Sebaiknya hasil perhitungan dicek ulang oleh pihak yang berwenang
              sebelum dijadikan dasar keputusan.
            </li>
          </ul>
        </section>
      </div>
    </Modal>
  )
}