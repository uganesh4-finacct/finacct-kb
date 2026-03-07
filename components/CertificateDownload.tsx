'use client'

import React from 'react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

export function CertificateDownload() {
  async function handleDownload() {
    const el = document.getElementById('certificate')
    if (!el) return
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    })
    const pdfW = pdf.internal.pageSize.getWidth()
    const pdfH = pdf.internal.pageSize.getHeight()
    const imgW = canvas.width
    const imgH = canvas.height
    const ratio = Math.min(pdfW / imgW, pdfH / imgH) * 0.95
    const w = imgW * ratio
    const h = imgH * ratio
    pdf.addImage(imgData, 'PNG', (pdfW - w) / 2, (pdfH - h) / 2, w, h)
    pdf.save('FinAcct360-Certificate.pdf')
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
