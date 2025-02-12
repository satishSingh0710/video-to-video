'use client'; // Needed for React Server Components

import { FileUploaderRegular } from '@uploadcare/react-uploader/next';
import '@uploadcare/react-uploader/core.css';

function App() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 bg-white shadow-lg rounded-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">
          Upload Your Video
        </h2>
        <FileUploaderRegular
          sourceList="local, gdrive"
          classNameUploader="uc-light"
          pubkey={process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY as string}
        />
      </div>
    </div>
  );
}

export default App;
