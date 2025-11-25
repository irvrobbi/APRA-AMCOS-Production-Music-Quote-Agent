import React, { useState } from 'react';
import { QuoteDetails } from '../types';

interface QuoteCardProps {
  quote: QuoteDetails;
}

export const QuoteCard: React.FC<QuoteCardProps> = ({ quote }) => {
  const [copied, setCopied] = useState(false);
  const isAU = quote.territory === 'Australia';
  
  const fmt = (amount: number) => 
    new Intl.NumberFormat(isAU ? 'en-AU' : 'en-NZ', { 
      style: 'currency', 
      currency: quote.currency 
    }).format(amount);

  const hasDiscount = quote.discount && quote.discount > 0;
  
  // Fallback: If AI returns 0 for ratePerUnit, calculate it from the total.
  // This prevents the UI from showing "$0.00" base rate when a total exists.
  let displayRate = quote.ratePerUnit;
  if (!displayRate && quote.quantity > 0) {
    displayRate = (quote.netAmount + (quote.discount || 0)) / quote.quantity;
  }

  const grossAmount = displayRate * quote.quantity;

  const getQuoteText = () => {
    return `APRA AMCOS Production Music Quote Estimate (2025)
------------------------------------------------
Territory: ${quote.territory}
Category: ${quote.category}
Sub-Category: ${quote.subCategory}
------------------------------------------------
Unit Type: ${quote.unitType}
Base Rate: ${fmt(displayRate)}
Quantity: ${quote.quantity}
Gross Estimate: ${fmt(grossAmount)}
${hasDiscount ? `Discount: -${fmt(quote.discount!)} (${quote.discountLabel})` : ''}
------------------------------------------------
Subtotal: ${fmt(quote.netAmount)}
Processing Fee: ${fmt(quote.processingFee)}
GST ${isAU ? '(Included)' : '(15%)'}: ${fmt(quote.gstAmount)}
------------------------------------------------
GRAND TOTAL ESTIMATE: ${fmt(quote.totalAmount)}
------------------------------------------------
Notes: ${quote.notes || 'None'}

* This is an estimate based on the 2025 Rate Card.
* Apply for a licence at: https://portals.apraamcos.com.au/
`.trim();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getQuoteText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownload = () => {
    const text = getQuoteText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `APRA_Quote_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mt-2 font-sans transform transition-all duration-300 hover:shadow-xl relative group">
      {/* Header */}
      <div className="bg-gray-900 p-6 relative overflow-hidden">
         {/* Abstract background accent */}
         <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-400 rounded-full opacity-10 blur-xl"></div>

         {/* Action Buttons */}
         <div className="absolute top-4 right-4 flex gap-2 z-20">
            <button 
                onClick={handleCopy}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 border border-white/10"
                title="Copy details to clipboard"
            >
                <i className={`fa-solid ${copied ? 'fa-check text-green-400' : 'fa-copy'}`}></i>
            </button>
             <button 
                onClick={handleDownload}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 border border-white/10"
                title="Download as text file"
            >
                <i className="fa-solid fa-download"></i>
            </button>
         </div>

         <div className="relative z-10 pr-20">
            <div className="flex items-center gap-2 mb-3">
                 <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${isAU ? 'bg-yellow-400 text-gray-900' : 'bg-blue-500 text-white'}`}>
                    {quote.territory}
                </span>
                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest border border-gray-700 px-2 py-1 rounded-md">
                    2025 Rate Card
                </span>
            </div>
            <h2 className="text-2xl font-bold text-white leading-tight mb-1 tracking-tight">{quote.category}</h2>
            <p className="text-gray-400 text-sm font-medium">{quote.subCategory}</p>
         </div>
      </div>
      
      <div className="p-6">
        {/* Main Calculation Table */}
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 mb-5">
            {/* Base Line Item */}
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 border-dashed">
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-800">{quote.unitType}</span>
                    <span className="text-xs text-gray-500">Base Rate</span>
                </div>
                <div className="text-right">
                    <span className="text-sm font-bold text-gray-900">{fmt(displayRate)}</span>
                    <div className="text-xs text-gray-500 font-medium bg-white px-1 rounded border border-gray-200 inline-block mt-1">
                        Qty: {quote.quantity}
                    </div>
                </div>
            </div>

            {/* Gross Estimate (Always Displayed) */}
            <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Gross Estimate</span>
                <span className="text-sm text-gray-500 font-medium decoration-gray-400">{fmt(grossAmount)}</span>
            </div>

            {/* Discount */}
            {hasDiscount && (
                <div className="flex justify-between items-center mb-3 bg-green-50 p-3 rounded-lg border border-green-100">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                            <i className="fa-solid fa-tag text-[10px]"></i>
                        </div>
                        <span className="text-xs font-bold text-green-800">{quote.discountLabel || 'Discount Applied'}</span>
                    </div>
                    <span className="text-sm font-bold text-green-700">-{fmt(quote.discount!)}</span>
                </div>
            )}

             {/* Subtotal */}
             <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-sm font-bold text-gray-900">Subtotal</span>
                <span className="text-base font-bold text-gray-900">{fmt(quote.netAmount)}</span>
            </div>
        </div>

        {/* Fees Section */}
        <div className="px-2 space-y-3 mb-6">
            <div className="flex justify-between items-center text-sm group">
                <span className="text-gray-500 group-hover:text-gray-700 transition-colors">Processing Fee(s)</span>
                <span className="text-gray-700 font-medium bg-gray-50 px-2 py-0.5 rounded">{fmt(quote.processingFee)}</span>
            </div>
            <div className="flex justify-between items-center text-sm group">
                <span className="text-gray-500 group-hover:text-gray-700 transition-colors">GST {isAU ? '(Included)' : '(15%)'}</span>
                <span className="text-gray-700 font-medium bg-gray-50 px-2 py-0.5 rounded">{fmt(quote.gstAmount)}</span>
            </div>
        </div>

        {/* Notes Section - Full Width & Clear */}
        {quote.notes && (
            <div className="mb-8 p-4 bg-blue-50 text-blue-900 text-xs rounded-lg border border-blue-100 shadow-sm">
                 <div className="flex gap-3 items-start">
                    <i className="fa-solid fa-circle-info mt-0.5 text-blue-500 shrink-0"></i>
                    <p className="leading-relaxed opacity-90">{quote.notes}</p>
                 </div>
            </div>
        )}

        {/* Grand Total - REFINED & DISTINCT */}
        <div className="mt-6 bg-yellow-400 rounded-xl p-8 text-center relative overflow-hidden shadow-lg border border-yellow-500">
             <div className="absolute -top-20 -right-20 w-64 h-64 bg-white rounded-full opacity-20 blur-3xl"></div>
             <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white rounded-full opacity-20 blur-3xl"></div>
            <span className="text-sm font-bold text-gray-900 uppercase tracking-[0.25em] mb-2 block relative z-10">Grand Total Estimate</span>
            <span className="text-5xl sm:text-6xl font-black text-gray-900 tracking-tighter relative z-10">{fmt(quote.totalAmount)}</span>
        </div>
      </div>

      {/* Action Button */}
      <a 
        href="https://portals.apraamcos.com.au/" 
        target="_blank" 
        rel="noopener noreferrer"
        className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 hover:shadow-inner"
      >
            <span>Apply for Licence</span>
            <i className="fa-solid fa-chevron-right text-xs"></i>
      </a>
    </div>
  );
};