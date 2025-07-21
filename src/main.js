// The editor is responsible for creating and showing the schema
import { Editor } from '@tiptap/core'
// Everything goes inside the Document (it's the top level node)
import Document from '@tiptap/extension-document'
// text and paragraph required for every schema
// These are the basic extensions that are always included
import Text from '@tiptap/extension-text'
import Paragraph from '@tiptap/extension-paragraph'

// ALlows adding a blockquote using the > character
import BlockQuote from '@tiptap/extension-blockquote'

// allows adding creating quick lists using the * or - characters
import { BulletList, ListItem, OrderedList  } from '@tiptap/extension-list'

import CodeBlock from '@tiptap/extension-code-block'
import Heading from '@tiptap/extension-heading'
import HorizontalRule from '@tiptap/extension-horizontal-rule'

import Image from '@tiptap/extension-image'
import { Dropcursor } from '@tiptap/extensions'

import { TableKit } from '@tiptap/extension-table'
import { Gapcursor } from '@tiptap/extensions'

import { TaskItem, TaskList } from '@tiptap/extension-list'

import { Placeholder } from '@tiptap/extensions'

import Bold from '@tiptap/extension-bold'
import { TextStyleKit } from '@tiptap/extension-text-style'

import TextAlign from '@tiptap/extension-text-align'

import { BubbleMenu } from '@tiptap/extension-bubble-menu'

import Italic from '@tiptap/extension-italic'


const editorDiv = document.querySelector('#tiptap_editor');
const schemaViewer = document.querySelector('#schema_viewer');

function saveSchemaToLocalStorage(schema) {
  localStorage.setItem('tiptap_schema', JSON.stringify(schema));
}

const clearStoreButton = document.getElementById('clear_store');
clearStoreButton.addEventListener('click', () => {
  localStorage.removeItem('tiptap_schema');
  // reload the window to reset the editor
  window.location.reload();
});

let defaultSchema = null;
if (localStorage.getItem('tiptap_schema')) {
  defaultSchema = JSON.parse(localStorage.getItem('tiptap_schema'));
}

function renderSchema(editor) {
  const jsonSchema = editor.getJSON();
  schemaViewer.textContent = JSON.stringify(jsonSchema, null, 2);
}


const bubbleMenuDiv = document.createElement('div');
bubbleMenuDiv.id = 'bubble-menu';
bubbleMenuDiv.className = 'bubble-menu absolute bg-white border border-gray-300 rounded shadow-lg p-1';
bubbleMenuDiv.style.zIndex = '2000';
bubbleMenuDiv.style.display = 'flex';
editorDiv.appendChild(bubbleMenuDiv);

// bubble menu actions (Bold, Align Left, Align Center, Align Right, Align Justify
const bubbleMenuActions = document.createElement('div');
bubbleMenuActions.className = 'bubble-menu-actions gap-1 flex flex-wrap justify-start items-center';
bubbleMenuDiv.appendChild(bubbleMenuActions);

const bubbleMenuButtons = [
  {
    "editor-action": 'bold',
    "icon": '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bold-icon lucide-bold"><path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"/></svg>',
    "title": "Bold"
  },
  {
    "editor-action": 'italic',
    "icon": '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-italic-icon lucide-italic"><line x1="19" x2="10" y1="4" y2="4"/><line x1="14" x2="5" y1="20" y2="20"/><line x1="15" x2="9" y1="4" y2="20"/></svg>',
    "title": "Italic"
  },
  {
    "editor-action": 'align-left',
    "icon": '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-align-left-icon lucide-align-left"><path d="M15 12H3"/><path d="M17 18H3"/><path d="M21 6H3"/></svg>',
    "title": "Align Left"
  },
  {
    "editor-action": 'align-center',
    "icon": '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-align-center-icon lucide-align-center"><path d="M21 12H9"/><path d="M21 18H7"/><path d="M21 6H3"/></svg>',
    "title": "Align Center"
  }
  // rest of the buttons
];

bubbleMenuButtons.forEach(button => {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.setAttribute('editor-action', button['editor-action']);
  btn.className = 'px-1 py-1 text-black text-sm rounded border border-gray-300 hover:border-gray-400 active:bg-gray-200';
  btn.innerHTML = button.icon;
  btn.title = button.title;
  bubbleMenuActions.appendChild(btn);
});



const editor = new Editor({
  element: editorDiv,
  extensions: [
    // CORE
    Document,
    Text,
    Paragraph,
    // BLOCKS
    BlockQuote,
    BulletList,
    ListItem,
    OrderedList,
    CodeBlock,
    Heading.configure({
      levels: [1, 2, 3],
    }),
    HorizontalRule,
    Image,
    Dropcursor,
    TableKit.configure({
      table: { resizable: true },
    }),
    Gapcursor,
    TaskItem,
    TaskList,
    Placeholder.configure({
      placeholder: ({ node }) => {
        if (node.type.name === 'paragraph') {
          return 'Type something...';
        }
        if (node.type.name === 'heading') {
          return 'Heading';
        }
        if (node.type.name === 'codeBlock') {
          return 'Write some code...';
        }
        return '';
      }
    }),
    Bold,
    TextStyleKit,
    TextAlign.configure({
      types: ['heading', 'paragraph', 'codeBlock'],
      alignments: ['left', 'center', 'right', 'justify'],
    }),
    BubbleMenu.configure({
      element: document.querySelector('#bubble-menu'),
    }),
    Italic,
  ],
  autofocus: "start",
  content: defaultSchema || '',
  onUpdate: () => {
    renderSchema(editor);
    saveSchemaToLocalStorage(editor.getJSON());
  },
})

// Initialize the editor and store the schema
renderSchema(editor);


// Buttons

const addImageButton = document.querySelectorAll('[editor-action="add-image"]');
for (const button of addImageButton) {
  button.addEventListener('click', () => {
    const imageUrl = prompt('Enter image URL:');
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
    }
  });
}

const addTableButtons = document.querySelectorAll('[editor-action="add-table"]');
for (const button of addTableButtons) {
  button.addEventListener('click', () => {
    const rows = parseInt(prompt('Enter number of rows:', '3'));
    const cols = parseInt(prompt('Enter number of columns:', '3'));
    if (!isNaN(rows) && !isNaN(cols) && rows > 0 && cols > 0) {
      editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    }
  });
}

const boldButtons = document.querySelectorAll('[editor-action="bold"]');
for (const button of boldButtons) {
  button.addEventListener('click', () => {
    editor.chain().focus().toggleBold().run();
  });
}

const italicButtons = document.querySelectorAll('[editor-action="italic"]');
for (const button of italicButtons) {
  button.addEventListener('click', () => {
    editor.chain().focus().toggleItalic().run();
  });
}

const alignLeftButtons = document.querySelectorAll('[editor-action="align-left"]');
for (const button of alignLeftButtons) {
  button.addEventListener('click', () => {
    editor.chain().focus().setTextAlign('left').run();
  });
}

const alignCenterButtons = document.querySelectorAll('[editor-action="align-center"]');
for (const button of alignCenterButtons) {
  button.addEventListener('click', () => {
    editor.chain().focus().setTextAlign('center').run();
  });
}

const alignRightButtons = document.querySelectorAll('[editor-action="align-right"]');
for (const button of alignRightButtons) {
  button.addEventListener('click', () => {
    editor.chain().focus().setTextAlign('right').run();
  });
}

const alignJustifyButtons = document.querySelectorAll('[editor-action="align-justify"]');
for (const button of alignJustifyButtons) {
  button.addEventListener('click', () => {
    editor.chain().focus().setTextAlign('justify').run();
  });
}