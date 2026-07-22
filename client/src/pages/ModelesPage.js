import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Table } from '../components/ui/Table';
import { Card } from '../components/ui/Card';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Badge } from '../components/ui/Badge';
import { supabase } from '../services/supabase';
import { formatCurrency } from '../utils/format';
import { toast } from '../utils/notify';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
const modeleSchema = z.object({
    type_id: z.string().min(1, 'Le type est requis'),
    name: z.string().min(1, 'Le nom est requis'),
    prix: z.coerce.number().min(0, 'Le prix doit être positif'),
    description: z.string().optional(),
    status: z.string().optional(),
});
export function ModelesPage() {
    const [modeles, setModeles] = useState([]);
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [saving, setSaving] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(modeleSchema) });
    const load = async () => {
        setLoading(true);
        try {
            let query = supabase.from('catalog_modeles').select('*, catalog_types(name)');
            if (filterType)
                query = query.eq('type_id', filterType);
            if (search)
                query = query.ilike('name', `%${search}%`);
            const [mRes, tRes] = await Promise.all([query, supabase.from('catalog_types').select('*')]);
            const mapped = (mRes.data ?? []).map((m) => ({
                ...m,
                type_name: m.catalog_types?.name ?? '',
            }));
            setModeles(mapped);
            setTypes(tRes.data ?? []);
        }
        catch (err) {
            toast(err.message || 'Erreur chargement', 'error');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => { load(); }, [search, filterType]);
    const openCreate = () => { setEditing(null); reset({ status: 'actif', prix: 0 }); setModalOpen(true); };
    const openEdit = (m) => { setEditing(m); reset(m); setModalOpen(true); };
    const onSubmit = async (data) => {
        setSaving(true);
        try {
            if (editing)
                await supabase.from('catalog_modeles').update(data).eq('id', editing.id);
            else
                await supabase.from('catalog_modeles').insert(data);
            setModalOpen(false);
            load();
        }
        catch (err) {
            toast(err.message, 'error');
        }
        finally {
            setSaving(false);
        }
    };
    const handleDelete = async () => {
        if (!deleteId)
            return;
        setSaving(true);
        try {
            await supabase.from('catalog_modeles').delete().eq('id', deleteId);
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
        { key: 'name', label: 'Modèle' },
        { key: 'type_name', label: 'Type' },
        { key: 'prix', label: 'Prix m²', render: (m) => formatCurrency(m.prix) },
        { key: 'status', label: 'Statut', render: (m) => _jsx(Badge, { variant: m.status === 'actif' ? 'green' : 'default', children: m.status }) },
        { key: 'actions', label: '', hideLabel: true, render: (m) => (_jsxs("div", { className: "flex gap-2 justify-end", onClick: e => e.stopPropagation(), children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => openEdit(m), children: _jsx(Pencil, { size: 14 }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => setDeleteId(m.id), children: _jsx(Trash2, { size: 14, className: "text-red-500" }) })] })), className: 'w-24' }
    ];
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h1", { className: "text-2xl font-bold", children: "Mod\u00E8les" }), _jsxs(Button, { onClick: openCreate, children: [_jsx(Plus, { size: 16 }), _jsx("span", { className: "hidden lg:inline", children: "Nouveau mod\u00E8le" })] })] }), _jsxs(Card, { children: [_jsxs("div", { className: "flex flex-col lg:flex-row items-start lg:items-center gap-3 mb-4", children: [_jsxs("div", { className: "relative w-full lg:flex-1 lg:max-w-sm", children: [_jsx(Search, { size: 18, className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" }), _jsx("input", { className: "input pl-10", placeholder: "Rechercher...", value: search, onChange: e => setSearch(e.target.value) })] }), _jsx(Select, { options: types.map(t => ({ value: t.id, label: t.name })), placeholder: "Tous les types", value: filterType, onChange: e => setFilterType(e.target.value), className: "w-full lg:max-w-[200px]" })] }), _jsx(Table, { columns: columns, data: modeles, loading: loading, emptyMessage: "Aucun mod\u00E8le trouv\u00E9" })] }), _jsx(Modal, { open: modalOpen, onClose: () => setModalOpen(false), title: editing ? 'Modifier le modèle' : 'Nouveau modèle', size: "lg", children: _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [_jsx(Select, { label: "Type *", options: types.map(t => ({ value: t.id, label: t.name })), placeholder: "S\u00E9lectionner un type", ...register('type_id'), error: errors.type_id?.message }), _jsx(Input, { label: "Nom *", ...register('name'), error: errors.name?.message }), _jsx(Input, { label: "Prix au m\u00B2 *", type: "number", step: "0.000001", ...register('prix'), error: errors.prix?.message }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Description" }), _jsx("textarea", { className: "input min-h-[80px] resize-none", ...register('description') })] }), _jsx(Select, { label: "Statut", options: [{ value: 'actif', label: 'Actif' }, { value: 'inactif', label: 'Inactif' }], ...register('status') }), _jsxs("div", { className: "flex justify-end gap-3 pt-2", children: [_jsx(Button, { variant: "secondary", type: "button", onClick: () => setModalOpen(false), children: "Annuler" }), _jsx(Button, { type: "submit", loading: saving, children: editing ? 'Modifier' : 'Créer' })] })] }) }), _jsx(ConfirmDialog, { open: !!deleteId, onClose: () => setDeleteId(null), onConfirm: handleDelete, title: "Supprimer ce mod\u00E8le ?", message: "Cette action est irr\u00E9versible.", loading: saving })] }));
}
