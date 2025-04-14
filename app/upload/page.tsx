import { FileUploader } from "@/components/file-uploader"

export default function UploadPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Document Upload</h1>
      <FileUploader />
    </div>
  )
}
