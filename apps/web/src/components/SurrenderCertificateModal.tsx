import React, { useState } from 'react';
import type { SurrenderDocument } from '@bvb/shared';
import confetti from 'canvas-confetti';
import { SignaturePad } from './SignaturePad';
import { soundFx } from '../utils/audio';
import {
  downloadCertificateAsPng,
  downloadCertificateAsPdf,
} from '../utils/certificateGenerator';

interface SurrenderCertificateModalProps {
  documentData: SurrenderDocument;
  myPlayerId: string;
  roomCode?: string;
  onSignSurrender: (data: { signatureDataUrl: string }) => void;
  onClose: () => void;
  theme?: 'day' | 'night';
}

export const SurrenderCertificateModal: React.FC<SurrenderCertificateModalProps> = ({
  documentData,
  myPlayerId,
  roomCode,
  onSignSurrender,
  onClose,
  theme = 'day',
}) => {
  const isNight = theme === 'night';
  const isLoser = myPlayerId === documentData.loserPlayerId;
  const isSigned = documentData.isSigned;

  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(
    documentData.signatureDataUrl || null
  );

  const [isExportingPng, setIsExportingPng] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const canSign = !isSigned && isLoser;

  const dateStr = documentData.signedAt
    ? new Date(documentData.signedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

  const handleSealSurrender = () => {
    if (!signatureDataUrl) {
      alert('Please draw your signature in the box before sealing the declaration!');
      return;
    }

    soundFx.play('stamp');

    onSignSurrender({
      signatureDataUrl,
    });

    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#EF4444', '#DC2626', '#F59E0B'],
    });

    setStatusMessage('✅ SURRENDER DECLARATION SIGNED & SEALED!');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const certDataForExport = {
    id: documentData.id,
    loserName: documentData.loserName,
    winnerName: documentData.winnerName,
    scoreWinner: documentData.scoreWinner,
    scoreLoser: documentData.scoreLoser,
    signatureDataUrl: documentData.signatureDataUrl || signatureDataUrl || undefined,
    signedAt: documentData.signedAt || (isSigned ? Date.now() : undefined),
    roomCode,
  };

  const handleDownloadPng = async () => {
    try {
      setIsExportingPng(true);
      setStatusMessage('📸 Generating PNG...');
      await downloadCertificateAsPng(certDataForExport);
      setStatusMessage('✅ PNG downloaded!');
      setTimeout(() => setStatusMessage(null), 2500);
    } catch (err) {
      console.error('Failed to download PNG:', err);
      setStatusMessage('❌ Failed to generate PNG.');
    } finally {
      setIsExportingPng(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setIsExportingPdf(true);
      setStatusMessage('📄 Generating PDF...');
      await downloadCertificateAsPdf(certDataForExport);
      setStatusMessage('✅ PDF downloaded!');
      setTimeout(() => setStatusMessage(null), 2500);
    } catch (err) {
      console.error('Failed to download PDF:', err);
      setStatusMessage('❌ Failed to generate PDF.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div
        className={`relative w-full max-w-3xl border-4 border-ink shadow-pixel flex flex-col max-h-[92vh] overflow-hidden my-auto ${
          isNight ? 'bg-[#18243A] text-paper' : 'bg-[#FFFDF5] text-ink'
        }`}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-ink text-paper border-b-4 border-ink">
          <div className="flex items-center gap-2">
            <span className="text-xl">📜</span>
            <span className="font-arcade text-xs sm:text-sm text-cartridgeYellow font-bold tracking-wider">
              OFFICIAL MATCH DECLARATION
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-2.5 py-1 bg-arcadeRed text-white font-arcade text-xs hover:bg-red-600 border border-paper transition-all font-bold"
          >
            ✕ CLOSE
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col items-center">
          {/* Notification message */}
          {statusMessage && (
            <div className="w-full max-w-2xl mb-4 px-4 py-2 bg-cartridgeYellow text-ink font-mono font-bold text-xs sm:text-sm border-2 border-ink shadow-pixel text-center animate-bounce">
              {statusMessage}
            </div>
          )}

          {/* THE CLEAN, MINIMAL CERTIFICATE */}
          <div
            id="surrender-decree-print"
            className="w-full max-w-2xl p-6 sm:p-8 border-4 border-[#111827] shadow-xl relative select-none bg-[#FFFDF7] text-[#111827]"
          >
            {/* Inner Gold Border */}
            <div className="border border-[#F59E0B] p-5 sm:p-6 relative">
              {/* Corner Pixel Dots */}
              <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-[#111827]" />
              <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#111827]" />
              <div className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-[#111827]" />
              <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-[#111827]" />

              {/* Logo Header: BRO [v] BRO */}
              <div className="flex flex-col items-center text-center mb-4">
                <div className="flex items-center font-mono font-black text-2xl tracking-wider text-[#111827]">
                  <span>BRO</span>
                  <div className="mx-2 px-2 py-0.5 bg-[#EF4444] text-white text-xs border border-[#111827] font-bold">
                    v
                  </div>
                  <span>BRO</span>
                </div>
                <span className="text-[10px] font-mono text-gray-500 font-bold uppercase tracking-widest mt-1">
                  OFFICIAL MATCH SURRENDER DECLARATION
                </span>
              </div>

              {/* Title & Meta */}
              <div className="text-center mb-5">
                <h2 className="font-mono text-lg sm:text-xl font-black text-[#DC2626] uppercase tracking-wide">
                  DECLARATION OF SUPERIOR GAMER
                </h2>
                <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono text-gray-600 mt-1">
                  <span>FINAL SCORE: {documentData.scoreWinner} - {documentData.scoreLoser}</span>
                  <span>•</span>
                  <span>DATE: {dateStr}</span>
                  {roomCode && (
                    <>
                      <span>•</span>
                      <span>ROOM: {roomCode}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="w-full h-0.5 bg-gray-200 mb-6" />

              {/* THE SINGLE CLEAN PARAGRAPH (1 PARA WITH DETAIL) */}
              <div className="text-center my-6 px-2 sm:px-4">
                <p className="font-serif text-base sm:text-lg leading-relaxed text-gray-800">
                  &ldquo;I,{' '}
                  <strong className="font-mono text-[#DC2626] font-black uppercase">
                    {documentData.loserName}
                  </strong>
                  , hereby declare that{' '}
                  <strong className="font-mono text-[#059669] font-black uppercase">
                    {documentData.winnerName}
                  </strong>{' '}
                  is the superior gamer than me. Having suffered a decisive defeat of{' '}
                  <strong>{documentData.scoreWinner} to {documentData.scoreLoser}</strong> in Bro v Bro on {dateStr}, I openly concede that I was fairly outplayed with zero excuses, zero lag, and full respect to the better player.&rdquo;
                </p>
              </div>

              {/* Signatures Row */}
              <div className="mt-8 pt-4 border-t border-gray-200 flex items-end justify-between gap-4">
                {/* Left: Loser Signature */}
                <div className="flex-1 text-left">
                  <span className="font-mono text-[10px] font-bold text-gray-500 uppercase block mb-1">
                    LOSER'S SIGNATURE:
                  </span>
                  <div className="h-12 border-b border-gray-800 flex items-end pb-1">
                    {documentData.signatureDataUrl || signatureDataUrl ? (
                      <img
                        src={documentData.signatureDataUrl || signatureDataUrl!}
                        alt="Signature"
                        className="max-h-11 max-w-full object-contain"
                      />
                    ) : (
                      <span className="font-mono text-xs text-[#DC2626] italic">
                        [ Pending Signature ]
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-xs font-bold text-gray-900 block mt-1 uppercase">
                    {documentData.loserName}
                  </span>
                </div>

                {/* Center: Small Verified Badge */}
                <div className="flex flex-col items-center px-2">
                  <div
                    className={`w-14 h-14 rounded-full border-2 flex flex-col items-center justify-center text-center p-1 ${
                      isSigned
                        ? 'border-emerald-600 text-emerald-600 bg-emerald-50'
                        : 'border-gray-300 text-gray-400'
                    }`}
                  >
                    <span className="text-xs font-bold leading-none">★</span>
                    <span className="font-mono text-[8px] font-bold uppercase tracking-tighter mt-0.5">
                      {isSigned ? 'SIGNED' : 'PENDING'}
                    </span>
                  </div>
                </div>

                {/* Right: Winner Confirmation */}
                <div className="flex-1 text-right">
                  <span className="font-mono text-[10px] font-bold text-gray-500 uppercase block mb-1">
                    SUPERIOR GAMER:
                  </span>
                  <div className="h-12 border-b border-gray-800 flex items-end justify-end pb-1">
                    <span className="font-mono text-base font-bold text-[#D97706] uppercase">
                      👑 {documentData.winnerName}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-gray-900 block mt-1 uppercase">
                    {documentData.winnerName}
                  </span>
                </div>
              </div>

              {/* Minimal footer */}
              <div className="text-center font-mono text-[9px] text-gray-400 uppercase tracking-widest mt-6">
                BRO V BRO • HTTPS://BROVBRO.APP
              </div>
            </div>
          </div>

          {/* SIGNING SECTION */}
          {canSign ? (
            <div
              className={`w-full max-w-2xl mt-5 p-4 border-2 border-ink shadow-pixel ${
                isNight ? 'bg-slate-900 text-paper' : 'bg-white text-ink'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">✍️</span>
                <h3 className="font-arcade text-xs text-arcadeRed font-bold tracking-wider">
                  SIGN YOUR SURRENDER:
                </h3>
              </div>

              <div className="mb-3">
                <SignaturePad
                  signerName={documentData.loserName}
                  onSignatureChange={(dataUrl) => setSignatureDataUrl(dataUrl)}
                />
              </div>

              <button
                type="button"
                onClick={handleSealSurrender}
                disabled={!signatureDataUrl}
                className="w-full py-3 bg-arcadeRed text-white font-arcade text-xs tracking-wider border-2 border-ink shadow-pixel hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold"
              >
                ✍️ SIGN &amp; SEAL DECLARATION
              </button>
            </div>
          ) : !isSigned ? (
            <div
              className={`w-full max-w-2xl mt-4 p-4 border-2 border-ink text-center ${
                isNight ? 'bg-slate-900 text-paper' : 'bg-amber-50 text-ink'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-base">⏳</span>
                <span className={`font-arcade text-xs font-bold animate-pulse ${isNight ? 'text-cartridgeYellow' : 'text-amber-900'}`}>
                  AWAITING [{documentData.loserName.toUpperCase()}]&apos;S SIGNATURE...
                </span>
              </div>
              <p className="font-mono text-xs text-slate-600 dark:text-slate-400 mt-1">
                Only the defeated player can sign the confession. Official downloads will unlock immediately once sealed.
              </p>
            </div>
          ) : (
            <div className="w-full max-w-2xl mt-4 p-2.5 bg-emerald-100 dark:bg-emerald-950/60 border border-gameBoyGreen text-emerald-800 dark:text-emerald-300 font-mono text-xs font-bold text-center">
              ✅ DECLARATION SIGNED &amp; SEALED.
            </div>
          )}

          {/* ACTION BUTTONS (LOCKED UNTIL SIGNED) */}
          {isSigned ? (
            <div className="w-full max-w-2xl mt-5 flex flex-wrap gap-3 justify-center">
              <button
                onClick={handleDownloadPng}
                disabled={isExportingPng}
                className="flex-1 min-w-[160px] py-3 px-4 bg-cartridgeYellow text-ink font-arcade text-xs tracking-wider border-2 border-ink shadow-pixel hover:bg-yellow-300 disabled:opacity-50 transition-all font-bold flex items-center justify-center gap-2"
              >
                <span>📸</span>
                <span>{isExportingPng ? 'SAVING...' : 'DOWNLOAD PNG'}</span>
              </button>

              <button
                onClick={handleDownloadPdf}
                disabled={isExportingPdf}
                className="flex-1 min-w-[160px] py-3 px-4 bg-gameBoyGreen text-ink font-arcade text-xs tracking-wider border-2 border-ink shadow-pixel hover:bg-emerald-400 disabled:opacity-50 transition-all font-bold flex items-center justify-center gap-2"
              >
                <span>📄</span>
                <span>{isExportingPdf ? 'SAVING...' : 'DOWNLOAD PDF'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="py-3 px-4 bg-darkNavy text-paper font-arcade text-xs tracking-wider border-2 border-ink shadow-pixel hover:bg-slate-700 transition-all font-bold flex items-center justify-center gap-2"
              >
                <span>🖨️</span>
                <span>PRINT</span>
              </button>
            </div>
          ) : (
            <div className="w-full max-w-2xl mt-4 p-3 bg-stone-100 dark:bg-slate-900 border-2 border-dashed border-ink/40 text-center font-mono text-xs text-slate-700 dark:text-slate-300">
              🔒 <strong>Downloads Locked:</strong> The certificate will be available to download in PNG &amp; PDF as soon as {documentData.loserName} signs.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
