import Dexie from 'dexie';
const localDb = new Dexie('gnabo-offline');
localDb.version(1).stores({
    devis_brouillons: '++id, client_id, statut, synced',
    clients: '++id, nom, synced',
});
export async function syncOfflineData() {
    const pending = await localDb.table('devis_brouillons')
        .where('synced').equals(0)
        .toArray();
    const { supabase } = await import('./supabase');
    for (const item of pending) {
        const { data, error } = await supabase
            .from('devis')
            .insert({
            client_id: item.client_id,
            service: item.service,
            montant_ht: item.montant_ht,
            tva: item.tva,
            montant_ttc: item.montant_ttc,
            notes: item.notes,
            statut: item.statut,
        })
            .select('id')
            .single();
        if (!error && data) {
            await localDb.table('devis_brouillons').update(item.id, { synced: 1 });
        }
    }
}
export default localDb;
