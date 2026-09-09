import { useFamilyStore } from '../store/family-store'
import { useAssetStore } from '../store/asset-store'

type ExportData = {
  version: 1
  exportedAt: string
  anggota: import('../domain/anggota').Anggota[]
  hubunganHorizontal: import('../domain/hubungan-horizontal').HubunganHorizontal[]
  hubunganVertical: import('../domain/hubungan-vertical').HubunganVertical[]
  harta: import('../domain/harta').Harta[]
  pemilikHarta: import('../domain/harta').PemilikHarta[]
}

export function exportData(): Promise<Blob> {
  const familyState = useFamilyStore.getState()
  const assetState = useAssetStore.getState()

  const data: ExportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    anggota: familyState.anggota,
    hubunganHorizontal: familyState.hubunganHorizontal,
    hubunganVertical: familyState.hubunganVertical,
    harta: assetState.harta,
    pemilikHarta: assetState.pemilikHarta,
  }

  const json = JSON.stringify(data, null, 2)
  return Promise.resolve(new Blob([json], { type: 'application/json' }))
}

export async function importData(file: File): Promise<void> {
  const text = await file.text()
  const data = JSON.parse(text) as ExportData

  if (data.version !== 1) {
    throw new Error('Unsupported export version')
  }

  useFamilyStore.getState().loadState({
    anggota: data.anggota,
    hubunganHorizontal: data.hubunganHorizontal,
    hubunganVertical: data.hubunganVertical,
  })

  useAssetStore.getState().loadState({
    harta: data.harta,
    pemilikHarta: data.pemilikHarta,
  })
}
