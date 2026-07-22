import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Table } from '../components/ui/Table';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { supabase } from '../services/supabase';
import { formatDate } from '../utils/format';
import { toast } from '../utils/notify';
import { Trash2, ExternalLink } from 'lucide-react';
export function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState(null);
    const [saving, setSaving] = useState(false);
    const load = async () => {
        setLoading(true);
        try {
            const { data } = await supabase.from('profiles').select('*').order('cree_le', { ascending: false });
            setUsers(data ?? []);
        }
        catch (err) {
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => { load(); }, []);
    const handleDelete = async () => {
        if (!deleteId)
            return;
        setSaving(true);
        try {
            const { error } = await supabase.from('profiles').delete().eq('id', deleteId);
            if (error)
                throw error;
            setDeleteId(null);
            load();
        }
        catch (err) {
            toast(err.message, 'error');
        }
        finally {
            setSaving(false);
        }
    };
    const columns = [
        { key: 'nom', label: 'Nom' },
        { key: 'role', label: 'Rôle' },
        { key: 'cree_le', label: 'Créé le', render: (u) => formatDate(u.cree_le) },
        { key: 'actions', label: '', hideLabel: true, render: (u) => (_jsx("div", { className: "flex justify-end", onClick: e => e.stopPropagation(), children: _jsx(Button, { variant: "ghost", size: "sm", onClick: () => setDeleteId(u.id), children: _jsx(Trash2, { size: 14, className: "text-red-500" }) }) })), className: 'w-20' }
    ];
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h1", { className: "text-2xl font-bold", children: "Utilisateurs" }), _jsxs(Button, { onClick: () => window.open('https://supabase.com/project/nurtpoplxxpvxifwoynm/auth/users', '_blank'), children: [_jsx(ExternalLink, { size: 16 }), _jsx("span", { className: "hidden lg:inline", children: "G\u00E9rer dans Supabase" })] })] }), _jsx(Card, { children: _jsx(Table, { columns: columns, data: users, loading: loading, emptyMessage: "Aucun utilisateur" }) }), _jsx(ConfirmDialog, { open: !!deleteId, onClose: () => setDeleteId(null), onConfirm: handleDelete, title: "Supprimer l'utilisateur ?", message: "Cette action est irr\u00E9versible.", loading: saving })] }));
}
