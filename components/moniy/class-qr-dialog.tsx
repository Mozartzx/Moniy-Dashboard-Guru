'use client';

import { Copy, Download, X } from 'lucide-react';
import qrcode from 'qrcode-generator';
import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

const MARGIN = 4;

/** Matriks gelap/terang QR untuk teks `value` (koreksi kesalahan M). */
function buildMatrix(value: string): boolean[][] {
  const qr = qrcode(0, 'M');
  qr.addData(value);
  qr.make();
  const size = qr.getModuleCount();
  return Array.from({ length: size }, (_, r) => Array.from({ length: size }, (_, c) => qr.isDark(r, c)));
}

function toPngBlob(matrix: boolean[][], scale: number): Promise<Blob | null> {
  const total = (matrix.length + MARGIN * 2) * scale;
  const canvas = document.createElement('canvas');
  canvas.width = total;
  canvas.height = total;
  const ctx = canvas.getContext('2d');
  if (!ctx) return Promise.resolve(null);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, total, total);
  ctx.fillStyle = '#0f172a';
  matrix.forEach((row, r) => row.forEach((dark, c) => {
    if (dark) ctx.fillRect((c + MARGIN) * scale, (r + MARGIN) * scale, scale, scale);
  }));
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

/** QR kode kelas: siswa memindainya di aplikasi (atau memilih fotonya dari galeri) untuk bergabung. */
export function ClassQrDialog({ open, onOpenChange, code, name }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  code: string;
  name: string;
}) {
  const matrix = useMemo(() => buildMatrix(code), [code]);
  const [copied, setCopied] = useState(false);
  const viewSize = matrix.length + MARGIN * 2;

  const download = async () => {
    const blob = await toPngBlob(matrix, 12);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qr-${code}.png`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="detail-modal manage-class-modal" showCloseButton={false}>
        <button className="modal-close" type="button" onClick={() => onOpenChange(false)} aria-label="Tutup"><X size={20} /></button>
        <DialogTitle>QR kelas {name}</DialogTitle>
        <DialogDescription>Siswa membuka Moniy, pilih Gabung kelas, lalu pindai QR ini atau pilih fotonya dari galeri.</DialogDescription>
        <div className="class-qr">
          <svg viewBox={`0 0 ${viewSize} ${viewSize}`} shapeRendering="crispEdges">
            <title>{`QR kode kelas ${code}`}</title>
            <rect width={viewSize} height={viewSize} fill="#fff" />
            {matrix.map((row, r) => row.map((dark, c) => (dark ? <rect key={`${r}-${c}`} x={c + MARGIN} y={r + MARGIN} width="1" height="1" fill="#0f172a" /> : null)))}
          </svg>
          <strong className="class-qr-code">{code}</strong>
        </div>
        <div className="module-form-actions">
          <button className="primary-button" type="button" onClick={() => void download()}><Download size={18} /> Unduh QR</button>
          <button className="secondary-button" type="button" onClick={() => void copy()}><Copy size={16} /> {copied ? 'Tersalin' : 'Salin kode'}</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
