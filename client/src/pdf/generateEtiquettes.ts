import jsPDF from 'jspdf'
import QRCode from 'qrcode'

const LAYOUTS: Record<string, { cols: number; rows: number; labelW: number; labelH: number; margin: number }> = {
  '20': { cols: 5, rows: 4, labelW: 38, labelH: 66, margin: 10 },
  '24': { cols: 6, rows: 4, labelW: 31.5, labelH: 66, margin: 8 },
  '30': { cols: 5, rows: 6, labelW: 38, labelH: 43, margin: 10 },
  '40': { cols: 8, rows: 5, labelW: 23.5, labelH: 50.5, margin: 7 },
  '48': { cols: 8, rows: 6, labelW: 23.5, labelH: 42, margin: 7 },
}



export async function generateEtiquettes(
  codes: string[],
  layout: string,
  serviceName: string,
  serviceColor: string,
  logoUrl?: string
): Promise<jsPDF> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const lay = LAYOUTS[layout] || LAYOUTS['24']
  const { cols, rows, labelW, labelH, margin } = lay
  const qrSize = labelH * 0.5
  const fontSize = labelH < 45 ? 5 : 6.5
  const fontSizeCode = labelH < 45 ? 4.5 : 5.5

  let totalPerPage = cols * rows

  for (let idx = 0; idx < codes.length; idx++) {
    if (idx > 0 && idx % totalPerPage === 0) doc.addPage()

    const pageIdx = idx % totalPerPage
    const col = pageIdx % cols
    const row = Math.floor(pageIdx / cols)
    const x = margin + col * (labelW + 2)
    const y = margin + row * (labelH + 2)

    const code = codes[idx]

    const qrDataUrl = await QRCode.toDataURL(code, {
      width: 200,
      margin: 1,
      color: { dark: '#000000', light: '#FFFFFF' }
    })

    doc.setFillColor('#FFFFFF')
    doc.roundedRect(x, y, labelW, labelH, 1, 1, 'F')
    doc.setDrawColor(serviceColor)
    doc.setLineWidth(0.3)
    doc.roundedRect(x, y, labelW, labelH, 1, 1, 'S')

    const qrX = x + (labelW - qrSize) / 2
    const qrY = y + 3
    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize)

    if (logoUrl) {
      try {
        doc.addImage(logoUrl, 'PNG', x + labelW - 8, y + 1.5, 6, 6)
      } catch {}
    }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(fontSize)
    doc.setTextColor('#1e293b')
    const textY = qrY + qrSize + 2
    doc.text(code, x + labelW / 2, textY, { align: 'center' })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(fontSizeCode)
    doc.setTextColor(serviceColor)
    doc.text(serviceName, x + labelW / 2, textY + fontSize, { align: 'center' })
  }

  return doc
}
