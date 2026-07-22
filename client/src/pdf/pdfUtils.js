import QRCode from 'qrcode';
export const C = {
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
export const PAGE_W = 210;
export const PAGE_H = 297;
export const M = 20;
export const CW = PAGE_W - 2 * M;
export const FONT = 'helvetica';
export const LH = 3.5;
export const MAX_Y = PAGE_H - 20;
export function currency(s) {
    return s.currency || '';
}
export function fmt(n) {
    const fixed = n.toFixed(2);
    const [int, dec] = fixed.split('.');
    return int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ',' + dec;
}
export function fmtInt(n) {
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
export function fillRoundRect(doc, x, y, w, h, r, color) {
    doc.setFillColor(color);
    doc.roundedRect(x, y, w, h, r, r, 'F');
}
export function companyColor(s) {
    return s.service_color || C.accent;
}
export async function drawHeader(doc, settings, title, numero, y) {
    const accent = companyColor(settings);
    doc.setFillColor(accent);
    doc.rect(0, 0, PAGE_W, 3, 'F');
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
    const cardW = 70;
    const cardX = PAGE_W - M - cardW;
    const cardH = 28;
    fillRoundRect(doc, cardX, y, cardW, cardH, 4, C.white);
    doc.setDrawColor(C.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(cardX, y, cardW, cardH, 4, 4, 'S');
    doc.setFillColor(accent);
    doc.rect(cardX, y, cardW, 2.5, 'F');
    try {
        const qrData = await QRCode.toDataURL(numero, {
            width: 80, margin: 0, color: { dark: C.navy, light: '#FFFFFF' },
        });
        doc.addImage(qrData, 'PNG', cardX + 6, y + 5, 10, 10);
    }
    catch { /* skip QR */ }
    doc.setFont(FONT, 'bold');
    doc.setFontSize(13);
    doc.setTextColor(C.navy);
    doc.text(title, cardX + 20, y + 11);
    doc.setFont(FONT, 'normal');
    doc.setFontSize(7);
    doc.setTextColor(C.textLight);
    doc.text(`N° ${numero}`, cardX + 20, y + 17);
    const dateStr = new Date().toLocaleDateString('fr-FR', {
        year: 'numeric', month: 'short', day: 'numeric',
    });
    doc.text(dateStr, cardX + 20, y + 21);
    const sepY = y + 33;
    doc.setDrawColor(C.border);
    doc.setLineWidth(0.3);
    doc.line(M, sepY, PAGE_W - M, sepY);
    return sepY + 5;
}
export function drawClientCard(doc, client, y) {
    const cardH = 28;
    fillRoundRect(doc, M, y, CW, cardH, 6, C.lightBg);
    doc.setDrawColor(C.accent);
    doc.setLineWidth(1.8);
    doc.line(M, y, M, y + cardH);
    doc.setFont(FONT, 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(C.textVeryLight);
    doc.text('CLIENT', M + 12, y + 8);
    const name = client?.company || client?.nom || '-';
    const addr = client?.adresse || '';
    const tel = client?.telephone || '';
    doc.setFont(FONT, 'bold');
    doc.setFontSize(9);
    doc.setTextColor(C.text);
    doc.text(name, M + 12, y + 15);
    doc.setFont(FONT, 'normal');
    doc.setFontSize(7);
    doc.setTextColor(C.textLight);
    let cy = y + 20;
    if (addr) {
        doc.text(addr, M + 12, cy);
        cy += LH + 0.5;
    }
    if (tel) {
        doc.text(tel, M + 12, cy);
        cy += LH + 0.5;
    }
    return y + cardH + 6;
}
export function ensureSpace(doc, y, needed) {
    if (y + needed > MAX_Y) {
        doc.addPage();
        return M + 5;
    }
    return y;
}
export function drawFooter(doc, pageCount, settings) {
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
export function drawSignatureArea(doc, y, leftLabel, rightLabel) {
    const colW = (CW - 10) / 2;
    doc.setFont(FONT, 'bold');
    doc.setFontSize(7);
    doc.setTextColor(C.textVeryLight);
    doc.text(leftLabel, M, y + 3);
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
    doc.setFont(FONT, 'bold');
    doc.setFontSize(7);
    doc.setTextColor(C.textVeryLight);
    doc.text(rightLabel, PAGE_W - M - colW, y + 3);
    doc.setFont(FONT, 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(C.text);
    doc.text('Nom :', PAGE_W - M - colW, y + 9);
    doc.text('Date :', PAGE_W - M - colW, y + 14);
    doc.text('Signature :', PAGE_W - M - colW, y + 19);
    doc.setDrawColor(C.border);
    doc.setLineWidth(0.3);
    doc.line(PAGE_W - M - colW + 13, y + 9, PAGE_W - M, y + 9);
    doc.line(PAGE_W - M - colW + 14, y + 14, PAGE_W - M, y + 14);
    doc.line(PAGE_W - M - colW, y + 28, PAGE_W - M, y + 28);
    return y + 34;
}
