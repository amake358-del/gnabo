import { dbRun } from '../db'

export function auditLog(params: {
  utilisateur_id?: number
  module: string
  action: string
  ancienne_valeur?: string | null
  nouvelle_valeur?: string | null
  adresse_ip?: string
}): void {
  dbRun(
    `INSERT INTO audit_log (utilisateur_id, module, action, ancienne_valeur, nouvelle_valeur, adresse_ip, cree_le)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
    [params.utilisateur_id ?? null, params.module, params.action, params.ancienne_valeur ?? null, params.nouvelle_valeur ?? null, params.adresse_ip ?? null]
  )
}
