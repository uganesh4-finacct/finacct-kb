'use client'

export function CertificatePrint() {
  function handlePrint() {
    window.print()
  }
  return (
    <button
      type="button"
      onClick={handlePrint}
      className="px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium border border-slate-600"
    >
      Print
    </button>
  )
}
