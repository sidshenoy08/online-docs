'use client';

import {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';

import Quill from 'quill';
import 'quill/dist/quill.snow.css';

export type EditorHandle = {
  getContents: () => object;
};

const Editor = forwardRef<EditorHandle>((_, ref) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    const container = editorRef.current;

    const quill = new Quill(container, {
      theme: 'snow',
      modules: {
        toolbar: [
          [{ header: [1, 2, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link', 'image', 'code-block'],
        ],
      },
      placeholder: 'Write something...',
    });

    quillRef.current = quill;

    return () => {
      // Remove the toolbar Quill inserted before the editor
      const toolbar = quill.getModule('toolbar')?.container;
      toolbar?.remove();

      // // Clear the editor container
      container.innerHTML = '';
      container.classList.remove('ql-container', 'ql-snow');

      quillRef.current = null;
      // editorRef.current!.innerHTML = '';
    };
  }, []);

  useImperativeHandle(ref, () => ({
    getContents: () => {
      return quillRef.current?.getContents() ?? { ops: [] };
    },
  }));

  return <div ref={editorRef} style={{ height: '300px' }} />;
});

Editor.displayName = 'Editor';

export default Editor;