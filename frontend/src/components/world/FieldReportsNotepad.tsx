import React, { useState } from 'react';
import { Button, Textarea, Icon, FormControl } from '@chakra-ui/react';
import {
  MdStrikethroughS,
  MdOutlineFormatBold,
  MdOutlineFormatItalic,
  MdOutlineCode,
  MdOutlineImage,
  MdOutlineTableChart,
} from 'react-icons/md';
import MarkdownRenderer from '../MarkdownRenderer';

function Notepad(props: { defaultText: string; onSubmit: (text: string) => any }) {
  const { defaultText, onSubmit } = props;
  const [defaultTextAreaValue, setDefaultTextAreaValue] = useState(defaultText);
  const [inputText, setInputText] = useState(defaultTextAreaValue);
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
            style={{ fontFamily: 'monospace', height: '100%' }}
          />
        </div>
        <MarkdownRenderer markdown={inputText} />
        {/* <ReactMarkdown>{inputText}</ReactMarkdown> */}
      </div>
      <div style={{ display: 'flex', justifyContent: 'right', paddingRight: 30 }}>
        <Button
          style={{ marginRight: 15 }}
          onClick={() => {
            setDefaultTextAreaValue(inputText);
            onSubmit(inputText);
          }}>
          Submit
        </Button>
        <Button onClick={() => setInputText(defaultTextAreaValue)}>Reset</Button>
      </div>
    </div>
  );
}

export default Notepad;
