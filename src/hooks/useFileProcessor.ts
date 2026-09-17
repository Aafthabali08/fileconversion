import { useState, useCallback } from 'react';
import { saveAs } from 'file-saver';
import { convertFile } from '../services/converter';
import { mergeFiles } from '../services/merger';

export function useFileProcessor() {
  const [processing, setProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Blob | null>(null);
  const [resultFilename, setResultFilename] = useState<string>('');

  const processConversion = useCallback(async (
    file: File,
    targetFormat: string,
    options?: { quality?: number; maxSizeMB?: number }
  ) => {
    setProcessing(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      const conversionResult = await convertFile(file, targetFormat, {
        ...options,
        onProgress: (p) => setProgress(p)
      });
      setResult(conversionResult.blob);
      setResultFilename(conversionResult.filename);
      setProgress(100);
    } catch (err: any) {
      setError(err.message || 'An error occurred during conversion');
    } finally {
      setProcessing(false);
    }
  }, []);

  const processMerge = useCallback(async (
    files: File[],
    outputFormat: string = 'pdf'
  ) => {
    setProcessing(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      // Pass the onProgress callback inside the options object
      const mergeResult = await mergeFiles(files, outputFormat, {
        onProgress: (p) => setProgress(p)
      });
      setResult(mergeResult.blob);
      setResultFilename(mergeResult.filename);
      setProgress(100);
    } catch (err: any) {
      setError(err.message || 'An error occurred during merging');
    } finally {
      setProcessing(false);
    }
  }, []);

  const downloadResult = useCallback((filename?: string) => {
    if (result) {
      saveAs(result, filename || resultFilename || 'download');
    }
  }, [result, resultFilename]);

  const reset = useCallback(() => {
    setProcessing(false);
    setProgress(0);
    setError(null);
    setResult(null);
    setResultFilename('');
  }, []);

  return {
    processing,
    progress,
    error,
    result,
    resultFilename,
    processConversion,
    processMerge,
    downloadResult,
    reset
  };
}
