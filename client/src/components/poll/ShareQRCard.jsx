import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { LinkSimple, Download, Check } from '@phosphor-icons/react';
import toast from 'react-hot-toast';

export default function ShareQRCard({ poll }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef(null);

  const pollUrl = `${window.location.origin}/polls/${poll.id}`;

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -12, y: x * 12 });
  };

  const handleMouseEnter = () => setHovering(true);
  const handleMouseLeave = () => {
    setHovering(false);
    setTilt({ x: 0, y: 0 });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(pollUrl).then(
      () => {
        setCopied(true);
        toast.success('Link copied!');
        setTimeout(() => setCopied(false), 2000);
      },
      () => toast.error('Failed to copy link'),
    );
  };

  const downloadQR = () => {
    const svg = cardRef.current?.querySelector('svg.qr-code');
    if (!svg) return;

    const canvas = document.createElement('canvas');
    const size = 512;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const data = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);

      const link = document.createElement('a');
      link.download = `${poll.title.replace(/[^a-zA-Z0-9]/g, '_')}_qr.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(data)));
  };

  return (
    <div
      className="rounded-xl p-5 space-y-4"
      style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <h3 className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
        Share this poll
      </h3>

      {/* 3D Card */}
      <div className="flex justify-center" style={{ perspective: '800px' }}>
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="relative w-56 rounded-2xl p-5 space-y-3 transition-transform duration-200 ease-out"
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${hovering ? 1.03 : 1})`,
            transformStyle: 'preserve-3d',
            background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-400), var(--color-accent-500))',
            boxShadow: hovering
              ? '0 20px 40px rgba(0,0,0,0.25), 0 0 30px color-mix(in srgb, var(--color-primary-500) 30%, transparent)'
              : '0 8px 24px rgba(0,0,0,0.15)',
          }}
        >
          {/* Gloss overlay */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{
              background: `radial-gradient(circle at ${50 + tilt.y * 4}% ${50 + tilt.x * 4}%, rgba(255,255,255,0.15) 0%, transparent 60%)`,
            }}
          />

          {/* Card content */}
          <div style={{ transform: 'translateZ(20px)' }}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/60">
              VotePulse
            </p>
            <p className="mt-1 text-sm font-bold text-white truncate">
              {poll.title}
            </p>
          </div>

          <div
            className="flex justify-center rounded-xl p-3"
            style={{
              backgroundColor: 'rgba(255,255,255,0.95)',
              transform: 'translateZ(30px)',
            }}
          >
            <QRCodeSVG
              className="qr-code"
              value={pollUrl}
              size={140}
              level="M"
              bgColor="transparent"
              fgColor="#1a1a1a"
            />
          </div>

          <p
            className="text-[10px] text-center text-white/50 truncate"
            style={{ transform: 'translateZ(15px)' }}
          >
            Scan to vote
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={copyLink}
          className="cursor-pointer flex-1 inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors hover:bg-[var(--surface-hover)]"
          style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
        >
          {copied ? <Check size={13} weight="bold" /> : <LinkSimple size={13} />}
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
        <button
          onClick={downloadQR}
          className="cursor-pointer flex-1 inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors hover:bg-[var(--surface-hover)]"
          style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
        >
          <Download size={13} /> Download QR
        </button>
      </div>
    </div>
  );
}
