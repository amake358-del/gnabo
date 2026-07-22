import jsPDF from 'jspdf';
import { C, LH, M, CW, ensureSpace, fillRoundRect, drawHeader, drawClientCard, drawFooter } from './pdfUtils';
function drawDefautCard(doc, appareil, y) {
    const cardH = 36;
    fillRoundRect(doc, M, y, CW, cardH, 6, C.lightBg);
    doc.setDrawColor(C.accent);
    doc.setLineWidth(1.8);
    doc.line(M, y, M, y + cardH);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(C.textVeryLight);
    doc.text('APPAREIL', M + 12, y + 8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(C.text);
    const rows = [
        { label: 'Marque', value: appareil.marque || '-' },
        { label: 'Modèle', value: appareil.modele || '-' },
        { label: 'Panne déclarée', value: appareil.panne_declaree || appareil.description_defaut || '-' },
    ];
    let cy = y + 13;
    rows.forEach(r => {
        doc.setFont('helvetica', 'bold');
        doc.text(`${r.label} :`, M + 12, cy);
        doc.setFont('helvetica', 'normal');
        doc.text(r.value, M + 35, cy);
        cy += LH + 2;
    });
    return y + cardH + 6;
}
function drawDiagnosticContent(doc, diagnostic, cout_estime, currency, y) {
    y = ensureSpace(doc, y, 60);
    doc.setDrawColor(C.border);
    doc.setLineWidth(0.3);
    doc.line(M, y, M + CW, y);
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(C.textVeryLight);
    doc.text('DIAGNOSTIC', M, y + 2.5);
    y += 7;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(C.text);
    doc.text('Problème constaté :', M, y + 2.5);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(C.textLight);
    const problem = diagnostic.diagnostic || '-';
    const wrapped = doc.splitTextToSize(problem, CW);
    doc.text(wrapped, M, y + 2);
    y += wrapped.length * LH + 6;
    if (diagnostic.cause) {
        y = ensureSpace(doc, y, 20);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(C.text);
        doc.text('Cause :', M, y + 2.5);
        y += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(C.textLight);
        const causeWrapped = doc.splitTextToSize(diagnostic.cause, CW);
        doc.text(causeWrapped, M, y + 2);
        y += causeWrapped.length * LH + 6;
    }
    if (diagnostic.pieces_necessaires) {
        y = ensureSpace(doc, y, 20);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(C.text);
        doc.text('Pièces nécessaires :', M, y + 2.5);
        y += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(C.textLight);
        const piecesWrapped = doc.splitTextToSize(diagnostic.pieces_necessaires, CW);
        doc.text(piecesWrapped, M, y + 2);
        y += piecesWrapped.length * LH + 6;
    }
    if (diagnostic.tests) {
        y = ensureSpace(doc, y, 20);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(C.text);
        doc.text('Tests effectués :', M, y + 2.5);
        y += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(C.textLight);
        const testsWrapped = doc.splitTextToSize(diagnostic.tests, CW);
        doc.text(testsWrapped, M, y + 2);
        y += testsWrapped.length * LH + 6;
    }
    y = ensureSpace(doc, y, 30);
    doc.setDrawColor(C.border);
    doc.setLineWidth(0.3);
    doc.line(M, y, M + CW, y);
    y += 6;
    const summaryW = CW * 0.5;
    const sx = M + CW - summaryW;
    const costRows = [
        { label: 'Main-d\'œuvre', value: diagnostic.main_oeuvre || 0 },
        { label: 'Temps estimé', value: `${diagnostic.temps_estime || 0} min` },
        { label: 'Coût estimé TTC', value: cout_estime, bold: true, border: true },
    ];
    costRows.forEach(r => {
        doc.setFont('helvetica', r.bold ? 'bold' : 'normal');
        doc.setFontSize(r.bold ? 8 : 7);
        doc.setTextColor(C.text);
        doc.text(r.label, sx, y + 3);
        if (typeof r.value === 'number') {
            doc.text(`${r.value} ${currency}`, sx + summaryW - 4, y + 3, { align: 'right' });
        }
        else {
            doc.text(r.value, sx + summaryW - 4, y + 3, { align: 'right' });
        }
        if (r.border) {
            doc.setDrawColor(C.border);
            doc.setLineWidth(0.5);
            doc.line(sx, y + 6, sx + summaryW, y + 6);
        }
        y += r.bold ? 8 : 6;
    });
    return y + 4;
}
export async function generateDiagnosticPdf(data, settings) {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    let y = M + 2;
    y = await drawHeader(doc, settings, 'DIAGNOSTIC', data.numero, y);
    y = drawClientCard(doc, data.client, y);
    y = drawDefautCard(doc, data.appareil, y);
    y = drawDiagnosticContent(doc, data.diagnostic, data.cout_estime, data.currency, y);
    if (data.diagnostic.observations) {
        y = ensureSpace(doc, y, 20);
        doc.setDrawColor(C.border);
        doc.setLineWidth(0.3);
        doc.line(M, y, M + CW, y);
        y += 6;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(C.textVeryLight);
        doc.text('OBSERVATIONS', M, y + 2.5);
        y += 7;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(C.textLight);
        const obsWrapped = doc.splitTextToSize(data.diagnostic.observations, CW);
        doc.text(obsWrapped, M, y + 2);
        y += obsWrapped.length * LH + 6;
    }
    const pageCount = doc.getNumberOfPages();
    drawFooter(doc, pageCount, settings);
    return doc.output('blob');
}
