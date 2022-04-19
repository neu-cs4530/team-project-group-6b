import React from 'react';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import { Remarkable } from 'remarkable';

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

function MarkdownRenderer(props: { markdown: string }) {
  const { markdown } = props;
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
