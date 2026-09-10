import { useFamilyStore } from '../store/family-store'
import { useAssetStore } from '../store/asset-store'
import { useSimulationStore } from '../store/simulation-store'
import { useCanvasStore } from '../store/canvas-store'
import { saveAllData } from './sync'

type BackupPayload = {
  version: 1
  exportedAt: string
  data: {
    anggota: unknown
    hubunganHorizontal: unknown
    hubunganVertical: unknown
    harta: unknown
    pemilikHarta: unknown
    pewarisId: unknown
    tanggalWarisan: unknown
    nodePositions: unknown
    zoom: unknown
    panX: unknown
    panY: unknown
  }
}

const REQUIRED_ARRAYS = ['anggota', 'hubunganHorizontal', 'hubunganVertical', 'harta', 'pemilikHarta']

export function exportToFile() {
  const family = useFamilyStore.getState()
  const asset = useAssetStore.getState()
  const sim = useSimulationStore.getState()
  const canvas = useCanvasStore.getState()

  const payload: BackupPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      anggota: family.anggota,
      hubunganHorizontal: family.hubunganHorizontal,
      hubunganVertical: family.hubunganVertical,
      harta: asset.harta,
      pemilikHarta: asset.pemilikHarta,
      pewarisId: sim.pewarisId,
      tanggalWarisan: sim.tanggalWarisan,
      nodePositions: [...canvas.nodePositions.entries()].map(([id, p]) => ({ id, x: p.x, y: p.y })),
      zoom: canvas.zoom,
      panX: canvas.panX,
      panY: canvas.panY,
    },
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `pewaris-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export async function importFromFile(file: File): Promise<void> {
  const text = await file.text()

  let payload: BackupPayload
  try {
    payload = JSON.parse(text)
  } catch {
    throw new Error('File bukan JSON yang valid')
  }

  const data = payload.data as unknown as Record<string, unknown>
  if (!data || typeof data !== 'object') {
    throw new Error('Struktur file tidak valid: field "data" tidak ditemukan')
  }

  for (const key of REQUIRED_ARRAYS) {
    if (!Array.isArray(data[key])) {
      throw new Error(`Struktur file tidak valid: field "${key}" bukan array`)
    }
  }

  useFamilyStore.getState().loadState({
    anggota: data.anggota as never,
    hubunganHorizontal: data.hubunganHorizontal as never,
    hubunganVertical: data.hubunganVertical as never,
  })

  useAssetStore.getState().loadState({
    harta: data.harta as never,
    pemilikHarta: data.pemilikHarta as never,
  })

  useSimulationStore.setState({
    pewarisId: typeof data.pewarisId === 'string' ? data.pewarisId : null,
    tanggalWarisan:
      typeof data.tanggalWarisan === 'string'
        ? data.tanggalWarisan
        : new Date().toISOString().split('T')[0],
    result: null,
  })

  useCanvasStore.setState({
    nodePositions: new Map(
      Array.isArray(data.nodePositions)
        ? data.nodePositions.map((p: { id: string; x: number; y: number }) => [p.id, { x: p.x, y: p.y }])
        : []
    ),
    zoom: typeof data.zoom === 'number' ? data.zoom : 1,
    panX: typeof data.panX === 'number' ? data.panX : 0,
    panY: typeof data.panY === 'number' ? data.panY : 0,
    selectedIds: [],
  })

  await saveAllData({
    anggota: useFamilyStore.getState().anggota,
    hubunganHorizontal: useFamilyStore.getState().hubunganHorizontal,
    hubunganVertical: useFamilyStore.getState().hubunganVertical,
    harta: useAssetStore.getState().harta,
    pemilikHarta: useAssetStore.getState().pemilikHarta,
  })
}