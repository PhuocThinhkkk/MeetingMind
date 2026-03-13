@@ .. @@
 import React from 'react';
+import { LoadingProvider } from './contexts/LoadingContext';
+import LoadingOverlay from './components/LoadingOverlay';
 import UploadFile from './components/UploadFile';
 import RealTimeTranscript from './components/RealTimeTranscript';
import { LoadingProvider } from './contexts/LoadingContext';
import LoadingOverlay from './components/LoadingOverlay';

 function App() {
   return (
   )
 }
-        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
-          Audio Transcription App
-        </h1>
-        
-          <UploadFile />
-          <RealTimeTranscript />
    <LoadingProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Audio Transcription App
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <UploadFile />
            <RealTimeTranscript />
          </div>
+    <LoadingProvider>
+      <div className="min-h-screen bg-gray-100 p-8">
+        <div className="max-w-4xl mx-auto">
+          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
+            Audio Transcription App
+          </h1>
+          
+          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
+            <UploadFile />
+            <RealTimeTranscript />
+          </div>
         </div>
        <LoadingOverlay />
       </div>
-    </div>
    </LoadingProvider>
+      <LoadingOverlay />
+    </LoadingProvider>
   );
 }