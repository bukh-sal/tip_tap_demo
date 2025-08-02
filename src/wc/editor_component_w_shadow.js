import { get_editor } from "./editor.js";

class TiptapEditor extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.editor = null;
        this.autoSaveTimeGap = 1000;
        this.autoSaveDebounce = null;
    }

    connectedCallback() {
        this.init();
    }

    async init() {
        this.injectStyles();
        this.renderShell();
        await this.loadContent();
        this.setupEditor();
    }

    _getTiptapStyles() {
        return `
            <style>
                :host {
                    overflow-wrap: break-word;
                    text-size-adjust: none;
                    text-rendering: optimizeLegibility;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                    --tt-gray-light-a-50: rgba(56,56,56,0.04);
                    --tt-gray-light-a-100: rgba(15,22,36,0.05);
                    --tt-gray-light-a-200: rgba(37,39,45,0.1);
                    --tt-gray-light-a-300: rgba(47,50,55,0.2);
                    --tt-gray-light-a-400: rgba(40,44,51,0.42);
                    --tt-gray-light-a-500: rgba(52,55,60,0.64);
                    --tt-gray-light-a-600: rgba(36,39,46,0.78);
                    --tt-gray-light-a-700: rgba(35,37,42,0.87);
                    --tt-gray-light-a-800: rgba(30,32,36,0.95);
                    --tt-gray-light-a-900: rgba(29,30,32,0.98);
                    --tt-gray-light-50: rgba(250,250,250,1);
                    --tt-gray-light-100: rgba(244,244,245,1);
                    --tt-gray-light-200: rgba(234,234,235,1);
                    --tt-gray-light-300: rgba(213,214,215,1);
                    --tt-gray-light-400: rgba(166,167,171,1);
                    --tt-gray-light-500: rgba(125,127,130,1);
                    --tt-gray-light-600: rgba(83,86,90,1);
                    --tt-gray-light-700: rgba(64,65,69,1);
                    --tt-gray-light-800: rgba(44,45,48,1);
                    --tt-gray-light-900: rgba(34,35,37,1);
                    --tt-brand-color-50: rgba(239,238,255,1);
                    --tt-brand-color-100: rgba(222,219,255,1);
                    --tt-brand-color-200: rgba(195,189,255,1);
                    --tt-brand-color-300: rgba(157,138,255,1);
                    --tt-brand-color-400: rgba(122,82,255,1);
                    --tt-brand-color-500: rgba(98,41,255,1);
                    --tt-brand-color-600: rgba(84,0,229,1);
                    --tt-brand-color-700: rgba(75,0,204,1);
                    --tt-brand-color-800: rgba(56,0,153,1);
                    --tt-brand-color-900: rgba(43,25,102,1);
                    --tt-brand-color-950: hsla(257,100%,9%,1);
                    --white: rgba(255,255,255,1);
                    --black: rgba(14,14,17,1);
                    --transparent: rgba(255,255,255,0);
                    --tt-radius-xxs: 0.125rem;
                    --tt-radius-xs: 0.25rem;
                    --tt-radius-sm: 0.375rem;
                    --tt-radius-md: 0.5rem;
                    --tt-radius-lg: 0.75rem;
                    --tt-radius-xl: 1rem;
                    --tt-transition-duration-default: 0.2s;
                    --tt-transition-easing-default: cubic-bezier(0.46,0.03,0.52,0.96);
                    --tt-cursor-color: var(--tt-brand-color-500);
                    --tt-selection-color: rgba(157,138,255,0.2);
                    
                    /* Resets previously on :host,html */
                    line-height: 1.5;
                    -webkit-text-size-adjust: 100%;
                    -moz-tab-size: 4;
                    tab-size: 4;
                    font-family: GeistSans,ui-sans-serif,system-ui,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;
                    font-feature-settings: normal;
                    font-variation-settings: normal;
                    -webkit-tap-highlight-color: rgba(0,0,0,0)
                }

                :host *,:host :after,:host :before {
                    box-sizing: border-box;
                    transition: none var(--tt-transition-duration-default) var(--tt-transition-easing-default)
                }

                /* Base Tiptap and ProseMirror styles - these selectors are fine as is */
                .tiptap.ProseMirror h1,.tiptap.ProseMirror h2,.tiptap.ProseMirror h3,.tiptap.ProseMirror h4 {
                    position: relative;
                    color: inherit;
                    font-style: inherit
                }

                .tiptap.ProseMirror h1:first-child,.tiptap.ProseMirror h2:first-child,.tiptap.ProseMirror h3:first-child,.tiptap.ProseMirror h4:first-child {
                    margin-top: 0
                }

                .tiptap.ProseMirror {
                    --link-text-color: var(--tt-brand-color-500);
                    --placeholder-color: var(--tt-gray-light-a-400);
                }

                .tiptap.ProseMirror>* {
                    position: relative
                }

                .tiptap.ProseMirror {
                    white-space: pre-wrap;
                    outline: none;
                    caret-color: var(--tt-cursor-color)
                }

                .tiptap.ProseMirror p {
                    font-size: 1.2rem;
                    line-height: 1.6;
                    font-weight: 400;
                }

                .tiptap.ProseMirror:not(.readonly):not(.ProseMirror-hideselection) ::selection {
                    background-color: var(--tt-selection-color)
                }

                .tiptap.ProseMirror:not(.readonly):not(.ProseMirror-hideselection) .selection::selection {
                    background: rgba(0,0,0,0)
                }

                .tiptap.ProseMirror .selection {
                    display: inline;
                    background-color: var(--tt-selection-color)
                }

                .tiptap.ProseMirror .ProseMirror-selectednode:not(img):not(pre):not(.react-renderer) {
                    border-radius: var(--tt-radius-md);
                    background-color: var(--tt-selection-color)
                }

                .tiptap.ProseMirror .ProseMirror-hideselection {
                    caret-color: rgba(0,0,0,0)
                }

                .tiptap.ProseMirror.resize-cursor {
                    cursor: ew-resize;
                    cursor: col-resize
                }

                .tiptap.ProseMirror a span {
                    text-decoration: underline
                }

                .tiptap.ProseMirror s span {
                    text-decoration: line-through
                }

                .tiptap.ProseMirror u span {
                    text-decoration: underline
                }

                .tiptap.ProseMirror a {
                    color: var(--link-text-color);
                    text-decoration: underline
                }

                /* Blockquote */
                .tiptap.ProseMirror {
                    --blockquote-bg-color: var(--tt-gray-light-900)
                }

                .tiptap.ProseMirror blockquote {
                    position: relative;
                    padding-left: 1em;
                    padding-top: .375em;
                    padding-bottom: .375em;
                    margin: 1.5rem 0
                }

                .tiptap.ProseMirror blockquote p {
                    margin-top: 0
                }

                .tiptap.ProseMirror blockquote.is-empty:before,.tiptap.ProseMirror blockquote:before {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    top: 0;
                    height: 100%;
                    width: .25em;
                    background-color: var(--blockquote-bg-color);
                    content: "";
                    border-radius: 0
                }

                /* Code and Code Blocks */
                .tiptap.ProseMirror {
                    --tt-inline-code-bg-color: var(--tt-gray-light-a-100);
                    --tt-inline-code-text-color: var(--tt-gray-light-a-700);
                    --tt-inline-code-border-color: var(--tt-gray-light-a-200);
                    --tt-codeblock-bg: #292c34;
                    --tt-codeblock-text: var(--tt-gray-light-a-800);
                    --tt-codeblock-border: var(--tt-gray-light-a-200)
                }

                .tiptap.ProseMirror code {
                    background-color: var(--tt-inline-code-bg-color);
                    color: var(--tt-inline-code-text-color);
                    border: 1px solid var(--tt-inline-code-border-color);
                    font-family: JetBrains Mono NL,monospace;
                    font-size: 1em;
                    line-height: 1.4;
                    border-radius: 6px/.375rem;
                    padding: .1em .2em;
                }

                .tiptap.ProseMirror pre {
                    background-color: var(--tt-codeblock-bg);
                    color: #cfd0db;
                    border: 1px solid var(--tt-codeblock-border);
                    margin-top: 1.5em;
                    margin-bottom: 1.5em;
                    padding: 1em;
                    font-size: 1rem;
                    border-radius: 6px/.375rem
                    max-width: 100%;
                    overflow-x: auto;
                }

                .tiptap.ProseMirror pre code {
                    background-color: rgba(0,0,0,0);
                    border: none;
                    border-radius: 0;
                    -webkit-text-fill-color: inherit;
                    color: inherit
                }

                /* Horizontal Rule */
                .tiptap.ProseMirror {
                    --horizontal-rule-color: var(--tt-gray-light-a-200)
                }

                .tiptap.ProseMirror hr {
                    border: none;
                    height: 1px;
                    background-color: var(--horizontal-rule-color)
                }

                .tiptap.ProseMirror [data-type=horizontalRule] {
                    margin-top: 2.25em;
                    margin-bottom: 2.25em;
                    padding-top: .75rem;
                    padding-bottom: .75rem
                }

                /* Default Font */
                .tiptap.ProseMirror {
                    font-family: GeistSans,DM Sans,sans-serif
                }

                /* Images */
                .tiptap.ProseMirror img {
                    max-width: 100%;
                    height: auto;
                    display: block
                }

                .tiptap.ProseMirror>img:not([data-type=emoji] img) {
                    margin: 2rem 0;
                    outline: .125rem solid rgba(0,0,0,0);
                    border-radius: var(--tt-radius-xs,.25rem)
                }

                .tiptap.ProseMirror img:not([data-type=emoji] img).ProseMirror-selectednode {
                    outline-color: var(--tt-brand-color-500)
                }

                hr {
                    height: 0;
                    color: inherit;
                    border-top-width: 1px
                }

                h1,h2,h3,h4,h5,h6 {
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                }

                h1 { font-size: 3.7em; }
                h2 { font-size: 3.2em; }
                h3 { font-size: 2.9em; }
                h4 { font-size: 2.2em; }
                h5 { font-size: 2em; }
                h6 { font-size: 1.7rem; }

                a { color: inherit; text-decoration: inherit }
                b,strong { font-weight: bolder }
                code,kbd,pre,samp {
                    font-family: GeistSans,ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;
                    font-feature-settings: normal;
                    font-variation-settings: normal;
                    font-size: 1em
                }
                small { font-size: 80% }
                sub,sup { font-size: 75%; line-height: 0; position: relative; vertical-align: baseline }
                sub { bottom: -.25em }
                sup { top: -.5em }
                table { text-indent: 0; border-color: inherit; border-collapse: collapse }
                menu,ol,ul { list-style: none; margin: 0; padding: 0 }
                textarea { resize: vertical }
                input::placeholder,textarea::placeholder { opacity: 1; color: #9ca3af }
                [role=button],button { cursor: pointer }
                :disabled { cursor: default }
                audio,canvas,embed,iframe,img,object,svg,video { display: block }
                img,video { max-width: 100%; height: auto }
                [hidden] { display: none }


                /* Lists (ul, ol) and Task Lists */
                .tiptap.ProseMirror {
                    --tt-checklist-bg-color: var(--tt-gray-light-a-100);
                    --tt-checklist-bg-active-color: var(--tt-gray-light-a-900);
                    --tt-checklist-border-color: var(--tt-gray-light-a-200);
                    --tt-checklist-border-active-color: var(--tt-gray-light-a-900);
                    --tt-checklist-check-icon-color: var(--white);
                    --tt-checklist-text-active: var(--tt-gray-light-a-500)
                }

                .tiptap.ProseMirror ol,.tiptap.ProseMirror ul {
                    margin-top: 1.5em;
                    margin-bottom: 1.5em;
                    padding-left: 1.5em
                }

                .tiptap.ProseMirror ol:first-child,.tiptap.ProseMirror ul:first-child {
                    margin-top: 0
                }

                .tiptap.ProseMirror ol:last-child,.tiptap.ProseMirror ul:last-child {
                    margin-bottom: 0
                }

                .tiptap.ProseMirror ol ol,.tiptap.ProseMirror ol ul,.tiptap.ProseMirror ul ol,.tiptap.ProseMirror ul ul {
                    margin-top: 0;
                    margin-bottom: 0
                }

                .tiptap.ProseMirror li p {
                    margin-top: 0;
                    line-height: 1.6
                }

                .tiptap.ProseMirror ol {
                    list-style: decimal
                }

                .tiptap.ProseMirror ol ol {
                    list-style: lower-alpha
                }

                .tiptap.ProseMirror ol ol ol {
                    list-style: lower-roman
                }

                .tiptap.ProseMirror ul:not([data-type=taskList]) {
                    list-style: disc
                }

                .tiptap.ProseMirror ul:not([data-type=taskList]) ul {
                    list-style: circle
                }

                .tiptap.ProseMirror ul:not([data-type=taskList]) ul ul {
                    list-style: square
                }

                .tiptap.ProseMirror ul[data-type=taskList] {
                    padding-left: .25em
                }

                .tiptap.ProseMirror ul[data-type=taskList] li {
                    display: flex;
                    flex-direction: row;
                    align-items: flex-start
                }

                .tiptap.ProseMirror ul[data-type=taskList] li:not(:has(>p:first-child)) {
                    list-style-type: none
                }

                .tiptap.ProseMirror ul[data-type=taskList] li[data-checked=true]>div>p {
                    opacity: .5;
                    text-decoration: line-through
                }

                .tiptap.ProseMirror ul[data-type=taskList] li[data-checked=true]>div>p span {
                    text-decoration: line-through
                }

                .tiptap.ProseMirror ul[data-type=taskList] li label {
                    position: relative;
                    padding-top: .375rem;
                    padding-right: .5rem
                }

                .tiptap.ProseMirror ul[data-type=taskList] li label input[type=checkbox] {
                    position: absolute;
                    opacity: 0;
                    width: 0;
                    height: 0
                }

                .tiptap.ProseMirror ul[data-type=taskList] li label span {
                    display: block;
                    width: 1em;
                    height: 1em;
                    border: 1px solid var(--tt-checklist-border-color);
                    border-radius: var(--tt-radius-xs,.25rem);
                    position: relative;
                    cursor: pointer;
                    background-color: var(--tt-checklist-bg-color);
                    transition: background-color 80ms ease-out,border-color 80ms ease-out
                }

                .tiptap.ProseMirror ul[data-type=taskList] li label span:before {
                    content: "";
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%,-50%);
                    width: .75em;
                    height: .75em;
                    background-color: var(--tt-checklist-check-icon-color);
                    opacity: 0;
                    -webkit-mask: url("data:image/svg+xml,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22currentColor%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%20d%3D%22M21.4142%204.58579C22.1953%205.36683%2022.1953%206.63317%2021.4142%207.41421L10.4142%2018.4142C9.63317%2019.1953%208.36684%2019.1953%207.58579%2018.4142L2.58579%2013.4142C1.80474%2012.6332%201.80474%2011.3668%202.58579%2010.5858C3.36683%209.80474%204.63317%209.80474%205.41421%2010.5858L9%2014.1716L18.5858%204.58579C19.3668%203.80474%2020.6332%203.80474%2021.4142%204.58579Z%22%20fill%3D%22currentColor%22%2F%3E%3C%2Fsvg%3E") center/contain no-repeat;
                    mask: url("data:image/svg+xml,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22currentColor%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%20d%3D%22M21.4142%204.58579C22.1953%205.36683%2022.1953%206.63317%2021.4142%207.41421L10.4142%2018.4142C9.63317%2019.1953%208.36684%2019.1953%207.58579%2018.4142L2.58579%2013.4142C1.80474%2012.6332%201.80474%2011.3668%202.58579%2010.5858C3.36683%209.80474%204.63317%209.80474%205.41421%2010.5858L9%2014.1716L18.5858%204.58579C19.3668%203.80474%2020.6332%203.80474%2021.4142%204.58579Z%22%20fill%3D%22currentColor%22%2F%3E%3C%2Fsvg%3E") center/contain no-repeat
                }

                .tiptap.ProseMirror ul[data-type=taskList] li label input[type=checkbox]:checked+span {
                    background: var(--tt-checklist-bg-active-color);
                    border-color: var(--tt-checklist-border-active-color)
                }

                .tiptap.ProseMirror ul[data-type=taskList] li label input[type=checkbox]:checked+span:before {
                    opacity: 1
                }

                .tiptap.ProseMirror ul[data-type=taskList] li div {
                    flex: 1 1;
                    min-width: 0
                }

                /* Table and Drag Handle */
                .tiptap > *:first-child {
                    margin-top: 0;
                }

                .tiptap table {
                    border-collapse: collapse;
                    margin: 0;
                    overflow: hidden;
                    table-layout: fixed;
                    width: 100%;
                    border-radius: 0.25rem;
                }

                .tiptap td,
                .tiptap th {
                    border: 1px solid #dddddd;
                    box-sizing: border-box;
                    min-width: 1em;
                    padding: 6px 8px;
                    position: relative;
                    vertical-align: top;
                }

                .tiptap td > *,
                .tiptap th > * {
                    margin-bottom: 0;
                }

                .tiptap th {
                    background-color: var(--tt-gray-light-200);
                    font-weight: bold;
                    text-align: left;
                }

                .tiptap tr {
                    background-color: var(--tt-gray-light-50);
                }

                .tiptap .column-resize-handle {
                    background-color: var(--tt-brand-color-500);
                    bottom: -2px;
                    pointer-events: none;
                    position: absolute;
                    right: -2px;
                    top: 0;
                    width: 4px;
                }

                .tiptap .tableWrapper {
                    margin: 1.5rem 0;
                    overflow-x: auto;
                }

                .tiptap.resize-cursor {
                    cursor: ew-resize;
                    cursor: col-resize;
                }

                .drag-handle {
                    align-items: center;
                    cursor: grab;
                    display: flex;
                    height: 1.5rem;
                    width: 1.5rem;
                }

                .tiptap p.is-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: #adb5bd;
                    pointer-events: none;
                    height: 0;
                }
                
                /* lowlight styles */
                .tiptap {
                    pre {
                        .hljs{
                            color:#c9d1d9;background:#0d1117
                        }
                        .hljs-doctag,
                        .hljs-keyword,
                        .hljs-meta .hljs-keyword,
                        .hljs-template-tag,
                        .hljs-template-variable,
                        .hljs-type,
                        .hljs-variable.language_{
                            color:#ff7b72
                        }
                        .hljs-title,
                        .hljs-title.class_,
                        .hljs-title.class_.inherited__,
                        .hljs-title.function_{
                            color:#d2a8ff
                        }
                        .hljs-attr,
                        .hljs-attribute,
                        .hljs-literal,
                        .hljs-meta,
                        .hljs-number,
                        .hljs-operator,
                        .hljs-selector-attr,
                        .hljs-selector-class,
                        .hljs-selector-id,
                        .hljs-variable{
                            color:#79c0ff
                        }
                        .hljs-meta .hljs-string,
                        .hljs-regexp,
                        .hljs-string{
                            color:#a5d6ff
                        }
                        .hljs-built_in,
                        .hljs-symbol{
                            color:#ffa657
                        }
                        .hljs-code,
                        .hljs-comment,
                        .hljs-formula{
                            color:#8b949e
                        }
                        .hljs-name,
                        .hljs-quote,
                        .hljs-selector-pseudo,
                        .hljs-selector-tag{
                            color:#7ee787
                        }
                        .hljs-subst{
                            color:#c9d1d9
                        }
                        .hljs-section{
                            color:#1f6feb;font-weight:700
                        }
                        .hljs-bullet{
                            color:#f2cc60
                        }
                        .hljs-emphasis{
                            color:#c9d1d9;font-style:italic
                        }
                        .hljs-strong{
                            color:#c9d1d9;font-weight:700
                        }
                        .hljs-addition{
                            color:#aff5b4;background-color:#033a16
                        }
                        .hljs-deletion{
                            color:#ffdcd7;background-color:#67060c
                        }
                    }
                }
            </style>
        `;
    }

    _getFontStyles() {
        return `
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Cascadia+Code:ital,wght@0,200..700;1,200..700&family=IBM+Plex+Sans+Arabic:wght@100;200;300;400;500;600;700&family=Intel+One+Mono:ital,wght@0,300..700;1,300..700&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Noto+Kufi+Arabic:wght@100..900&family=Noto+Sans+Arabic:wght@100..900&family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Roboto:ital,wght@0,100..900;1,100..900&family=Rubik:ital,wght@0,300..900;1,300..900&family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap" rel="stylesheet">
            <style>
                @font-face {
                    font-family: 'GeistSans';
                    src: url('/src/fonts/Geist-v1.4.01/Geist-v1.4.01/webfonts/Geist-Regular.woff2') format('woff2'),
                    url('/src/fonts/Geist-v1.4.01/Geist-v1.4.01/webfonts/Geist-Regular.woff') format('woff');
                    font-weight: normal;
                    font-style: normal;
                }
                
                @font-face {
                    font-family: 'GeistSans';
                    src: url('/src/fonts/Geist-v1.4.01/Geist-v1.4.01/webfonts/Geist-Bold.woff2') format('woff2'),
                    url('/src/fonts/Geist-v1.4.01/Geist-v1.4.01/webfonts/Geist-Bold.woff') format('woff');
                    font-weight: bold;
                    font-style: normal;
                }
                
                @font-face {
                    font-family: 'GeistSans';
                    src: url('/src/fonts/Geist-v1.4.01/Geist-v1.4.01/webfonts/Geist-Light.woff2') format('woff2'),
                    url('/src/fonts/Geist-v1.4.01/Geist-v1.4.01/webfonts/Geist-Light.woff') format('woff');
                    font-weight: 300;
                    font-style: normal;
                }
                
                /* semibold */
                @font-face {
                    font-family: 'GeistSans';
                    src: url('/src/fonts/Geist-v1.4.01/Geist-v1.4.01/webfonts/Geist-Medium.woff2') format('woff2'),
                    url('/src/fonts/Geist-v1.4.01/Geist-v1.4.01/webfonts/Geist-Medium.woff') format('woff');
                    font-weight: 600;
                    font-style: normal;
                }
                
                body {
                    font-family: 'GeistSans', sans-serif;
                    letter-spacing: 0.01em;
                    -webkit-font-smoothing: antialiased;
                    text-rendering: optimizeLegibility;
                }
            </style>
        `;
    }

    _getEditorStyles() {
        return `
            <style>
                .top-bar-container {
                    position: sticky;
                    top: 3px;
                    z-index: 10;
                    background-color: rgba(255, 255, 255, 0.5);
                    border: 1px solid #d1d5dc;
                    backdrop-filter: blur(2px);
                    border-radius: 0.375rem;
                    padding-inline: 4px;
                    padding-block: 0px;
                    margin-bottom: 20px;
                }
                .top-bar {
                    scale: 1.1;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.1rem;
                    align-items: center;
                    justify-content: center;
                }

                .editor-button {
                    background-color: transparent;
                    color: #000000a6;
                    margin-top: 3px;
                    margin-bottom: 3px;
                    padding-block: 4px;
                    padding-inline: 4px;
                    border: none;
                    cursor: pointer;

                    border-radius: 0.25rem;
                    transition: background-color 0.2s ease-in-out;
                }
                .editor-button:hover {
                    background-color: rgba(0, 0, 0, 0.1);
                }
                .editor-button.active {
                    background-color: rgba(0, 0, 0, 0.1);
                }
                .buttons-separator {
                    margin: 0 2px;
                    height: 20px;
                    border-right: 1.5px solid #dadee3;
                }
                .editor-select {
                    background-color: transparent;
                    color: #000000a6;
                    font-size: 14px;
                    line-height: 1.4;
                    text-align: start;
                    padding-block: 8px;
                    padding-inline: 12px;
                    border-color: transparent;
                    transition: background-color 0.2s ease-in-out;
                }
                .editor-select:hover {
                    background-color: rgba(0, 0, 0, 0.1);
                }
                .editor-select:focus {
                    outline: none;
                    border-color: transparent;
                }
                .color-swatch-grid {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    grid-gap: 0.2rem;
                }
                .color-swatch {
                    width: 25px;
                    height: 25px;
                    border: 1px solid #d1d5dc;
                    border-radius: 1.25rem;
                    cursor: pointer;
                    transition: transform 0.2s ease-in-out;
                }
                .color-swatch:hover {
                    border: 1px solid #a4a4a4;
                    transform: translateY(-1px);
                }
                #top-bar-text-color-picker {
                    anchor-name: --top_bar_color_picker_anchor;
                }
                #text-color-picker {
                    margin: 0;
                    margin-top: 10px;
                    padding: 0.5rem;
                    border-radius: 0.25rem;
                    display: none;
                    position-anchor: --top_bar_color_picker_anchor;
                    top: anchor(--top_bar_color_picker_anchor bottom);
                    left: anchor(--top_bar_color_picker_anchor start);
                    background-color: rgba(255, 255, 255, 0.5);
                    border: 1px solid #d1d5dc;
                    backdrop-filter: blur(2px);
                }
                #text-color-picker:popover-open {
                    display: block;
                }
            </style>
        `;
    }

    injectStyles() {
        // CDNs
        this.shadowRoot.innerHTML = `
            ${this._getFontStyles()}
            ${this._getTiptapStyles()}
            ${this._getEditorStyles()}
        `;
    }

    renderShell() {
        this.shadowRoot.innerHTML += `
            <style>
                .editor-container {
                    position: relative;
                }
                @media (min-width: 768px) {
                    .editor-container {
                        max-height: 80vh;
                        overflow-y: auto;
                        overflow-x: hidden;
                        border-bottom: 1px solid var(--tt-gray-light-a-200);
                    }
                }
                @media (min-width: 768px) {
                    .tiptap-editor {
                        max-width: 80%;
                        margin: 0 auto;
                    }
                }
                </style>
                <div class="editor-container relative">
                    <div class="top-bar-container">
                        <div class="top-bar">
                            <button class="editor-button" title="Bold" editor-action="undo">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-undo2-icon lucide-undo-2"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"/></svg>
                            </button>
                            <button class="editor-button" title="Bold" editor-action="redo">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-redo2-icon lucide-redo-2"><path d="m15 14 5-5-5-5"/><path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5A5.5 5.5 0 0 0 9.5 20H13"/></svg>
                            </button>

                            <span class="buttons-separator"></span>

                            <select editor-action="select-font-family" class="editor-select">
                                <option value="" selected>Default Font</option>
                                <option value="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">System UI</option>
                                <option value="'IBM Plex Sans Arabic', monospace;">IBM Plex Sans</option>
                                <option value="'Noto Kufi Arabic', sans-serif">Noto Kufi</option>
                                <option value="'Noto Sans Arabic', sans-serif">Noto Sans</option>
                                <option value="'Cascadia Code', sans-serif;">Cascadia Code</option>
                                <option value="'Intel One Mono', monospace;">Intel One Mono</option>
                                <option value="Arial, sans-serif">Arial</option>
                                <option value="sans-serif">Sans-serif</option>
                                <option value="serif">Serif</option>
                                <option value="'Inter', sans-serif">Inter</option>
                                <option value="'Rubik', sans-serif;">Rubik</option>
                                <option value="'Montserrat', sans-serif;">Montserrat</option>
                                <option value="'Roboto', sans-serif;">Roboto</option>
                                <option value="'Open Sans', sans-serif;">Open Sans</option>
                                <option value="'Ubuntu', sans-serif;">Ubuntu</option>
                                <option value="'Times New Roman', Times, serif">Times New Roman</option>
                                <option value="monospace">Monospace</option>
                            </select>

                            <select editor-action="select-font-size" class="editor-select">
                                <option editor-action="clear-font-size" value="">Default Size</option>
                                <option editor-action="set-heading" value="1">Heading 1</option>
                                <option editor-action="set-heading" value="2">Heading 2</option>
                                <option editor-action="set-heading" value="3">Heading 3</option>
                                <option editor-action="set-heading" value="4">Heading 4</option>
                                <option editor-action="set-heading" value="5">Heading 5</option>
                                <option editor-action="set-heading" value="6">Heading 6</option>
                                <option editor-action="set-pixel-size" value="12px">12px</option>
                                <option editor-action="set-pixel-size" value="14px">14px</option>
                                <option editor-action="set-pixel-size" value="16px">16px</option>
                                <option editor-action="set-pixel-size" value="18px">18px</option>
                                <option editor-action="set-pixel-size" value="20px">20px</option>
                                <option editor-action="set-pixel-size" value="24px">24px</option>
                                <option editor-action="set-pixel-size" value="32px">32px</option>
                                <option editor-action="set-pixel-size" value="36px">36px</option>
                                <option editor-action="set-pixel-size" value="40px">40px</option>
                                <option editor-action="set-pixel-size" value="48px">48px</option>
                                <option editor-action="set-pixel-size" value="56px">56px</option>
                                <option editor-action="set-pixel-size" value="64px">64px</option>
                                <option editor-action="set-pixel-size" value="72px">72px</option>
                                <option editor-action="set-pixel-size" value="80px">80px</option>
                                <option editor-action="set-pixel-size" value="96px">96px</option>
                                <option editor-action="set-pixel-size" value="128px">128px</option>
                                <option editor-action="set-pixel-size" value="160px">160px</option>
                            </select>

                            <button id="top-bar-text-color-picker" popovertarget="text-color-picker" class="editor-button" title="Text Color">
                                <span style="display: flex; align-items: between;">
                                    <div class="current-color" style="background-color: #000000; width: 18px; height: 18px; border-radius:0.2rem; margin-inline-end:7px;"></div>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down-icon lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>
                                </span>
                            </button>

                            <span class="buttons-separator"></span>

                            <button type="button" editor-action="bold" class="editor-button" title="bold">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bold-icon lucide-bold"><path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"></path></svg>
                            </button>

                            <button type="button" editor-action="italic" class="editor-button" title="bold">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-italic-icon lucide-italic"><line x1="19" x2="10" y1="4" y2="4"/><line x1="14" x2="5" y1="20" y2="20"/><line x1="15" x2="9" y1="4" y2="20"/></svg>
                            </button>

                            <button type="button" editor-action="underline" class="editor-button" title="bold">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-underline-icon lucide-underline"><path d="M6 4v6a6 6 0 0 0 12 0V4"/><line x1="4" x2="20" y1="20" y2="20"/></svg>
                            </button>

                            <button type="button" editor-action="strikethrough" class="editor-button" title="bold">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-strikethrough-icon lucide-strikethrough"><path d="M16 4H9a3 3 0 0 0-2.83 4"/><path d="M14 12a4 4 0 0 1 0 8H6"/><line x1="4" x2="20" y1="12" y2="12"/></svg>
                            </button>

                            <span class="buttons-separator"></span>

                            <button type="button" editor-action="quote" class="editor-button" title="bold">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-quote-icon lucide-quote"><path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/></svg>
                            </button>

                            <button type="button" editor-action="code" class="editor-button" title="bold">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-code-icon lucide-code"><path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/></svg>
                            </button>

                            <button type="button" editor-action="link" class="editor-button" title="bold">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link-icon lucide-link"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                            </button>

                            <span class="buttons-separator"></span>

                            <button type="button" editor-action="align-left" class="editor-button" title="bold">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-align-left-icon lucide-align-left"><path d="M15 12H3"/><path d="M17 18H3"/><path d="M21 6H3"/></svg>
                            </button>

                            <button type="button" editor-action="align-center" class="editor-button" title="bold">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-align-center-icon lucide-align-center"><path d="M17 12H7"/><path d="M19 18H5"/><path d="M21 6H3"/></svg>
                            </button>

                            <button type="button" editor-action="align-right" class="editor-button" title="bold">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-align-right-icon lucide-align-right"><path d="M21 12H9"/><path d="M21 18H7"/><path d="M21 6H3"/></svg>
                            </button>

                            <button type="button" editor-action="align-justify" class="editor-button" title="bold">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-align-justify-icon lucide-align-justify"><path d="M3 12h18"/><path d="M3 18h18"/><path d="M3 6h18"/></svg>
                            </button>

                        </div>

                        <div id="text-color-picker" popover>
                            <div class="color-swatch-grid">
                                <button class="color-swatch" style="background-color: #000000;" data-color="#000000"></button>
                                <button class="color-swatch" style="background-color: #404040;" data-color="#404040"></button>
                                <button class="color-swatch" style="background-color: #808080;" data-color="#808080"></button>
                                <button class="color-swatch" style="background-color: #c0c0c0;" data-color="#c0c0c0"></button>
                                <button class="color-swatch" style="background-color: #e0e0e0;" data-color="#e0e0e0"></button>
                                <button class="color-swatch" style="background-color: #ffffff;" data-color="#ffffff"></button>
                                <button class="color-swatch" style="background-color: #ff0000;" data-color="#ff0000"></button>
                                <button class="color-swatch" style="background-color: #00ff00;" data-color="#00ff00"></button>
                                <button class="color-swatch" style="background-color: #0000ff;" data-color="#0000ff"></button>
                                <button class="color-swatch" style="background-color: #ffff00;" data-color="#ffff00"></button>
                                <button class="color-swatch" style="background-color: #ff00ff;" data-color="#ff00ff"></button>
                                <button class="color-swatch" style="background-color: #00ffff;" data-color="#00ffff"></button>
                                <button class="color-swatch" style="background-color: #0078d4;" data-color="#0078d4"></button>
                                <button class="color-swatch" style="background-color: #107c41;" data-color="#107c41"></button>
                                <button class="color-swatch" style="background-color: #d83b01;" data-color="#d83b01"></button>
                                <button class="color-swatch" style="background-color: #f2c811;" data-color="#f2c811"></button>
                                <button class="color-swatch" style="background-color: #742774;" data-color="#742774"></button>
                                <button class="color-swatch" style="background-color: #00a99d;" data-color="#00a99d"></button>
                                <button class="color-swatch" style="background-color: #c43e1c;" data-color="#c43e1c"></button>
                                <button class="color-swatch" style="background-color: #077568;" data-color="#077568"></button>
                                <button class="color-swatch" style="background-color: #bc1948;" data-color="#bc1948"></button>
                                <button class="color-swatch" style="background-color: #49aae5;" data-color="#49aae5"></button>
                                <button class="color-swatch" style="background-color: #853d90;" data-color="#853d90"></button>
                                <button class="color-swatch" style="background-color: #527f13;" data-color="#527f13"></button>
                            </div>
                        </div>

                    </div>

                <div class="tiptap-editor"></div>
            </div>
        `;
    }

    async loadContent() {
        const defaultContent = '<p>Welcome to the Tiptap Editor!</p>';
        if (localStorage.getItem('tiptap-editor-content')) {
            try {
                this.content = JSON.parse(localStorage.getItem('tiptap-editor-content'));
            } catch (e) {
                console.error('Failed to parse saved content, using default content.', e);
                this.content = defaultContent;
            }
        }
    }

    autoSave() {
        if (this.autoSaveDebounce) {
            clearTimeout(this.autoSaveDebounce);
        }
        this.autoSaveDebounce = setTimeout(() => {
            if (this.editor) {
                const content = this.editor.getJSON();
                // save to localStorage
                localStorage.setItem('tiptap-editor-content', JSON.stringify(content));
            }
        }, this.autoSaveTimeGap);
    }

    setupEditor() {
        const container = this.shadowRoot.querySelector('.tiptap-editor');
        this.editor = get_editor({
            element: container,
            editable: true,
            content: this.content,
            parentDOM: this.shadowRoot,
            onUpdate: ({ editor }) => {
                this.updateFormattingSelections();
            },
            onSelectionUpdate: ({ editor }) => {
                this.autoSave();
                this.updateFormattingSelections();
            },
        });

        if (!this.editor) {
            console.error('Failed to initialize the editor');
        }
        this.bindControls();
    }

    getTextAlignment() {
        const attributes = this.editor.getAttributes('paragraph') || this.editor.getAttributes('heading');
        return attributes.textAlign || 'left';
    }

    getTextStyleState() {
        const textAlign = this.getTextAlignment();
        return {
            bold: this.editor.isActive('bold') || null,
            italic: this.editor.isActive('italic') || null,
            underline: this.editor.isActive('underline') || null,
            strike: this.editor.isActive('strike') || null,
            code: this.editor.isActive('code') || null,
            fontSize: this.editor.getAttributes('textStyle').fontSize || null,
            color: this.editor.getAttributes('textStyle').color || null,
            backgroundColor: this.editor.getAttributes('textStyle').backgroundColor || null,
            fontFamily: this.editor.getAttributes('textStyle').fontFamily || null,
            quote: this.editor.isActive('quote') || null,
            textAlign: textAlign,
        };
    }

    bindControls() {
        this.bindKeyboardShortcuts();

        const addImageButton = this.shadowRoot.querySelectorAll('[editor-action="add-image"]');
        for (const button of addImageButton) {
          button.addEventListener('click', () => {
            const imageUrl = prompt('Enter image URL:');
            if (imageUrl) {
              this.editor.chain().focus().setImage({ src: imageUrl }).run();
            }
          });
        }

        const addTableButtons = this.shadowRoot.querySelectorAll('[editor-action="add-table"]');
        for (const button of addTableButtons) {
          button.addEventListener('click', () => {
            const rows = parseInt(prompt('Enter number of rows:', '3'));
            const cols = parseInt(prompt('Enter number of columns:', '3'));
            if (!isNaN(rows) && !isNaN(cols) && rows > 0 && cols > 0) {
              this.editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
            }
          });
        }

        const boldButtons = this.shadowRoot.querySelectorAll('[editor-action="bold"]');
        for (const button of boldButtons) {
          button.addEventListener('click', () => {
            this.editor.chain().focus().toggleBold().run();
          });
        }

        const italicButtons = this.shadowRoot.querySelectorAll('[editor-action="italic"]');
        for (const button of italicButtons) {
          button.addEventListener('click', () => {
            this.editor.chain().focus().toggleItalic().run();
          });
        }

        const quoteButtons = this.shadowRoot.querySelectorAll('[editor-action="quote"]');
        for (const button of quoteButtons) {
          button.addEventListener('click', () => {
            this.editor.chain().focus().toggleBlockquote().run();
          });
        }

        const strikethroughButtons = this.shadowRoot.querySelectorAll('[editor-action="strikethrough"]');
        for (const button of strikethroughButtons) {
          button.addEventListener('click', () => {
            this.editor.chain().focus().toggleStrike().run();
          });
        }

        const underlineButtons = this.shadowRoot.querySelectorAll('[editor-action="underline"]');
        for (const button of underlineButtons) {
          button.addEventListener('click', () => {
            this.editor.chain().focus().toggleUnderline().run();
          });
        }

        const codeButtons = this.shadowRoot.querySelectorAll('[editor-action="code"]');
        for (const button of codeButtons) {
          button.addEventListener('click', () => {
            this.editor.chain().focus().toggleCodeBlock().run();
          });
        }

        const linkButtons = this.shadowRoot.querySelectorAll('[editor-action="link"]');
        for (const button of linkButtons) {
          button.addEventListener('click', () => {
            const linkUrl = prompt('Enter link URL:');
            if (linkUrl) {
              this.editor.chain().focus().setLink({ href: linkUrl }).run();
            }
          });
        }

        const fontSizeSelects = this.shadowRoot.querySelectorAll('[editor-action="select-font-size"]');
        for (const select of fontSizeSelects) {
          // we have 3 types of editor actions for the options (clear-font-size, set-heading, set-pixel-size)
          select.addEventListener('change', (event) => {
            const selectedOption = event.target.options[event.target.selectedIndex];
            const actionType = selectedOption.getAttribute('editor-action');
            if (actionType === 'clear-font-size') {
                this.editor.chain().focus().setNode('paragraph').run();
                this.editor.chain().focus().unsetFontSize().run();
            }
            else if (actionType === 'set-pixel-size') {
              this.editor.chain().focus().setNode('paragraph').run();
              this.editor.chain().focus().setFontSize(selectedOption.value).run();
            }
            else if (actionType === 'set-heading') {
              this.editor.chain().focus().unsetFontSize().run();
              this.editor.chain().focus().setHeading({ level: parseInt(selectedOption.value) }).run();
            }
          });
        }

        const alignLeftButtons = this.shadowRoot.querySelectorAll('[editor-action="align-left"]');
        for (const button of alignLeftButtons) {
          button.addEventListener('click', () => {
            this.editor.chain().focus().setTextAlign('left').run();
          });
        }

        const alignCenterButtons = this.shadowRoot.querySelectorAll('[editor-action="align-center"]');
        for (const button of alignCenterButtons) {
          button.addEventListener('click', () => {
            this.editor.chain().focus().setTextAlign('center').run();
          });
        }

        const alignRightButtons = this.shadowRoot.querySelectorAll('[editor-action="align-right"]');
        for (const button of alignRightButtons) {
          button.addEventListener('click', () => {
            this.editor.chain().focus().setTextAlign('right').run();
          });
        }

        const alignJustifyButtons = this.shadowRoot.querySelectorAll('[editor-action="align-justify"]');
        for (const button of alignJustifyButtons) {
          button.addEventListener('click', () => {
            this.editor.chain().focus().setTextAlign('justify').run();
          });
        }

        const undoButtons = this.shadowRoot.querySelectorAll('[editor-action="undo"]');
        for (const button of undoButtons) {
          button.addEventListener('click', () => {
            this.editor.chain().focus().undo().run();
          });
        }

        const redoButtons = this.shadowRoot.querySelectorAll('[editor-action="redo"]');
        for (const button of redoButtons) {
          button.addEventListener('click', () => {
            this.editor.chain().focus().redo().run();
          });
        }

        const colorChoices = this.shadowRoot.querySelectorAll('.color-swatch');
        for (const colorChoice of colorChoices) {
          colorChoice.addEventListener('click', () => {
            // data-color
            const color = colorChoice.dataset.color;
            this.editor.chain().focus().setColor(color).run();
          });
        }

        const customColorPickers = this.shadowRoot.querySelectorAll('.custom-color-picker');
        for (const picker of customColorPickers) {
          picker.addEventListener('input', (event) => {
            const color = event.target.value;
            this.editor.chain().focus().setColor(color).run();
          });
        }

        const fontFamilyPickers = this.shadowRoot.querySelectorAll('[editor-action="select-font-family"]');
        for (const picker of fontFamilyPickers) {
          picker.addEventListener('change', (event) => {
            const fontFamily = event.target.value;
            if (fontFamily) {
              this.editor.chain().focus().setFontFamily(fontFamily).run();
            } else {
              this.editor.chain().focus().unsetFontFamily().run();
            }
          });
        }

        const bulletListButtons = this.shadowRoot.querySelectorAll('[editor-action="bullet-list"]');
        for (const button of bulletListButtons) {
          button.addEventListener('click', () => {
            this.editor.chain().focus().toggleBulletList().run();
          });
        }

        const orderedListButtons = this.shadowRoot.querySelectorAll('[editor-action="ordered-list"]');
        for (const button of orderedListButtons) {
          button.addEventListener('click', () => {
            this.editor.chain().focus().toggleOrderedList().run();
          });
        }

        const tasksListButtons = this.shadowRoot.querySelectorAll('[editor-action="tasks-list"]');
        for (const button of tasksListButtons) {
          button.addEventListener('click', () => {
            this.editor.chain().focus().toggleTaskList().run();
          });
        }
        
    }

    bindKeyboardShortcuts() {

    }

    updateFormattingSelections() {
        const textStyleState = this.getTextStyleState();
        const activeButtonClass = 'active';

        const togglableActions = [
            'bold',
            'italic',
            'underline',
            'strikethrough',
            'align-left',
            'align-center',
            'align-right',
            'align-justify',
        ];

        for (const action of togglableActions) {
            const buttons = this.shadowRoot.querySelectorAll(`button[editor-action="${action}"]`);
            for (const btn of buttons) {
                btn.classList.remove(activeButtonClass);
                if (textStyleState[action]) {
                    btn.classList.add(activeButtonClass);
                }
            }
        }


        const fontSizeDropdowns = this.shadowRoot.querySelectorAll('[editor-action="select-font-size"]');
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

        const fontFamilyDropdowns = this.shadowRoot.querySelectorAll('[editor-action="select-font-family"]');
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

        const fontColorPreviews = this.shadowRoot.querySelectorAll('.current-color');
        for (const preview of fontColorPreviews) {
            if (textStyleState.color) {
                preview.style.backgroundColor = textStyleState.color;
            } else {
                preview.style.backgroundColor = '#000000';
            }
        }

    }

}


customElements.define('tiptap-editor', TiptapEditor);