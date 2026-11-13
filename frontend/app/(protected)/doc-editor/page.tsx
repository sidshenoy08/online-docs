'use client';

import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';
import TextField from '@mui/material/TextField';

import Navbar from '@/components/Navbar';
import { useAuthStore } from '@/app/store/authStore';

const Editor = dynamic(() => import('@/components/editor/Editor'), {
  ssr: false
});

// Define the RichTextEditorHandle type
type EditorHandle = {
  getContents: () => object;
};


export default function DocEditor() {
  const editorRef = useRef<EditorHandle>(null); // Ref for RichTextEditor 
  const [docTitle, setDocTitle] = useState<string>("Untitled Doc");
  const [documentId, setDocumentId] = useState<string | null>(null);

  const saveDocument = async () => {
    const userToken = useAuthStore.getState().accessToken;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/save-doc`, {
        method: 'POST',
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
        throw new Error(`API Error: ${response}`);
      }

      const data = await response.json();
      setDocumentId(data.docId);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="p-4">
        <TextField id="outlined-basic" label="Document Title" variant="outlined" value={docTitle} onChange={(event) => { setDocTitle(event.target.value); }} />
        <div>
          <Editor ref={editorRef} />
        </div>
        <button
          onClick={saveDocument}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded flex "
        >
          Save
        </button>
      </div>
    </>
  );
}