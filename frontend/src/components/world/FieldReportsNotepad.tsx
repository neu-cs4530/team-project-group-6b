import React, { useState } from 'react';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import { Remarkable } from 'remarkable';
import { Button, Textarea } from '@chakra-ui/react';

function highlight(str: any, lang: any) {
  if (lang && hljs.getLanguage(lang)) {
    try {
      return hljs.highlight(lang, str).value;
    } catch (err) {
      console.log('error highlighting', err);
    }
  }

  try {
    return hljs.highlightAuto(str).value;
  } catch (err) {
    console.log('error highlighting', err);
  }

  return ''; // use external default escaping
}

const md = new Remarkable({
  highlight,
});

function Notepad(props: { defaultText: string; onSubmit: (text: string) => any }) {
  const { defaultText, onSubmit } = props;
  const [inputText, setInputText] = useState(defaultText);
  const sanitizedMarkdown = DOMPurify.sanitize(md.render(inputText)); //  (marked.parse(inputText));
  return (
    <div>
      <div style={{ display: 'flex' }}>
        <div style={{ width: '50%', paddingRight: 30 }}>
          <Textarea
            value={inputText}
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
      <div style={{ display: 'flex', justifyContent: 'right', paddingRight: 30 }}>
        <Button style={{ marginRight: 15 }} onClick={() => onSubmit(inputText)}>
          Submit
        </Button>
        <Button onClick={() => setInputText(defaultText)}>Reset</Button>
      </div>
    </div>
  );
}

export default Notepad;
