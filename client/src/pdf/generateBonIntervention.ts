import jsPDF from 'jspdf'
import type { Settings, Intervention } from '../types'
import { C, FONT, LH, M, CW, MAX_Y, ensureSpace, fillRoundRect, drawHeader, drawFooter, drawSignatureArea } from './pdfUtils'

interface BonInterventionData {
  intervention: Intervention
  client: { nom?: string; telephone?: string; adresse?: string }
  settings: Settings
  numero: string
}

function drawInterventionInfo(doc: jsPDF, intervention: Intervention, settings: Settings, y: number): number {
  const cardH = 38
  fillRoundRect(doc, M, y, CW, cardH, 6, C.lightBg)
  doc.setDrawColor(C.accent)
  doc.setLineWidth(1.8)
  doc.line(M, y, M, y + cardH)

  doc.setFont(FONT, 'bold')
  doc.setFontSize(6.5)
  doc.setTextColor(C.textVeryLight)
  doc.text('INTERVENTION', M + 12, y + 8)

  doc.setFont(FONT, 'normal')
  doc.setFontSize(7)
  doc.setTextColor(C.text)

  const rows = [
    { label: 'Service', value: settings.service_name || intervention.service || '-' },
    { label: 'Technicien', value: intervention.technicien || '-' },
    { label: 'Equipe', value: intervention.equipe || '-' },
    { label: 'Date prevue', value: intervention.date_prevue ? new Date(intervention.date_prevue).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' }) : '-' },
    { label: 'Heure prevue', value: intervention.heure_prevue || '-' },
    { label: 'Statut', value: intervention.statut || '-' },
  ]

  let cy = y + 13
  const leftCol = rows.slice(0, 3)
  const rightCol = rows.slice(3)

  leftCol.forEach(r => {
    doc.setFont(FONT, 'bold')
    doc.text(`${r.label} :`, M + 12, cy)
    doc.setFont(FONT, 'normal')
    doc.text(r.value, M + 30, cy)
    cy += LH + 2
  })

  cy = y + 13
  rightCol.forEach(r => {
    doc.setFont(FONT, 'bold')
    doc.text(`${r.label} :`, M + CW / 2, cy)
    doc.setFont(FONT, 'normal')
    doc.text(r.value, M + CW / 2 + 25, cy)
    cy += LH + 2
  })

  return y + cardH + 6
}

function drawAdresseChantier(doc: jsPDF, intervention: Intervention, y: number): number {
  const cardH = 18
  fillRoundRect(doc, M, y, CW, cardH, 6, C.grayRow)

  doc.setFont(FONT, 'bold')
  doc.setFontSize(6.5)
  doc.setTextColor(C.textVeryLight)
  doc.text('ADRESSE CHANTIER', M + 12, y + 6)

  doc.setFont(FONT, 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(C.text)
  const addr = intervention.adresse_intervention || intervention.client_adresse || '-'
  doc.text(addr, M + 12, y + 13)

  return y + cardH + 6
}

function drawDescriptionTravaux(doc: jsPDF, intervention: Intervention, y: number): number {
  y = ensureSpace(doc, y, 40)

  doc.setDrawColor(C.border)
  doc.setLineWidth(0.3)
  doc.line(M, y, M + CW, y)
  y += 6

  doc.setFont(FONT, 'bold')
  doc.setFontSize(6.5)
  doc.setTextColor(C.textVeryLight)
  doc.text('DESCRIPTION DES TRAVAUX', M, y + 2.5)
  y += 7

  doc.setFont(FONT, 'normal')
  doc.setFontSize(7)
  doc.setTextColor(C.textLight)
  const desc = intervention.compte_rendu || 'Aucune description'
  const wrapped = doc.splitTextToSize(desc, CW)
  doc.text(wrapped, M, y + 2)
  y += wrapped.length * LH + 6

  return y
}

async function drawPhotos(doc: jsPDF, photos: string, label: string, y: number): Promise<number> {
  if (!photos) return y
  y = ensureSpace(doc, y, 16)

  doc.setFont(FONT, 'bold')
  doc.setFontSize(6.5)
  doc.setTextColor(C.textVeryLight)
  doc.text(label, M, y + 2.5)
  y += 7

  const urls = photos.split(',').filter(Boolean)
  for (const url of urls.slice(0, 4)) {
    try {
      const img = new Image()
      img.src = url.trim()
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject()
      })
      if (y + 30 > MAX_Y) { doc.addPage(); y = M + 5 }
      const imgH = 24
      const aspect = img.width / img.height
      const imgW = imgH * aspect
      doc.addImage(img, 'JPEG', M, y, Math.min(imgW, CW), imgH)
      y += imgH + 4
    } catch { /* skip */ }
  }
  return y
}

export async function generateBonInterventionPdf(data: BonInterventionData): Promise<Blob> {
  const { intervention, client, settings } = data
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  let y = M + 2

  y = await drawHeader(doc, settings, "BON D'INTERVENTION", data.numero, y)
  y = drawInterventionInfo(doc, intervention, settings, y)
  y = drawClientCard(doc, client, y)
  y = drawAdresseChantier(doc, intervention, y)
  y = drawDescriptionTravaux(doc, intervention, y)

  if (intervention.photos_avant) {
    y = await drawPhotos(doc, intervention.photos_avant, 'PHOTOS AVANT', y)
  }
  if (intervention.photos_apres) {
    y = await drawPhotos(doc, intervention.photos_apres, 'PHOTOS APRES', y)
  }

  y = ensureSpace(doc, y, 40)
  doc.setDrawColor(C.border)
  doc.setLineWidth(0.3)
  doc.line(M, y, M + CW, y)
  y += 8

  y = drawSignatureArea(doc, y, 'CLIENT', 'TECHNICIEN')

  const pageCount = doc.getNumberOfPages()
  drawFooter(doc, pageCount, settings)

  return doc.output('blob')
}

function drawClientCard(doc: jsPDF, client: { nom?: string; telephone?: string; adresse?: string }, y: number): number {
  const cardH = 24
  fillRoundRect(doc, M, y, CW, cardH, 6, C.lightBg)
  doc.setDrawColor(C.accent)
  doc.setLineWidth(1.8)
  doc.line(M, y, M, y + cardH)

  doc.setFont(FONT, 'bold')
  doc.setFontSize(6.5)
  doc.setTextColor(C.textVeryLight)
  doc.text('CLIENT', M + 12, y + 6)

  const name = client?.nom || '-'
  const tel = client?.telephone || ''
  const addr = client?.adresse || ''

  doc.setFont(FONT, 'bold')
  doc.setFontSize(9)
  doc.setTextColor(C.text)
  doc.text(name, M + 12, y + 13)

  doc.setFont(FONT, 'normal')
  doc.setFontSize(7)
  doc.setTextColor(C.textLight)
  let cy = y + 18
  if (addr) { doc.text(addr, M + 12, cy); cy += LH }
  if (tel) { doc.text(tel, M + 12, cy) }

  return y + cardH + 6
}
