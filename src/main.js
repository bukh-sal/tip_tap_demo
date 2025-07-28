import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Text from '@tiptap/extension-text'
import Paragraph from '@tiptap/extension-paragraph'
import BlockQuote from '@tiptap/extension-blockquote'
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
import DragHandle from '@tiptap/extension-drag-handle'
import Link from '@tiptap/extension-link'
import Strike from '@tiptap/extension-strike'
import Underline from '@tiptap/extension-underline'
import { UndoRedo } from '@tiptap/extensions'


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
bubbleMenuDiv.className = 'bubble-menu absolute bg-white/40 backdrop-blur-[2px] border border-gray-300 rounded-md shadow-xs';
bubbleMenuDiv.style.zIndex = '2000';
bubbleMenuDiv.style.display = 'none';
editorDiv.appendChild(bubbleMenuDiv);

// bubble menu actions (Bold, Italic, Underline, Strikethrough, Align Left, Align Center, Align Right, Align Justify)
const bubbleMenuActions = document.createElement('div');
bubbleMenuActions.className = 'bubble-menu-actions gap-0 flex flex-wrap justify-center items-center';
bubbleMenuDiv.appendChild(bubbleMenuActions);

const bubbleMenuButtons = [
  {
    "editor-action": 'bold',
    "icon": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bold-icon lucide-bold"><path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"/></svg>',
    "title": "Bold"
  },
  {
    "editor-action": 'italic',
    "icon": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-italic-icon lucide-italic"><line x1="19" x2="10" y1="4" y2="4"/><line x1="14" x2="5" y1="20" y2="20"/><line x1="15" x2="9" y1="4" y2="20"/></svg>',
    "title": "Italic"
  },
  {
    "editor-action": 'underline',
    "icon": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-underline-icon lucide-underline"><path d="M6 4v6a6 6 0 0 0 12 0V4"/><line x1="4" x2="20" y1="20" y2="20"/></svg>',
    "title": "Underline"
  },
  {
    "editor-action": 'strikethrough',
    "icon": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-strikethrough-icon lucide-strikethrough"><path d="M16 4H9a3 3 0 0 0-2.83 4"/><path d="M14 12a4 4 0 0 1 0 8H6"/><line x1="4" x2="20" y1="12" y2="12"/></svg>',
    "title": "Strikethrough"
  },
  {
    "editor-action": 'separator',
    "icon": '<span class="border border-r border-gray-300/70 py-3 mx-1"></span>',
    "title": ""
  },
  {
    "editor-action": 'align-left',
    "icon": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-align-left-icon lucide-align-left"><path d="M15 12H3"/><path d="M17 18H3"/><path d="M21 6H3"/></svg>',
    "title": "Align Left"
  },
  {
    "editor-action": 'align-center',
    "icon": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-align-center-icon lucide-align-center"><path d="M17 12H7"/><path d="M19 18H5"/><path d="M21 6H3"/></svg>',
    "title": "Align Center"
  },
  {
    "editor-action": 'align-right',
    "icon": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-align-right-icon lucide-align-right"><path d="M21 12H9"/><path d="M21 18H7"/><path d="M21 6H3"/></svg>',
    "title": "Align Right"
  },
  {
    "editor-action": 'align-justify',
    "icon": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-align-justify-icon lucide-align-justify"><path d="M3 12h18"/><path d="M3 18h18"/><path d="M3 6h18"/></svg>',
    "title": "Align Justify"
  }
];

bubbleMenuButtons.forEach(button => {
  if (button['editor-action'] === 'separator') {
    const separator = document.createElement('span');
    separator.className = 'border border-r border-gray-300/70 py-3 mx-1';
    bubbleMenuActions.appendChild(separator);
  } else {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('editor-action', button['editor-action']);
    btn.className = 'px-2 py-2 text-black/65 text-sm rounded hover:bg-gray-200/70';
    btn.innerHTML = button.icon;
    btn.title = button.title;
    bubbleMenuActions.appendChild(btn);
  }
});

function getCurrentAlignment(editor) {
  const attributes = editor.getAttributes('paragraph') || editor.getAttributes('heading');
  return attributes.textAlign || 'left'; // default to 'left' if no alignment set
}

const getTextStyleState = (editor) => {
  const textAlign = getCurrentAlignment(editor);
  return {
    bold: editor.isActive('bold') || null,
    italic: editor.isActive('italic') || null,
    underline: editor.isActive('underline') || null,
    strike: editor.isActive('strike') || null,
    code: editor.isActive('code') || null,
    fontSize: editor.getAttributes('textStyle').fontSize || null,
    color: editor.getAttributes('textStyle').color || null,
    backgroundColor: editor.getAttributes('textStyle').backgroundColor || null,
    fontFamily: editor.getAttributes('textStyle').fontFamily || null,
    quote: editor.isActive('quote') || null,
    textAlign: textAlign,
  };
};


function updateFormattingSelections(editor) {
  const textStyleState = getTextStyleState(editor);

  // update bold button
  const boldButtons = document.querySelectorAll('button[editor-action="bold"]');
  for (const btn of boldButtons) {
      btn.classList.remove('bg-gray-200/70');
      if (textStyleState.bold) {
        btn.classList.add('bg-gray-200/70');
      }
  }

  // update italic button
  const italicButtons = document.querySelectorAll('button[editor-action="italic"]');
  for (const btn of italicButtons) {
    btn.classList.remove('bg-gray-200/70');
    if (textStyleState.italic) {
      btn.classList.add('bg-gray-200/70');
    }
  }

  // update underline button
  const underlineButtons = document.querySelectorAll('button[editor-action="underline"]');
  for (const btn of underlineButtons) {
    btn.classList.remove('bg-gray-200/70');
    if (textStyleState.underline) {
      btn.classList.add('bg-gray-200/70');
    }
  }

  // update strike button
  const strikeButtons = document.querySelectorAll('button[editor-action="strikethrough"]');
  for (const btn of strikeButtons) {
    btn.classList.remove('bg-gray-200/70');
    if (textStyleState.strike) {
      btn.classList.add('bg-gray-200/70');
    }
  }

  // update font size dropdown
  const fontSizeDropdowns = document.querySelectorAll('[editor-action="select-font-size"]');
  for (const ddown of fontSizeDropdowns) {
    if (textStyleState.fontSize) {
      const options = ddown.querySelectorAll('option');
      for (const opt of options) {
        if (opt.value == textStyleState.fontSize) {
          opt.selected = true;
        }
      }
    } else {
      // reset to default (option where value = "")
      ddown.value = "";
    }
  }

  // update font family drop down
  const fontFamilyDropdowns = document.querySelectorAll('.font-family-picker');
  for (const ddown of fontFamilyDropdowns) {
    if (textStyleState.fontFamily) {
      const options = ddown.querySelectorAll('option');
      for (const opt of options) {
        if (opt.value == textStyleState.fontFamily) {
          opt.selected = true;
        }
      }
    } else {
      // reset to default (option where value = "")
      ddown.value = "";
    }
  }

  // update font color
  const fontColorPreviews = document.querySelectorAll('.current-color');
  for (const preview of fontColorPreviews) {
    if (textStyleState.color) {
      preview.style.backgroundColor = textStyleState.color;
    } else {
      preview.style.backgroundColor = '#000000';
    }
  }

  // update align-left
  const alignLeftButtons = document.querySelectorAll('button[editor-action="align-left"]');
  for (const btn of alignLeftButtons) {
    btn.classList.remove('bg-gray-200/70');
    if (textStyleState.textAlign == 'left') {
      btn.classList.add('bg-gray-200/70');
    }
  }

  // update align cetner
  const alignCenterButtons = document.querySelectorAll('button[editor-action="align-center"]');
  for (const btn of alignCenterButtons) {
    btn.classList.remove('bg-gray-200/70');
    if (textStyleState.textAlign == 'center') {
      btn.classList.add('bg-gray-200/70');
    }
  }

  // update align right
  const alignRightButtons = document.querySelectorAll('button[editor-action="align-right"]');
  for (const btn of alignRightButtons) {
    btn.classList.remove('bg-gray-200/70');
    if (textStyleState.textAlign == 'right') {
      btn.classList.add('bg-gray-200/70');
    }
  }

  // update align-justify
  const alignJustifyButtons = document.querySelectorAll('button[editor-action="align-justify"]');
  for (const btn of alignJustifyButtons) {
    btn.classList.remove('bg-gray-200/70');
    if (textStyleState.textAlign == 'justify') {
      btn.classList.add('bg-gray-200/70');
    }
  }

}


const editor = new Editor({
  element: editorDiv,
  editable: true,
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
      levels: [1, 2, 3, 4, 5, 6],
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
      shouldShow: ({ editor, view, state, from, to }) => {
        // Only show when there is a text selection
        let r = from !== to && editor.isFocused;
        if (r) {
          setTimeout(() => {
            updateFormattingSelections(editor);
          }, 5);
        }
        bubbleMenuDiv.style.display = r ? 'block' : 'none';
        return r;
      },
    }),
    Italic,
    DragHandle.configure({
      render: () => {
        const element = document.createElement('div')
        // Use as a hook for CSS to insert an icon
        element.classList.add('drag-handle')
        element.innerHTML = `
          <svg class="text-gray-300 me-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-grip-vertical-icon lucide-grip-vertical"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
        `;
        return element
      },

      onNodeChange: ({ node, editor, pos }) => {
        // can be used to add options (delete, insert, table actions, etc..) to the drag handle
      },

    }),
    Link.configure({
      defaultProtocol: 'https',
      shouldAutoLink: (url) => url.startsWith('https://'),
    }),
    Strike,
    Underline,
    UndoRedo,
  ],
  autofocus: "start",
  content: defaultSchema || '',
  onUpdate: ({ editor }) => {
    renderSchema(editor);
    saveSchemaToLocalStorage(editor.getJSON());
    updateFormattingSelections(editor);
  },
  onSelectionUpdate: ({ editor }) => {
    updateFormattingSelections(editor);
  }
})

// Initialize the editor and store the schema
renderSchema(editor);

function incrimentFontSize() {
  const maxFontSize = 192;
  const currentFontSize = getTextStyleState(editor).fontSize;
  let newFontSize = parseInt(currentFontSize) + 1;
  if (newFontSize > maxFontSize) newFontSize = maxFontSize;
  if (currentFontSize == newFontSize) return;
  editor.chain().focus().setFontSize(newFontSize + 'px').run();
}

function decrementFontSize() {
  const minFontSize = 3;
  const currentFontSize = getTextStyleState(editor).fontSize;
  let newFontSize = parseInt(currentFontSize) - 1;
  
  if (newFontSize < minFontSize) newFontSize = minFontSize;
  if (currentFontSize == newFontSize) return;

  editor.chain().focus().setFontSize(newFontSize + 'px').run();
}

// bind CTRL + [ to decrement font size
document.addEventListener('keydown', (event) => {
  if (event.ctrlKey && event.code === 'BracketLeft') {
    decrementFontSize();
  }
});

// bind CTRL + ] to increment font size
document.addEventListener('keydown', (event) => {
  if (event.ctrlKey && event.code === 'BracketRight') {
    incrimentFontSize();
  }
});


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

const quoteButtons = document.querySelectorAll('[editor-action="quote"]');
for (const button of quoteButtons) {
  button.addEventListener('click', () => {
    editor.chain().focus().toggleBlockquote().run();
  });
}

const strikethroughButtons = document.querySelectorAll('[editor-action="strikethrough"]');
for (const button of strikethroughButtons) {
  button.addEventListener('click', () => {
    editor.chain().focus().toggleStrike().run();
  });
}

const underlineButtons = document.querySelectorAll('[editor-action="underline"]');
for (const button of underlineButtons) {
  button.addEventListener('click', () => {
    editor.chain().focus().toggleUnderline().run();
  });
}

const codeButtons = document.querySelectorAll('[editor-action="code"]');
for (const button of codeButtons) {
  button.addEventListener('click', () => {
    editor.chain().focus().toggleCodeBlock().run();
  });
}

const linkButtons = document.querySelectorAll('[editor-action="link"]');
for (const button of linkButtons) {
  button.addEventListener('click', () => {
    const linkUrl = prompt('Enter link URL:');
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
    }
  });
}

const fontSizeSelects = document.querySelectorAll('[editor-action="select-font-size"]');
for (const select of fontSizeSelects) {
  // we have 3 types of editor actions for the options (clear-font-size, set-heading, set-pixel-size)
  select.addEventListener('change', (event) => {
    const selectedOption = event.target.options[event.target.selectedIndex];
    const actionType = selectedOption.getAttribute('editor-action');
    if (actionType === 'clear-font-size') {
        editor.chain().focus().setNode('paragraph').run();
        editor.chain().focus().unsetFontSize().run();
    }
    else if (actionType === 'set-pixel-size') {
      editor.chain().focus().setNode('paragraph').run();
      editor.chain().focus().setFontSize(selectedOption.value).run();
    }
    else if (actionType === 'set-heading') {
      editor.chain().focus().unsetFontSize().run();
      editor.chain().focus().setHeading({ level: parseInt(selectedOption.value) }).run();
    }
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

const undoButtons = document.querySelectorAll('[editor-action="undo"]');
for (const button of undoButtons) {
  button.addEventListener('click', () => {
    editor.chain().focus().undo().run();
  });
}

const redoButtons = document.querySelectorAll('[editor-action="redo"]');
for (const button of redoButtons) {
  button.addEventListener('click', () => {
    editor.chain().focus().redo().run();
  });
}

const colorChoices = document.querySelectorAll('.color-swatch');
for (const colorChoice of colorChoices) {
  colorChoice.addEventListener('click', () => {
    // data-color
    const color = colorChoice.dataset.color;
    editor.chain().focus().setColor(color).run();
  });
}

const customColorPickers = document.querySelectorAll('.custom-color-picker');
for (const picker of customColorPickers) {
  picker.addEventListener('input', (event) => {
    const color = event.target.value;
    editor.chain().focus().setColor(color).run();
  });
}

const fontFamilyPickers = document.querySelectorAll('.font-family-picker');
for (const picker of fontFamilyPickers) {
  picker.addEventListener('change', (event) => {
    const fontFamily = event.target.value;
    if (fontFamily) {
      editor.chain().focus().setFontFamily(fontFamily).run();
    } else {
      editor.chain().focus().unsetFontFamily().run();
    }
  });
}

const bulletListButtons = document.querySelectorAll('[editor-action="bullet-list"]');
for (const button of bulletListButtons) {
  button.addEventListener('click', () => {
    editor.chain().focus().toggleBulletList().run();
  });
}

const orderedListButtons = document.querySelectorAll('[editor-action="ordered-list"]');
for (const button of orderedListButtons) {
  button.addEventListener('click', () => {
    editor.chain().focus().toggleOrderedList().run();
  });
}

const tasksListButtons = document.querySelectorAll('[editor-action="tasks-list"]');
for (const button of tasksListButtons) {
  button.addEventListener('click', () => {
    editor.chain().focus().toggleTaskList().run();
  });
}

// Table menu actions
const tableActionsIcons = {
  add: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>`,
  delete: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z"/></svg>`,
  header: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="6" rx="1"/><rect x="3" y="9" width="18" height="12" rx="1"/></svg>`
};

// Dropdown config for menu cleanliness
const tableDropdowns = [
  {
    key: 'add',
    label: 'Add',
    icon: tableActionsIcons.add,
    btnClass: 'toolbar-btn flex items-center gap-1 px-3 py-1 rounded-md border border-gray-200 bg-white hover:bg-gray-100 focus:bg-gray-200 text-sm font-medium shadow-sm transition',
    menuClass: 'dropdown-menu absolute left-0 mt-2 min-w-[160px] bg-white border border-gray-200 rounded-md shadow-lg flex flex-col z-10 hidden',
    items: [
      { action: 'add-row-before', label: 'Row Above', icon: '⬆️', title: 'Add row above' },
      { action: 'add-row-after', label: 'Row Below', icon: '⬇️', title: 'Add row below' },
      { action: 'add-col-before', label: 'Col Left', icon: '⬅️', title: 'Add column left' },
      { action: 'add-col-after', label: 'Col Right', icon: '➡️', title: 'Add column right' },
    ]
  },
  {
    key: 'delete',
    label: 'Delete',
    icon: tableActionsIcons.delete,
    btnClass: 'toolbar-btn flex items-center gap-1 px-3 py-1 rounded-md border border-red-200 bg-white hover:bg-red-50 focus:bg-red-100 text-sm font-medium text-red-600 shadow-sm transition',
    menuClass: 'dropdown-menu absolute left-0 mt-2 min-w-[160px] bg-white border border-red-200 rounded-md shadow-lg flex flex-col z-10 hidden',
    items: [
      { action: 'delete-row', label: 'Delete Row', icon: '🗑️', title: 'Delete row' },
      { action: 'delete-col', label: 'Delete Col', icon: '🗑️', title: 'Delete column' },
      { action: 'delete-table', label: 'Delete Table', icon: '🗑️', title: 'Delete table', danger: true },
    ]
  },
  {
    key: 'headers',
    label: 'Headers',
    icon: tableActionsIcons.header,
    btnClass: 'toolbar-btn flex items-center gap-1 px-3 py-1 rounded-md border border-blue-200 bg-white hover:bg-blue-50 focus:bg-blue-100 text-sm font-medium text-blue-700 shadow-sm transition',
    menuClass: 'dropdown-menu absolute left-0 mt-2 min-w-[160px] bg-white border border-blue-200 rounded-md shadow-lg flex flex-col z-10 hidden',
    items: [
      { action: 'toggle-header-row', label: 'Header Row', icon: '🔠', title: 'Toggle header row' },
      { action: 'toggle-header-col', label: 'Header Col', icon: '🔠', title: 'Toggle header column' },
    ]
  }
];

// Utility to create a dropdown
function createTableActionDropdown({ key, label, icon, btnClass, menuClass, items }) {
  const dropdownDiv = document.createElement('div');
  dropdownDiv.className = 'relative';
  const button = document.createElement('button');
  button.type = 'button';
  button.className = btnClass;
  button.innerHTML = `${icon}<span>${label}</span>`;
  button.setAttribute('data-dropdown', key);
  dropdownDiv.appendChild(button);

  const menu = document.createElement('div');
  menu.className = menuClass;
  menu.style.display = 'none';
  items.forEach(btn => {
    const itemBtn = document.createElement('button');
    itemBtn.type = 'button';
    itemBtn.innerHTML = `<span class="inline-block align-middle mr-2">${btn.icon}</span><span class="align-middle">${btn.label}</span>`;
    itemBtn.title = btn.title;
    itemBtn.className = `dropdown-item px-3 py-2 text-sm text-left rounded transition flex items-center ${btn.danger ? 'text-red-600 hover:bg-red-50' : 'hover:bg-gray-100'}`;
    itemBtn.setAttribute('data-action', btn.action);
    menu.appendChild(itemBtn);
  });
  dropdownDiv.appendChild(menu);
  return { dropdownDiv, button, menu };
}

// Create the menu container
const tableMenuDiv = document.createElement('div');
tableMenuDiv.id = 'table-menu';
tableMenuDiv.className = 'table-menu absolute bg-white/90 border border-gray-300 rounded-md shadow-xs flex flex-row gap-2 p-2 z-[2100]';
tableMenuDiv.style.display = 'none';
tableMenuDiv.style.position = 'absolute';
document.body.appendChild(tableMenuDiv);

// Store references for dropdown toggling
const dropdownRefs = {};
tableDropdowns.forEach(cfg => {
  const { dropdownDiv, button, menu } = createTableActionDropdown(cfg);
  tableMenuDiv.appendChild(dropdownDiv);
  dropdownRefs[cfg.key] = { button, menu, dropdownDiv };
});

// Dropdown toggle
Object.entries(dropdownRefs).forEach(([key, ref]) => {
  ref.button.addEventListener('click', (e) => {
    e.stopPropagation();
    Object.entries(dropdownRefs).forEach(([k, r]) => {
      r.menu.style.display = (k === key && r.menu.style.display === 'none') ? 'flex' : 'none';
    });
  });
});
document.addEventListener('click', (e) => {
  Object.values(dropdownRefs).forEach(ref => {
    if (!ref.dropdownDiv.contains(e.target)) {
      ref.menu.style.display = 'none';
    }
  });
});

// Table menu actions
function handleTableMenuClick(e) {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const action = btn.getAttribute('data-action');
  const closeMenu = () => { tableMenuDiv.style.display = 'none'; };
  switch (action) {
    case 'add-row-before':
      editor.chain().focus().addRowBefore().run();
      closeMenu();
      break;
    case 'add-row-after':
      editor.chain().focus().addRowAfter().run();
      closeMenu();
      break;
    case 'delete-row':
      editor.chain().focus().deleteRow().run();
      closeMenu();
      break;
    case 'add-col-before':
      editor.chain().focus().addColumnBefore().run();
      closeMenu();
      break;
    case 'add-col-after':
      editor.chain().focus().addColumnAfter().run();
      closeMenu();
      break;
    case 'delete-col':
      editor.chain().focus().deleteColumn().run();
      closeMenu();
      break;
    case 'toggle-header-row':
      editor.chain().focus().toggleHeaderRow().run();
      closeMenu();
      break;
    case 'toggle-header-col':
      editor.chain().focus().toggleHeaderColumn().run();
      closeMenu();
      break;
    case 'delete-table':
      editor.chain().focus().deleteTable().run();
      closeMenu();
      break;
  }
}
tableMenuDiv.addEventListener('click', handleTableMenuClick);

// Show/hide and position the table menu
function updateTableMenu(editor) {
  if (!editor.options.editable) {
    tableMenuDiv.style.display = 'none';
    return;
  }

  if (editor.isActive('table')) {
    // Find the DOM node for the current table
    const view = editor.view;
    let dom = null;
    // Find the table node that contains the selection
    const selection = view.state.selection;
    const anchor = selection.$anchor ? selection.$anchor : selection.$from;
    let node = anchor.node();
    while (node && node.type && node.type.name !== 'table') {
      node = node.parent;
    }
    if (node && node.type && node.type.name === 'table') {
      // Find the corresponding DOM node
      view.dom.querySelectorAll('table').forEach(table => {
        if (!dom && table.offsetParent !== null) {
          dom = table;
        }
      });
    } else {
      // fallback: pick first visible table
      view.dom.querySelectorAll('table').forEach(table => {
        if (!dom && table.offsetParent !== null) {
          dom = table;
        }
      });
    }
    if (dom) {
      const rect = dom.getBoundingClientRect();
      // Position menu above the table, centered horizontally
      const menuRect = tableMenuDiv.getBoundingClientRect();
      const left = rect.left + window.scrollX + (rect.width - menuRect.width) / 2;
      const top = rect.top + window.scrollY - menuRect.height - 8;
      tableMenuDiv.style.left = `${Math.max(left, 8)}px`;
      tableMenuDiv.style.top = `${Math.max(top, 8)}px`;
      tableMenuDiv.style.display = 'flex';
    } else {
      tableMenuDiv.style.display = 'none';
    }
  } else {
    tableMenuDiv.style.display = 'none';
  }
}


// --- Show menu on cell hover/focus ---
editorDiv.addEventListener('mouseover', e => {
  const cell = e.target.closest('td,th');
  if (cell && editor.isActive('table')) {
    updateTableMenu(editor);
  }
});
editorDiv.addEventListener('mouseleave', e => {
  if (!e.relatedTarget || !e.relatedTarget.closest('#table-menu')) {
    tableMenuDiv.style.display = 'none';
  }
});


// Update menu on selection and content changes
editor.on('selectionUpdate', ({ editor }) => {
  updateTableMenu(editor);
});
editor.on('update', ({ editor }) => {
  updateTableMenu(editor);
});
