import React, { useState } from 'react';
import { Upload, FileAudio } from 'lucide-react';
import { useLoading } from '../contexts/LoadingContext';

const UploadFile: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const { isLoading, setLoading } = useLoading();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setLoading(true, 'Processing audio file...');
    setTranscript('');

    try {
      const formData = new FormData();
      formData.append('audio', selectedFile);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to transcribe audio');
      }

      const data = await response.json();
      setTranscript(data.transcript);
    } catch (error) {
      console.error('Error processing file:', error);
      setTranscript('Error processing file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Upload Audio File</h2>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <FileAudio className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileSelect}
            className="hidden"
            id="audio-upload"
          />
          
          <label
            htmlFor="audio-upload"
            className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
          >
            Choose an audio file
          </label>
          
          {selectedFile && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700">
                Selected: {selectedFile.name}
              </p>
            </div>
          )}
        </div>

        <div className="mt-6">
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload & Transcribe
          </button>
        </div>

        {transcript && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Transcript:</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{transcript}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadFile;