import { get_editor } from "./editor.js";
import { defaultContent } from "../default_content.js";

class TableMenu {
    constructor(editor, container) {
        this.editor = editor;
        this.container = container;
        this._injectStyles();
        this.menuDiv = this._createMenuDiv();
        this.dropdownRefs = {};
        this._setupDropdowns();
        this.menuDiv.addEventListener('click', this._handleMenuClick.bind(this));
        this.hide();
    }

    static getDropdowns() {
        return [
            {
                key: 'add',
                label: 'Add',
                icon: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>`,
                btnClass: 'editor-table-toolbar-btn',
                menuClass: 'editor-toolbar-dropdown-menu',
                items: [
                    { action: 'add-row-before', label: 'Row Above', icon: '⬆️' },
                    { action: 'add-row-after', label: 'Row Below', icon: '⬇️' },
                    { action: 'add-col-before', label: 'Col Left', icon: '⬅️' },
                    { action: 'add-col-after', label: 'Col Right', icon: '➡️' },
                ]
            },
            {
                key: 'delete',
                label: 'Delete',
                icon: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z"/></svg>`,
                btnClass: 'editor-table-toolbar-btn danger',
                menuClass: 'editor-toolbar-dropdown-menu',
                items: [
                    { action: 'delete-row', label: 'Delete Row', icon: '🗑️' },
                    { action: 'delete-col', label: 'Delete Col', icon: '🗑️' },
                    { action: 'delete-table', label: 'Delete Table', icon: '🗑️', danger: true },
                ]
            },
            {
                key: 'headers',
                label: 'Headers',
                icon: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="6" rx="1"/><rect x="3" y="9" width="18" height="12" rx="1"/></svg>`,
                btnClass: 'editor-table-toolbar-btn',
                menuClass: 'editor-toolbar-dropdown-menu',
                items: [
                    { action: 'toggle-header-row', label: 'Header Row', icon: '🔠' },
                    { action: 'toggle-header-col', label: 'Header Col', icon: '🔠' },
                ]
            }
        ];
    }

    static getStyles() {
        return `
        <style>
            .editor-table-menu {
                position: absolute;
                z-index: 2100;
                background: #fff;
                border: 1px solid #d1d5dc;
                border-radius: 6px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                display: flex;
                flex-direction: row;
                gap: 0.5rem;
                padding: 0.5rem;
            }
            .editor-table-toolbar-btn {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.25rem 0.75rem;
                border-radius: 4px;
                border: 1px solid #e5e7eb;
                background: #fff;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: background 0.2s;
            }
            .editor-table-toolbar-btn:hover {
                background: #f3f4f6;
            }
            .editor-table-toolbar-btn.danger {
                color: #dc2626;
                border-color: #fecaca;
                background: #fff;
            }
            .editor-table-toolbar-btn.danger:hover {
                background: #fee2e2;
            }
            .editor-toolbar-dropdown-menu {
                position: absolute;
                left: 0;
                top: 100%;
                min-width: 160px;
                background: #fff;
                border: 1px solid #e5e7eb;
                border-radius: 4px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                display: none;
                flex-direction: column;
                z-index: 10;
            }
            .editor-toolbar-dropdown-menu.flex {
                display: flex;
            }
            .editor-toolbar-dropdown-item {
                padding: 0.5rem 1rem;
                font-size: 14px;
                text-align: left;
                border-radius: 4px;
                cursor: pointer;
                transition: background 0.2s;
                background: none;
                border: none;
                color: #222;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            .editor-toolbar-dropdown-item:hover {
                background: #f3f4f6;
            }
            .editor-toolbar-dropdown-item.text-red-600 {
                color: #dc2626;
            }
        </style>
        `;
    }

    _injectStyles() {
        // Only inject once per container
        if (!this.container.querySelector('style[data-editor-table-menu]')) {
            const style = document.createElement('style');
            style.setAttribute('data-editor-table-menu', 'true');
            style.innerHTML = TableMenu.getStyles().replace(/<style>|<\/style>/g, '');
            this.container.appendChild(style);
        }
    }

    _createMenuDiv() {
        const div = document.createElement('div');
        div.className = 'editor-table-menu';
        div.style.display = 'none';
        this.container.appendChild(div);
        return div;
    }

    _setupDropdowns() {
        TableMenu.getDropdowns().forEach(cfg => {
            const { dropdownDiv, button, menu } = this._createDropdown(cfg);
            this.menuDiv.appendChild(dropdownDiv);
            this.dropdownRefs[cfg.key] = { button, menu, dropdownDiv };
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                Object.entries(this.dropdownRefs).forEach(([k, r]) => {
                    r.menu.classList.toggle('flex', k === cfg.key && r.menu.style.display === 'none');
                    r.menu.style.display = (k === cfg.key && r.menu.style.display === 'none') ? 'flex' : 'none';
                });
            });
        });
        document.addEventListener('click', (e) => {
            Object.values(this.dropdownRefs).forEach(ref => {
                if (!ref.dropdownDiv.contains(e.target)) {
                    ref.menu.style.display = 'none';
                    ref.menu.classList.remove('flex');
                }
            });
        });
    }

    _createDropdown({ key, label, icon, btnClass, menuClass, items }) {
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
            itemBtn.innerHTML = `<span>${btn.icon}</span><span>${btn.label}</span>`;
            itemBtn.className = `editor-toolbar-dropdown-item${btn.danger ? ' text-red-600' : ''}`;
            itemBtn.setAttribute('data-action', btn.action);
            menu.appendChild(itemBtn);
        });
        dropdownDiv.appendChild(menu);
        return { dropdownDiv, button, menu };
    }

    _handleMenuClick(e) {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        const action = btn.getAttribute('data-action');
        this._runAction(action);
        this.hide();
    }

    _runAction(action) {
        const chain = this.editor.chain().focus();
        switch (action) {
            case 'add-row-before': chain.addRowBefore().run(); break;
            case 'add-row-after': chain.addRowAfter().run(); break;
            case 'delete-row': chain.deleteRow().run(); break;
            case 'add-col-before': chain.addColumnBefore().run(); break;
            case 'add-col-after': chain.addColumnAfter().run(); break;
            case 'delete-col': chain.deleteColumn().run(); break;
            case 'toggle-header-row': chain.toggleHeaderRow().run(); break;
            case 'toggle-header-col': chain.toggleHeaderColumn().run(); break;
            case 'delete-table': chain.deleteTable().run(); break;
        }
    }

    showAboveTable(tableDom) {
        if (!tableDom) return this.hide();
        const tableRect = tableDom.getBoundingClientRect();
        const menuRect = this.menuDiv.getBoundingClientRect();
        const containerRect = this.container.getBoundingClientRect();

        // Account for container scroll
        const scrollTop = this.container.scrollTop;
        const scrollLeft = this.container.scrollLeft;

        // Position relative to container, including scroll
        const left = tableRect.left - containerRect.left + scrollLeft + (tableRect.width - menuRect.width) / 2;
        const top = tableRect.top - containerRect.top + scrollTop - menuRect.height - 8;

        this.menuDiv.style.left = `${Math.max(left, 8)}px`;
        this.menuDiv.style.top = `${Math.max(top, 8)}px`;
        this.menuDiv.style.display = 'flex';
    }

    hide() {
        this.menuDiv.style.display = 'none';
        Object.values(this.dropdownRefs).forEach(ref => {
            ref.menu.style.display = 'none';
            ref.menu.classList.remove('flex');
        });
    }

    update() {
        if (!this.editor.options.editable || !this.editor.isActive('table')) {
            this.hide();
            return;
        }
        // Find the DOM node for the current table
        const view = this.editor.view;
        let dom = null;
        view.dom.querySelectorAll('table').forEach(table => {
            if (!dom && table.offsetParent !== null) dom = table;
        });
        if (dom) {
            this.showAboveTable(dom);
        } else {
            this.hide();
        }
    }
}

class TiptapEditor extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.editor = null;
        this.autoSaveTimeGap = 1000;
        this.autoSaveDebounce = null;
        this.tableMenu = null;
        this.bubbleMenuContainer = null;
        this.fontOptions = {
            "Default Font"    : "",
            "System UI"       : "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            "IBM Plex Sans"   : "'IBM Plex Sans Arabic', monospace",
            "Noto Kufi"       : "'Noto Kufi Arabic', sans-serif",
            "Noto Sans"       : "'Noto Sans Arabic', sans-serif",
            "Cascadia Code"   : "'Cascadia Code', sans-serif",
            "Intel One Mono"  : "'Intel One Mono', monospace",
            "Arial"           : "Arial, sans-serif",
            "Sans-serif"      : "sans-serif",
            "Serif"           : "serif",
            "Inter"           : "'Inter', sans-serif",
            "Rubik"           : "'Rubik', sans-serif",
            "Montserrat"      : "'Montserrat', sans-serif",
            "Roboto"          : "'Roboto', sans-serif",
            "Open Sans"       : "'Open Sans', sans-serif",
            "Ubuntu"          : "'Ubuntu', sans-serif",
            "Times New Roman" : "'Times New Roman', Times, serif",
            "Monospace"       : "monospace",
        };
        this.headingOptions = {
            "Heading 1": "1",
            "Heading 2": "2",
            "Heading 3": "3",
            "Heading 4": "4",
            "Heading 5": "5",
            "Heading 6": "6",
        }
        // font sizes
        const fontSizeOptions = Array.from({ length: 30 }, (_, i) => `${12 + i * 4}px`);
        this.fontSizeOptions = {
            "Default Size": "",
        }
        fontSizeOptions.forEach(size => {
            this.fontSizeOptions[size] = size;
        });
        
        this.textColorOptions = [
            '#000000', '#404040', '#808080', '#c0c0c0', '#e0e0e0',
            '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00',
            '#ff00ff', '#00ffff', '#0078d4', '#107c41', '#d83b01',
            '#f2c811', '#742774', '#00a99d', '#c43e1c', '#077568',
            '#bc1948', '#49aae5', '#853d90', '#527f13', 
        ]
        this.textHighlightOptions = [
            '#F8FF00', '#A41A1A', '#10FF00', '#00FFD9', '#49aae5',
            '#ff0000',
        ]
    }

    connectedCallback() {
        this.init();
    }

    async init() {
        this.injectStyles();
        this.renderShell();
        await this.loadContent();
        this.setupEditor();
        this.tableMenu = new TableMenu(this.editor, this.shadowRoot.querySelector('.editor-container'));
    }

    _getTiptapStyles() {
        return `
            <style>
                :host {
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
                }

                :host *,:host :after,:host :before {
                    box-sizing: border-box;
                    transition: none var(--tt-transition-duration-default) var(--tt-transition-easing-default)
                }

                .tiptap {
                    overflow-wrap: break-word;
                    text-size-adjust: none;
                    text-rendering: optimizeLegibility;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                    line-height: 1.2;
                    -webkit-text-size-adjust: 100%;
                    -moz-tab-size: 4;
                    tab-size: 4;
                    font-family: GeistSans,ui-sans-serif,system-ui,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;
                    font-feature-settings: normal;
                    font-variation-settings: normal;
                    -webkit-tap-highlight-color: rgba(0,0,0,0);
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
                    margin: 0;
                    font-size: 1.2rem;
                    line-height: 1;
                    font-weight: 400;
                }

                .tiptap.ProseMirror p span {
                    font-size: 1.2rem;
                    line-height: 2;
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
                    line-height: 1;
                    border-radius: var(--tt-radius-md);
                    padding: .1em .2em;
                }

                .tiptap.ProseMirror pre {
                    background-color: var(--tt-codeblock-bg);
                    color: #cfd0db;
                    border: 1px solid var(--tt-codeblock-border);
                    margin-top: 1.5em;
                    margin-bottom: 0.5em;
                    padding: 1em;
                    font-size: 1rem;
                    border-radius: var(--tt-radius-md);
                    max-width: 100%;
                    overflow-x: auto;
                    line-height: 1.4;
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
                    font-weight: 500;
                    margin-top: 1.5rem;
                    margin-bottom: 0.5rem;
                    line-height: 1.2;
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
                    margin-top: 0em;
                    margin-bottom: 0em;
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
                    line-height: 1.2;
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

                .tiptap {
                    table {
                        border-collapse: collapse;
                        margin: 0;
                        overflow: hidden;
                        table-layout: fixed;
                        width: 100%;
                        border-radius: 0.25rem;

                        td,
                        th {
                            border: 1px solid var(--tt-gray-light-300);
                            box-sizing: border-box;
                            min-width: 1em;
                            padding: 6px 8px;
                            position: relative;
                            vertical-align: top;
                            > * {
                                margin: 0;
                            }
                        }

                        th {
                            background-color: var(--tt-gray-light-100);
                            font-weight: bold;
                            text-align: left;
                        }

                        .selectedCell:after {
                            background: var(--tt-gray-light-a-100);
                            content: '';
                            left: 0;
                            right: 0;
                            top: 0;
                            bottom: 0;
                            pointer-events: none;
                            position: absolute;
                            z-index: 2;
                        }

                        .column-resize-handle {
                            background-color: var(--tt-brand-color-400);
                            bottom: -2px;
                            pointer-events: none;
                            position: absolute;
                            right: -2px;
                            top: 0;
                            width: 4px;
                        }
                    }

                    .tableWrapper {
                        margin: 1.5rem 0;
                        overflow-x: auto;
                    }

                    &.resize-cursor {
                        cursor: ew-resize;
                        cursor: col-resize;
                    }
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

                .tiptap p.is-empty::before,
                .tiptap h1.is-empty::before,
                .tiptap h2.is-empty::before,
                .tiptap h3.is-empty::before,
                .tiptap h4.is-empty::before,
                .tiptap h5.is-empty::before,
                .tiptap h6.is-empty::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: #adb5bd;
                    pointer-events: none;
                    height: 0;
                }

                .tiptap mark {
                    background-color: #faf594;
                    border-radius: 0.4rem;
                    box-decoration-break: clone;
                    padding: 0.1rem 0.3rem;
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
                .editor-top-bar-container {
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
                .editor-top-bar {
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
                    grid-template-columns: repeat(8, 1fr);
                    grid-gap: 0.2rem;
                    padding-bottom: 0.7rem;
                }
                .color-swatch {
                    width: 25px;
                    height: 25px;
                    border: 1px solid #d1d5dc;
                    border-radius: 1.25rem;
                    cursor: pointer;
                    transition: transform 0.2s ease-in-out;
                }
                .highlight-swatch {
                    width: 25px;
                    height: 25px;
                    border: 1px solid #d1d5dc;
                    border-radius: 0.25rem;
                    cursor: pointer;
                    transition: transform 0.2s ease-in-out;
                }
                .color-swatch:hover {
                    border: 1px solid #a4a4a4;
                    transform: translateY(-1px);
                }
                .highlight-swatch:hover {
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

                    h6 {
                        font-size: 14px;
                        font-weight: 600;
                        color: #000000a6;
                        margin: 0;
                        padding-bottom: 0.5rem;
                        cursor: default;
                        user-select: none;
                    }
                }
                #text-color-picker:popover-open {
                    display: block;
                }

                #top-bar-insert-list-dropdown {
                    anchor-name: --top_bar_insert_list_dropdown_anchor;
                }

                #insert-list-dropdown {
                    margin: 0;
                    margin-top: 10px;
                    padding: 0.5rem;
                    border-radius: 0.25rem;
                    display: none;
                    position-anchor: --top_bar_insert_list_dropdown_anchor;
                    top: anchor(--top_bar_insert_list_dropdown_anchor bottom);
                    left: anchor(--top_bar_insert_list_dropdown_anchor start);
                    background-color: rgba(255, 255, 255, 0.5);
                    border: 1px solid #d1d5dc;
                    backdrop-filter: blur(2px);

                    h6 {
                        font-size: 14px;
                        font-weight: 600;
                        color: #000000a6;
                        margin: 0;
                        padding-bottom: 0.5rem;
                        cursor: default;
                        user-select: none;
                    }
                }
                #insert-list-dropdown:popover-open {
                    display: block;
                }


                #top-bar-set-line-height-dropdown {
                    anchor-name: --top_bar_set_line_height_dropdown_anchor;
                }

                #set-line-height-dropdown {
                    margin: 0;
                    margin-top: 10px;
                    padding: 0.5rem;
                    border-radius: 0.25rem;
                    display: none;
                    position-anchor: --top_bar_set_line_height_dropdown_anchor;
                    top: anchor(--top_bar_set_line_height_dropdown_anchor bottom);
                    left: anchor(--top_bar_set_line_height_dropdown_anchor center);
                    background-color: rgba(255, 255, 255, 0.5);
                    border: 1px solid #d1d5dc;
                    backdrop-filter: blur(2px);

                    h6 {
                        font-size: 14px;
                        font-weight: 600;
                        color: #000000a6;
                        margin: 0;
                        padding-bottom: 0.5rem;
                        cursor: default;
                        user-select: none;
                    }
                }
                #set-line-height-dropdown:popover-open {
                    display: block;
                }
            </style>
        `;
    }

    _getBubbleMenuStyles() {
        return `
            <style>
                .bubble-menu-container {
                    background-color: rgba(255, 255, 255, 0.5);
                    border: 1px solid #d1d5dc;
                    backdrop-filter: blur(2px);
                    border-radius: 0.375rem;
                    padding-inline: 0px;
                    padding-block: 0px;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.1rem;
                    align-items: center;
                    justify-content: center;
                    position: absolute;
                    z-index: 1000;
                }
            </style>
        `;
    }

    _createBubbleMenu() {
        const bubbleMenuContainer = this.shadowRoot.querySelector('.bubble-menu-container');
        const bubbleMenuButtons = [
            {
                "editor-action": 'select-font-family',
                "title": "Select Font Family",
                "type": "select",
                "options": this.fontOptions,
            },
            {
                "editor-action": 'select-font-size',
                "title": "Select Font Size",
                "type": "select",
                "options": this.fontSizeOptions,
            },
            {
                "editor-action": '',
                "icon": '',
                "title": "",
                "type": "separator",
            },
            {
                "editor-action": 'bold',
                "icon": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bold-icon lucide-bold"><path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"/></svg>',
                "title": "Bold",
                "type": "button",
            },
            {
                "editor-action": 'italic',
                "icon": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-italic-icon lucide-italic"><line x1="19" x2="10" y1="4" y2="4"/><line x1="14" x2="5" y1="20" y2="20"/><line x1="15" x2="9" y1="4" y2="20"/></svg>',
                "title": "Italic",
                "type": "button",
            },
            {
                "editor-action": 'underline',
                "icon": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-underline-icon lucide-underline"><path d="M6 4v6a6 6 0 0 0 12 0V4"/><line x1="4" x2="20" y1="20" y2="20"/></svg>',
                "title": "Underline",
                "type": "button",
            },
            {
                "editor-action": '',
                "icon": '',
                "title": "",
                "type": "separator",
            },
            {
                "editor-action": 'align-left',
                "icon": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-align-left-icon lucide-align-left"><path d="M15 12H3"/><path d="M17 18H3"/><path d="M21 6H3"/></svg>',
                "title": "Align Left",
                "type": "button",
            },
            {
                "editor-action": 'align-center',
                "icon": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-align-center-icon lucide-align-center"><path d="M17 12H7"/><path d="M19 18H5"/><path d="M21 6H3"/></svg>',
                "title": "Align Center",
                "type": "button",
            },
            {
                "editor-action": 'align-right',
                "icon": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-align-right-icon lucide-align-right"><path d="M21 12H9"/><path d="M21 18H7"/><path d="M21 6H3"/></svg>',
                "title": "Align Right",
                "type": "button",
            },
        ];

        bubbleMenuButtons.forEach(item => {
            let newItem = null;

            if (item.type === 'select') {
                newItem = document.createElement('select');
                newItem.className = 'editor-select';
                newItem.setAttribute('editor-action', item['editor-action']);
                Object.entries(item.options).forEach(([key, value]) => {
                    const option = document.createElement('option');
                    option.value = value;
                    option.textContent = key;
                    newItem.appendChild(option);
                });
            } else if (item.type === 'button') {
                newItem = document.createElement('button');
                newItem.className = 'editor-button';
                newItem.setAttribute('editor-action', item['editor-action']);
                newItem.title = item.title;
                newItem.innerHTML = item.icon;
            } else if (item.type === 'separator') {
                newItem = document.createElement('span');
                newItem.className = 'buttons-separator';
            }

            bubbleMenuContainer.appendChild(newItem);
        });
        bubbleMenuContainer.style.visibility = 'hidden';
        this.bubbleMenuContainer = bubbleMenuContainer;
    }

    injectStyles() {
        // CDNs
        this.shadowRoot.innerHTML = `
            ${this._getFontStyles()}
            ${this._getTiptapStyles()}
            ${this._getEditorStyles()}
            ${this._getBubbleMenuStyles()}
            <div class="bubble-menu-container"></div>
        `;
        this._createBubbleMenu();
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
                    <div class="editor-top-bar-container">
                        <div class="editor-top-bar">
                            <button class="editor-button" title="Undo" editor-action="undo">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-undo2-icon lucide-undo-2"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"/></svg>
                            </button>
                            <button class="editor-button" title="Redo" editor-action="redo">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-redo2-icon lucide-redo-2"><path d="m15 14 5-5-5-5"/><path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5A5.5 5.5 0 0 0 9.5 20H13"/></svg>
                            </button>

                            <span class="buttons-separator"></span>

                            <select editor-action="select-font-family" class="editor-select">
                                ${Object.entries(this.fontOptions).map(([key, value]) => `
                                    <option value="${value}" ${key === 'default' ? 'selected' : ''}>${key}</option>
                                `).join('')}
                            </select>

                            <select editor-action="select-font-size" class="editor-select">
                                <option editor-action="clear-font-size" value="">Default Size</option>

                                ${Object.entries(this.headingOptions).map(([key, value]) => `
                                    <option editor-action="set-heading" value="${value}">${key}</option>
                                `).join('')
                                }

                                ${Object.entries(this.fontSizeOptions).map(([size, value]) => `
                                    <option editor-action="set-pixel-size" value="${value}">${size}</option>
                                `).join('')
                                }

                            </select>

                            <button id="top-bar-text-color-picker" popovertarget="text-color-picker" class="editor-button" title="Text Color">
                                <span style="display: flex; align-items: between;">
                                    <div class="current-color" style="background-color: #000000; width: 18px; height: 18px; border-radius:0.2rem; margin-inline-end:7px;"></div>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down-icon lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>
                                </span>
                            </button>

                            <span class="buttons-separator"></span>

                            <button type="button" editor-action="bold" class="editor-button" title="Bold">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bold-icon lucide-bold"><path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"></path></svg>
                            </button>

                            <button type="button" editor-action="italic" class="editor-button" title="Italic">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-italic-icon lucide-italic"><line x1="19" x2="10" y1="4" y2="4"/><line x1="14" x2="5" y1="20" y2="20"/><line x1="15" x2="9" y1="4" y2="20"/></svg>
                            </button>

                            <button type="button" editor-action="underline" class="editor-button" title="Underline">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-underline-icon lucide-underline"><path d="M6 4v6a6 6 0 0 0 12 0V4"/><line x1="4" x2="20" y1="20" y2="20"/></svg>
                            </button>

                            <button type="button" editor-action="strikethrough" class="editor-button" title="Strikethrough">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-strikethrough-icon lucide-strikethrough"><path d="M16 4H9a3 3 0 0 0-2.83 4"/><path d="M14 12a4 4 0 0 1 0 8H6"/><line x1="4" x2="20" y1="12" y2="12"/></svg>
                            </button>

                            <span class="buttons-separator"></span>

                            <button type="button" editor-action="quote" class="editor-button" title="Quote">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-quote-icon lucide-quote"><path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/></svg>
                            </button>

                            <button type="button" editor-action="code" class="editor-button" title="Code">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-code-icon lucide-code"><path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/></svg>
                            </button>

                            <button type="button" editor-action="link" class="editor-button" title="Link">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link-icon lucide-link"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                            </button>

                            <span class="buttons-separator"></span>

                            <button type="button" editor-action="align-left" class="editor-button" title="Left Align">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-align-left-icon lucide-align-left"><path d="M15 12H3"/><path d="M17 18H3"/><path d="M21 6H3"/></svg>
                            </button>

                            <button type="button" editor-action="align-center" class="editor-button" title="Center Align">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-align-center-icon lucide-align-center"><path d="M17 12H7"/><path d="M19 18H5"/><path d="M21 6H3"/></svg>
                            </button>

                            <button type="button" editor-action="align-right" class="editor-button" title="Right Align">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-align-right-icon lucide-align-right"><path d="M21 12H9"/><path d="M21 18H7"/><path d="M21 6H3"/></svg>
                            </button>

                            <button type="button" editor-action="align-justify" class="editor-button" title="Justify Align">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-align-justify-icon lucide-align-justify"><path d="M3 12h18"/><path d="M3 18h18"/><path d="M3 6h18"/></svg>
                            </button>

                            <span class="buttons-separator"></span>

                            <button type="button" editor-action="add-table" class="editor-button" title="Insert Table">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-table2-icon lucide-table-2"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>
                            </button>

                            <button type="button" editor-action="add-image" class="editor-button" title="Insert Image">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image-icon lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                            </button>

                            <button id="top-bar-insert-list-dropdown" popovertarget="insert-list-dropdown" class="editor-button" title="Insert List">
                                <span style="display: flex; align-items: end;">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-list-icon lucide-list"><path d="M3 12h.01"/><path d="M3 18h.01"/><path d="M3 6h.01"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M8 6h13"/></svg>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down-icon lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>
                                </span>
                            </button>

                            <button id="top-bar-set-line-height-dropdown" popovertarget="set-line-height-dropdown" class="editor-button" title="Line Height">
                                <span style="display: flex; align-items: end;">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevrons-up-down-icon lucide-chevrons-up-down"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down-icon lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>
                                </span>
                            </button>

                            <button type="button" editor-action="clear-formatting" class="editor-button" title="Clear Formatting">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rotate-ccw-icon lucide-rotate-ccw"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                            </button>

                        </div>

                        <div id="insert-list-dropdown" popover>
                            <h6>Insert List</h6>
                            <div>
                                <button class="editor-button" editor-action="bullet-list" style="margin-right: 0.5rem; display: flex; align-items: center; width: 100%;">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-list-icon lucide-list"><path d="M3 12h.01"/><path d="M3 18h.01"/><path d="M3 6h.01"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M8 6h13"/></svg>
                                    <span style="margin-inline-start: 0.5rem;">Bullet List</span>
                                </button>
                                <button class="editor-button" editor-action="ordered-list" style="margin-right: 0.5rem; display: flex; align-items: center; width: 100%;">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-list-ordered-icon lucide-list-ordered"><path d="M10 12h11"/><path d="M10 18h11"/><path d="M10 6h11"/><path d="M4 10h2"/><path d="M4 6h1v4"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
                                    <span style="margin-inline-start: 0.5rem;">Ordered List</span>
                                </button>
                                <button class="editor-button" editor-action="tasks-list" style="margin-right: 0.5rem; display: flex; align-items: center; width: 100%;">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-list-checks-icon lucide-list-checks"><path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/></svg>
                                    <span style="margin-inline-start: 0.5rem;">Tasks List</span>
                                </button>
                            </div>
                        </div>

                        <div id="set-line-height-dropdown" popover>
                            <h6>Line Height</h6>
                            <div>
                                <button class="editor-button" editor-action="set-line-height" data-value="" style="color: #000000; display:flex; width: 100%; align-items: center; justify-content: center; border: 1px solid #f1f1f1; padding: 0.1rem; font-size: 15px;">
                                    Default
                                </button>
                                ${[1.0, 1.15, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75].map(value => `
                                    <button class="editor-button" editor-action="set-line-height" data-value="${value}" style="color: #000000; display:flex; width: 100%; align-items: center; justify-content: center; border: 1px solid #f1f1f1; padding: 0.1rem; font-size: 15px;">
                                        ${value}
                                    </button>
                                `).join('')}
                            </div>
                        </div>

                        <div id="text-color-picker" popover>
                            <h6>Colors</h6>
                            <div class="color-swatch-grid">
                                ${this.textColorOptions.map(color => `
                                    <button class="color-swatch" style="background-color: ${color};" editor-action="set-text-color" data-value="${color}"></button>
                                `).join('')
                                }
                            </div>
                            <h6>Highlight</h6>
                            <div class="color-swatch-grid">
                                <button class="highlight-swatch" style="background-color: #ffffff;" editor-action="set-text-highlight" data-value=""></button>
                                ${this.textHighlightOptions.map(color => `
                                    <button class="highlight-swatch" style="background-color: ${color};" editor-action="set-text-highlight" data-value="${color}"></button>
                                `).join('')
                                }
                            </div>
                        </div>

                    </div>

                <div class="tiptap-editor"></div>
            </div>
        `;
    }

    async loadContent() {
        this.content = defaultContent;
        if (localStorage.getItem('tiptap-editor-content')) {
            try {
                this.content = JSON.parse(localStorage.getItem('tiptap-editor-content'));
            } catch (e) {
                console.error('Failed to parse saved content, using default content.', e);
                this.content = content;
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
                this.tableMenu.update();
            },
            onSelectionUpdate: ({ editor }) => {
                this.autoSave();
                this.updateFormattingSelections();
                this.tableMenu.update();
            },
            bubbleMenuConfig: {
                element: this.bubbleMenuContainer,
                shouldShow: ({ editor, view, state, from, to }) => {
                    let r = from !== to && editor.isFocused;
                    if (r) {
                        setTimeout(() => {
                            this.updateFormattingSelections();
                        }, 5);
                        this.bubbleMenuContainer.style.visibility = 'visible';
                    }
                    return r;
                },
            }
        });
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

    bindClickEvents() {
        this.shadowRoot.addEventListener('click', (event) => {
            const path = event.composedPath();
            let realTarget = path.find(node => node !== this.shadowRoot && node.nodeType === 1);
            let action = null;
            if (!realTarget) return;
            if (realTarget) action = realTarget.getAttribute('editor-action');

            if (!action) {
                let atRoot = false;
                while (!action && !atRoot) {
                    if (realTarget === this.shadowRoot) {
                        atRoot = true;
                    } else {
                        action = realTarget.getAttribute('editor-action');
                        if (!action) {
                            realTarget = realTarget.parentElement;
                            if (!realTarget) {
                                atRoot = true;
                            }
                        }
                    }
                }
            }

            if (!action) return;
            if (!realTarget || realTarget.tagName != 'BUTTON') return;

            const value = realTarget.getAttribute('data-value') || null;

            const data = { "type": "button", "action": action, "target": realTarget, "value": value };
            this.runEditorAction(data);
        });
    }

    bindChangeEvents() {
        this.shadowRoot.addEventListener('change', (event) => {
            const path = event.composedPath();
            let realTarget = path.find(node => node !== this.shadowRoot && node.nodeType === 1);
            if (!realTarget) return;

            let action = realTarget.getAttribute('editor-action');
            while (!action && realTarget && realTarget.parentElement && realTarget.parentElement !== this.shadowRoot) {
                realTarget = realTarget.parentElement;
                action = realTarget.getAttribute('editor-action');
            }
            if (!action) return;
            const data = { "type": "select", "action": action, "target": realTarget, "value": realTarget.value };
            this.runEditorAction(data);
        });
    }

    bindControls() {
        this.bindKeyboardShortcuts();
        this.bindClickEvents();
        this.bindChangeEvents();
    }

    bindKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            if (!this.editor || !this.editor.isEditable) return;

            // bind CTRL + ] to increment font size
            if (event.ctrlKey && event.code === 'BracketRight') {
                this.Actions.incrementFontSize();
                return;
            }

            // bind CTRL + [ to decrement font size
            if (event.ctrlKey && event.code === 'BracketLeft') {
                this.Actions.decrementFontSize();
                return;
            }

            // bind CTRL + L to toggle left alignment
            if (event.ctrlKey && event.code === 'KeyL') {
                event.preventDefault();
                this.Actions.setTextAlign('left');
                return;
            }

            // bind CTRL + E to toggle center alignment
            if (event.ctrlKey && event.code === 'KeyE') {
                event.preventDefault();
                this.Actions.setTextAlign('center');
                return;
            }

            // bind CTRL + R to toggle right alignment
            if (event.ctrlKey && event.code === 'KeyR') {
                event.preventDefault();
                this.Actions.setTextAlign('right');
                return;
            }

            // bind CTRL + J to toggle justify alignment
            if (event.ctrlKey && event.code === 'KeyJ') {
                event.preventDefault();
                this.Actions.setTextAlign('justify');
                return;
            }

            // bind CTRL + S to save content
            if (event.ctrlKey && event.code === 'KeyS') {
                event.preventDefault();
                // save logic here
                return;
            }
        });
    }

    runEditorAction({ action, value=null, target=null }) {
        if (!this.editor) {
            return;
        }

        switch (action) {
            case 'bold':
                this.Actions.toggleBold();
                break;
            case 'italic':
                this.Actions.toggleItalic();
                break;
            case 'underline':
                this.Actions.toggleUnderline();
                break;
            case 'strikethrough':
                this.Actions.toggleStrike();
                break;
            case 'code':
                this.Actions.toggleCode();
                break;
            case 'link':
                this.Actions.addLink();
                break;
            case 'add-image':
                this.Actions.addImage();
                break;
            case 'add-table':
                this.Actions.addTable();
                break;
            case 'bullet-list':
                this.Actions.toggleBulletList();
                break;
            case 'ordered-list':
                this.Actions.toggleOrderedList();
                break;
            case 'tasks-list':
                this.Actions.toggleTaskList();
                break;
            case 'align-left':
                this.Actions.setTextAlign('left');
                break;
            case 'align-center':
                this.Actions.setTextAlign('center');
                break;
            case 'align-right':
                this.Actions.setTextAlign('right');
                break;
            case 'align-justify':
                this.Actions.setTextAlign('justify');
                break;
            case 'undo':
                this.Actions.undo();
                break;
            case 'redo':
                this.Actions.redo();
                break;
            case 'set-line-height':
                this.Actions.setLineHeight(value);
                break;
            case 'select-font-size':
                // if the value is a number, set heading level
                if (!isNaN(value) && value >= 1 && value <= 6) {
                    this.Actions.setHeading(value);
                    break;
                }
                this.Actions.setFontSize(value);
                break;
            case 'select-font-family':
                this.Actions.setFontFamily(value);
                break;
            case 'set-text-color':
                this.Actions.setTextColor(value);
                break;
            case 'set-text-highlight':
                this.Actions.setTextHighlight(value);
                break;
            case 'clear-formatting':
                this.Actions.clearFormatting();
                break;
            case 'quote':
                this.Actions.toggleQuote();
                break;
            default:
                console.warn(`Unknown editor action: ${action}`);
                break;
        }
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

    Actions = {
        toggleBold: () => {
            this.editor.chain().focus().toggleBold().run();
        },

        toggleItalic: () => {
            this.editor.chain().focus().toggleItalic().run();
        },

        toggleUnderline: () => {
            this.editor.chain().focus().toggleUnderline().run();
        },

        toggleStrike: () => {
            this.editor.chain().focus().toggleStrike().run();
        },

        toggleQuote: () => {
            this.editor.chain().focus().toggleBlockquote().run();
        },

        toggleCode: () => {
            this.editor.chain().focus().toggleCodeBlock().run();
        },

        addLink: () => {
            const linkUrl = prompt('Enter link URL:');
            if (linkUrl) {
                this.editor.chain().focus().setLink({ href: linkUrl }).run();
            }
        },

        addImage: () => {
            const imageUrl = prompt('Enter image URL:');
            if (imageUrl) {
                this.editor.chain().focus().setImage({ src: imageUrl }).run();
            }
        },

        addTable: () => {
            const rows = parseInt(prompt('Enter number of rows:', '3'));
            const cols = parseInt(prompt('Enter number of columns:', '3'));
            if (!isNaN(rows) && !isNaN(cols) && rows > 0 && cols > 0) {
                this.editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
            }
        },

        setHeading: (level) => {
            try {
                level = parseInt(level);
                if (isNaN(level) || level < 1 || level > 6) {
                    console.warn('Invalid heading level:', level);
                    return;
                }
            } catch (e) {
                console.warn('Invalid heading level:', level);
                return;
            }
            this.editor.chain().focus().unsetFontSize().run();
            this.editor.chain().focus().setHeading({ level: level }).run();
        },

        setFontSize: (size) => {
            this.editor.chain().focus().setNode('paragraph').run();
            if (size) {
                this.editor.chain().focus().setFontSize(size).run();
            } else {
                this.editor.chain().focus().unsetFontSize().run();
            }
        },

        setFontFamily: (family) => {
            if (family) {
                this.editor.chain().focus().setFontFamily(family).run();
            } else {
                this.editor.chain().focus().unsetFontFamily().run();
            }
        },
        
        toggleBulletList: () => {
            this.editor.chain().focus().toggleBulletList().run();
        },

        toggleOrderedList: () => {
            this.editor.chain().focus().toggleOrderedList().run();
        },

        toggleTaskList: () => {
            this.editor.chain().focus().toggleTaskList().run();
        },

        undo: () => {
            this.editor.chain().focus().undo().run();
        },

        redo: () => {
            this.editor.chain().focus().redo().run();
        },

        setTextAlign: (align) => {
            this.editor.chain().focus().setTextAlign(align).run();
        },

        leftAlign: () => {
            this.Actions.setTextAlign('left');
        },

        centerAlign: () => {
            this.Actions.setTextAlign('center');
        },

        rightAlign: () => {
            this.Actions.setTextAlign('right');
        },

        justifyAlign: () => {
            this.Actions.setTextAlign('justify');
        },

        setLineHeight: (lineHeight) => {
            if (lineHeight) {
                this.editor.chain().focus().setLineHeight(lineHeight).run();
            } else {
                this.editor.chain().focus().unsetLineHeight().run();
            }
        },

        setTextColor: (color) => {
            if (color) {
                this.editor.chain().focus().setColor(color).run();
            } else {
                this.editor.chain().focus().unsetColor().run();
            }
        },

        setTextHighlight: (color) => {
            if (color) {
                this.editor.chain().focus().setHighlight({ color: color }).run();
            } else {
                this.editor.chain().focus().unsetHighlight().run();
            }
        },

        incrementFontSize: () => {
            const maxSize = 192;
            const currentSize = this.getTextStyleState().fontSize || 16;
            const newSize = Math.min(parseInt(currentSize) + 1, maxSize);
            if (newSize !== currentSize) {
                this.Actions.setFontSize(newSize + 'px');
            }
        },

        decrementFontSize: () => {
            const minSize = 6;
            const currentSize = this.getTextStyleState().fontSize || 16;
            const newSize = Math.max(parseInt(currentSize) - 1, minSize);
            if (newSize !== currentSize) {
                this.Actions.setFontSize(newSize + 'px');
            }
        },

        clearFormatting: () => {
            this.editor.chain().focus().clearNodes().unsetAllMarks().run();
            this.editor.chain().focus().setParagraph().run();
            this.editor.chain().focus().unsetFontSize().run();
            this.editor.chain().focus().unsetFontFamily().run();
            this.editor.chain().focus().unsetColor().run();
            this.editor.chain().focus().unsetHighlight().run();
        },

    }

}


customElements.define('tiptap-editor', TiptapEditor);