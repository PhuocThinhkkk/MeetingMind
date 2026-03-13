@@ .. @@
 import React, { useState } from 'react';
 import { Upload, FileAudio } from 'lucide-react';
+import { useLoading } from '../contexts/LoadingContext';

 const UploadFile: React.FC = () => {
   const [selectedFile, setSelectedFile] = useState<File | null>(null);
   const [transcript, setTranscript] = useState<string>('');
-  const [isProcessing, setIsProcessing] = useState(false);
+  const { isLoading, setLoading } = useLoading();

   const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
@@ .. @@
   const handleUpload = async () => {
     if (!selectedFile) return;

-    setIsProcessing(true);
+    setLoading(true, 'Processing audio file...');
     setTranscript('');

     try {
@@ .. @@
       console.error('Error processing file:', error);
       setTranscript('Error processing file. Please try again.');
     } finally {
-      setIsProcessing(false);
+      setLoading(false);
     }
   };

@@ .. @@
           <button
             onClick={handleUpload}
-            disabled={!selectedFile || isProcessing}
-            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
+            disabled={!selectedFile || isLoading}
+            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
           >
-            {isProcessing ? (
-              <>
-                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
-                Processing...
-              </>
-            ) : (
-              <>
-                <Upload className="w-4 h-4" />
-                Upload & Transcribe
-              </>
-            )}
+            <Upload className="w-4 h-4" />
+            Upload & Transcribe
           </button>
         </div>

@@ .. @@
         {transcript && (
           <div className="mt-6 p-4 bg-gray-50 rounded-lg">
             <h3 className="font-semibold text-gray-800 mb-2">Transcript:</h3>
             <p className="text-gray-700 whitespace-pre-wrap">{transcript}</p>
           </div>
         )}
       </div>
     </div>
   );