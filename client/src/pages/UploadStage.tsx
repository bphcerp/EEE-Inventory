import { DropzoneOptions, useDropzone } from 'react-dropzone'

export const UploadStage = ({ onSubmit }: { onSubmit: (file: File) => void }) => {

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        maxFiles: 1, accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls']
        },
        onDrop: (incomingFiles : File[]) => {
            onSubmit(incomingFiles[0])
        }
    } as unknown as DropzoneOptions)

    return (
        <div {...getRootProps()} className="flex h-96 items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-10 text-center text-gray-500 cursor-pointer hover:border-primary hover:text-primary transition-all">
            <input required {...getInputProps()} hidden />
            {isDragActive ? <p className="text-lg font-medium">Drop the file here</p> : <div>
                <p className="text-lg font-medium">Drag and drop your file here</p>
                <p className="text-sm mt-2">or click to upload</p>
            </div>}
        </div>
    )
}