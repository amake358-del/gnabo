import jsPDF, { GState } from 'jspdf';
import QRCode from 'qrcode';
// ── Design Tokens ──
const C = {
    navy: '#0F172A',
    accent: '#2563EB',
    accentLight: '#DBEAFE',
    white: '#FFFFFF',
    lightBg: '#F8FAFC',
    border: '#E2E8F0',
    text: '#334155',
    textLight: '#64748B',
    textVeryLight: '#94A3B8',
    success: '#059669',
    warning: '#D97706',
    danger: '#DC2626',
    grayRow: '#F1F5F9',
};
const PAGE_W = 210;
const PAGE_H = 297;
const M = 20;
const CW = PAGE_W - 2 * M;
const FONT = 'helvetica';
const LH = 3.5;
const MAX_Y = PAGE_H - 20;
function currency(s) {
    return s.currency || '';
}
function companyColor(s) {
    return s.service_color || C.accent;
}
const STATUS_LABEL = {
    brouillon: 'BROUILLON',
    envoye: 'ENVOYÉ',
    accepte: 'ACCEPTÉ',
    refuse: 'REFUSÉ',
    expire: 'EXPIRÉ',
};
const STATUS_COLOR = {
    brouillon: '#94A3B8',
    envoye: '#2563EB',
    accepte: '#059669',
    refuse: '#DC2626',
    expire: '#94A3B8',
};
// ── Helpers ──
function fmt(n) {
    const fixed = n.toFixed(2);
    const [int, dec] = fixed.split('.');
    return int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ',' + dec;
}
function fmtDecimal(n, d = 2) {
    const fixed = n.toFixed(d);
    const [int, dec] = fixed.split('.');
    const spaced = int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return d > 0 ? spaced + ',' + dec : spaced;
}
function addDays(dateStr, days) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' });
}
function fillRoundRect(doc, x, y, w, h, r, color) {
    doc.setFillColor(color);
    doc.roundedRect(x, y, w, h, r, r, 'F');
}
function drawBadge(doc, label, color, x, y, w) {
    const bw = w || doc.getTextWidth(label) + 8;
    const bh = 5.5;
    doc.setFillColor(color);
    doc.setGState(new GState({ opacity: 0.12 }));
    doc.roundedRect(x, y, bw, bh, 2.75, 2.75, 'F');
    doc.setGState(new GState({ opacity: 1 }));
    doc.setFont(FONT, 'bold');
    doc.setFontSize(5.5);
    doc.setTextColor(color);
    doc.text(label, x + bw / 2, y + bh - 1.5, { align: 'center' });
}
function ensureSpace(doc, y, needed) {
    if (y + needed > MAX_Y) {
        doc.addPage();
        return M + 5;
    }
    return y;
}
// ── 1. Header ──
async function drawHeader(doc, devis, settings, y) {
    const accent = companyColor(settings);
    // Top bar
    doc.setFillColor(accent);
    doc.rect(0, 0, PAGE_W, 3, 'F');
    // ── Left: Company ──
    let logoW = 0;
    if (settings.logo_url) {
        try {
            const img = new Image();
            img.src = settings.logo_url;
            await new Promise((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = () => reject();
            });
            const maxH = 18;
            const aspect = img.width / img.height;
            const logoH = Math.min(maxH, 38 / aspect);
            logoW = logoH * aspect;
            doc.addImage(img, 'PNG', M, y + 1, Math.min(logoW, 38), logoH);
        }
        catch { /* skip logo */ }
    }
    const compX = M + (logoW > 0 ? Math.min(logoW, 38) + 8 : 0);
    doc.setFont(FONT, 'bold');
    doc.setFontSize(15);
    doc.setTextColor(C.navy);
    doc.text(settings.company_name || '', compX, y + 6);
    // Service name subtitle
    if (settings.service_name) {
        doc.setFont(FONT, 'normal');
        doc.setFontSize(8);
        doc.setTextColor(accent);
        doc.text(`Service ${settings.service_name}`, compX, y + 11);
    }
    doc.setFont(FONT, 'normal');
    doc.setFontSize(7);
    doc.setTextColor(C.textLight);
    let cy = y + (settings.service_name ? 15.5 : 11);
    if (settings.address) {
        doc.text(settings.address, compX, cy);
        cy += LH + 0.5;
    }
    if (settings.phone) {
        doc.text(`Tél: ${settings.phone}`, compX, cy);
        cy += LH + 0.5;
    }
    if (settings.email) {
        doc.text(settings.email, compX, cy);
        cy += LH + 0.5;
    }
    // ── Right: DEVIS Card ──
    const cardW = 70;
    const cardX = PAGE_W - M - cardW;
    const cardH = 32;
    doc.setFillColor(C.white);
    doc.setDrawColor(C.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(cardX, y, cardW, cardH, 4, 4, 'FD');
    // Card accent top line
    doc.setFillColor(accent);
    doc.rect(cardX, y, cardW, 2.5, 'F');
    // QR Code
    try {
        const qrData = await QRCode.toDataURL(devis.numero, {
            width: 80, margin: 0, color: { dark: C.navy, light: '#FFFFFF' },
        });
        doc.addImage(qrData, 'PNG', cardX + 6, y + 5, 10, 10);
    }
    catch { /* skip QR */ }
    // DEVIS title
    doc.setFont(FONT, 'bold');
    doc.setFontSize(13);
    doc.setTextColor(C.navy);
    doc.text('DEVIS', cardX + 20, y + 11);
    // Status badge top-right of card
    const sLabel = STATUS_LABEL[devis.statut] || devis.statut;
    const sColor = STATUS_COLOR[devis.statut] || C.textVeryLight;
    const sbw = doc.getTextWidth(sLabel) + 8;
    drawBadge(doc, sLabel, sColor, cardX + cardW - sbw - 6, y + 6, sbw);
    // Details below title
    doc.setFont(FONT, 'normal');
    doc.setFontSize(7);
    doc.setTextColor(C.textLight);
    doc.text(`N° ${devis.numero}`, cardX + 20, y + 17);
    const dateStr = devis.created_at
        ? new Date(devis.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' })
        : '-';
    doc.text(dateStr, cardX + 20, y + 21);
    doc.text(`Valable jusqu'au ${devis.created_at ? addDays(devis.created_at, 30) : '-'}`, cardX + 20, y + 25.5);
    // ── Separator ──
    const sepY = y + 37;
    doc.setDrawColor(C.border);
    doc.setLineWidth(0.3);
    doc.line(M, sepY, PAGE_W - M, sepY);
    return sepY + 5;
}
// ── 2. Client Card ──
function drawClientCard(doc, devis, y) {
    const cardH = 34;
    const cardY = y;
    fillRoundRect(doc, M, cardY, CW, cardH, 6, C.lightBg);
    // Left accent border
    doc.setDrawColor(C.accent);
    doc.setLineWidth(1.8);
    doc.line(M, cardY, M, cardY + cardH);
    // Left column — CLIENT
    doc.setFont(FONT, 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(C.textVeryLight);
    doc.text('CLIENT', M + 12, cardY + 8);
    const client = devis.client;
    const name = client?.company || (client?.nom ? `${client.nom} ${client.prenom || ''}`.trim() : devis.client_nom || '-');
    const addr = client?.adresse || '';
    const tel = client?.telephone || '';
    const email = client?.email || '';
    doc.setFont(FONT, 'bold');
    doc.setFontSize(9);
    doc.setTextColor(C.text);
    doc.text(name, M + 12, cardY + 15);
    doc.setFont(FONT, 'normal');
    doc.setFontSize(7);
    doc.setTextColor(C.textLight);
    let cy = cardY + 20.5;
    if (addr) {
        doc.text(addr, M + 12, cy);
        cy += LH + 0.5;
    }
    if (tel) {
        doc.text(tel, M + 12, cy);
        cy += LH + 0.5;
    }
    if (email) {
        doc.text(email, M + 12, cy);
        cy += LH + 0.5;
    }
    // Right column — RÉFÉRENCES
    const rx = M + CW - 72;
    doc.setFont(FONT, 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(C.textVeryLight);
    doc.text('RÉFÉRENCES', rx, cardY + 8);
    doc.setFont(FONT, 'normal');
    doc.setFontSize(7);
    doc.setTextColor(C.textLight);
    let ry = cardY + 15;
    if (devis.type_name) {
        doc.setFont(FONT, 'bold');
        doc.text('Type', rx, ry);
        doc.setFont(FONT, 'normal');
        doc.setTextColor(C.text);
        doc.text(devis.type_name, rx + 30, ry);
        doc.setTextColor(C.textLight);
        ry += LH + 0.5;
    }
    if (devis.modele_name) {
        doc.setFont(FONT, 'bold');
        doc.text('Modèle', rx, ry);
        doc.setFont(FONT, 'normal');
        doc.setTextColor(C.text);
        doc.text(devis.modele_name, rx + 30, ry);
        doc.setTextColor(C.textLight);
        ry += LH + 0.5;
    }
    doc.setFont(FONT, 'bold');
    doc.text('Statut', rx, ry);
    doc.setFont(FONT, 'normal');
    const sLabel = STATUS_LABEL[devis.statut] || devis.statut;
    const sColor = STATUS_COLOR[devis.statut] || C.textVeryLight;
    doc.setTextColor(sColor);
    doc.setFont(FONT, 'bold');
    doc.text(sLabel, rx + 30, ry);
    doc.setFont(FONT, 'normal');
    return cardY + cardH + 6;
}
// ── 3. Object / Notes ──
function drawNotes(doc, devis, y) {
    if (!devis.notes)
        return y;
    doc.setDrawColor(C.border);
    doc.setLineWidth(0.3);
    doc.line(M, y, PAGE_W - M, y);
    y += 6;
    doc.setFont(FONT, 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(C.textVeryLight);
    doc.text('OBJET', M, y + 2.5);
    y += 7;
    doc.setFont(FONT, 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(C.text);
    const wrapped = doc.splitTextToSize(devis.notes, CW);
    doc.text(wrapped, M, y + 2.5);
    y += wrapped.length * LH + 4;
    return y + 2;
}
// ── 4. Items Table ──
const COL_W = [CW * 0.08, CW * 0.45, CW * 0.10, CW * 0.18, CW * 0.19];
const COL_X = (i) => M + COL_W.slice(0, i).reduce((a, b) => a + b, 0);
const MIN_ROW_H = 6;
function drawTable(doc, devis, startY, settings) {
    const lines = devis.lines || [];
    let y = startY;
    const curr = currency(settings);
    const drawHeader = () => {
        fillRoundRect(doc, M, y, CW, 7.5, 3, C.navy);
        doc.setTextColor(C.white);
        doc.setFont(FONT, 'bold');
        doc.setFontSize(6.5);
        const headers = ['N°', 'Désignation', 'Qté', 'Prix unitaire', 'Total'];
        const aligns = ['left', 'left', 'left', 'right', 'right'];
        headers.forEach((h, i) => {
            const align = aligns[i];
            const xOff = align === 'right' ? COL_X(i) + COL_W[i] - 2 : COL_X(i) + 3;
            doc.text(h, xOff, y + 5, { align });
        });
        doc.setFont(FONT, 'normal');
        y += 7.5 + 1.5;
        return y;
    };
    y = drawHeader();
    lines.forEach((line, idx) => {
        let desigText = line.designation || '-';
        if (line.largeur || line.hauteur) {
            desigText += `\n${fmtDecimal(line.largeur || 0)} × ${fmtDecimal(line.hauteur || 0)} mm`;
        }
        const desigLines = doc.splitTextToSize(desigText, COL_W[1] - 4);
        const rowH = Math.max(MIN_ROW_H, desigLines.length * LH + 1.5);
        if (y + rowH > MAX_Y) {
            doc.addPage();
            y = M + 5;
            y = drawHeader();
        }
        if (idx % 2 === 1) {
            doc.setFillColor(C.grayRow);
            doc.rect(M, y, CW, rowH, 'F');
        }
        const surface = line.surface || 0;
        const prixM2 = line.prix_m2 || 0;
        const quantite = line.quantite || 1;
        const prixUnitaire = surface * prixM2;
        const montant = line.total || 0;
        doc.setTextColor(C.text);
        doc.setFont(FONT, 'normal');
        doc.setFontSize(7);
        doc.text(String(idx + 1), COL_X(0) + 3, y + rowH - 2);
        doc.text(desigLines, COL_X(1) + 2, y + rowH - 2);
        doc.text(String(quantite), COL_X(2) + 3, y + rowH - 2);
        doc.text(fmtDecimal(prixUnitaire, 4) + ` ${curr}`, COL_X(3) + COL_W[3] - 2, y + rowH - 2, { align: 'right' });
        doc.setFont(FONT, 'bold');
        doc.text(fmt(montant) + ` ${curr}`, COL_X(4) + COL_W[4] - 2, y + rowH - 2, { align: 'right' });
        doc.setFont(FONT, 'normal');
        y += rowH;
    });
    doc.setDrawColor(C.border);
    doc.setLineWidth(0.3);
    doc.line(M, y, M + CW, y);
    y += 4;
    return y;
}
// ── 5. Financial Summary ──
function drawFinancialSummary(doc, devis, y, settings) {
    const curr = currency(settings);
    y = ensureSpace(doc, y, 58);
    const summaryW = CW * 0.5;
    const sx = M + CW - summaryW;
    const rowH = 5;
    const labelW = summaryW * 0.55;
    const tvaAmount = devis.total_ht
        ? Math.round((devis.total_ht - (devis.remise || 0)) * (devis.tva || 0) / 100 * 100) / 100
        : 0;
    const rows = [
        { label: 'Sous-total', value: devis.total_ht },
        { label: 'Remise', value: devis.remise || 0 },
        { label: 'Transport', value: devis.transport || 0 },
        { label: 'Pose', value: devis.pose || 0 },
    ];
    doc.setFont(FONT, 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(C.textLight);
    rows.forEach((r, i) => {
        doc.text(r.label, sx, y + i * rowH + 3);
        doc.setTextColor(C.text);
        doc.text(fmt(r.value) + ` ${curr}`, sx + labelW, y + i * rowH + 3, { align: 'right' });
        doc.setTextColor(C.textLight);
    });
    const tvaY = y + rows.length * rowH;
    doc.text(`TVA (${devis.tva}%)`, sx, tvaY + 3);
    doc.setTextColor(C.text);
    doc.text(fmt(tvaAmount) + ` ${curr}`, sx + labelW, tvaY + 3, { align: 'right' });
    const sepY = tvaY + rowH;
    doc.setDrawColor(C.border);
    doc.setLineWidth(0.3);
    doc.line(sx, sepY, sx + summaryW, sepY);
    const ttcY = sepY + 2;
    const ttcH = 14;
    fillRoundRect(doc, sx, ttcY, summaryW, ttcH, 4, C.navy);
    doc.setFont(FONT, 'bold');
    doc.setFontSize(7);
    doc.setTextColor(C.white);
    doc.text('TOTAL TTC', sx + 10, ttcY + 6);
    doc.setFontSize(12);
    doc.text(fmt(devis.total_ttc) + ` ${curr}`, sx + summaryW - 10, ttcY + 10, { align: 'right' });
    const acY = ttcY + ttcH + 4;
    doc.setFont(FONT, 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(C.textLight);
    doc.text('Acompte versé', sx, acY + 3);
    doc.setTextColor(C.text);
    doc.text(fmt(devis.acompte) + ` ${curr}`, sx + labelW, acY + 3, { align: 'right' });
    doc.setDrawColor(C.border);
    doc.setLineWidth(0.3);
    doc.line(sx, acY + 6, sx + summaryW, acY + 6);
    const resteY = acY + 9;
    doc.setFont(FONT, 'bold');
    doc.setFontSize(9);
    doc.setTextColor(C.navy);
    doc.text('Reste à payer', sx, resteY + 3);
    doc.text(fmt(devis.reste) + ` ${curr}`, sx + labelW, resteY + 3, { align: 'right' });
    // Amount in words below summary
    const wordsY = resteY + 9;
    doc.setDrawColor(C.border);
    doc.setLineWidth(0.3);
    doc.line(M, wordsY, PAGE_W - M, wordsY);
    doc.setFont(FONT, 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(C.textLight);
    doc.text('Arrêté le présent devis à la somme de :', M, wordsY + 5);
    doc.setFont(FONT, 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(C.navy);
    doc.text(montantEnLettres(devis.total_ttc), M, wordsY + 9.5, { maxWidth: CW });
    return wordsY + 14;
}
// ── 6. Terms ──
function drawTerms(doc, settings, y) {
    if (!settings.conditions)
        return y;
    y = ensureSpace(doc, y, 24);
    doc.setDrawColor(C.border);
    doc.setLineWidth(0.3);
    doc.line(M, y, PAGE_W - M, y);
    y += 6;
    doc.setFont(FONT, 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(C.textVeryLight);
    doc.text('CONDITIONS GÉNÉRALES', M, y + 2.5);
    y += 7;
    doc.setFont(FONT, 'normal');
    doc.setFontSize(7);
    doc.setTextColor(C.textLight);
    const wrapped = doc.splitTextToSize(settings.conditions, CW);
    doc.text(wrapped, M, y + 2);
    y += wrapped.length * LH + 4;
    return y + 2;
}
// ── 7. Signatures ──
function drawSignatures(doc, y, settings) {
    y = ensureSpace(doc, y, 50);
    doc.setDrawColor(C.border);
    doc.setLineWidth(0.3);
    doc.line(M, y, PAGE_W - M, y);
    y += 8;
    const colW = (CW - 10) / 2;
    // Client
    doc.setFont(FONT, 'bold');
    doc.setFontSize(7);
    doc.setTextColor(C.textVeryLight);
    doc.text('CLIENT', M, y + 3);
    doc.setFont(FONT, 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(C.text);
    doc.text('Nom :', M, y + 9);
    doc.text('Date :', M, y + 14);
    doc.text('Signature :', M, y + 19);
    doc.setDrawColor(C.border);
    doc.setLineWidth(0.3);
    doc.line(M + 13, y + 9, M + colW, y + 9);
    doc.line(M + 14, y + 14, M + colW, y + 14);
    doc.line(M, y + 28, M + colW, y + 28);
    // Service signature
    doc.setFont(FONT, 'bold');
    doc.setFontSize(7);
    doc.setTextColor(C.textVeryLight);
    doc.text(settings.service_name ? `SERVICE ${settings.service_name.toUpperCase()}` : 'ENTREPRISE', PAGE_W - M - colW, y + 3);
    const hasCachet = settings.cachet_url;
    const hasSignature = settings.signature_url;
    const sigY = y + 9;
    if (hasSignature || hasCachet) {
        if (hasSignature) {
            try {
                const img = new Image();
                img.src = settings.signature_url;
                const sigH = 12;
                const sigAspect = img.width / img.height;
                const sigW = sigH * sigAspect;
                doc.addImage(img, 'PNG', PAGE_W - M - colW, sigY, Math.min(sigW, colW - 5), sigH);
            }
            catch { /* skip */ }
        }
        if (hasCachet) {
            try {
                const img = new Image();
                img.src = settings.cachet_url;
                const cachetSize = 22;
                const cachetX = PAGE_W - M - (hasSignature ? cachetSize + 5 : colW / 2);
                doc.addImage(img, 'PNG', cachetX, sigY + 14, cachetSize, cachetSize);
            }
            catch { /* skip */ }
        }
        if (settings.signatory_name) {
            doc.setFont(FONT, 'bold');
            doc.setFontSize(7);
            doc.setTextColor(C.text);
            doc.text(settings.signatory_name, PAGE_W - M - colW, sigY + (hasSignature ? 16 : 0));
        }
        if (settings.signatory_title) {
            doc.setFont(FONT, 'normal');
            doc.setFontSize(6);
            doc.setTextColor(C.textLight);
            doc.text(settings.signatory_title, PAGE_W - M - colW, sigY + (hasSignature ? 20 : 4));
        }
    }
    else {
        doc.setFont(FONT, 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(C.text);
        doc.text('Nom :', PAGE_W - M - colW, sigY);
        doc.text('Date :', PAGE_W - M - colW, sigY + 5);
        doc.text('Signature :', PAGE_W - M - colW, sigY + 10);
        doc.setDrawColor(C.border);
        doc.setLineWidth(0.3);
        doc.line(PAGE_W - M - colW + 13, sigY, PAGE_W - M, sigY);
        doc.line(PAGE_W - M - colW + 14, sigY + 5, PAGE_W - M, sigY + 5);
        doc.line(PAGE_W - M - colW, sigY + 19, PAGE_W - M, sigY + 19);
    }
    return y + 34;
}
// ── 8. Footer ──
function drawFooter(doc, pageCount, settings) {
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setDrawColor(C.border);
        doc.setLineWidth(0.3);
        doc.line(M, PAGE_H - 15, PAGE_W - M, PAGE_H - 15);
        doc.setFont(FONT, 'normal');
        doc.setFontSize(6);
        doc.setTextColor(C.textVeryLight);
        const leftParts = [];
        if (settings.address)
            leftParts.push(settings.address);
        if (settings.phone)
            leftParts.push(`Tél: ${settings.phone}`);
        if (settings.email)
            leftParts.push(settings.email);
        const leftText = leftParts.join(' | ') || settings.company_name || '';
        doc.text(leftText, M, PAGE_H - 8);
        const centerText = settings.company_name || '';
        if (centerText) {
            doc.text(centerText, PAGE_W / 2, PAGE_H - 8, { align: 'center' });
        }
        if (settings.service_name) {
            doc.setFontSize(5);
            doc.text(`Service ${settings.service_name}`, PAGE_W / 2, PAGE_H - 3, { align: 'center' });
        }
        doc.text(`Page ${i} / ${pageCount}`, PAGE_W - M, PAGE_H - 8, { align: 'right' });
    }
}
// ── 9. Watermark ──
function drawWatermark(doc, devis, pageCount) {
    const label = STATUS_LABEL[devis.statut];
    if (!label)
        return;
    const color = STATUS_COLOR[devis.statut] || C.textVeryLight;
    doc.setFont(FONT, 'bold');
    doc.setFontSize(40);
    doc.setTextColor(color);
    doc.setGState(new GState({ opacity: 0.05 }));
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(label, PAGE_W / 2, PAGE_H / 2, { align: 'center', angle: -30 });
    }
    doc.setGState(new GState({ opacity: 1 }));
}
// ── Number to Words ──
const units = ['', 'mille', 'million', 'milliard'];
const nums = [
    ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'],
    ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'],
    ['vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'],
];
function numberToWords(n) {
    if (n === 0)
        return 'zéro';
    if (n < 0)
        return 'moins ' + numberToWords(-n);
    let words = '';
    let unitIndex = 0;
    while (n > 0) {
        const part = n % 1000;
        if (part > 0) {
            let partWords = '';
            const hundreds = Math.floor(part / 100);
            const rest = part % 100;
            if (hundreds > 0)
                partWords += (hundreds === 1 ? 'cent' : nums[0][hundreds] + ' cent') + ' ';
            if (rest > 0) {
                if (rest < 10)
                    partWords += nums[0][rest];
                else if (rest < 20)
                    partWords += nums[1][rest - 10];
                else {
                    const tens = Math.floor(rest / 10);
                    const units_d = rest % 10;
                    partWords += nums[2][tens - 2];
                    if (units_d > 0)
                        partWords += '-' + nums[0][units_d];
                }
                partWords += ' ';
            }
            if (unitIndex > 0)
                partWords += units[unitIndex] + (part > 1 && unitIndex > 0 ? 's' : '') + ' ';
            words = partWords + words;
        }
        n = Math.floor(n / 1000);
        unitIndex++;
    }
    return words.trim();
}
function montantEnLettres(montant, settings) {
    const entier = Math.floor(montant);
    const centimes = Math.round((montant - entier) * 100);
    const currencyName = settings?.currency || 'Francs Guinéens';
    let result = numberToWords(entier).charAt(0).toUpperCase() + numberToWords(entier).slice(1) + ` ${currencyName}`;
    if (centimes > 0)
        result += ` et ${centimes} centimes`;
    return result;
}
// ── Main ──
export async function generatePdf(devis, settings) {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    let y = M + 2;
    y = await drawHeader(doc, devis, settings, y);
    y = drawClientCard(doc, devis, y);
    y = drawNotes(doc, devis, y);
    y = drawTable(doc, devis, y, settings);
    y = drawFinancialSummary(doc, devis, y, settings);
    y = drawTerms(doc, settings, y);
    y = drawSignatures(doc, y, settings);
    const pageCount = doc.getNumberOfPages();
    drawFooter(doc, pageCount, settings);
    drawWatermark(doc, devis, pageCount);
    return doc.output('blob');
}
