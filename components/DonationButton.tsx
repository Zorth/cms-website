"use client";
import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { QrCode, Smartphone } from "lucide-react";

interface DonationButtonProps {
  iban: string;
  name: string;
  bic?: string;
  message?: string;
  amount?: number;
  labelEn?: string;
  labelNl?: string;
}

export const DonationButton = ({
  iban,
  name,
  bic = "",
  message = "",
  amount,
  labelEn = "Donate via Banking App",
  labelNl = "Snel betalen via bank-app",
}: DonationButtonProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  // SEPA EPC QR Code Format
  // BCD (Binary Coded Data)
  // 001: Service Tag (always BCD)
  // 002: Version (always 002)
  // 003: Character Set (always 1 - UTF-8)
  // 004: Identification (SCT)
  // 005: BIC (optional)
  // 006: Name
  // 007: IBAN
  // 008: Amount (optional, e.g., EUR12.34)
  // 009: Purpose (optional)
  // 010: Remittance Reference (optional)
  // 011: Remittance Text (optional)
  // 012: Information (optional)

  const formattedAmount = amount ? `EUR${amount.toFixed(2)}` : "";
  const qrData = [
    "BCD",
    "002",
    "1",
    "SCT",
    bic,
    name,
    iban.replace(/\s/g, ""),
    formattedAmount,
    "",
    "",
    message,
    "",
  ].join("\n");

  // payto: URI scheme (RFC 8905)
  const payToUrl = `payto:iban:${iban.replace(/\s/g, "")}?name=${encodeURIComponent(
    name
  )}${amount ? `&amount=${amount}` : ""}${
    message ? `&message=${encodeURIComponent(message)}` : ""
  }`;

  const handlePayClick = () => {
    if (isMobile) {
      window.location.href = payToUrl;
    } else {
      setShowQR(!showQR);
    }
  };

  return (
    <div className="donation-container">
      <button className="donation-btn" onClick={handlePayClick}>
        {isMobile ? <Smartphone size={20} /> : <QrCode size={20} />}
        <span>{labelNl} / {labelEn}</span>
      </button>

      {showQR && !isMobile && (
        <div className="qr-popup">
          <p className="qr-instruction">
            Scan deze code met je bank-app om de gegevens automatisch in te vullen.
          </p>
          <div className="qr-wrapper">
            <QRCodeSVG value={qrData} size={200} level="M" />
          </div>
          <button className="close-qr" onClick={() => setShowQR(false)}>
            Sluiten
          </button>
        </div>
      )}

      <style jsx>{`
        .donation-container {
          margin: 2rem 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        .donation-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.8rem 1.5rem;
          background: var(--secondary);
          color: var(--darker);
          border: none;
          border-radius: 0.5rem;
          font-family: var(--font-orunde), sans-serif;
          font-weight: 600;
          font-size: 1.1rem;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: var(--shadow-sm);
        }
        .donation-btn:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .qr-popup {
          background: white;
          padding: 1.5rem;
          border-radius: 1rem;
          box-shadow: var(--shadow-lg);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          border: 1px solid #eee;
          max-width: 300px;
          text-align: center;
        }
        .qr-instruction {
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 0.5rem;
        }
        .qr-wrapper {
          padding: 1rem;
          background: white;
          border: 1px solid #eee;
          border-radius: 0.5rem;
        }
        .close-qr {
          background: none;
          border: none;
          color: var(--secondary);
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};
