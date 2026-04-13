export const REJECTION_REASONS = [
  {
    id: 'not_original',
    label: 'Not an original photo',
    description: 'This photo appears to be sourced from the internet, a press kit, or another user. Please upload a photo you personally took.',
  },
  {
    id: 'poor_quality',
    label: 'Photo quality too low',
    description: 'The image is blurry, too dark, or too small to display well in the gallery. Please upload a clearer, higher-resolution photo.',
  },
  {
    id: 'not_a_watch',
    label: 'No watch visible',
    description: 'We could not identify a watch in this photo. Please submit a photo that clearly shows the watch.',
  },
  {
    id: 'ai_generated',
    label: 'AI-generated image',
    description: 'This image appears to be AI-generated rather than a real photo. We only accept genuine wrist shots from real owners.',
  },
  {
    id: 'duplicate',
    label: 'Duplicate submission',
    description: 'This photo has already been submitted. Please avoid submitting the same image more than once.',
  },
  {
    id: 'other',
    label: 'Other',
    description: '', // admin fills in custom note
  },
] as const

export type RejectionReasonId = (typeof REJECTION_REASONS)[number]['id']
