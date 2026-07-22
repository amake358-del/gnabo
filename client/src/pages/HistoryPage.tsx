import { useEffect, useState } from 'react'
import { Card } from '../components/ui/Card'
import { Table } from '../components/ui/Table'
import { supabase } from '../services/supabase'
import { formatDateTime } from '../utils/format'

interface AuditEntry {
  id: number
  action: string
  details?: string
  cree_le: string
}

export function HistoryPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from('audit_log')
          .select('*')
          .order('cree_le', { ascending: false })
          .limit(200)
        setLogs(data ?? [])
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    })()
  }, [])

  const columns = [
    { key: 'action', label: 'Action' },
    { key: 'details', label: 'Détails', render: (l: AuditEntry) => l.details || '-' },
    { key: 'cree_le', label: 'Date', render: (l: AuditEntry) => formatDateTime(l.cree_le) },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Historique des actions</h1>
      <Card>
        <Table columns={columns} data={logs} loading={loading} emptyMessage="Aucune action enregistrée" />
      </Card>
    </div>
  )
}