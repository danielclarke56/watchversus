import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL

// Check if R2 is configured
export const isR2Configured =
  R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET_NAME && R2_PUBLIC_URL

let s3Client: S3Client | null = null

function getS3Client(): S3Client {
  if (!isR2Configured) {
    throw new Error('Cloudflare R2 is not configured (missing R2_* env vars)')
  }

  if (!s3Client) {
    s3Client = new S3Client({
      region: 'auto',
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID!,
        secretAccessKey: R2_SECRET_ACCESS_KEY!,
      },
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    })
  }

  return s3Client
}

/**
 * Upload a photo buffer to Cloudflare R2
 * Returns the public URL on success
 */
export async function uploadPhotoToR2(
  watchId: string,
  photoId: string,
  buffer: Buffer,
  contentType: string = 'image/webp'
): Promise<string> {
  const key = `user-photos/${watchId}/${photoId}.webp`
  const client = getS3Client()

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME!,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000, immutable', // 1 year cache for immutable files
  })

  try {
    await client.send(command)
    // Return the public URL
    return `${R2_PUBLIC_URL}/${key}`
  } catch (error) {
    console.error('Failed to upload to R2:', error)
    throw error
  }
}

/**
 * Upload a thumbnail buffer to Cloudflare R2
 * Returns the public URL on success
 */
export async function uploadThumbnailToR2(
  photoId: string,
  buffer: Buffer
): Promise<string> {
  const key = `user-photos/thumbs/thumb-${photoId}.jpg`
  const client = getS3Client()

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME!,
    Key: key,
    Body: buffer,
    ContentType: 'image/jpeg',
    CacheControl: 'public, max-age=31536000, immutable', // 1 year cache for immutable files
  })

  try {
    await client.send(command)
    // Return the public URL
    return `${R2_PUBLIC_URL}/${key}`
  } catch (error) {
    console.error('Failed to upload thumbnail to R2:', error)
    throw error
  }
}

/**
 * Delete a photo from Cloudflare R2 by URL
 */
export async function deletePhotoFromR2(photoUrl: string): Promise<boolean> {
  if (!photoUrl.startsWith(R2_PUBLIC_URL!)) {
    // Not an R2 URL, skip deletion
    return false
  }

  const key = photoUrl.replace(R2_PUBLIC_URL!, '').replace(/^\//, '')
  const client = getS3Client()

  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME!,
    Key: key,
  })

  try {
    await client.send(command)
    return true
  } catch (error) {
    console.error('Failed to delete from R2:', error)
    return false
  }
}
