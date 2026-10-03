export interface SurrenderCertData {
  id: string;
  loserName: string;
  winnerName: string;
  scoreWinner: number;
  scoreLoser: number;
  signatureDataUrl?: string;
  signedAt?: number;
  roomCode?: string;
}

/**
 * Renders a clean, minimal 1-paragraph Surrender Certificate with our Bro v Bro logo onto Canvas.
 * Resolution: 1200 x 800 (clean 3:2 landscape format).
 */
export async function renderSurrenderCertificateToCanvas(
  data: SurrenderCertData
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 800;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  const {
    id,
    loserName,
    winnerName,
    scoreWinner,
    scoreLoser,
    signatureDataUrl,
    signedAt,
    roomCode,
  } = data;

  const dateStr = signedAt
    ? new Date(signedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

  // 1. Clean off-white paper background
  ctx.fillStyle = '#FFFDF7';
  ctx.fillRect(0, 0, 1200, 800);

  // 2. Minimalist retro double border
  ctx.strokeStyle = '#111827';
  ctx.lineWidth = 4;
  ctx.strokeRect(36, 36, 1128, 728);

  ctx.strokeStyle = '#F59E0B'; // Gold accent
  ctx.lineWidth = 1.5;
  ctx.strokeRect(44, 44, 1112, 712);

  // Corner pixel accents
  const drawCornerDot = (x: number, y: number) => {
    ctx.fillStyle = '#111827';
    ctx.fillRect(x - 3, y - 3, 6, 6);
  };
  drawCornerDot(54, 54);
  drawCornerDot(1146, 54);
  drawCornerDot(54, 746);
  drawCornerDot(1146, 746);

  // 3. Official BRO [v] BRO Logo (Centered at top)
  drawBroVBroLogo(ctx, 600, 100);

  // Subtitle under logo
  ctx.textAlign = 'center';
  ctx.fillStyle = '#6B7280';
  ctx.font = 'bold 11px "Courier New", monospace';
  ctx.fillText('OFFICIAL MATCH SURRENDER DECLARATION', 600, 148);

  // 4. Document Title
  ctx.fillStyle = '#DC2626'; // Arcade Red
  ctx.font = 'bold 28px "Courier New", monospace';
  ctx.fillText('DECLARATION OF SUPERIOR GAMER', 600, 195);

  // Match details meta line
  ctx.fillStyle = '#4B5563';
  ctx.font = '13px "Courier New", monospace';
  const metaText = `FINAL SCORE: ${scoreWinner} - ${scoreLoser}   •   DATE: ${dateStr}${
    roomCode ? `   •   ROOM: ${roomCode}` : ''
  }   •   REF: ${id}`;
  ctx.fillText(metaText, 600, 225);

  // Horizontal divider line
  ctx.strokeStyle = '#E5E7EB';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(180, 245);
  ctx.lineTo(1020, 245);
  ctx.stroke();

  // 5. The Single Minimal Paragraph (Centered, clean, elegant)
  const bodyX = 160;
  let bodyY = 320;
  const maxWidth = 880;
  const lineHeight = 38;

  ctx.textAlign = 'center';
  ctx.font = '22px Georgia, serif';
  ctx.fillStyle = '#1F2937';

  const fullText =
    `I, ${loserName.toUpperCase()}, hereby declare that ${winnerName.toUpperCase()} is the superior gamer than me. Having suffered a decisive defeat of ${scoreWinner} to ${scoreLoser} in Bro v Bro on ${dateStr}, I openly concede that I was fairly outplayed with zero excuses, zero lag, and full respect to the better player.`;

  // Wrap text cleanly across lines
  const words = fullText.split(' ');
  let currentLine = '';
  const lines: string[] = [];

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = ctx.measureText(testLine).width;
    if (testWidth > maxWidth) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);

  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], 600, bodyY + i * lineHeight);
  }

  // 6. Signatures Section (Clean & Minimal)
  const sigY = 560;
  const leftX = 220;
  const rightX = 720;
  const boxWidth = 260;

  // --- Left: Defeated Player Signature ---
  ctx.textAlign = 'left';
  ctx.fillStyle = '#6B7280';
  ctx.font = 'bold 11px "Courier New", monospace';
  ctx.fillText("LOSER'S SIGNATURE:", leftX, sigY - 45);

  // Draw signature line
  ctx.strokeStyle = '#111827';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(leftX, sigY + 15);
  ctx.lineTo(leftX + boxWidth, sigY + 15);
  ctx.stroke();

  // Draw signature if present
  if (signatureDataUrl) {
    try {
      const sigImg = await loadImage(signatureDataUrl);
      ctx.drawImage(sigImg, leftX + 10, sigY - 40, 240, 52);
    } catch {
      ctx.fillStyle = '#1E3A8A';
      ctx.font = 'italic 26px "Brush Script MT", cursive, serif';
      ctx.fillText(loserName, leftX + 20, sigY + 5);
    }
  } else {
    ctx.fillStyle = '#DC2626';
    ctx.font = 'italic 14px "Courier New", monospace';
    ctx.fillText('[ Pending Signature ]', leftX + 30, sigY + 5);
  }

  ctx.fillStyle = '#111827';
  ctx.font = 'bold 14px "Courier New", monospace';
  ctx.fillText(loserName.toUpperCase(), leftX, sigY + 38);
  ctx.fillStyle = '#DC2626';
  ctx.font = '11px "Courier New", monospace';
  ctx.fillText('CONCEDED DEFEAT', leftX, sigY + 55);

  // --- Right: Winner Confirmation ---
  ctx.textAlign = 'left';
  ctx.fillStyle = '#6B7280';
  ctx.font = 'bold 11px "Courier New", monospace';
  ctx.fillText('SUPERIOR GAMER:', rightX, sigY - 45);

  // Draw winner line
  ctx.strokeStyle = '#111827';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(rightX, sigY + 15);
  ctx.lineTo(rightX + boxWidth, sigY + 15);
  ctx.stroke();

  ctx.fillStyle = '#D97706';
  ctx.font = 'bold 22px "Courier New", monospace';
  ctx.fillText(`👑 ${winnerName.toUpperCase()}`, rightX + 10, sigY + 5);

  ctx.fillStyle = '#111827';
  ctx.font = 'bold 14px "Courier New", monospace';
  ctx.fillText(winnerName.toUpperCase(), rightX, sigY + 38);
  ctx.fillStyle = '#059669';
  ctx.font = '11px "Courier New", monospace';
  ctx.fillText('VERIFIED VICTOR', rightX, sigY + 55);

  // Center subtle gold verified seal
  drawMiniVerifiedSeal(ctx, 600, sigY - 5, Boolean(signatureDataUrl));

  // 7. Minimal Footer
  ctx.textAlign = 'center';
  ctx.fillStyle = '#9CA3AF';
  ctx.font = '10px "Courier New", monospace';
  ctx.fillText('GENERATED BY BRO V BRO • HTTPS://BROVBRO.APP', 600, 725);

  return canvas;
}

/**
 * Draws the official Bro v Bro pixel logo at (cx, cy).
 */
function drawBroVBroLogo(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // BRO (left)
  ctx.fillStyle = '#111827';
  ctx.font = '900 28px "Courier New", monospace';
  ctx.fillText('BRO', cx - 72, cy);

  // Center Pixel Heart / [v] Badge
  // Red background badge
  ctx.fillStyle = '#EF4444';
  ctx.fillRect(cx - 20, cy - 14, 40, 28);
  ctx.strokeStyle = '#111827';
  ctx.lineWidth = 2;
  ctx.strokeRect(cx - 20, cy - 14, 40, 28);

  // "v" in badge
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 16px "Courier New", monospace';
  ctx.fillText('v', cx, cy + 1);

  // BRO (right)
  ctx.fillStyle = '#111827';
  ctx.font = '900 28px "Courier New", monospace';
  ctx.fillText('BRO', cx + 72, cy);

  ctx.restore();
}

/**
 * Draws a subtle, clean circular verified seal in the center.
 */
function drawMiniVerifiedSeal(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  isSigned: boolean
) {
  ctx.save();
  ctx.translate(x, y);

  const radius = 38;

  // Outer circle
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.strokeStyle = isSigned ? '#059669' : '#D1D5DB';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Inner dashed circle
  ctx.beginPath();
  ctx.setLineDash([3, 3]);
  ctx.arc(0, 0, radius - 5, 0, Math.PI * 2);
  ctx.strokeStyle = isSigned ? '#10B981' : '#9CA3AF';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.setLineDash([]);

  // Text
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = isSigned ? '#059669' : '#9CA3AF';
  ctx.font = 'bold 9px "Courier New", monospace';
  ctx.fillText(isSigned ? '★ VERIFIED ★' : 'BRO V BRO', 0, -10);
  ctx.font = 'bold 10px "Courier New", monospace';
  ctx.fillText(isSigned ? 'SIGNED' : 'PENDING', 0, 6);

  ctx.restore();
}

/**
 * Helper to load an image from URL or Data URL.
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Downloads the minimal decree as a crisp, high-resolution PNG image.
 */
export async function downloadCertificateAsPng(
  data: SurrenderCertData,
  fileName?: string
): Promise<void> {
  const canvas = await renderSurrenderCertificateToCanvas(data);
  const dataUrl = canvas.toDataURL('image/png', 1.0);

  const defaultName = `Bro_v_Bro_Surrender_${data.loserName}_vs_${data.winnerName}.png`
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_-]/g, '');

  const link = document.createElement('a');
  link.download = fileName || defaultName;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates and downloads a clean, minimal PDF document with the Bro v Bro logo and signature.
 * Standard PDF 1.4 with DCTDecode image embedding (zero external dependencies).
 */
export async function downloadCertificateAsPdf(
  data: SurrenderCertData,
  fileName?: string
): Promise<void> {
  const canvas = await renderSurrenderCertificateToCanvas(data);

  // Convert canvas to JPEG for PDF embedding
  const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.95);
  const base64Data = jpegDataUrl.split(',')[1];
  const binaryString = atob(base64Data);
  const jpegBytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    jpegBytes[i] = binaryString.charCodeAt(i);
  }

  // Standard A4 Landscape in PDF points: 842 x 595
  const pageWidth = 842;
  const pageHeight = 595;

  const pdfHeader = '%PDF-1.4\n';
  const obj1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
  const obj2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
  const obj3 =
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' +
    pageWidth +
    ' ' +
    pageHeight +
    '] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n';

  const obj4Header =
    '4 0 obj\n<< /Type /XObject /Subtype /Image /Width ' +
    canvas.width +
    ' /Height ' +
    canvas.height +
    ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' +
    jpegBytes.length +
    ' >>\nstream\n';
  const obj4Footer = '\nendstream\nendobj\n';

  const contentStream = `q ${pageWidth} 0 0 ${pageHeight} 0 0 cm /Im0 Do Q`;
  const obj5 =
    '5 0 obj\n<< /Length ' +
    contentStream.length +
    ' >>\nstream\n' +
    contentStream +
    '\nendstream\nendobj\n';

  const enc = new TextEncoder();
  const headerBytes = enc.encode(pdfHeader);
  const obj1Bytes = enc.encode(obj1);
  const obj2Bytes = enc.encode(obj2);
  const obj3Bytes = enc.encode(obj3);
  const obj4HeadBytes = enc.encode(obj4Header);
  const obj4FootBytes = enc.encode(obj4Footer);
  const obj5Bytes = enc.encode(obj5);

  const offset1 = headerBytes.length;
  const offset2 = offset1 + obj1Bytes.length;
  const offset3 = offset2 + obj2Bytes.length;
  const offset4 = offset3 + obj3Bytes.length;
  const offset5 = offset4 + obj4HeadBytes.length + jpegBytes.length + obj4FootBytes.length;

  const xrefOffset = offset5 + obj5Bytes.length;
  const padOffset = (num: number) => num.toString().padStart(10, '0');

  const xref =
    'xref\n' +
    '0 6\n' +
    '0000000000 65535 f \n' +
    padOffset(offset1) +
    ' 00000 n \n' +
    padOffset(offset2) +
    ' 00000 n \n' +
    padOffset(offset3) +
    ' 00000 n \n' +
    padOffset(offset4) +
    ' 00000 n \n' +
    padOffset(offset5) +
    ' 00000 n \n' +
    'trailer\n<< /Size 6 /Root 1 0 R >>\n' +
    'startxref\n' +
    xrefOffset +
    '\n%%EOF';

  const xrefBytes = enc.encode(xref);

  const blob = new Blob(
    [
      headerBytes,
      obj1Bytes,
      obj2Bytes,
      obj3Bytes,
      obj4HeadBytes,
      jpegBytes,
      obj4FootBytes,
      obj5Bytes,
      xrefBytes,
    ],
    { type: 'application/pdf' }
  );

  const defaultName = `Bro_v_Bro_Surrender_${data.loserName}_vs_${data.winnerName}.pdf`
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_-]/g, '');

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = fileName || defaultName;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
