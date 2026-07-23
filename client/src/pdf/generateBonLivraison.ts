import jsPDF from 'jspdf'
import type { Settings, Appareil } from '../types'
import { C, FONT, LH, M, PAGE_W, CW, ensureSpace, fillRoundRect, drawHeader, drawClientCard, drawFooter } from './pdfUtils'

interface BonLivraisonData {
  appareil: Appareil
  client: { nom?: string; telephone?: string; adresse?: string }
  accessoires_rendus: string
  date_livraison: string
  numero: string
  notes: string
  signature?: string
}

function drawAppareilCard(doc: jsPDF, appareil: Appareil, y: number): number {
  const cardH = 42
  fillRoundRect(doc, M, y, CW, cardH, 6, C.lightBg)
  doc.setDrawColor(C.accent)
  doc.setLineWidth(1.8)
  doc.line(M, y, M, y + cardH)

  doc.setFont(FONT, 'bold')
  doc.setFontSize(6.5)
  doc.setTextColor(C.textVeryLight)
  doc.text('APPAREIL', M + 12, y + 8)

  doc.setFont(FONT, 'normal')
  doc.setFontSize(7)
  doc.setTextColor(C.text)

  const rows = [
    { label: 'Marque', value: appareil.marque || '-' },
    { label: 'Modèle', value: appareil.modele || '-' },
    { label: 'IMEI', value: appareil.code_imei || '-' },
    { label: 'UID', value: appareil.uid_visible || appareil.uid_interne || '-' },
    { label: 'Numéro série', value: appareil.numero_serie || '-' },
    { label: 'État esthétique', value: appareil.etat_esthetique || '-' },
  ]

  let cy = y + 12
  const leftCol = rows.slice(0, 3)
  const rightCol = rows.slice(3)

  leftCol.forEach(r => {
    doc.setFont(FONT, 'bold')
    doc.text(`${r.label} :`, M + 12, cy)
    doc.setFont(FONT, 'normal')
    doc.text(r.value, M + 32, cy)
    cy += LH + 1
  })

  cy = y + 12
  rightCol.forEach(r => {
    doc.setFont(FONT, 'bold')
    doc.text(`${r.label} :`, M + CW / 2, cy)
    doc.setFont(FONT, 'normal')
    doc.text(r.value, M + CW / 2 + 22, cy)
    cy += LH + 1
  })

  return y + cardH + 6
}

function drawAccessoires(doc: jsPDF, accessoires: string, y: number): number {
  const sectionH = 24
  y = ensureSpace(doc, y, sectionH)

  doc.setDrawColor(C.border)
  doc.setLineWidth(0.3)
  doc.line(M, y, PAGE_W - M, y)
  y += 6

  doc.setFont(FONT, 'bold')
  doc.setFontSize(6.5)
  doc.setTextColor(C.textVeryLight)
  doc.text('ACCESSOIRES RENDUS', M, y + 2.5)
  y += 7

  doc.setFont(FONT, 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(C.text)
  const text = accessoires || 'Aucun accessoire'
  const wrapped = doc.splitTextToSize(text, CW)
  doc.text(wrapped, M, y + 2.5)
  y += wrapped.length * LH + 6

  return y
}

function drawDeliveryInfo(doc: jsPDF, date_livraison: string, y: number): number {
  y = ensureSpace(doc, y, 16)

  doc.setDrawColor(C.border)
  doc.setLineWidth(0.3)
  doc.line(M, y, PAGE_W - M, y)
  y += 6

  doc.setFont(FONT, 'bold')
  doc.setFontSize(6.5)
  doc.setTextColor(C.textVeryLight)
  doc.text('DATE DE LIVRAISON', M, y + 2.5)
  y += 7

  doc.setFont(FONT, 'bold')
  doc.setFontSize(9)
  doc.setTextColor(C.text)
  const dateStr = date_livraison
    ? new Date(date_livraison).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
  doc.text(dateStr, M, y + 2.5)
  y += 10

  return y
}

export async function generateBonLivraisonPdf(data: BonLivraisonData, settings: Settings): Promise<Blob> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  let y = M + 2

  y = await drawHeader(doc, settings, 'BON DE LIVRAISON', data.numero, y)
  y = drawClientCard(doc, data.client, y)
  y = drawAppareilCard(doc, data.appareil, y)
  y = drawAccessoires(doc, data.accessoires_rendus, y)
  y = drawDeliveryInfo(doc, data.date_livraison, y)

  y = ensureSpace(doc, y, 40)
  doc.setDrawColor(C.border)
  doc.setLineWidth(0.3)
  doc.line(M, y, PAGE_W - M, y)
  y += 8

  const colW = (CW - 10) / 2
  doc.setFont(FONT, 'bold')
  doc.setFontSize(7)
  doc.setTextColor(C.textVeryLight)
  doc.text('CLIENT', M, y + 3)
  doc.text('ENTREPRISE', PAGE_W - M - colW, y + 3)

  doc.setFont(FONT, 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(C.text)
  doc.text('Nom :', M, y + 9)
  doc.text('Date :', M, y + 14)
  doc.text('Signature :', M, y + 19)

  doc.setDrawColor(C.border)
  doc.setLineWidth(0.3)
  doc.line(M + 13, y + 9, M + colW, y + 9)
  doc.line(M + 14, y + 14, M + colW, y + 14)
  doc.line(M, y + 28, M + colW, y + 28)
  if (data.signature) {
    try { doc.addImage(data.signature, 'PNG', M + 2, y + 15, colW - 4, 16) } catch (_) {}
  }

  doc.setFont(FONT, 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(C.text)
  doc.text('Nom :', PAGE_W - M - colW, y + 9)
  doc.text('Date :', PAGE_W - M - colW, y + 14)
  doc.text('Signature :', PAGE_W - M - colW, y + 19)

  doc.setDrawColor(C.border)
  doc.setLineWidth(0.3)
  doc.line(PAGE_W - M - colW + 13, y + 9, PAGE_W - M, y + 9)
  doc.line(PAGE_W - M - colW + 14, y + 14, PAGE_W - M, y + 14)
  doc.line(PAGE_W - M - colW, y + 28, PAGE_W - M, y + 28)

  const pageCount = doc.getNumberOfPages()
  drawFooter(doc, pageCount, settings)

  return doc.output('blob')
}
