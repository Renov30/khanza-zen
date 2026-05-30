"use client";

import React, { useEffect, useRef, useState } from 'react';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  label?: string;
  sublabel?: string;
}

export default function QRCodeDisplay({ value, size = 100, label, sublabel }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !value.trim()) return;
    setError(false);

    let cancelled = false;

    import('qrcode').then((QRCode) => {
      if (cancelled) return;
      QRCode.toCanvas(canvasRef.current, value.trim(), {
        width: size,
        margin: 2,
        color: { dark: '#1e293b', light: '#ffffff' },
      }, (err: any) => {
        if (!cancelled && err) setError(true);
      });
    }).catch(() => {
      if (!cancelled) setError(true);
    });

    return () => { cancelled = true; };
  }, [value, size]);

  if (!value.trim()) return null;

  return (
    <div className="flex flex-col items-center gap-1">
      <canvas ref={canvasRef} width={size} height={size}
        className="rounded-lg border border-slate-200 bg-white" />
      {error && (
        <div className="text-[10px] text-red-500 italic">Gagal generate QR</div>
      )}
      {label && (
        <span className="text-[11px] font-semibold text-slate-700 text-center leading-tight">{label}</span>
      )}
      {sublabel && (
        <span className="text-[10px] text-slate-500 text-center leading-tight">{sublabel}</span>
      )}
    </div>
  );
}
