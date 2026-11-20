'use client';

import dynamic from 'next/dynamic';
import { useRef, useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import { useSearchParams } from 'next/navigation';

import Navbar from '@/components/Navbar';
import { useAuthStore } from '@/app/store/authStore';

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
      setDocumentId(data.docId);
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
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    setDocumentId(docId); // set id of document that was clicked on

    if (docId) {
      fetchDocContent(); // fetch document content if existing document opened
    }
  }, []);

  return (
    <>
      <Navbar />
      <div className="p-4">
        <TextField id="outlined-basic" label="Document Title" variant="outlined" value={docTitle} onChange={(event) => { setDocTitle(event.target.value); }} />
        <div>
          <Editor ref={editorRef} />
        </div>
        <button
          onClick={documentId ? updateDocument : saveDocument}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded flex "
        >
          Save
        </button>
      </div>
    </>
  );
};