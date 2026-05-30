"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download, Loader2, QrCode } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type QueueQrCodeDialogProps = {
  url: string;
  queueName: string;
  triggerClassName?: string;
};

function sanitizeFilename(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "queue";
}

export function QueueQrCodeDialog({
  url,
  queueName,
  triggerClassName,
}: QueueQrCodeDialogProps) {
  const [open, setOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setQrDataUrl(null);
    setError(null);

    QRCode.toDataURL(url, {
      width: 280,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    })
      .then((dataUrl) => {
        if (!cancelled) setQrDataUrl(dataUrl);
      })
      .catch(() => {
        if (!cancelled) setError("Could not generate QR code.");
      });

    return () => {
      cancelled = true;
    };
  }, [open, url]);

  function downloadPng() {
    if (!qrDataUrl) return;

    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `${sanitizeFilename(queueName)}-qr-code.png`;
    link.click();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={triggerClassName ?? "h-9"}>
          <QrCode size={14} className="mr-1.5" />
          QR Code
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Queue QR Code</DialogTitle>
          <DialogDescription>
            Scan to join <span className="font-medium text-foreground">{queueName}</span>.
            Print and place at your entrance for walk-in guests.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          <div className="flex h-[280px] w-[280px] items-center justify-center rounded-xl border border-border/40 bg-white p-3">
            {error ? (
              <p className="px-4 text-center text-sm text-destructive">{error}</p>
            ) : qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrDataUrl}
                alt={`QR code for ${queueName}`}
                width={256}
                height={256}
                className="h-64 w-64"
              />
            ) : (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            )}
          </div>

          <p className="w-full break-all rounded-lg bg-muted/30 px-3 py-2 text-center font-mono text-xs text-muted-foreground">
            {url}
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            onClick={downloadPng}
            disabled={!qrDataUrl}
            className="w-full sm:w-auto"
          >
            <Download size={14} className="mr-1.5" />
            Download PNG
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
