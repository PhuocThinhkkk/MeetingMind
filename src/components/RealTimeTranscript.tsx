@@ .. @@
 import React, { useState, useRef, useEffect } from 'react';
 import { Mic, MicOff, Square } from 'lucide-react';
+import { useLoading } from '../contexts/LoadingContext';

 const RealTimeTranscript: React.FC = () => {
   const [isRecording, setIsRecording] = useState(false);
   const [transcript, setTranscript] = useState<string>('');
-  const [isLoading, setIsLoading] = useState(false);
+  const { isLoading, setLoading } = useLoading();
   const mediaRecorderRef = useRef<MediaRecorder | null>(null);
   const chunksRef = useRef<Blob[]>([]);

@@ .. @@
   const startRecording = async () => {
+    if (isLoading) return; // Prevent starting if already loading
+    
     try {
       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
       const mediaRecorder = new MediaRecorder(stream);
@@ .. @@
   const stopRecording = () => {
     if (mediaRecorderRef.current && isRecording) {
       mediaRecorderRef.current.stop();
-      setIsLoading(true);
+      setLoading(true, 'Processing recording...');
       setIsRecording(false);
       
       // Stop all tracks to release the microphone
@@ .. @@
       console.error('Error processing audio:', error);
       setTranscript('Error processing audio. Please try again.');
     } finally {
-      setIsLoading(false);
+      setLoading(false);
       chunksRef.current = [];
     }
   };

@@ .. @@
         <div className="flex gap-4 justify-center">
           <button
             onClick={startRecording}
-            disabled={isRecording}
+            disabled={isRecording || isLoading}
             className="bg-green-600 text-white p-4 rounded-full hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
           >
             <Mic className="w-6 h-6" />
@@ .. @@
           
           <button
             onClick={stopRecording}
-            disabled={!isRecording}
+            disabled={!isRecording || isLoading}
             className="bg-red-600 text-white p-4 rounded-full hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
           >
             <Square className="w-6 h-6" />
           </button>
         </div>

-        {isLoading && (
-          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
-            <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4 text-center">
-              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
-              <p className="text-gray-700 text-lg font-medium">Processing recording...</p>
-            </div>
-          </div>
-        )}

         {transcript && (
           <div className="mt-6 p-4 bg-gray-50 rounded-lg">
             <h3 className="font-semibold text-gray-800 mb-2">Real-time Transcript:</h3>