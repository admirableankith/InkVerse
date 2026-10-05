import React, { useRef, useEffect, useState } from 'react';
import { 
  Bold, Italic, Underline, Heading2, Heading3, 
  Quote, List, ListOrdered, Link as LinkIcon, 
  Image as ImageIcon, Eye, Edit3, RemoveFormatting 
} from 'lucide-react';

export default function RichTextEditor({ value, onChange, placeholder = 'Write your thoughts, stories, and ideas here...' }) {
  const editorRef = useRef(null);
  const [isPreview, setIsPreview] = useState(false);
  const isUpdatingRef = useRef(false);

  // Sync incoming value to editable div when not actively typing
  useEffect(() => {
    if (editorRef.current && !isUpdatingRef.current) {
      if (editorRef.current.innerHTML !== (value || '')) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value, isPreview]);

  const handleInput = () => {
    if (editorRef.current) {
      isUpdatingRef.current = true;
      const html = editorRef.current.innerHTML;
      onChange(html);
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 50);
    }
  };

  const executeCommand = (command, val = null) => {
    document.execCommand(command, false, val);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };

  const applyFormatBlock = (tag) => {
    document.execCommand('formatBlock', false, `<${tag}>`);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };

  const handleInsertLink = () => {
    const url = prompt('Enter link URL (e.g. https://example.com):');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  const handleInsertImage = () => {
    const url = prompt('Enter image URL (e.g. https://images.unsplash.com/...):');
    if (url) {
      executeCommand('insertImage', url);
    }
  };

  return (
    <div className="border border-app-border rounded-xl overflow-hidden bg-app-surface shadow-xs focus-within:border-primary-main transition-colors">
      
      {/* Toolbar - Touchscreen friendly flex wrap */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 p-2 bg-app-surface-hover/80 border-b border-app-border text-app-main select-none">
        
        <div className="flex flex-wrap items-center gap-1">
          {/* Text Style */}
          <button
            type="button"
            onClick={() => executeCommand('bold')}
            title="Bold (Ctrl+B)"
            aria-label="Bold"
            className="p-2 sm:p-1.5 min-h-[38px] min-w-[38px] flex items-center justify-center rounded hover:bg-app-surface text-app-main transition-colors font-bold active:bg-app-surface"
          >
            <Bold className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={() => executeCommand('italic')}
            title="Italic (Ctrl+I)"
            aria-label="Italic"
            className="p-2 sm:p-1.5 min-h-[38px] min-w-[38px] flex items-center justify-center rounded hover:bg-app-surface text-app-main transition-colors active:bg-app-surface"
          >
            <Italic className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => executeCommand('underline')}
            title="Underline (Ctrl+U)"
            aria-label="Underline"
            className="p-2 sm:p-1.5 min-h-[38px] min-w-[38px] flex items-center justify-center rounded hover:bg-app-surface text-app-main transition-colors active:bg-app-surface"
          >
            <Underline className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-app-border mx-0.5" />

          {/* Headings */}
          <button
            type="button"
            onClick={() => applyFormatBlock('h2')}
            title="Heading 2 (Section Title)"
            aria-label="Heading 2"
            className="p-2 sm:p-1.5 min-h-[38px] min-w-[38px] flex items-center justify-center rounded hover:bg-app-surface text-app-main transition-colors font-semibold active:bg-app-surface"
          >
            <Heading2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => applyFormatBlock('h3')}
            title="Heading 3 (Sub-section)"
            aria-label="Heading 3"
            className="p-2 sm:p-1.5 min-h-[38px] min-w-[38px] flex items-center justify-center rounded hover:bg-app-surface text-app-main transition-colors font-semibold active:bg-app-surface"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => applyFormatBlock('p')}
            title="Normal Paragraph"
            aria-label="Paragraph"
            className="px-2.5 py-1.5 min-h-[38px] rounded text-xs hover:bg-app-surface text-app-muted hover:text-app-main transition-colors font-sans flex items-center active:bg-app-surface"
          >
            Text
          </button>

          <div className="h-4 w-px bg-app-border mx-0.5" />

          {/* Quote & Lists */}
          <button
            type="button"
            onClick={() => applyFormatBlock('blockquote')}
            title="Quote Box"
            aria-label="Quote"
            className="p-2 sm:p-1.5 min-h-[38px] min-w-[38px] flex items-center justify-center rounded hover:bg-app-surface text-app-main transition-colors active:bg-app-surface"
          >
            <Quote className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => executeCommand('insertUnorderedList')}
            title="Bullet Points"
            aria-label="Bullet List"
            className="p-2 sm:p-1.5 min-h-[38px] min-w-[38px] flex items-center justify-center rounded hover:bg-app-surface text-app-main transition-colors active:bg-app-surface"
          >
            <List className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => executeCommand('insertOrderedList')}
            title="Numbered List"
            aria-label="Numbered List"
            className="p-2 sm:p-1.5 min-h-[38px] min-w-[38px] flex items-center justify-center rounded hover:bg-app-surface text-app-main transition-colors active:bg-app-surface"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-app-border mx-0.5" />

          {/* Link & Media */}
          <button
            type="button"
            onClick={handleInsertLink}
            title="Add Link"
            aria-label="Insert Link"
            className="p-2 sm:p-1.5 min-h-[38px] min-w-[38px] flex items-center justify-center rounded hover:bg-app-surface text-app-main transition-colors active:bg-app-surface"
          >
            <LinkIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleInsertImage}
            title="Insert In-article Image"
            aria-label="Insert Image"
            className="p-2 sm:p-1.5 min-h-[38px] min-w-[38px] flex items-center justify-center rounded hover:bg-app-surface text-app-main transition-colors active:bg-app-surface"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => executeCommand('removeFormat')}
            title="Clear Formatting"
            aria-label="Clear Formatting"
            className="p-2 sm:p-1.5 min-h-[38px] min-w-[38px] flex items-center justify-center rounded hover:bg-app-surface text-app-muted hover:text-app-main transition-colors active:bg-app-surface"
          >
            <RemoveFormatting className="w-4 h-4" />
          </button>
        </div>

        {/* Edit / Preview Mode Switch */}
        <div className="flex items-center gap-1 border-t sm:border-t-0 sm:border-l border-app-border pt-1 sm:pt-0 sm:pl-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => setIsPreview(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors min-h-[36px] ${
              !isPreview ? 'bg-app-surface text-primary-main shadow-2xs border border-app-border' : 'text-app-muted hover:bg-app-surface'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Write</span>
          </button>
          <button
            type="button"
            onClick={() => setIsPreview(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors min-h-[36px] ${
              isPreview ? 'bg-app-surface text-primary-main shadow-2xs border border-app-border' : 'text-app-muted hover:bg-app-surface'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
        </div>

      </div>

      {/* Editing / Preview Canvas */}
      {!isPreview ? (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onBlur={handleInput}
          className="article-prose min-h-[280px] sm:min-h-[360px] p-4 sm:p-6 lg:p-8 outline-none focus:outline-none focus:ring-0 overflow-y-auto cursor-text bg-app-surface text-app-main"
          data-placeholder={placeholder}
        />
      ) : (
        <div className="article-prose min-h-[280px] sm:min-h-[360px] p-4 sm:p-6 lg:p-8 bg-app-surface overflow-y-auto">
          {value ? (
            <div dangerouslySetInnerHTML={{ __html: value }} />
          ) : (
            <p className="text-app-muted italic font-sans text-sm">Nothing written yet. Click 'Write' to start drafting your article.</p>
          )}
        </div>
      )}

      {/* Status Footer */}
      <div className="px-4 py-2 bg-app-surface-hover/60 border-t border-app-border flex items-center justify-between text-xs text-app-muted font-sans">
        <span>Rich Text Editor</span>
        <span>
          {value ? `${value.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length} words` : '0 words'}
        </span>
      </div>

    </div>
  );
}
