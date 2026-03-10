'use client'

import React from 'react'
import { getCertificatePdfBase64 } from '@/components/CertificateEmailButton'

export function CertificateDownload() {
  async function handleDownload() {
    const dataUrl = await getCertificatePdfBase64()
    if (!dataUrl) return
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = 'FinAcct360-Certificate.pdf'
    link.click()
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
    >
      Download as PDF
    </button>
  )
}
