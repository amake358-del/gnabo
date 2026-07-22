import jsPDF from 'jspdf';
import { C, FONT, LH, M, CW, MAX_Y, ensureSpace, fillRoundRect, drawHeader, drawFooter, fmtInt, currency } from './pdfUtils';
function drawSummary(doc, data, y) {
    const totalEncaissements = data.entries
        .filter(e => e.type === 'encaissement')
        .reduce((s, e) => s + e.montant, 0);
    const totalDepenses = data.entries
        .filter(e => e.type === 'depense')
        .reduce((s, e) => s + e.montant, 0);
    const curr = currency(data.settings);
    const cardH = 50;
    fillRoundRect(doc, M, y, CW, cardH, 6, C.lightBg);
    doc.setDrawColor(C.accent);
    doc.setLineWidth(1.8);
    doc.line(M, y, M, y + cardH);
    doc.setFont(FONT, 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(C.textVeryLight);
    doc.text('RESUME', M + 12, y + 8);
    const rows = [
        { label: 'Solde debut', value: `${fmtInt(data.soldeDebut)} ${curr}`, bold: false },
        { label: 'Total encaissements', value: `${fmtInt(totalEncaissements)} ${curr}`, bold: false },
        { label: 'Total depenses', value: `${fmtInt(totalDepenses)} ${curr}`, bold: false },
        { label: 'Solde fin', value: `${fmtInt(data.soldeFin)} ${curr}`, bold: true },
    ];
    let cy = y + 13;
    rows.forEach(r => {
        doc.setFont(FONT, r.bold ? 'bold' : 'normal');
        doc.setFontSize(r.bold ? 9 : 7);
        doc.setTextColor(r.bold ? C.navy : C.text);
        doc.text(r.label, M + 12, cy);
        doc.text(r.value, M + CW - 12, cy, { align: 'right' });
        cy += r.bold ? 8 : LH + 1;
    });
    return y + cardH + 6;
}
function drawMouvementsTable(doc, entries, y, curr) {
    y = ensureSpace(doc, y, 20);
    doc.setDrawColor(C.border);
    doc.setLineWidth(0.3);
    doc.line(M, y, M + CW, y);
    y += 6;
    doc.setFont(FONT, 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(C.textVeryLight);
    doc.text('DETAIL DES MOUVEMENTS', M, y + 2.5);
    y += 7;
    const cols = [
        { x: M, w: CW * 0.05 },
        { x: M + CW * 0.05, w: CW * 0.12 },
        { x: M + CW * 0.17, w: CW * 0.10 },
        { x: M + CW * 0.27, w: CW * 0.33 },
        { x: M + CW * 0.60, w: CW * 0.18 },
        { x: M + CW * 0.78, w: CW * 0.22 },
    ];
    const headerH = 7;
    fillRoundRect(doc, M, y, CW, headerH, 3, C.navy);
    doc.setFont(FONT, 'bold');
    doc.setFontSize(6);
    doc.setTextColor(C.white);
    const headers = ['#', 'Date', 'Type', 'Description', 'Categorie', 'Montant'];
    const aligns = ['left', 'left', 'left', 'left', 'left', 'right'];
    headers.forEach((h, i) => {
        const a = aligns[i];
        doc.text(h, a === 'right' ? cols[i].x + cols[i].w - 2 : cols[i].x + 2, y + 4.5, { align: a });
    });
    y += headerH + 1.5;
    entries.forEach((entry, idx) => {
        const rowH = 6;
        if (y + rowH > MAX_Y) {
            doc.addPage();
            y = M + 5;
            fillRoundRect(doc, M, y, CW, headerH, 3, C.navy);
            doc.setFont(FONT, 'bold');
            doc.setFontSize(6);
            doc.setTextColor(C.white);
            headers.forEach((h, i) => {
                const a = aligns[i];
                doc.text(h, a === 'right' ? cols[i].x + cols[i].w - 2 : cols[i].x + 2, y + 4.5, { align: a });
            });
            y += headerH + 1.5;
        }
        if (idx % 2 === 0) {
            doc.setFillColor(C.grayRow);
            doc.rect(M, y, CW, rowH, 'F');
        }
        doc.setFont(FONT, 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(C.text);
        doc.text(String(idx + 1), cols[0].x + 2, y + 4);
        const dateStr = entry.cree_le
            ? new Date(entry.cree_le).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
            : '-';
        doc.text(dateStr, cols[1].x + 2, y + 4);
        doc.setFont(FONT, 'bold');
        const typeColor = entry.type === 'encaissement' ? C.success : C.danger;
        doc.setTextColor(typeColor);
        doc.text(entry.type === 'encaissement' ? 'Encaiss.' : 'Depense', cols[2].x + 2, y + 4);
        doc.setFont(FONT, 'normal');
        doc.setTextColor(C.text);
        const desc = entry.description || '-';
        const displayDesc = desc.length > 35 ? desc.slice(0, 33) + '...' : desc;
        doc.text(displayDesc, cols[3].x + 2, y + 4);
        doc.text(entry.categorie || '-', cols[4].x + 2, y + 4);
        doc.setFont(FONT, 'bold');
        doc.text(`${fmtInt(entry.montant)} ${curr}`, cols[5].x + cols[5].w - 2, y + 4, { align: 'right' });
        y += rowH;
    });
    return y + 4;
}
export async function generateRapportCaissePdf(data) {
    const { entries, periodStart, periodEnd, settings } = data;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    let y = M + 2;
    const periodLabel = `${periodStart ? new Date(periodStart).toLocaleDateString('fr-FR') : '...'} - ${periodEnd ? new Date(periodEnd).toLocaleDateString('fr-FR') : '...'}`;
    y = await drawHeader(doc, settings, 'RAPPORT DE CAISSE', `Periode: ${periodLabel}`, y);
    y = drawSummary(doc, data, y);
    y = drawMouvementsTable(doc, entries, y, currency(settings));
    const pageCount = doc.getNumberOfPages();
    drawFooter(doc, pageCount, settings);
    return doc.output('blob');
}
