import { request } from './api-client'

const API = 'http://localhost:3001/api/v1'

export async function seedTestData(entrepriseId: string) {
  try {
    const client = await createClient(entrepriseId, {
      company: 'Société Test',
      nom: 'Jean Dupont',
      email: 'jean@test.fr',
      telephone: '0612345678',
      adresse: '123 Rue de Paris, 75001 Paris',
    })

    const typePorte = await createType(entrepriseId, 'Portes')
    const typeFenetre = await createType(entrepriseId, 'Fenêtres')

    const modelePorte = await createModele(entrepriseId, typePorte.id, {
      name: 'Porte Aluminium Standard',
      prix: 450,
      description: 'Porte aluminium standard 215x90cm',
    })
    const modeleFenetre = await createModele(entrepriseId, typeFenetre.id, {
      name: 'Fenêtre Coulissante',
      prix: 350,
      description: 'Fenêtre aluminium coulissante 2 vantaux',
    })

    const devis = await createDevis(entrepriseId, client.id, typePorte.id, modelePorte.id, [
      { designation: 'Porte Aluminium Standard', quantite: 2, largeur: 90, hauteur: 215, prix_m2: 450 },
      { designation: 'Poignée Design', quantite: 2, largeur: 0, hauteur: 0, prix_m2: 0 },
    ])

    return { client, typePorte, typeFenetre, modelePorte, modeleFenetre, devis }
  } catch (err) {
    console.warn('Seed data creation failed (may already exist):', err)
    return null
  }
}

export async function cleanupTestData(entrepriseId: string) {
  try {
    const devis = await request<any[]>('GET', `${API}/devis?limit=500`, {})
    for (const d of devis.data || []) {
      try { await request('DELETE', `${API}/devis/${d.id}`, {}) } catch {}
    }
  } catch {}
}

async function createClient(entrepriseId: string, data: any) {
  const res = await request<any>('POST', `${API}/clients`, {}, JSON.stringify(data))
  return res.data
}

async function createType(entrepriseId: string, name: string) {
  const res = await request<any>('POST', `${API}/catalog/types`, {}, JSON.stringify({ name }))
  return res.data
}

async function createModele(entrepriseId: string, typeId: string, data: any) {
  const res = await request<any>('POST', `${API}/catalog/modeles`, {}, JSON.stringify({ ...data, type_id: typeId }))
  return res.data
}

async function createDevis(entrepriseId: string, clientId: string, typeId: string, modeleId: string, lines: any[]) {
  const res = await request<any>('POST', `${API}/devis`, {}, JSON.stringify({
    client_id: clientId,
    type_id: typeId,
    modele_id: modeleId,
    lines,
    statut: 'brouillon',
  }))
  return res.data
}
