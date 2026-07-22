import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Table } from '../components/ui/Table';
import { supabase } from '../services/supabase';
import { formatDateTime } from '../utils/format';
export function HistoryPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        (async () => {
            try {
                const { data } = await supabase
                    .from('audit_log')
                    .select('*')
                    .order('cree_le', { ascending: false })
                    .limit(200);
                setLogs(data ?? []);
            }
            catch (err) {
                console.error(err);
            }
            finally {
                setLoading(false);
            }
        })();
    }, []);
    const columns = [
        { key: 'action', label: 'Action' },
        { key: 'details', label: 'Détails', render: (l) => l.details || '-' },
        { key: 'cree_le', label: 'Date', render: (l) => formatDateTime(l.cree_le) },
    ];
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("h1", { className: "text-2xl font-bold", children: "Historique des actions" }), _jsx(Card, { children: _jsx(Table, { columns: columns, data: logs, loading: loading, emptyMessage: "Aucune action enregistr\u00E9e" }) })] }));
}
