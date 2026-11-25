'use client';

import dynamic from 'next/dynamic';
import { useRef, useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import CheckIcon from '@mui/icons-material/Check';
import { pdfExporter } from 'quill-to-pdf';
import { saveAs } from 'file-saver';
import { useSearchParams } from 'next/navigation';
import { RawOrParsedDelta } from 'quill-to-pdf';

import Navbar from '@/components/Navbar';
import { useAuthStore } from '@/app/store/authStore';
import { Delta } from 'quill';

const Editor = dynamic(() => import('@/components/editor/Editor'), {
  ssr: false
});

// Define the RichTextEditorHandle type
type EditorHandle = {
  getContents: () => object;
  setContents: (content: object) => void;
};


export default function DocEditor() {
  const editorRef = useRef<EditorHandle>(null); // Ref for RichTextEditor 
  const [docTitle, setDocTitle] = useState<string>("Untitled Doc");
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [docSave, setDocSave] = useState<boolean>(false);

  const searchParams = useSearchParams();
  const docId = searchParams.get("id");

  const userToken = useAuthStore.getState().accessToken;

  const fetchDocContent = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fetch-doc-content/${docId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`API Error!`);
      }

      const data = await response.json();

      setDocTitle(data.document.name);
      editorRef.current?.setContents(
        data.document.content
      );
    } catch (err) {
      console.log(err);
    }
  }

  const saveDocument = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/save-doc`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          // id: documentId,
          name: docTitle,
          content: editorRef.current ? editorRef.current?.getContents() : []
        })
      });

      if (!response.ok) {
        throw new Error(`API Error!`);
      }

      const data = await response.json();

      if (data.document.id) {
        setDocumentId(data.document.id);
        setDocSave(true);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const updateDocument = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/update-doc`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          id: documentId,
          name: docTitle,
          content: editorRef.current ? editorRef.current?.getContents() : []
        })
      });

      if (!response.ok) {
        throw new Error(`API Error!`);
      }

      const data = await response.json();

      if (data.docId) {
        console.log("Doc updated!");
        setDocSave(true);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const exportDocument = async () => {
    const docContent = editorRef.current?.getContents()
    const pdfAsBlob = await pdfExporter.generatePdf(docContent);
    saveAs(pdfAsBlob, `${docTitle}.pdf`);
  };

  useEffect(() => {
    setDocumentId(docId); // set id of document that was clicked on

    if (docId) {
      fetchDocContent(); // fetch document content if existing document opened
    }

    return () => {
      setDocTitle("Untitled Doc");
      setDocumentId(null);
    }
  }, []);

  useEffect(() => {
    if (!docSave) {
      return;
    }

    const timer = setTimeout(() => {
      setDocSave(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [docSave]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">

        <div className="relative mx-auto max-w-5xl">

          {docSave && (
            <div className="absolute top-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2">
              <Alert
                icon={<CheckIcon fontSize="inherit" />}
                severity="success"
                elevation={6}
              >
                Your document was saved successfully!
              </Alert>
            </div>
          )}

          {/* Page heading */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              Document Editor
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Create, edit, and save your documents.
            </p>
          </div>

          {/* Editor container */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">

            {/* Document title */}
            <div className="mb-6">
              <TextField
                id="document-title"
                label="Document Title"
                variant="outlined"
                fullWidth
                value={docTitle}
                onChange={(event) => setDocTitle(event.target.value)}
                placeholder="Enter a document title..."
              />
            </div>

            {/* Text editor */}
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <Editor ref={editorRef} />
            </div>

            {/* Buttons */}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <button
                onClick={documentId ? updateDocument : saveDocument}
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {documentId ? "Save Changes" : "Create Document"}
              </button>
              <button
                onClick={exportDocument}
                className="inline-flex items-center justify-center rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Export to PDF
              </button>
            </div>

          </div>
        </div>
      </main>
    </>
  );
};