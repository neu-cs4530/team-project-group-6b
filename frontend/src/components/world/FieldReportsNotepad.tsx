import React, { useState } from 'react';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import { Remarkable } from 'remarkable';
import { Button, Textarea, Icon } from '@chakra-ui/react';
import {
  MdStrikethroughS,
  MdOutlineFormatBold,
  MdOutlineFormatItalic,
  MdOutlineCode,
  MdOutlineImage,
  MdOutlineTableChart,
} from 'react-icons/md';

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
  const formattingButtons = [
    { name: 'Code', print: '`your text here`', icon: MdOutlineCode },
    { name: 'Strikethrough', print: '~~your text here~~', icon: MdStrikethroughS },
    { name: 'Bold', print: '**your text here**', icon: MdOutlineFormatBold },
    {
      name: 'Table',
      print: `|item|amount|cost|
|-|-|-|
|bread|1 loaf|$2|
|milk|1 gallon|$3.50|
|eggs|1 dozen| $8.35|`,
      icon: MdOutlineTableChart,
    },
    {
      name: 'Image',
      print:
        '![nyan cat](https://cdn.vox-cdn.com/thumbor/8KxJUDwQsz5Qy-_HzZjtCTRR5PU=/0x164:1440x884/fit-in/1200x600/cdn.vox-cdn.com/uploads/chorus_asset/file/22310830/NmJgg.jpg)',
      icon: MdOutlineImage,
    },
    { name: 'Italic', print: '_your text here_', icon: MdOutlineFormatItalic },
  ];
  return (
    <div>
      <div style={{ display: 'flex' }}>
        {formattingButtons.map(btn => (
          <Button
            key={btn.name}
            onClick={() => {
              setInputText(`${inputText}\n${btn.print}\n`);
            }}
            leftIcon={<Icon as={btn.icon} />}
          />
        ))}
      </div>
      <div style={{ display: 'flex' }}>
        <div style={{ width: '50%', paddingRight: 30 }}>
          <Textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            style={{ fontFamily: 'monospace', minHeight: '100%' }}
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
