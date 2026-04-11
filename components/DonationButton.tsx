"use client";
import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { QrCode, Smartphone, Copy, Check, ExternalLink, X } from "lucide-react";

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
  const [showDetails, setShowDetails] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  const cleanIban = iban.replace(/\s/g, "");
  const formattedAmount = amount ? `EUR${amount.toFixed(2)}` : "";
  
  // SEPA EPC QR Code Format
  const qrData = [
    "BCD",
    "002",
    "1",
    "SCT",
    bic,
    name,
    cleanIban,
    formattedAmount,
    "",
    "",
    message,
    "",
  ].join("\n");

  // payto: URI scheme (RFC 8905)
  const payToUrl = `payto:iban:${cleanIban}?name=${encodeURIComponent(
    name
  )}${amount ? `&amount=${amount}` : ""}${
    message ? `&message=${encodeURIComponent(message)}` : ""
  }`;

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <div className="donation-container">
      <button className="donation-btn" onClick={() => setShowDetails(!showDetails)}>
        {isMobile ? <Smartphone size={20} /> : <QrCode size={20} />}
        <span>{labelNl} / {labelEn}</span>
      </button>

      {showDetails && (
        <div className="details-overlay" onClick={() => setShowDetails(false)}>
          <div className="details-card" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowDetails(false)}>
              <X size={24} />
            </button>
            
            <h3>{isMobile ? "Betalingsgegevens" : "Scan de QR-code"}</h3>
            
            {!isMobile ? (
              <div className="qr-section">
                <p className="instruction">
                  Scan met je bank-app om automatisch in te vullen.
                </p>
                <div className="qr-wrapper">
                  <QRCodeSVG value={qrData} size={200} level="M" />
                </div>
              </div>
            ) : (
              <div className="mobile-section">
                <p className="instruction">
                  Kopieer de gegevens of probeer je bank-app direct te openen.
                </p>
                
                <div className="copy-fields">
                  <div className="copy-item">
                    <label>IBAN</label>
                    <div className="field-row">
                      <code>{iban}</code>
                      <button onClick={() => copyToClipboard(cleanIban, 'iban')}>
                        {copiedField === 'iban' ? <Check size={18} color="#4CAF50" /> : <Copy size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="copy-item">
                    <label>Naam / Name</label>
                    <div className="field-row">
                      <span>{name}</span>
                      <button onClick={() => copyToClipboard(name, 'name')}>
                        {copiedField === 'name' ? <Check size={18} color="#4CAF50" /> : <Copy size={18} />}
                      </button>
                    </div>
                  </div>

                  {message && (
                    <div className="copy-item">
                      <label>Mededeling / Message</label>
                      <div className="field-row">
                        <span>{message}</span>
                        <button onClick={() => copyToClipboard(message, 'msg')}>
                          {copiedField === 'msg' ? <Check size={18} color="#4CAF50" /> : <Copy size={18} />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <a href={payToUrl} className="launch-app-btn">
                  <ExternalLink size={18} />
                  Open Bank App
                </a>
              </div>
            )}
            
            <p className="footer-note">Tarragon VZW - Bedankt voor je steun!</p>
          </div>
        </div>
      )}

      <style jsx>{`
        .donation-container {
          margin: 2rem 0;
          display: flex;
          justify-content: center;
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
          transition: all 0.2s;
          box-shadow: var(--shadow-sm);
        }
        .donation-btn:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        
        .details-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }
        
        .details-card {
          background: white;
          width: 100%;
          max-width: 400px;
          border-radius: 1.5rem;
          padding: 2rem;
          position: relative;
          color: #333;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }
        
        .close-btn {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          cursor: pointer;
          color: #999;
        }
        
        h3 {
          margin-top: 0;
          font-family: var(--font-rockwell), serif;
          color: var(--darker);
          text-align: center;
        }
        
        .instruction {
          font-size: 0.9rem;
          color: #666;
          text-align: center;
          margin-bottom: 1.5rem;
        }
        
        .qr-section {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .qr-wrapper {
          padding: 1rem;
          background: white;
          border: 1px solid #eee;
          border-radius: 1rem;
        }
        
        .copy-fields {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .copy-item label {
          display: block;
          font-size: 0.75rem;
          text-transform: uppercase;
          font-weight: 700;
          color: #999;
          margin-bottom: 0.25rem;
        }
        
        .field-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f5f7f5;
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          border: 1px solid #e0e6e0;
        }
        
        .field-row span, .field-row code {
          font-weight: 600;
          font-size: 0.95rem;
          word-break: break-all;
        }
        
        .field-row button {
          background: none;
          border: none;
          padding: 0.5rem;
          cursor: pointer;
          color: var(--secondary);
          display: flex;
          align-items: center;
        }
        
        .launch-app-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 1rem;
          background: #eee;
          border-radius: 0.5rem;
          text-decoration: none;
          color: #333;
          font-weight: 600;
          font-size: 1rem;
          transition: background 0.2s;
        }
        
        .launch-app-btn:hover {
          background: #e0e0e0;
        }
        
        .footer-note {
          margin-top: 1.5rem;
          font-size: 0.8rem;
          text-align: center;
          color: #999;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};
