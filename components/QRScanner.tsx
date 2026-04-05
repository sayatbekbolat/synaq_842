"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { QrCode, X } from "lucide-react";

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
  onClose?: () => void;
  expectedCode?: string; // Optional: validate specific QR code
  title?: string;
}

export default function QRScanner({
  onScan,
  onError,
  onClose,
  expectedCode,
  title = "Scan QR Code",
}: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasScannedRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    const startScanner = async () => {
      try {
        // Wait a bit for DOM to be ready
        await new Promise(resolve => setTimeout(resolve, 100));

        if (!mounted) return;

        const scanner = new Html5Qrcode("qr-reader");
        scannerRef.current = scanner;

        // Try to get cameras first
        const cameras = await Html5Qrcode.getCameras();

        if (!cameras || cameras.length === 0) {
          throw new Error("No cameras found on this device");
        }

        console.log("Available cameras:", cameras);

        // Prefer back camera, fallback to first available
        const cameraId = cameras.length > 1 ? cameras[1].id : cameras[0].id;

        await scanner.start(
          cameraId,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            // Success callback
            console.log("QR Code scanned:", decodedText);

            // Only process once
            if (hasScannedRef.current) return;
            hasScannedRef.current = true;

            if (expectedCode && decodedText !== expectedCode) {
              setError("Invalid QR code. Please scan the correct code.");
              onError?.("Invalid QR code");
              hasScannedRef.current = false; // Allow retry
              return;
            }

            // Valid scan - stop scanner first, then call callback
            stopScanner();

            // Small delay to ensure scanner is stopped before navigation
            setTimeout(() => {
              onScan(decodedText);
            }, 100);
          },
          (errorMessage) => {
            // Error callback - these are normal scanning errors, ignore
            // console.log("Scanning...");
          }
        );

        if (mounted) {
          setIsScanning(true);
        }
      } catch (err) {
        console.error("Scanner error:", err);
        const errorMsg =
          err instanceof Error ? err.message : "Failed to start camera";
        if (mounted) {
          setError(errorMsg);
          onError?.(errorMsg);
        }
      }
    };

    startScanner();

    return () => {
      mounted = false;
      stopScanner();
    };
  }, [expectedCode, onScan, onError]);

  const stopScanner = () => {
    if (scannerRef.current) {
      const scanner = scannerRef.current;

      // Check if scanner is actually running before stopping
      if (scanner.getState() === 2) { // 2 = SCANNING state
        scanner
          .stop()
          .then(() => {
            scanner.clear();
            setIsScanning(false);
          })
          .catch((err) => {
            console.log("Scanner already stopped or error:", err.message);
          });
      } else {
        // Just clear if not running
        try {
          scanner.clear();
        } catch (e) {
          // Ignore clear errors
        }
      }
      scannerRef.current = null;
    }
  };

  const handleClose = () => {
    stopScanner();
    onClose?.();
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-foreground-muted/10">
        <div className="flex items-center gap-2">
          <QrCode className="w-6 h-6 text-lime" />
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
        </div>
        {onClose && (
          <button
            onClick={handleClose}
            className="p-2 hover:bg-surface rounded-lg transition-colors"
            type="button"
          >
            <X className="w-6 h-6 text-foreground-muted" />
          </button>
        )}
      </div>

      {/* Scanner Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="relative w-full max-w-sm">
          {/* QR Reader Container */}
          <div
            id="qr-reader"
            className="rounded-2xl overflow-hidden border-2 border-lime shadow-glow-lime"
          />

          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-danger/10 border border-danger/30 rounded-lg p-4">
              <p className="text-danger text-sm text-center mb-2">{error}</p>
              {error.includes("Permission") && (
                <p className="text-danger/80 text-xs text-center">
                  Please allow camera access in your browser settings
                </p>
              )}
              {error.includes("No cameras") && (
                <p className="text-danger/80 text-xs text-center">
                  Make sure your device has a working camera
                </p>
              )}
              {error.includes("NotReadableError") && (
                <p className="text-danger/80 text-xs text-center">
                  Camera might be in use by another app. Close other apps and try again.
                </p>
              )}
            </div>
          )}

          {/* Instructions */}
          {!error && (
            <div className="mt-6 text-center">
              <p className="text-foreground-muted text-sm">
                Position the QR code within the frame
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-lime rounded-full animate-pulse" />
                <p className="text-lime text-xs font-mono">
                  {isScanning ? "Scanning..." : "Initializing camera..."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Helper Text */}
      <div className="p-6 border-t border-foreground-muted/10">
        <p className="text-center text-foreground-muted text-xs mb-3">
          Make sure you&apos;re at the {expectedCode === "SYNAQ_START" ? "start" : "finish"} point
        </p>

        {/* Testing shortcut - remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <button
            onClick={() => {
              if (hasScannedRef.current) return;
              hasScannedRef.current = true;

              console.log("DEV MODE: Simulating QR scan");
              stopScanner();

              setTimeout(() => {
                onScan(expectedCode || "SYNAQ_START");
              }, 100);
            }}
            className="w-full bg-warning/20 border border-warning/40 text-foreground
                       text-xs py-2 rounded-lg hover:bg-warning/30 transition-colors"
            type="button"
          >
            🧪 DEV: Skip QR Scan (simulate success)
          </button>
        )}
      </div>
    </div>
  );
}
