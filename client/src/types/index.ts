export interface Entreprise {
  id: string
  name: string
  slug: string
  logo_url: string
  address: string
  phone: string
  email: string
  signature_url: string
  cachet_url: string
  default_tva: number
  conditions: string
  footer_text: string
  primary_color: string
  icon: string
  description: string
  service_order: number
  created_at: string
  updated_at: string
}

export interface EntrepriseBrief {
  id: string
  name: string
  slug: string
  logo_url: string
  primary_color: string
  icon: string
  description: string
  service_order: number
}

export interface CompanyConfig {
  id?: string
  company_name: string
  slogan: string
  description: string
  rccm: string
  nif: string
  address: string
  city: string
  country: string
  phone: string
  phone2: string
  email: string
  website: string
  logo_url: string
  favicon_url: string
  signature_url: string
  cachet_url: string
  signatory_name: string
  signatory_title: string
  default_tva: number
  currency: string
  date_format: string
  primary_color: string
  secondary_color: string
  conditions: string
  footer_text: string
}

export interface QrCode {
  qr_code: string
  contenu: string
  uid_visible: string
}

export interface Appareil {
  id: string
  uid_interne: string
  uid_visible: string
  client_id: number
  client_nom?: string
  client_telephone?: string
  client_adresse?: string
  type: string
  type_appareil?: string
  marque: string
  modele: string
  numero_serie: string
  code_imei: string
  mot_de_passe: string
  accessoires: string
  description_defaut: string
  panne_declaree?: string
  observations?: string
  qr_code?: string
  date_reception?: string
  etat_esthetique: string
  statut: string
  QR_code_genere: number
  etiquette_genere: number
  photos: string
  cree_le: string
  modifie_le: string
}

export interface Diagnostic {
  id: string
  appareil_id: string
  diagnostic: string
  cause: string
  tests: string
  pieces_necessaires: string
  main_oeuvre: number
  temps_estime: number
  observations: string
  photos: string
  created_at: string
}

export interface Reparation {
  id: string
  appareil_id: string
  diagnostic_id: string | null
  statut: string
  pieces_utilisees: string
  main_oeuvre: number
  temps_passe: number
  notes: string
  created_at: string
  updated_at: string
}

export interface DevisElectronique {
  id: string
  service_id: string
  appareil_id: string
  numero: string
  lignes: string
  total_ht: number
  tva: number
  total_ttc: number
  statut: string
  validite: number
  notes: string
  created_at: string
  updated_at: string
}

export interface FactureElectronique {
  id: string
  service_id: string
  appareil_id: string
  devis_id: string | null
  numero: string
  lignes: string
  total_ht: number
  tva: number
  total_ttc: number
  statut: string
  date_echeance: string | null
  notes: string
  created_at: string
  updated_at: string
}

export interface PaiementElectronique {
  id: string
  service_id: string
  facture_id: string | null
  appareil_id: string
  montant: number
  type: string
  methode: string
  reference: string
  date_paiement: string
  created_at: string
}

export interface Client {
  id: string
  nom: string
  prenom?: string
  company?: string
  email?: string
  telephone?: string
  telephone2?: string
  adresse?: string
  ville?: string
  code_postal?: string
  notes?: string
  cree_le?: string
  modifie_le?: string
  devis_count?: number
}

export interface CatalogType {
  id: string
  entreprise_id: string
  name: string
  created_at: string
}

export interface Modele {
  id: string
  entreprise_id: string
  type_id: string
  name: string
  prix: number
  description: string
  status: string
  type_name?: string
  created_at: string
  updated_at: string
}

export interface DevisLine {
  id?: string
  designation: string
  quantite: number
  largeur: number
  hauteur: number
  surface: number
  prix_m2: number
  total: number
  sort_order: number
}

export interface Devis {
  id: string
  entreprise_id?: string
  numero: string
  client_id: string
  type_id: string
  modele_id: string
  modele_name?: string
  statut: 'brouillon' | 'envoye' | 'accepte' | 'refuse' | 'expire'
  total_ht: number
  remise: number
  transport: number
  pose: number
  tva: number
  total_ttc: number
  acompte: number
  reste: number
  notes: string
  created_at: string
  updated_at: string
  client?: Client
  client_company?: string
  client_nom?: string
  lines?: DevisLine[]
  type_name?: string
}

export type Settings = CompanyConfig & {
  [key: string]: any
}

export interface ActionLog {
  id: string
  entreprise_id: string
  user_id: string
  action: string
  details: string
  created_at: string
}

export interface DashboardStats {
  devis_count: number
  total_ca: number
  devis_par_mois: { mois: string; count: number; total: number }[]
  devis_recents: Devis[]
  devis_par_statut: { statut: string; count: number }[]
  appareils_count: number
  appareils_par_statut: { statut: string; count: number }[]
  factures_electronique_count: number
  factures_electronique_total: number
  paiements_electronique_total: number
  ca_par_service: { service_name: string; slug: string; devis_count: number; ca_devis: number; ca_factures: number; appareils_count: number }[]
  revenu_mensuel: { mois: string; ca_devis: number; ca_factures: number; total: number }[]
  activite_recente: { type: string; id: string; ref: string; statut: string; total_ttc: number; created_at: string; service_name: string }[]
}

export interface Backup {
  filename: string
  size: number
  created_at: string
}

export interface User {
  id: string
  entreprise_id: string
  username: string
  role: string
  created_at: string
}

export interface CaisseEntry {
  id: string
  type: 'encaissement' | 'depense'
  categorie: string
  montant: number
  description: string
  mode_paiement: string
  utilisateur_id: number
  utilisateur_nom?: string
  cree_le: string
}

export interface StockCategory {
  id: string
  nom: string
  service: string
}

export interface StockArticle {
  id: string
  categorie_id: number
  categorie_nom?: string
  nom: string
  reference: string
  quantite: number
  seuil_alerte: number
  prix_unitaire: number
  fournisseur: string
  cree_le: string
  modifie_le: string
}

export interface StockMovement {
  id: string
  article_id: number
  article_nom?: string
  type: 'entree' | 'sortie'
  quantite: number
  reference: string
  notes: string
  utilisateur_id?: number
  cree_le: string
}

export interface Intervention {
  id: string
  devis_id?: number
  client_id: number
  client_nom?: string
  client_telephone?: string
  client_adresse?: string
  devis_numero?: string
  service: string
  technicien: string
  equipe: string
  date_prevue: string
  heure_prevue: string
  adresse_intervention: string
  statut: 'planifiee' | 'en_cours' | 'terminee' | 'annulee'
  photos_avant: string
  photos_apres: string
  compte_rendu: string
  signature_client: string
  cree_le: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
