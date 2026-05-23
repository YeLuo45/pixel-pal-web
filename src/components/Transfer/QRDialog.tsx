import React from 'react';

/**
 * V134: QRDialog — displays QR code for skill transfer
 */
interface QRDialogProps {
  dataUrl: string;
  onClose: () => void;
}

export function QRDialog({ dataUrl, onClose }: QRDialogProps) {
  return (
    <div className="qr-dialog-overlay" onClick={onClose}>
      <div className="qr-dialog" onClick={e => e.stopPropagation()}>
        <h3>Transfer QR Code</h3>
        <img src={dataUrl} alt="QR Code" className="qr-image" />
        <p className="muted">Scan with another PixelPal instance</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
