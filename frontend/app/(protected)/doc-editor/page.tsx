'use client';

import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';

import Navbar from '@/components/Navbar';

const Editor = dynamic(() => import('@/components/editor/Editor'), {
  ssr: false
});

// Define the RichTextEditorHandle type
type EditorHandle = {
  getContents: () => object;
};


export default function DocEditor() {
  const editorRef = useRef<EditorHandle>(null); // Ref for RichTextEditor

  const handleGetContent = () => {
    if (editorRef.current) {
      const contents = editorRef.current?.getContents();
      console.log(contents);
    }
  };

  return (
    <>
      <Navbar />
      <div className="p-4">
        <div>
          <Editor ref={editorRef} />
        </div>
        <button
          onClick={handleGetContent}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded flex "
        >
          Save
        </button>
      </div>
    </>
  );
}