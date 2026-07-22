import { create } from 'zustand'
import { supabase } from '../services/supabase'

interface CompanyConfig {
  company_name: string
  devise: string
  logo_url: string
  adresse: string
  telephone: string
  email: string
  rccm: string
  conditions: string
  footer_text: string
  default_tva: number
  slogan: string
  primary_color: string
  currency: string
}

interface CompanyState {
  current: CompanyConfig | null
  liste: any[]
  companyName: string
  loading: boolean
  load: () => Promise<void>
  setCurrent: (e: any) => void
  setListe: (l: any[]) => void
  setCompanyName: (name: string) => void
  clear: () => void
}

const defaults: CompanyConfig = {
  company_name: 'Gnabo Multi-Services',
  devise: 'FG',
  logo_url: '',
  adresse: '',
  telephone: '',
  email: '',
  rccm: '',
  conditions: '',
  footer_text: '',
  default_tva: 0,
  slogan: '',
  primary_color: '#1e3a5f',
  currency: 'FG',
}

export const useEntrepriseStore = create<CompanyState>()((set) => ({
  current: null,
  liste: [],
  companyName: '',
  loading: false,
  load: async () => {
    set({ loading: true })
    try {
      const { data: rows } = await supabase.from('parametres').select('cle, valeur')
      const config: CompanyConfig = { ...defaults }
      if (rows) {
        for (const row of rows) {
          if (row.cle === 'entreprise_nom') config.company_name = row.valeur
          else if (row.cle === 'devise') { config.devise = row.valeur; config.currency = row.valeur }
          else if (row.cle === 'adresse') config.adresse = row.valeur
          else if (row.cle === 'telephone') config.telephone = row.valeur
          else if (row.cle === 'email') config.email = row.valeur
          else if (row.cle === 'rccm') config.rccm = row.valeur
          else if (row.cle === 'conditions_devis') config.conditions = row.valeur
          else if (row.cle === 'pied_page') config.footer_text = row.valeur
          else if (row.cle === 'logo_url') config.logo_url = row.valeur
          else if (row.cle === 'slogan') config.slogan = row.valeur
          else if (row.cle === 'primary_color') config.primary_color = row.valeur
          else if (row.cle === 'default_tva') config.default_tva = parseFloat(row.valeur) || 0
        }
      }
      set({ current: config, companyName: config.company_name, loading: false })
    } catch { set({ loading: false }) }
  },
  setCurrent: (e) => { localStorage.setItem('entrepriseId', 'main'); set({ current: e, companyName: e.company_name || '' }) },
  setListe: (l) => set({ liste: l }),
  setCompanyName: (name) => set({ companyName: name }),
  clear: () => { localStorage.removeItem('entrepriseId'); set({ current: null, companyName: '' }) },
}))
