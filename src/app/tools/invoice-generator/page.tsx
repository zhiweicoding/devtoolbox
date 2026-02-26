"use client";

import { useState } from "react";

interface LineItem { id: number; description: string; quantity: number; unitPrice: number; }
interface InvoiceData {
  invoiceNo: string; date: string;
  fromName: string; fromAddress: string; fromEmail: string;
  toName: string; toAddress: string; toEmail: string;
  items: LineItem[]; taxRate: number; notes: string;
}

const defaultInvoice: InvoiceData = {
  invoiceNo: "INV-001", date: new Date().toISOString().split("T")[0],
  fromName: "", fromAddress: "", fromEmail: "",
  toName: "", toAddress: "", toEmail: "",
  items: [{ id: 1, description: "", quantity: 1, unitPrice: 0 }],
  taxRate: 0, notes: "",
};

export default function InvoiceGeneratorPage() {
  const [inv, setInv] = useState<InvoiceData>(defaultInvoice);
  const update = (f: keyof InvoiceData, v: string | number) => setInv((p) => ({ ...p, [f]: v }));
  const updateItem = (id: number, f: keyof LineItem, v: string | number) =>
    setInv((p) => ({ ...p, items: p.items.map((it) => (it.id === id ? { ...it, [f]: v } : it)) }));
  const addItem = () => setInv((p) => ({ ...p, items: [...p.items, { id: Date.now(), description: "", quantity: 1, unitPrice: 0 }] }));
  const removeItem = (id: number) => setInv((p) => ({ ...p, items: p.items.filter((it) => it.id !== id) }));

  const subtotal = inv.items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
  const tax = subtotal * (inv.taxRate / 100);
  const total = subtotal + tax;
  const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const ic = "w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-600";
  const lc = "text-xs text-gray-500 block mb-1";

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-7xl mx-auto p-6 print:p-0">
        <div className="print:hidden mb-6">
          <h1 className="text-3xl font-bold mb-2">Invoice Generator</h1>
          <p className="text-gray-400">Fill in the details and print or save as PDF.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* FORM SIDE */}
          <div className="print:hidden space-y-5">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-gray-300 mb-3">Invoice Info</h2>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={lc}>Invoice #</label><input value={inv.invoiceNo} onChange={(e) => update("invoiceNo", e.target.value)} className={ic} /></div>
                <div><label className={lc}>Date</label><input type="date" value={inv.date} onChange={(e) => update("date", e.target.value)} className={ic} /></div>
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-gray-300 mb-3">From</h2>
              <div className="space-y-2">
                <div><label className={lc}>Name / Company</label><input value={inv.fromName} onChange={(e) => update("fromName", e.target.value)} className={ic} placeholder="Your company" /></div>
                <div><label className={lc}>Address</label><input value={inv.fromAddress} onChange={(e) => update("fromAddress", e.target.value)} className={ic} placeholder="Street, City" /></div>
                <div><label className={lc}>Email</label><input value={inv.fromEmail} onChange={(e) => update("fromEmail", e.target.value)} className={ic} placeholder="you@example.com" /></div>
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-gray-300 mb-3">Bill To</h2>
              <div className="space-y-2">
                <div><label className={lc}>Name / Company</label><input value={inv.toName} onChange={(e) => update("toName", e.target.value)} className={ic} placeholder="Client name" /></div>
                <div><label className={lc}>Address</label><input value={inv.toAddress} onChange={(e) => update("toAddress", e.target.value)} className={ic} placeholder="Street, City" /></div>
                <div><label className={lc}>Email</label><input value={inv.toEmail} onChange={(e) => update("toEmail", e.target.value)} className={ic} placeholder="client@example.com" /></div>
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-sm font-semibold text-gray-300">Items</h2>
                <button onClick={addItem} className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded">+ Add Item</button>
              </div>
              {inv.items.map((item, idx) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 mb-2 items-end">
                  <div className="col-span-5">
                    {idx === 0 && <label className={lc}>Description</label>}
                    <input value={item.description} onChange={(e) => updateItem(item.id, "description", e.target.value)} className={ic} placeholder="Item description" />
                  </div>
                  <div className="col-span-2">
                    {idx === 0 && <label className={lc}>Qty</label>}
                    <input type="number" min={1} value={item.quantity} onChange={(e) => updateItem(item.id, "quantity", Math.max(1, parseInt(e.target.value) || 1))} className={ic} />
                  </div>
                  <div className="col-span-3">
                    {idx === 0 && <label className={lc}>Unit Price</label>}
                    <input type="number" min={0} step={0.01} value={item.unitPrice} onChange={(e) => updateItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)} className={ic} />
                  </div>
                  <div className="col-span-2 flex items-center justify-between">
                    <span className="text-sm text-gray-400">${fmt(item.quantity * item.unitPrice)}</span>
                    {inv.items.length > 1 && <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-400 text-lg ml-2">×</button>}
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lc}>Tax Rate (%)</label>
                  <input type="number" min={0} max={100} step={0.1} value={inv.taxRate} onChange={(e) => update("taxRate", parseFloat(e.target.value) || 0)} className={ic} />
                </div>
                <div className="flex items-end">
                  <div className="text-sm text-gray-400">
                    <div>Subtotal: <span className="text-gray-200">${fmt(subtotal)}</span></div>
                    <div>Tax: <span className="text-gray-200">${fmt(tax)}</span></div>
                    <div className="text-lg font-bold text-white">Total: ${fmt(total)}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <label className={lc}>Notes</label>
              <textarea value={inv.notes} onChange={(e) => update("notes", e.target.value)} rows={3} className={ic + " resize-none"} placeholder="Payment terms, thank you note..." />
            </div>
            <button onClick={() => window.print()} className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium text-sm">
              <i className="bi bi-printer"></i> Print / Save as PDF
            </button>
          </div>
          {/* PREVIEW SIDE */}
          <div className="bg-white text-gray-900 rounded-xl p-8 print:rounded-none print:shadow-none print:p-8 shadow-lg">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">INVOICE</h2>
                <p className="text-sm text-gray-500 mt-1">{inv.invoiceNo}</p>
                <p className="text-sm text-gray-500">{inv.date}</p>
              </div>
              <div className="text-right text-sm">
                <p className="font-semibold">{inv.fromName || "Your Company"}</p>
                <p className="text-gray-500">{inv.fromAddress}</p>
                <p className="text-gray-500">{inv.fromEmail}</p>
              </div>
            </div>
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Bill To</p>
              <p className="font-semibold">{inv.toName || "Client Name"}</p>
              <p className="text-sm text-gray-500">{inv.toAddress}</p>
              <p className="text-sm text-gray-500">{inv.toEmail}</p>
            </div>
            <table className="w-full mb-6 text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-2 font-semibold">Description</th>
                  <th className="text-right py-2 font-semibold w-16">Qty</th>
                  <th className="text-right py-2 font-semibold w-24">Price</th>
                  <th className="text-right py-2 font-semibold w-24">Amount</th>
                </tr>
              </thead>
              <tbody>
                {inv.items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-2">{item.description || "—"}</td>
                    <td className="py-2 text-right">{item.quantity}</td>
                    <td className="py-2 text-right">${fmt(item.unitPrice)}</td>
                    <td className="py-2 text-right">${fmt(item.quantity * item.unitPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end">
              <div className="w-64 text-sm">
                <div className="flex justify-between py-1"><span className="text-gray-500">Subtotal</span><span>${fmt(subtotal)}</span></div>
                {inv.taxRate > 0 && <div className="flex justify-between py-1"><span className="text-gray-500">Tax ({inv.taxRate}%)</span><span>${fmt(tax)}</span></div>}
                <div className="flex justify-between py-2 border-t-2 border-gray-900 font-bold text-lg mt-1"><span>Total</span><span>${fmt(total)}</span></div>
              </div>
            </div>
            {inv.notes && (
              <div className="mt-8 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Notes</p>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{inv.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
