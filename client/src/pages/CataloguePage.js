import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Card } from '../components/ui/Card';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { supabase } from '../services/supabase';
import { toast } from '../utils/notify';
import { Plus, Package, Pencil, Trash2 } from 'lucide-react';
export function CataloguePage() {
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [name, setName] = useState('');
    const [saving, setSaving] = useState(false);
    const load = async () => {
        setLoading(true);
        try {
            const { data } = await supabase.from('catalog_types').select('*');
            setTypes(data ?? []);
        }
        catch (err) {
            toast(err.message || 'Erreur chargement', 'error');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => { load(); }, []);
    const openCreate = () => { setEditing(null); setName(''); setModalOpen(true); };
    const openEdit = (t) => { setEditing(t); setName(t.name); setModalOpen(true); };
    const handleSave = async () => {
        if (!name.trim())
            return;
        setSaving(true);
        try {
            if (editing)
                await supabase.from('catalog_types').update({ name: name.trim() }).eq('id', editing.id);
            else
                await supabase.from('catalog_types').insert({ name: name.trim() });
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
            await supabase.from('catalog_types').delete().eq('id', deleteId);
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
    if (loading)
        return _jsx("div", { className: "flex justify-center py-20", children: _jsx(LoadingSpinner, { size: 40 }) });
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h1", { className: "text-2xl font-bold", children: "Catalogue" }), _jsxs(Button, { onClick: openCreate, children: [_jsx(Plus, { size: 16 }), _jsx("span", { className: "hidden lg:inline", children: "Nouveau type" })] })] }), types.length === 0 ? (_jsx(Card, { children: _jsxs("div", { className: "text-center py-12 text-gray-500", children: [_jsx(Package, { size: 48, className: "mx-auto mb-4 opacity-50" }), _jsx("p", { children: "Aucun type de catalogue" })] }) })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: types.map(t => (_jsx(Card, { children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-lg", children: t.name }), _jsxs("p", { className: "text-sm text-gray-500", children: ["Cr\u00E9\u00E9 le ", new Date(t.created_at).toLocaleDateString('fr-FR')] })] }), _jsxs("div", { className: "flex gap-1", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => openEdit(t), children: _jsx(Pencil, { size: 14 }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => setDeleteId(t.id), children: _jsx(Trash2, { size: 14, className: "text-red-500" }) })] })] }) }, t.id))) })), _jsxs(Modal, { open: modalOpen, onClose: () => setModalOpen(false), title: editing ? 'Modifier le type' : 'Nouveau type', children: [_jsx(Input, { label: "Nom du type", value: name, onChange: e => setName(e.target.value), placeholder: "Ex: Aluminium, Vitrerie..." }), _jsxs("div", { className: "flex justify-end gap-3 pt-4", children: [_jsx(Button, { variant: "secondary", onClick: () => setModalOpen(false), children: "Annuler" }), _jsx(Button, { onClick: handleSave, loading: saving, children: editing ? 'Modifier' : 'Créer' })] })] }), _jsx(ConfirmDialog, { open: !!deleteId, onClose: () => setDeleteId(null), onConfirm: handleDelete, title: "Supprimer ce type ?", message: "Cette action est irr\u00E9versible si des mod\u00E8les ou devis y sont li\u00E9s.", loading: saving })] }));
}
