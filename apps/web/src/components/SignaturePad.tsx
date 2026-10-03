import React, { useRef, useState, useEffect, useCallback } from 'react';

interface SignaturePadProps {
  onSignatureChange: (dataUrl: string | null) => void;
  disabled?: boolean;
  signerName?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  onSignatureChange,
  disabled = false,
  signerName = 'Defeated Gamer',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const [strokeCount, setStrokeCount] = useState(0);

  // Initialize canvas with transparent background and crisp DPR
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use internal coordinate resolution matching CSS dimensions
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#1E3A8A'; // Deep blue fountain pen ink
  }, []);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.setPointerCapture(e.pointerId);
    setIsDrawing(true);

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    // Draw a dot on tap
    ctx.arc(x, y, 1, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();

    if (!hasContent) {
      setHasContent(true);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore if pointer capture release fails
      }
    }
    setIsDrawing(false);
    setStrokeCount((prev) => prev + 1);

    if (canvas) {
      onSignatureChange(canvas.toDataURL('image/png'));
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    initCanvas();
    setHasContent(false);
    setStrokeCount(0);
    onSignatureChange(null);
  };

  // Generates a stylized cursive signature automatically
  const handleAutoSign = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    handleClear();

    // Draw stylized cursive text signature on canvas
    ctx.save();
    ctx.font = 'italic 34px "Brush Script MT", "Caveat", "Segoe Script", cursive, serif';
    ctx.fillStyle = '#1E3A8A';
    ctx.fillText(signerName, 40, 75);

    // Decorative flourish underneath
    ctx.strokeStyle = '#1E3A8A';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(35, 88);
    ctx.bezierCurveTo(90, 80, 180, 105, 320, 85);
    ctx.stroke();
    ctx.restore();

    setHasContent(true);
    setStrokeCount(1);
    onSignatureChange(canvas.toDataURL('image/png'));
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-full max-w-[420px] bg-[#FFFDF5] border-2 border-ink rounded shadow-inner overflow-hidden select-none">
        {/* Signature Canvas */}
        <canvas
          ref={canvasRef}
          width={420}
          height={130}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`w-full h-[130px] touch-none cursor-crosshair block ${
            disabled ? 'opacity-60 cursor-not-allowed' : ''
          }`}
          style={{ touchAction: 'none' }}
        />

        {/* Dashed baseline guideline */}
        <div className="absolute left-6 right-6 bottom-7 border-b border-dashed border-gray-300 pointer-events-none flex items-center justify-between">
          <span className="text-gray-400 font-mono text-[10px] uppercase tracking-wider">
            Sign here (draw with mouse or finger)
          </span>
          <span className="text-gray-400 font-mono text-xs">X 🖊️</span>
        </div>

        {/* Empty state hint */}
        {!hasContent && !disabled && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
            <span className="text-gray-500 font-mono text-xs italic">
              Draw signature here...
            </span>
          </div>
        )}
      </div>

      {/* Signature Toolbar Buttons */}
      {!disabled && (
        <div className="flex items-center justify-between w-full max-w-[420px] mt-2 text-xs font-mono">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClear}
              disabled={!hasContent}
              className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-ink border border-ink/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              🧹 Clear
            </button>
            <button
              type="button"
              onClick={handleAutoSign}
              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-800/40 transition-all font-semibold"
              title="Generate cursive signature automatically"
            >
              ✍️ Quick-Sign
            </button>
          </div>
          <span className="text-[10px] text-gray-500">
            {hasContent ? `✅ ${strokeCount} strokes recorded` : '⚠️ Signature needed'}
          </span>
        </div>
      )}
    </div>
  );
};
