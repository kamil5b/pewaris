export type SimulationContext = {
  pewarisId: string
  tanggalWarisan: string
}

export type BoardData = {
  anggota: import('./anggota').Anggota[]
  hubunganHorizontal: import('./hubungan-horizontal').HubunganHorizontal[]
  hubunganVertical: import('./hubungan-vertical').HubunganVertical[]
  harta: import('./harta').Harta[]
  pemilikHarta: import('./harta').PemilikHarta[]
}
