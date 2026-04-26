export type CreateUploadUrlParams = {
  userId: string
  fileName: string
  fileType: string
}

export type CreateUploadUrlResult = {
  path: string
  signedUrl: string
  token: string
  contentType: string
}
