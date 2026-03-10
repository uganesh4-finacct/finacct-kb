'use client'

import React, { useState } from 'react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { sendCertificateToEmail } from '@/lib/certificate-actions'
import { Mail } from 'lucide-react'

/**
 * Generates the certificate as PDF and returns base64 (data URL or raw base64).
 * Shared by download and email actions.
 */
export async function getCertificatePdfBase64(): Promise<string | null> {
  const el = document.getElementById('certificate')
  if (!el) return null

  const scale = 3
  const canvas = await html2canvas(el, {
    scale,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    scrollX: 0,
    scrollY: 0,
    width: el.scrollWidth,
    height: el.scrollHeight,
    windowWidth: el.scrollWidth,
    windowHeight: el.scrollHeight,
    imageTimeout: 0,
    onclone: (_, clonedEl) => {
      const style = clonedEl.style
      style.overflow = 'visible'
      style.borderRadius = '12px'
      style.paddingTop = '6px'
    },
  })

  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
  }

  const imgData = canvas.toDataURL('image/png', 1.0)
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  })
  const pdfW = pdf.internal.pageSize.getWidth()
  const pdfH = pdf.internal.pageSize.getHeight()
  const imgW = canvas.width
  const imgH = canvas.height
  const ratio = Math.min(pdfW / imgW, pdfH / imgH) * 0.98
  const w = imgW * ratio
  const h = imgH * ratio
  const x = (pdfW - w) / 2
  const y = (pdfH - h) / 2
  pdf.addImage(imgData, 'PNG', x, y, w, h)
  return pdf.output('dataurlstring')
}

export function CertificateEmailButton() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleEmail() {
    setMessage(null)
    setLoading(true)
    try {
      const dataUrl = await getCertificatePdfBase64()
      if (!dataUrl) {
        setMessage({ type: 'error', text: 'Could not generate certificate.' })
        return
      }
      const res = await sendCertificateToEmail(dataUrl)
      if (res.ok) {
        setMessage({ type: 'success', text: 'Certificate sent to your email.' })
      } else {
        setMessage({ type: 'error', text: res.error ?? 'Failed to send email.' })
      }
    } catch (e) {
      setMessage({ type: 'error', text: e instanceof Error ? e.message : 'Something went wrong.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={handleEmail}
        disabled={loading}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium disabled:opacity-60 transition-colors"
      >
        <Mail className="w-4 h-4" />
        {loading ? 'Sending…' : 'Email certificate to me'}
      </button>
      {message && (
        <p
          className={`text-sm ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}
          role="status"
        >
          {message.text}
        </p>
      )}
    </div>
  )
}
