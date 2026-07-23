import jsPDF from 'jspdf'
import QRCode from 'qrcode'
import type { Settings } from '../types'

const C = {
  navy: '#0F172A',
  accent: '#2563EB',
  white: '#FFFFFF',
  border: '#E2E8F0',
  text: '#334155',
  textLight: '#64748B',
  textVeryLight: '#94A3B8',
  success: '#059669',
  warning: '#D97706',
  danger: '#DC2626',
  grayRow: '#F1F5F9',
}

const PAGE_W = 210, PAGE_H = 297, M = 20, CW = PAGE_W - 2 * M
const FONT = 'helvetica', LH = 3.5

function fmt(n: number): string {
  const fixed = n.toFixed(0)
  return fixed.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

function fillRoundRect(doc: jsPDF, x: number, y: number, w: number, h: number, r: number, color: string) {
  doc.setFillColor(color)
  doc.roundedRect(x, y, w, h, r, r, 'F')
}

function currency(s: Settings): string { return s.currency || '' }

async function drawHeader(doc: jsPDF, settings: Settings, title: string, numero: string, statut: string, y: number): Promise<number> {
  const accent = settings.service_color || C.accent
  doc.setFillColor(accent)
  doc.rect(0, 0, PAGE_W, 3, 'F')

  let logoW = 0
  if (settings.logo_url) {
    try {
      const img = new Image()
      img.src = settings.logo_url
      await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = () => reject() })
      const maxH = 18, aspect = img.width / img.height, logoH = Math.min(maxH, 38 / aspect)
      logoW = logoH * aspect
      doc.addImage(img, 'PNG', M, y + 1, Math.min(logoW, 38), logoH)
    } catch { /* skip */ }
  }

  const compX = M + (logoW > 0 ? Math.min(logoW, 38) + 8 : 0)
  doc.setFont(FONT, 'bold'); doc.setFontSize(15); doc.setTextColor(C.navy)
  doc.text(settings.company_name || '', compX, y + 6)

  if (settings.service_name) {
    doc.setFont(FONT, 'normal'); doc.setFontSize(8); doc.setTextColor(accent)
    doc.text(`Service ${settings.service_name}`, compX, y + 11)
  }

  doc.setFont(FONT, 'normal'); doc.setFontSize(7); doc.setTextColor(C.textLight)
  let cy = y + (settings.service_name ? 15.5 : 11)
  if (settings.address) { doc.text(settings.address, compX, cy); cy += LH + 0.5 }
  if (settings.phone) { doc.text(`Tél: ${settings.phone}`, compX, cy); cy += LH + 0.5 }
  if (settings.email) { doc.text(settings.email, compX, cy); cy += LH + 0.5 }

  const cardW = 70, cardX = PAGE_W - M - cardW, cardH = 28
  doc.setFillColor(C.white); doc.setDrawColor(C.border); doc.setLineWidth(0.3)
  doc.roundedRect(cardX, y, cardW, cardH, 4, 4, 'FD')
  doc.setFillColor(accent); doc.rect(cardX, y, cardW, 2.5, 'F')

  try {
    const qrData = await QRCode.toDataURL(numero, { width: 80, margin: 0, color: { dark: C.navy, light: '#FFFFFF' } })
    doc.addImage(qrData, 'PNG', cardX + 6, y + 5, 10, 10)
  } catch { /* skip */ }

  doc.setFont(FONT, 'bold'); doc.setFontSize(13); doc.setTextColor(C.navy)
  doc.text(title, cardX + 20, y + 11)
  doc.setFont(FONT, 'normal'); doc.setFontSize(7); doc.setTextColor(C.textLight)
  doc.text(`N° ${numero}`, cardX + 20, y + 17)

  const dateStr = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' })
  doc.text(dateStr, cardX + 20, y + 21)
  doc.setFont(FONT, 'bold'); doc.setFontSize(5.5); doc.setTextColor(statut === 'payee' || statut === 'accepté' ? C.success : statut === 'refusé' || statut === 'annulee' ? C.danger : C.warning)

  const sepY = y + 33
  doc.setDrawColor(C.border); doc.setLineWidth(0.3)
  doc.line(M, sepY, PAGE_W - M, sepY)
  return sepY + 5
}

function drawClientInfo(doc: jsPDF, client: { nom?: string; tel?: string; marque?: string; modele?: string; qr_code?: string }, y: number): number {
  fillRoundRect(doc, M, y, CW, 18, 4, C.grayRow)
  doc.setFont(FONT, 'bold'); doc.setFontSize(8); doc.setTextColor(C.text)
  doc.text('CLIENT', M + 4, y + 5)

  doc.setFont(FONT, 'normal'); doc.setFontSize(7); doc.setTextColor(C.textLight)
  const left = [`Nom: ${client.nom || '-'}`, `Tél: ${client.tel || '-'}`]
  const right = [`Appareil: ${client.marque || ''} ${client.modele || ''}`, `QR: ${client.qr_code || '-'}`]
  left.forEach((t, i) => doc.text(t, M + 4, y + 9.5 + i * LH))
  right.forEach((t, i) => doc.text(t, M + CW / 2 + 4, y + 9.5 + i * LH))
  return y + 22
}

function drawTable(doc: jsPDF, lines: any[], y: number, tvaPct: number = 0, totalTtcVal?: number): number {
  const cols = [
    { x: M, w: CW * 0.45, align: 'left' as const },
    { x: M + CW * 0.45, w: CW * 0.1, align: 'center' as const },
    { x: M + CW * 0.55, w: CW * 0.22, align: 'right' as const },
    { x: M + CW * 0.77, w: CW * 0.23, align: 'right' as const },
  ]
  const rowH = 6.5, headerH = 6
  const headers = ['Désignation', 'Qté', 'Prix unit.', 'Total']

  fillRoundRect(doc, M, y, CW, headerH, 3, C.navy)
  doc.setFont(FONT, 'bold'); doc.setFontSize(6.5); doc.setTextColor(C.white)
  headers.forEach((h, i) => doc.text(h, cols[i].x + 3, y + 4.2))

  let yy = y + headerH + 1.5
  for (let idx = 0; idx < lines.length; idx++) {
    const l = lines[idx]
    if (yy + rowH > PAGE_H - 20) { doc.addPage(); yy = M }
    if (idx % 2 === 0) fillRoundRect(doc, M, yy - 1.5, CW, rowH, 2, C.grayRow)

    doc.setFont(FONT, 'normal'); doc.setFontSize(7); doc.setTextColor(C.text)
    doc.text(l.designation || '-', cols[0].x + 3, yy + 2, { maxWidth: cols[0].w - 6 })
    doc.text(String(l.quantite || 1), cols[1].x + cols[1].w / 2, yy + 2, { align: 'center' })
    doc.text(`${fmt(parseFloat(l.prix_unitaire) || 0)}`, cols[2].x + 2, yy + 2, { align: 'right' })
    doc.setFont(FONT, 'bold')
    doc.text(`${fmt(l.total || 0)}`, cols[3].x + 2, yy + 2, { align: 'right' })
    yy += rowH
  }

  // Totals
  const totalHt = lines.reduce((s: number, l: any) => s + (l.total || 0), 0)
  yy += 3
  const totalX = M + CW * 0.45
  const totalW = CW * 0.55

  const rows = [
    { label: 'Total HT', value: totalHt, bold: false, border: false },
    { label: 'TVA', value: totalHt * (tvaPct / 100), bold: false, border: false },
    { label: 'Total TTC', value: totalTtcVal ?? totalHt * (1 + tvaPct / 100), bold: true, border: true },
  ]

  rows.forEach(r => {
    doc.setFont(FONT, r.bold ? 'bold' : 'normal'); doc.setFontSize(r.bold ? 8 : 7); doc.setTextColor(C.text)
    doc.text(r.label, totalX + 4, yy + 2)
    doc.text(`${fmt(r.value)}`, totalX + totalW - 4, yy + 2, { align: 'right' })
    if (r.border) {
      doc.setDrawColor(C.border); doc.setLineWidth(0.5)
      doc.line(totalX, yy + 6, totalX + totalW, yy + 6)
    }
    yy += r.bold ? 7 : 5.5
  })

  return yy + 5
}

function drawFooter(doc: jsPDF, notes: string, y: number, settings: Settings) {
  if (notes) {
    doc.setFont(FONT, 'bold'); doc.setFontSize(7); doc.setTextColor(C.text)
    doc.text('Notes:', M, y + 6)
    doc.setFont(FONT, 'normal'); doc.setFontSize(6.5); doc.setTextColor(C.textLight)
    doc.text(notes, M, y + 11, { maxWidth: CW })

    y += 20
  }

  // Footer bar
  const accent = C.accent
  doc.setFillColor(accent)
  doc.rect(0, PAGE_H - 8, PAGE_W, 8, 'F')
  doc.setFont(FONT, 'normal'); doc.setFontSize(6); doc.setTextColor(C.white)
  doc.text(`${settings.company_name || ''} — Document généré automatiquement`, PAGE_W / 2, PAGE_H - 3, { align: 'center' })
}

export async function generateDevisElectroniquePdf(devis: any, settings: Settings): Promise<Blob> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  let y = await drawHeader(doc, settings, 'DEVIS', devis.numero, devis.statut, 10)
  y = drawClientInfo(doc, { nom: devis.client_nom, tel: devis.client_telephone, marque: devis.marque, modele: devis.modele, qr_code: devis.qr_code }, y)
  const lignes = typeof devis.lignes === 'string' ? JSON.parse(devis.lignes) : (devis.lignes || [])
  y = drawTable(doc, lignes, y, devis.tva || 0, devis.montant_ttc)
  drawFooter(doc, devis.notes || '', y, settings)
  return doc.output('blob')
}

export async function generateFactureElectroniquePdf(facture: any, settings: Settings): Promise<Blob> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  let y = await drawHeader(doc, settings, 'FACTURE', facture.numero, facture.statut, 10)
  y = drawClientInfo(doc, { nom: facture.client_nom, tel: facture.client_telephone, marque: facture.marque, modele: facture.modele, qr_code: facture.qr_code }, y)
  const lignes = typeof facture.lignes === 'string' ? JSON.parse(facture.lignes) : (facture.lignes || [])
  y = drawTable(doc, lignes, y, facture.tva || 0, facture.montant_ttc)

  // Payment summary
  if (facture.paiements && facture.paiements.length > 0) {
    y += 5
    fillRoundRect(doc, M + CW * 0.45, y, CW * 0.55, 16, 4, C.grayRow)
    doc.setFont(FONT, 'bold'); doc.setFontSize(8); doc.setTextColor(C.text)
    doc.text('Paiements', M + CW * 0.45 + 4, y + 5)
    doc.setFont(FONT, 'normal'); doc.setFontSize(7); doc.setTextColor(C.textLight)
    doc.text(`Total payé: ${fmt(facture.total_paye || 0)} ${currency(settings)}`, M + CW * 0.45 + 4, y + 10)
    if ((facture.reste || 0) > 0) {
      doc.setFont(FONT, 'bold'); doc.setTextColor(C.danger)
      doc.text(`Reste dû: ${fmt(facture.reste || 0)} ${currency(settings)}`, M + CW * 0.45 + 4, y + 14)
    }
  }

  drawFooter(doc, facture.notes || '', y, settings)
  return doc.output('blob')
}

export async function generateRecuPdf(paiement: any, settings: Settings): Promise<Blob> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  let y = await drawHeader(doc, settings, 'REÇU DE PAIEMENT', paiement.id?.slice(0, 8) || '', 'payé', 10)

  fillRoundRect(doc, M, y, CW, 24, 4, C.grayRow)
  doc.setFont(FONT, 'bold'); doc.setFontSize(9); doc.setTextColor(C.success)
  doc.text('PAIEMENT REÇU', PAGE_W / 2, y + 6, { align: 'center' })

  const details = [
    { label: 'Montant', value: `${fmt(paiement.montant)} ${currency(settings)}` },
    { label: 'Type', value: paiement.type || 'Total' },
    { label: 'Méthode', value: paiement.methode || '-' },
    { label: 'Référence', value: paiement.reference || '-' },
    { label: 'Date', value: new Date(paiement.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) },
  ]

  doc.setFont(FONT, 'normal'); doc.setFontSize(7); doc.setTextColor(C.text)
  details.forEach((d, i) => {
    doc.text(d.label, M + 6, y + 12 + i * LH)
    doc.text(d.value, M + CW - 6, y + 12 + i * LH, { align: 'right' })
  })

  drawFooter(doc, '', y + 12 + details.length * LH + 5, settings)
  return doc.output('blob')
}
