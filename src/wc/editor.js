// The goal is to build this so it contains the extensions as a bundle
// then the web component can be done anywhere 
// (doesn't need to be built so it can be easily modified in the project that uses the editor)

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


export function get_editor({ element, editable=true, content='', parentDOM=document, onUpdate=()=>{}, onSelectionUpdate=()=>{}, bubbleMenuConfig = {}} = {}) {
    if (!element) {
        throw new Error('Element is required to initialize the editor');
    }

    const editor = new Editor({
    element: element,
    editable: editable,
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
        BubbleMenu.configure(bubbleMenuConfig),
        Italic,
        DragHandle.configure({
        render: () => {
            const element = document.createElement('div')
            // Use as a hook for CSS to insert an icon
            element.classList.add('drag-handle')
            element.innerHTML = `
            <svg class="text-gray-300 me-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-grip-vertical-icon lucide-grip-vertical"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
            `;
            return element;
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
    content: content || '',
    onUpdate: ({ editor }) => onUpdate({ editor }),
    onSelectionUpdate: ({ editor }) => onSelectionUpdate({ editor }),
    })

    if (!editor) {
        console.error('Failed to initialize the editor');
        return null;
    }

    return editor;
}