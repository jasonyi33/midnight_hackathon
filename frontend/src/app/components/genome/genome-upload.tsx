import { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthStore } from '../../stores/auth-store'
import { useGenomeUpload } from '../../hooks/use-genome'
import { useGenomeSummary } from '../../hooks/use-genome'

const uploadSchema = z.object({
  file: z.instanceof(File).refine((file) => file.name.endsWith('.json'), {
    message: 'File must be a JSON document',
  }),
})

type UploadFormData = z.infer<typeof uploadSchema>

export const GenomeUpload = () => {
  const { user } = useAuthStore((state) => ({
    user: state.user,
  }))
  const [preview, setPreview] = useState<string | null>(null)
  const { data: genomeSummary } = useGenomeSummary()
  const { mutate: uploadGenome, isPending, isSuccess } = useGenomeUpload()
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return
    
    setValue('file', file)
    
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result as string)
        setPreview(JSON.stringify(json, null, 2))
      } catch {
        setPreview('Invalid JSON format')
      }
    }
    reader.readAsText(file)
  }, [setValue])
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/json': ['.json'] },
    maxFiles: 1,
  })

  const onSubmit = handleSubmit((data) => {
    if (!user?.address) return
    uploadGenome({
      file: data.file,
      address: user.address,
    })
  })

  // Clear preview on successful upload
  useEffect(() => {
    if (isSuccess) {
      setPreview(null)
    }
  }, [isSuccess])

  // If genome already exists, show that instead of upload
  if (genomeSummary?.cid) {
    return (
      <div className="genome-status">
        <h3>Genome already uploaded</h3>
        <div className="genome-details">
          <div className="data-row">
            <span className="label">IPFS CID</span>
            <span className="value">{genomeSummary.cid}</span>
          </div>
          <div className="data-row">
            <span className="label">Commitment hash</span>
            <span className="value">{genomeSummary.commitmentHash}</span>
          </div>
          <div className="data-row">
            <span className="label">Uploaded</span>
            <span className="value">
              {genomeSummary.uploadedAt ? new Date(genomeSummary.uploadedAt).toLocaleString() : 'Unknown'}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="genome-upload">
      <form onSubmit={onSubmit}>
        <div 
          {...getRootProps()} 
          className={`dropzone ${isDragActive ? 'active' : ''} ${errors.file ? 'error' : ''}`}
        >
          <input {...getInputProps()} {...register('file')} />
          {isDragActive ? (
            <p>Drop the genome JSON here ...</p>
          ) : (
            <p>Drag & drop your genome JSON file here, or click to select</p>
          )}
        </div>
        
        {errors.file && <p className="error">{errors.file.message}</p>}
        
        {preview && (
          <div className="json-preview">
            <h4>File Preview</h4>
            <pre>{preview}</pre>
          </div>
        )}
        
        <div className="actions">
          <button 
            type="submit" 
            disabled={isPending || !preview || !!errors.file}
            className="primary"
          >
            {isPending ? 'Encrypting & uploading...' : 'Upload & encrypt'}
          </button>
        </div>
      </form>
    </div>
  )
}