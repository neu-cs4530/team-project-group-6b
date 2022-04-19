import React from 'react';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import { Remarkable } from 'remarkable';
import { useToast } from '@chakra-ui/react';

function MarkdownRenderer(props: { markdown: string }) {
  const { markdown } = props;
  const toast = useToast();
  function highlight(str: string, lang: string) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value;
      } catch (err) {
        toast({
          title: 'Error Highlighting',
          description: `${err}`,
          status: 'error',
        });
      }
    }
    try {
      return hljs.highlightAuto(str).value;
    } catch (err) {
      toast({
        title: 'Error Highlighting',
        description: `${err}`,
        status: 'error',
      });
    }

    return ''; // use external default escaping
  }
  const md = new Remarkable({
    highlight,
  });
  const sanitizedMarkdown = DOMPurify.sanitize(md.render(markdown)); //  (marked.parse(inputText));
  return (
    <div
      className='markdown-renderer'
      style={{ width: '50%', paddingLeft: 30 }}
      dangerouslySetInnerHTML={{ __html: sanitizedMarkdown }}
    />
  );
}

export default MarkdownRenderer;
