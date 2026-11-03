'use client';

import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';

import Navbar from '@/components/Navbar';

const Editor = dynamic(() => import('@/components/editor/Editor'), {
  ssr: false
});

// Define the RichTextEditorHandle type
type EditorHandle = {
  getContent: () => string;
};


export default function DocEditor() {
  const editorRef = useRef<EditorHandle>(null); // Ref for RichTextEditor
  const [editorContent, setEditorContent] = useState<string>(''); // State to store the editor content

  const handleGetContent = () => {
    if (editorRef.current) {
      const content = editorRef.current.getContent(); // Get the editor content
      setEditorContent(content); // Update the state with the content
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
          Show Content
        </button>
      </div>
    </>
  );
}