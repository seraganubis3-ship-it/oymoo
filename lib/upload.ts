import { writeFile, unlink, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { createId } from '@paralleldrive/cuid2'
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5MB
const ALLOWED_FOLDERS = ['before', 'sessions']

function getExt(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  }
  return map[mimeType] ?? 'jpg'
}

const isB2Enabled = !!process.env.B2_ENDPOINT && !!process.env.B2_BUCKET_NAME

const s3Client = isB2Enabled ? new S3Client({
  endpoint: process.env.B2_ENDPOINT,
  region: process.env.B2_REGION || 'us-west-004',
  credentials: {
    accessKeyId: process.env.B2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.B2_SECRET_ACCESS_KEY || '',
  },
}) : null

export async function saveFile(
  file: File,
  folder: string
): Promise<string> {
  if (!ALLOWED_FOLDERS.includes(folder)) {
    throw new Error(`المجلد غير مسموح: ${folder}`)
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('نوع الملف غير مدعوم. يُقبل فقط: JPG, PNG, WEBP')
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error('حجم الملف يتجاوز الحد المسموح (5MB)')
  }

  const ext = getExt(file.type)
  const filename = `${createId()}.${ext}`
  const fileKey = `${folder}/${filename}`

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  if (isB2Enabled && s3Client) {
    // Upload to Backblaze B2
    const command = new PutObjectCommand({
      Bucket: process.env.B2_BUCKET_NAME,
      Key: fileKey,
      Body: buffer,
      ContentType: file.type,
    })
    await s3Client.send(command)
    
    // Construct public URL. Assume bucket is public and format is endpoint/bucket/key
    // Alternatively, Backblaze supports: https://f004.backblazeb2.com/file/BUCKET_NAME/key
    const endpointUrl = new URL(process.env.B2_ENDPOINT as string)
    // Most S3 endpoints format public URLs like this:
    return `${endpointUrl.origin}/${process.env.B2_BUCKET_NAME}/${fileKey}`
  }

  // Fallback to local storage
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder)
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true })
  }
  await writeFile(path.join(uploadDir, filename), buffer)
  return `/uploads/${folder}/${filename}`
}

export async function deleteFile(url: string | null | undefined): Promise<void> {
  if (!url) return
  
  if (isB2Enabled && s3Client && url.startsWith('http')) {
    try {
      // Extract key from URL
      // Assuming URL format: https://domain.com/bucket-name/folder/filename.jpg
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/')
      // The key is everything after the bucket name
      const bucketIndex = pathParts.findIndex(p => p === process.env.B2_BUCKET_NAME)
      if (bucketIndex !== -1) {
        const key = pathParts.slice(bucketIndex + 1).join('/')
        await s3Client.send(new DeleteObjectCommand({
          Bucket: process.env.B2_BUCKET_NAME,
          Key: key,
        }))
      }
    } catch {
      // Ignore errors
    }
    return
  }

  // Local fallback
  try {
    const filePath = path.join(process.cwd(), 'public', url)
    await unlink(filePath)
  } catch {
    // File may not exist — ignore
  }
}
