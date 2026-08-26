import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import dotenv from 'dotenv'

dotenv.config()

const s3Client = new S3Client({
  region: process.env.IDRIVE_E2_REGION || 'us-east-1',
  endpoint: process.env.IDRIVE_E2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.IDRIVE_E2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.IDRIVE_E2_SECRET_ACCESS_KEY || ''
  },
  forcePathStyle: true
})

const BUCKET_NAME = process.env.IDRIVE_E2_BUCKET_NAME

export const s3Service = {
  async uploadFile(key: string, body: Buffer, contentType: string) {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType
    })
    return s3Client.send(command)
  },

  async getDownloadUrl(key: string) {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    })

    return getSignedUrl(s3Client, command, { expiresIn: 3600 })
  },

  async deleteFile(key: string) {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    })
    return s3Client.send(command)
  }
}
