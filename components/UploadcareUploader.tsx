'use client' // is needed only if you’re using React Server Components
import { FileUploaderRegular } from '@uploadcare/react-uploader/next';
import '@uploadcare/react-uploader/core.css';
import { useRef, useState, useEffect } from 'react';

interface UploadedFile {
    uuid: string;
    cdnUrl: string;
    fileInfo: {
      originalFilename: string;
      size: number;
      mimeType: string;
    };
    status: string;
  }

function UploadCareModal({ onUpload }: any) {
    const [isClient, setIsClient] = useState(false)
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const ctxProviderRef = useRef(null);


    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        let ctxProvider: any;
        const timeoutId = setTimeout(() => {
            ctxProvider = ctxProviderRef.current;
            if (!ctxProvider) return;
            const handleChangeEvent = (e: any) => {
                console.log('change event payload:', e);
                setFiles([...e.detail.allEntries.filter((f: any) => f.status === 'success')] as any);
            };
            ctxProvider.addEventListener('change', handleChangeEvent);
        }, 2000)
        
        return () => {
            clearTimeout(timeoutId);
            if(ctxProvider){
                ctxProvider.removeEventListener('change', () => {});
            }
        }
        
    }, [setFiles]);

    useEffect(() => {
        if (files.length > 0) {
            onUpload(files[0].cdnUrl);
        }
    }, [files, onUpload]);

    return (
        <div>
            <FileUploaderRegular
                apiRef={ctxProviderRef}
                sourceList="local, camera, facebook, gdrive"
                cameraModes="photo, video"
                classNameUploader="uc-light"
                pubkey="0a08329423b2ac3d4436"
            />
        </div>
    );
}

export default UploadCareModal;