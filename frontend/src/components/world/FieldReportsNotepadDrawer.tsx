import {
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Textarea,
} from '@chakra-ui/react';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import React, { useState } from 'react';
import { Remarkable } from 'remarkable';

function highlight (str: any, lang: any) {
  if (lang && hljs.getLanguage(lang)) {
    try {
      return hljs.highlight(lang, str).value;
    } catch (err) {
      console.log("error highlighting", err);
    }
  }

  try {
    return hljs.highlightAuto(str).value;
  } catch (err) {
    console.log("error highlighting", err)
  }

  return ''; // use external default escaping
}


const md = new Remarkable({
  highlight
});

function FieldReportsNotepadDrawer() {
  const [isNotepadOpen, setIsNotepadOpen] = useState(true);
  const [inputText, setInputText] = useState('');
  const sanitizedMarkdown = DOMPurify.sanitize(md.render(inputText)); //  (marked.parse(inputText));
  // ReactDom.render(<ReactMarkdown children={inputText} />, document.getElementById('md_root'));

  return (
    <Drawer
      isOpen={isNotepadOpen}
      placement='bottom'
      size='xl'
      onClose={() => setIsNotepadOpen(false)}>
      <DrawerOverlay />
      <DrawerContent style={{ minHeight: '40vh' }}>
        <DrawerCloseButton />
        <DrawerHeader>Notepad</DrawerHeader>
        <div style={{ display: 'flex' }}>
          <div style={{ width: '50%', paddingRight: 30 }}>
            <Textarea
              onChange={e => setInputText(e.target.value)}
              style={{ fontFamily: 'monospace', minHeight: '25vh' }}
            />
          </div>
          <div
            className='markdown-renderer'
            style={{ width: '50%', paddingLeft: 30 }}
            dangerouslySetInnerHTML={{ __html: sanitizedMarkdown }}
          />
          {/* <ReactMarkdown>{inputText}</ReactMarkdown> */}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export default FieldReportsNotepadDrawer;
