import {
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import Notepad from './FieldReportsNotepad'


function FieldReportsNotepadDrawer() {
  const [isNotepadOpen, setIsNotepadOpen] = useState(true);
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
        <Notepad onSubmit={(text: string) => console.log(text)} defaultText={`
# Hello From markdown!
These are your **notes** for the day
|item|amount|cost|
|-|-|-|
|bread|1 loaf|$2|
|milk|1 gallon|$3.50|
|eggs|1 dozen| $8.35|
*you can even code in your favorite language!*
\`\`\`javascript
const message = "hello coveytown";
console.log(message);
\`\`\`
`} />
      </DrawerContent>
    </Drawer>
  );
}

export default FieldReportsNotepadDrawer;
