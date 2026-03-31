'use client'

import { useState, useRef } from 'react'
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

interface CropModalProps {
  imageSrc: string
  onConfirm: (croppedFile: File, croppedDataUrl: string) => void
  onCancel: () => void
}

export default function CropModal({ imageSrc, onConfirm, onCancel }: CropModalProps) {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 80,
    height: 80,
    x: 10,
    y: 10,
  })
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  function handleCrop() {
    if (!imgRef.current || !completedCrop) return

    const img = imgRef.current
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    // Scale factor: completedCrop is in display pixels, but drawImage needs natural image pixels
    const scaleX = img.naturalWidth / img.width
    const scaleY = img.naturalHeight / img.height

    const cropX = completedCrop.x * scaleX
    const cropY = completedCrop.y * scaleY
    const cropW = completedCrop.width * scaleX
    const cropH = completedCrop.height * scaleY

    // Set canvas size to the real crop dimensions
    canvas.width = cropW
    canvas.height = cropH

    // Draw the cropped image using natural pixel coordinates
    ctx.drawImage(
      img,
      cropX,
      cropY,
      cropW,
      cropH,
      0,
      0,
      cropW,
      cropH
    )

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (!blob) return

      const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' })
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92)

      onConfirm(file, dataUrl)
    }, 'image/jpeg', 0.92)
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-surface rounded-xl p-4 sm:p-6 w-full max-w-sm sm:max-w-lg shadow-lg">
        <h2 className="text-xl font-bold text-textPrimary mb-4">Crop your photo</h2>

        <div className="mb-4">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={undefined}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Image to crop"
              style={{ maxHeight: '60vh' }}
              className="rounded-lg w-full object-contain"
            />
          </ReactCrop>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-neutral hover:bg-neutral/80 text-textPrimary rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCrop}
            className="flex-1 px-4 py-2 bg-accent hover:bg-accentHover text-white rounded-lg font-medium transition-colors"
          >
            Crop & Use Photo
          </button>
        </div>
      </div>
    </div>
  )
}
