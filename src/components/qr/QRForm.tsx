import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Layers,
  Palette,
  Image as ImageIcon,
  Upload,
  Globe,
  Receipt,
  CreditCard,
  Wifi,
  Contact,
  FileText
} from "lucide-react";
import { DotType, CornerSquareType, CornerDotType, ErrorCorrectionLevel } from "../../core/qr/types";
import { DESIGN_PRESETS } from "../../core/presets";
import { Translations } from "../../i18n/translations";
import {
  encodeGs1DigitalLink,
  encodeEpcSepa,
  encodeZatcaInvoice,
  encodeWifi,
  encodeVCard
} from "../../core/payloads/encoders";

interface QRFormProps {
  qrText: string;
  setQrText: (v: string) => void;
  errorLevel: ErrorCorrectionLevel;
  setErrorLevel: (v: ErrorCorrectionLevel) => void;
  dotType: DotType;
  setDotType: (v: DotType) => void;
  cornerSquareType: CornerSquareType;
  setCornerSquareType: (v: CornerSquareType) => void;
  setCornerDotType: (v: CornerDotType) => void;
  fgColor: string;
  setFgColor: (v: string) => void;
  fgColor2: string;
  setFgColor2: (v: string) => void;
  isGradient: boolean;
  setIsGradient: (v: boolean) => void;
  isTransparent: boolean;
  setIsTransparent: (v: boolean) => void;
  logoUrl: string | undefined;
  setLogoUrl: (v: string | undefined) => void;
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  lang: "en" | "ar";
  t: Translations;
}

export const QRForm: React.FC<QRFormProps> = ({
  qrText,
  setQrText,
  errorLevel,
  setErrorLevel,
  dotType,
  setDotType,
  cornerSquareType,
  setCornerSquareType,
  setCornerDotType,
  fgColor,
  setFgColor,
  fgColor2,
  setFgColor2,
  isGradient,
  setIsGradient,
  isTransparent,
  setIsTransparent,
  logoUrl,
  setLogoUrl,
  onLogoUpload,
  lang,
  t
}) => {
  const [payloadMode, setPayloadMode] = useState<"text" | "gs1" | "zatca" | "epc" | "wifi" | "vcard">("text");

  // GS1 state
  const [gs1Gtin, setGs1Gtin] = useState("06291041500213");
  const [gs1Lot, setGs1Lot] = useState("BATCH-2026-X");
  const [gs1Serial, setGs1Serial] = useState("SN-88992");
  const [gs1Expiry, setGs1Expiry] = useState("261231");

  // ZATCA state
  const [zatcaSeller, setZatcaSeller] = useState("شركة أومني كود للتقنية المحدودة");
  const [zatcaVatNumber, setZatcaVatNumber] = useState("300000000000003");
  const [zatcaTime, setZatcaTime] = useState(new Date().toISOString());
  const [zatcaTotal, setZatcaTotal] = useState("115.00");
  const [zatcaVat, setZatcaVat] = useState("15.00");

  // EPC SEPA state
  const [epcName, setEpcName] = useState("OmniCode Studio GmbH");
  const [epcIban, setEpcIban] = useState("DE89370400440532013000");
  const [epcBic, setEpcBic] = useState("DBEUMM21XXX");
  const [epcAmount, setEpcAmount] = useState("49.99");
  const [epcRemittance, setEpcRemittance] = useState("INV-2026-001");

  // WiFi state
  const [wifiSsid, setWifiSsid] = useState("OmniCode-Guest");
  const [wifiPassword, setWifiPassword] = useState("Enterprise2026!");
  const [wifiEnc, setWifiEnc] = useState<"WPA" | "WEP" | "nopass">("WPA");
  const [wifiHidden, setWifiHidden] = useState(false);

  // vCard state
  const [vcFirstName, setVcFirstName] = useState("Tarek");
  const [vcLastName, setVcLastName] = useState("Mohamed");
  const [vcOrg, setVcOrg] = useState("OmniCode Studio");
  const [vcTitle, setVcTitle] = useState("Principal Solutions Architect");
  const [vcPhone, setVcPhone] = useState("+966500000000");
  const [vcEmail, setVcEmail] = useState("contact@omnicode.studio");
  const [vcUrl, setVcUrl] = useState("https://omnicode.studio");

  useEffect(() => {
    if (payloadMode === "gs1") {
      try {
        const encoded = encodeGs1DigitalLink({
          gtin: gs1Gtin,
          lot: gs1Lot || undefined,
          serial: gs1Serial || undefined,
          expiryDate: gs1Expiry || undefined
        });
        setQrText(encoded);
      } catch {}
    } else if (payloadMode === "zatca") {
      try {
        const encoded = encodeZatcaInvoice({
          sellerName: zatcaSeller,
          vatRegistrationNumber: zatcaVatNumber,
          timestamp: zatcaTime,
          totalWithVat: zatcaTotal,
          vatTotal: zatcaVat
        });
        setQrText(encoded);
        setErrorLevel("H");
      } catch {}
    } else if (payloadMode === "epc") {
      try {
        const encoded = encodeEpcSepa({
          beneficiaryName: epcName,
          iban: epcIban,
          bic: epcBic || undefined,
          amount: parseFloat(epcAmount) || 0,
          remittanceInformation: epcRemittance || undefined
        });
        setQrText(encoded);
        setErrorLevel("M");
      } catch {}
    } else if (payloadMode === "wifi") {
      try {
        const encoded = encodeWifi({
          ssid: wifiSsid,
          password: wifiPassword,
          encryption: wifiEnc,
          hidden: wifiHidden
        });
        setQrText(encoded);
      } catch {}
    } else if (payloadMode === "vcard") {
      try {
        const encoded = encodeVCard({
          firstName: vcFirstName,
          lastName: vcLastName,
          organization: vcOrg,
          title: vcTitle,
          phone: vcPhone,
          email: vcEmail,
          url: vcUrl
        });
        setQrText(encoded);
      } catch {}
    }
  }, [
    payloadMode,
    gs1Gtin,
    gs1Lot,
    gs1Serial,
    gs1Expiry,
    zatcaSeller,
    zatcaVatNumber,
    zatcaTime,
    zatcaTotal,
    zatcaVat,
    epcName,
    epcIban,
    epcBic,
    epcAmount,
    epcRemittance,
    wifiSsid,
    wifiPassword,
    wifiEnc,
    wifiHidden,
    vcFirstName,
    vcLastName,
    vcOrg,
    vcTitle,
    vcPhone,
    vcEmail,
    vcUrl
  ]);
  return (
    <div className="space-y-5">
      {/* Presets Gallery */}
      <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3.5 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          {t.presets}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {DESIGN_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => {
                if (preset.options.dotsOptions) {
                  setDotType(preset.options.dotsOptions.type);
                  if (preset.options.dotsOptions.colorOrGradient.gradient) {
                    setIsGradient(true);
                    setFgColor(preset.options.dotsOptions.colorOrGradient.gradient.colorStops[0].color);
                    setFgColor2(preset.options.dotsOptions.colorOrGradient.gradient.colorStops[1].color);
                  } else if (preset.options.dotsOptions.colorOrGradient.color) {
                    setIsGradient(false);
                    setFgColor(preset.options.dotsOptions.colorOrGradient.color);
                  }
                }
                if (preset.options.cornersSquareOptions) {
                  setCornerSquareType(preset.options.cornersSquareOptions.type);
                }
                if (preset.options.cornersDotOptions) {
                  setCornerDotType(preset.options.cornersDotOptions.type);
                }
              }}
              className="p-3 text-start rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-md text-xs transition-all bg-slate-50/70 hover:bg-emerald-50/30 group"
            >
              <div className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                {lang === "ar" ? preset.nameAr : preset.name}
              </div>
              <div className="text-[10px] text-slate-500 truncate mt-1">{preset.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Enterprise Payload Standards Assistant & Data Input */}
      <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            {t.enterpriseStandards}
          </label>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
            {payloadMode.toUpperCase()}
          </span>
        </div>

        {/* Mode Selector Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setPayloadMode("text")}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
              payloadMode === "text"
                ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm"
                : "border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{t.payloadModeText}</span>
          </button>

          <button
            type="button"
            onClick={() => setPayloadMode("gs1")}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
              payloadMode === "gs1"
                ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm"
                : "border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700"
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate">{t.payloadModeGs1}</span>
          </button>

          <button
            type="button"
            onClick={() => setPayloadMode("zatca")}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
              payloadMode === "zatca"
                ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm"
                : "border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700"
            }`}
          >
            <Receipt className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{t.payloadModeZatca}</span>
          </button>

          <button
            type="button"
            onClick={() => setPayloadMode("epc")}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
              payloadMode === "epc"
                ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm"
                : "border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="truncate">{t.payloadModeEpc}</span>
          </button>

          <button
            type="button"
            onClick={() => setPayloadMode("wifi")}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
              payloadMode === "wifi"
                ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm"
                : "border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700"
            }`}
          >
            <Wifi className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate">{t.payloadModeWifi}</span>
          </button>

          <button
            type="button"
            onClick={() => setPayloadMode("vcard")}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
              payloadMode === "vcard"
                ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm"
                : "border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700"
            }`}
          >
            <Contact className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span className="truncate">{t.payloadModeVcard}</span>
          </button>
        </div>

        {/* Contextual form based on mode */}
        {payloadMode === "gs1" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">GTIN (01 - 14 digits)*</label>
              <input
                type="text"
                value={gs1Gtin}
                onChange={(e) => setGs1Gtin(e.target.value)}
                placeholder="06291041500213"
                className="w-full p-2.5 text-xs font-mono rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Batch / Lot (10)</label>
              <input
                type="text"
                value={gs1Lot}
                onChange={(e) => setGs1Lot(e.target.value)}
                placeholder="BATCH-2026-X"
                className="w-full p-2.5 text-xs font-mono rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Serial Number (21)</label>
              <input
                type="text"
                value={gs1Serial}
                onChange={(e) => setGs1Serial(e.target.value)}
                placeholder="SN-88992"
                className="w-full p-2.5 text-xs font-mono rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Expiry Date YYMMDD (17)</label>
              <input
                type="text"
                value={gs1Expiry}
                onChange={(e) => setGs1Expiry(e.target.value)}
                placeholder="261231"
                className="w-full p-2.5 text-xs font-mono rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none"
              />
            </div>
          </div>
        )}

        {payloadMode === "zatca" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Seller Name / اسم البائع*</label>
              <input
                type="text"
                value={zatcaSeller}
                onChange={(e) => setZatcaSeller(e.target.value)}
                placeholder="اسم المنشأة"
                className="w-full p-2.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">VAT Reg Number / الرقم الضريبي (15 رقم)*</label>
              <input
                type="text"
                value={zatcaVatNumber}
                onChange={(e) => setZatcaVatNumber(e.target.value)}
                placeholder="300000000000003"
                className="w-full p-2.5 text-xs font-mono rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Invoice Total / الإجمالي شامل الضريبة*</label>
              <input
                type="text"
                value={zatcaTotal}
                onChange={(e) => setZatcaTotal(e.target.value)}
                placeholder="115.00"
                className="w-full p-2.5 text-xs font-mono rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">VAT Total / مبلغ الضريبة (15%)*</label>
              <input
                type="text"
                value={zatcaVat}
                onChange={(e) => setZatcaVat(e.target.value)}
                placeholder="15.00"
                className="w-full p-2.5 text-xs font-mono rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Timestamp / تاريخ ووقت الفاتورة*</label>
              <input
                type="text"
                value={zatcaTime}
                onChange={(e) => setZatcaTime(e.target.value)}
                placeholder="2026-11-03T00:00:00Z"
                className="w-full p-2.5 text-xs font-mono rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none"
              />
            </div>
          </div>
        )}

        {payloadMode === "epc" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Beneficiary Name*</label>
              <input
                type="text"
                value={epcName}
                onChange={(e) => setEpcName(e.target.value)}
                placeholder="Company / Recipient Name"
                className="w-full p-2.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">IBAN Account*</label>
              <input
                type="text"
                value={epcIban}
                onChange={(e) => setEpcIban(e.target.value)}
                placeholder="DE89370400440532013000"
                className="w-full p-2.5 text-xs font-mono rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">BIC / SWIFT Code</label>
              <input
                type="text"
                value={epcBic}
                onChange={(e) => setEpcBic(e.target.value)}
                placeholder="DBEUMM21XXX"
                className="w-full p-2.5 text-xs font-mono rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Amount (EUR)*</label>
              <input
                type="text"
                value={epcAmount}
                onChange={(e) => setEpcAmount(e.target.value)}
                placeholder="49.99"
                className="w-full p-2.5 text-xs font-mono rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Remittance Ref / Invoice ID</label>
              <input
                type="text"
                value={epcRemittance}
                onChange={(e) => setEpcRemittance(e.target.value)}
                placeholder="INV-2026-001"
                className="w-full p-2.5 text-xs font-mono rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none"
              />
            </div>
          </div>
        )}

        {payloadMode === "wifi" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Network SSID*</label>
              <input
                type="text"
                value={wifiSsid}
                onChange={(e) => setWifiSsid(e.target.value)}
                placeholder="MyWiFiNetwork"
                className="w-full p-2.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Password</label>
              <input
                type="text"
                value={wifiPassword}
                onChange={(e) => setWifiPassword(e.target.value)}
                placeholder="WPA Key"
                className="w-full p-2.5 text-xs font-mono rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Security Encryption</label>
              <select
                value={wifiEnc}
                onChange={(e) => setWifiEnc(e.target.value as "WPA" | "WEP" | "nopass")}
                className="w-full p-2.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none"
              >
                <option value="WPA">WPA / WPA2 / WPA3</option>
                <option value="WEP">WEP</option>
                <option value="nopass">Open (No Password)</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="wifi-hidden"
                checked={wifiHidden}
                onChange={(e) => setWifiHidden(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="wifi-hidden" className="text-xs font-medium text-slate-700">
                Hidden SSID
              </label>
            </div>
          </div>
        )}

        {payloadMode === "vcard" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">First Name*</label>
              <input
                type="text"
                value={vcFirstName}
                onChange={(e) => setVcFirstName(e.target.value)}
                placeholder="First Name"
                className="w-full p-2.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Last Name</label>
              <input
                type="text"
                value={vcLastName}
                onChange={(e) => setVcLastName(e.target.value)}
                placeholder="Last Name"
                className="w-full p-2.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Phone Number</label>
              <input
                type="text"
                value={vcPhone}
                onChange={(e) => setVcPhone(e.target.value)}
                placeholder="+1 555-0199"
                className="w-full p-2.5 text-xs font-mono rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Email</label>
              <input
                type="email"
                value={vcEmail}
                onChange={(e) => setVcEmail(e.target.value)}
                placeholder="alex@domain.com"
                className="w-full p-2.5 text-xs font-mono rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Company / Organization</label>
              <input
                type="text"
                value={vcOrg}
                onChange={(e) => setVcOrg(e.target.value)}
                placeholder="Enterprise Corp"
                className="w-full p-2.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Job Title</label>
              <input
                type="text"
                value={vcTitle}
                onChange={(e) => setVcTitle(e.target.value)}
                placeholder="Product Architect"
                className="w-full p-2.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Website URL</label>
              <input
                type="text"
                value={vcUrl}
                onChange={(e) => setVcUrl(e.target.value)}
                placeholder="https://omnicode.studio"
                className="w-full p-2.5 text-xs font-mono rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none"
              />
            </div>
          </div>
        )}

        {/* Live Payload Stream / Output */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700">
              {payloadMode === "text" ? t.content : "Encoded QR Payload Output"}
            </label>
            <span className="text-[10px] font-mono text-slate-400">
              {qrText.length} chars
            </span>
          </div>
          <textarea
            value={qrText}
            onChange={(e) => setQrText(e.target.value)}
            readOnly={payloadMode !== "text"}
            placeholder="https://example.com or plain text payload..."
            className={`w-full h-20 p-3 rounded-xl border font-mono text-xs text-slate-900 outline-none transition-all ${
              payloadMode !== "text"
                ? "bg-slate-100/70 border-slate-200 cursor-default"
                : "border-slate-200 bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            }`}
          />
        </div>
      </div>

      {/* Design Controls */}
      <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-600" />
          {t.design}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1.5">{t.dotStyle}</label>
            <select
              value={dotType}
              onChange={(e) => setDotType(e.target.value as DotType)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
            >
              <option value="square">Square</option>
              <option value="rounded">Rounded</option>
              <option value="dots">Dots</option>
              <option value="classy">Classy</option>
              <option value="classy-rounded">Classy Rounded</option>
              <option value="extra-rounded">Extra Rounded</option>
              <option value="diamond">Diamond (جوهرة)</option>
              <option value="star">Star (نجمة)</option>
              <option value="horizontal-bars">Horizontal Bars (خطوط أفقية)</option>
              <option value="vertical-bars">Vertical Bars (خطوط عمودية)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1.5">{t.cornerStyle}</label>
            <select
              value={cornerSquareType}
              onChange={(e) => setCornerSquareType(e.target.value as CornerSquareType)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
            >
              <option value="square">Square</option>
              <option value="rounded">Rounded</option>
              <option value="extra-rounded">Extra Rounded</option>
              <option value="dot">Circular Dot</option>
              <option value="leaf">Leaf (ورقة شجر)</option>
              <option value="diamond">Diamond (ماسة)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1.5">{t.errorCorrection}</label>
            <select
              value={errorLevel}
              onChange={(e) => setErrorLevel(e.target.value as ErrorCorrectionLevel)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
            >
              <option value="L">L — 7% Restoration</option>
              <option value="M">M — 15% Standard</option>
              <option value="Q">Q — 25% High</option>
              <option value="H">H — 30% Maximum (Recommended for Logos)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Color Customization */}
      <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Palette className="w-4 h-4 text-emerald-600" />
          {t.colors}
        </h3>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-600">Color 1:</label>
            <input
              type="color"
              value={fgColor}
              onChange={(e) => setFgColor(e.target.value)}
              className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-slate-300 shadow-sm"
            />
          </div>
          {isGradient && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-600">Color 2:</label>
              <input
                type="color"
                value={fgColor2}
                onChange={(e) => setFgColor2(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-slate-300 shadow-sm"
              />
            </div>
          )}
          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isGradient}
              onChange={(e) => setIsGradient(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
            />
            Linear Gradient
          </label>
          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isTransparent}
              onChange={(e) => setIsTransparent(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
            />
            Transparent BG
          </label>
        </div>
      </div>

      {/* Logo Embedding */}
      <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-emerald-600" />
          {t.logo}
        </h3>
        <div className="flex items-center gap-4">
          <label className="px-4 py-2.5 rounded-xl border border-dashed border-emerald-500 hover:bg-emerald-50 text-emerald-700 font-semibold text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-sm">
            <Upload className="w-4 h-4 text-emerald-600" />
            {t.uploadLogo}
            <input type="file" accept="image/*" onChange={onLogoUpload} className="hidden" />
          </label>
          {logoUrl && (
            <button
              onClick={() => setLogoUrl(undefined)}
              className="px-3.5 py-2.5 rounded-xl border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors"
            >
              {t.removeLogo}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
