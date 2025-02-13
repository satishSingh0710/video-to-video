'use client' // is needed only if you’re using React Server Components
import { FileUploaderRegular } from '@uploadcare/react-uploader/next';
import '@uploadcare/react-uploader/core.css';
import { useRef, useState, useEffect } from 'react';
import { clear } from 'console';

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
                clearTimeout(timeoutId);
            };
            ctxProvider.addEventListener('change', handleChangeEvent);
        }, 5000)
        
        return () => {
            // clearTimeout(timeoutId);
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
                sourceList="local, camera,  gdrive"
                cameraModes="video"
                classNameUploader="uc-light"
                pubkey={`process.env.UPLOADCARE_PUBLIC_KEY`}
                multiple={false}
                confirmUpload={true}
                imgOnly={false}
            />
        </div>
    );
}

export default UploadCareModal;