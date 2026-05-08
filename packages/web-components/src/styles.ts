export const previewStyles = `
  :host {
    display: block;
    min-height: 240px;
    color: #111827;
    font-family: "IBM Plex Sans", "Segoe UI", sans-serif;
  }

  .frame {
    display: grid;
    gap: 12px;
    min-height: 240px;
    padding: 16px;
    border: 1px solid rgba(17, 24, 39, 0.12);
    border-radius: 20px;
    background:
      radial-gradient(circle at top left, rgba(16, 185, 129, 0.08), transparent 34%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(243, 244, 246, 0.98));
    box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
  }

  .meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    color: #4b5563;
    font-size: 12px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .status {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: #10b981;
  }

  .viewport {
    min-height: 180px;
    border-radius: 14px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.72);
    border: 1px solid rgba(17, 24, 39, 0.08);
  }

  .viewport > * {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
  }

  .fpk-text-preview pre {
    margin: 0;
    padding: 18px;
    overflow: auto;
    white-space: pre-wrap;
    word-break: break-word;
    font: 13px/1.55 "IBM Plex Mono", "Consolas", monospace;
  }

  .fpk-code-preview pre {
    margin: 0;
    padding: 18px;
    overflow: auto;
    background: #0f172a;
    color: #e2e8f0;
    font: 13px/1.55 "IBM Plex Mono", "Consolas", monospace;
  }

  .fpk-code-preview code .hljs-keyword,
  .fpk-code-preview code .hljs-selector-tag,
  .fpk-code-preview code .hljs-title,
  .fpk-code-preview code .hljs-section {
    color: #f472b6;
  }

  .fpk-code-preview code .hljs-string,
  .fpk-code-preview code .hljs-attr,
  .fpk-code-preview code .hljs-template-variable {
    color: #86efac;
  }

  .fpk-code-preview code .hljs-number,
  .fpk-code-preview code .hljs-literal,
  .fpk-code-preview code .hljs-built_in {
    color: #fbbf24;
  }

  .fpk-markdown-preview,
  .fpk-docx-preview {
    padding: 20px 22px;
    line-height: 1.7;
  }

  .fpk-markdown-preview :is(h1, h2, h3, h4, h5, h6),
  .fpk-docx-preview :is(h1, h2, h3, h4, h5, h6) {
    margin: 0 0 12px;
    line-height: 1.15;
  }

  .fpk-markdown-preview p,
  .fpk-docx-preview p {
    margin: 0 0 14px;
  }

  .fpk-docx-preview :is(ul, ol) {
    margin: 0 0 16px;
    padding-left: 22px;
  }

  .fpk-docx-preview blockquote {
    margin: 0 0 16px;
    padding: 8px 0 8px 16px;
    border-left: 3px solid rgba(15, 23, 42, 0.16);
    color: #475569;
  }

  .fpk-docx-preview table {
    width: 100%;
    margin: 0 0 16px;
    border-collapse: collapse;
    table-layout: fixed;
  }

  .fpk-docx-preview td,
  .fpk-docx-preview th {
    padding: 10px 12px;
    border: 1px solid rgba(15, 23, 42, 0.1);
    text-align: left;
    vertical-align: top;
  }

  .fpk-docx-preview img {
    max-width: 100%;
    height: auto;
  }

  .fpk-markdown-preview pre,
  .fpk-docx-preview pre {
    overflow: auto;
    padding: 14px 16px;
    border-radius: 14px;
    background: #f8fafc;
  }

  .fpk-markdown-preview code,
  .fpk-docx-preview code {
    font-family: "IBM Plex Mono", "Consolas", monospace;
  }

  .fpk-office-preview {
    display: grid;
    gap: 14px;
    padding: 18px;
  }

  .fpk-office-note {
    display: grid;
    gap: 6px;
    padding: 12px 14px;
    border-radius: 14px;
    color: #854d0e;
    background: #fffbeb;
    border: 1px solid #fcd34d;
  }

  .fpk-office-note strong {
    font-size: 13px;
  }

  .fpk-office-note p,
  .fpk-office-meta {
    margin: 0;
    line-height: 1.55;
  }

  .fpk-office-meta {
    color: #64748b;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.01em;
  }

  .fpk-section-title {
    margin: 0;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #475569;
  }

  .fpk-sheet-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 2px;
  }

  .fpk-sheet-tab {
    border: 0;
    border-radius: 999px;
    padding: 8px 12px;
    font: inherit;
    color: #0f172a;
    background: #e2e8f0;
    cursor: pointer;
    white-space: nowrap;
    transition:
      background-color 120ms ease,
      color 120ms ease,
      transform 120ms ease;
  }

  .fpk-sheet-tab:hover {
    transform: translateY(-1px);
  }

  .fpk-sheet-tab:focus-visible {
    outline: 2px solid #0f172a;
    outline-offset: 2px;
  }

  .fpk-sheet-tab[data-active="true"] {
    color: white;
    background: #0f172a;
  }

  .fpk-sheet-content {
    border-radius: 14px;
    border: 1px solid rgba(15, 23, 42, 0.08);
    background: white;
  }

  .fpk-sheet-panel {
    display: grid;
    gap: 12px;
    padding: 14px;
  }

  .fpk-sheet-panel > .fpk-office-meta:first-child {
    color: #334155;
    font-size: 13px;
  }

  .fpk-sheet-panel > .fpk-office-meta:nth-child(2) {
    color: #64748b;
  }

  .fpk-sheet-scroll {
    overflow: auto;
    border-radius: 12px;
    border: 1px solid rgba(15, 23, 42, 0.08);
  }

  .fpk-sheet-content table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }

  .fpk-sheet-content td,
  .fpk-sheet-content th {
    padding: 8px 10px;
    border: 1px solid rgba(15, 23, 42, 0.08);
    text-align: left;
    font-size: 13px;
    min-width: 120px;
    vertical-align: top;
    word-break: break-word;
  }

  .fpk-sheet-content td[data-formula] {
    position: relative;
    background:
      linear-gradient(135deg, rgba(59, 130, 246, 0.08), transparent 18px),
      white;
  }

  .fpk-sheet-content td[data-formula]::after {
    content: "fx";
    position: absolute;
    top: 6px;
    right: 8px;
    color: #2563eb;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .fpk-sheet-content thead th {
    position: sticky;
    top: 0;
    z-index: 1;
    background: #f8fafc;
  }

  .fpk-sheet-content tbody th {
    background: #f8fafc;
    color: #475569;
    font-weight: 600;
  }

  .fpk-slide {
    display: grid;
    gap: 10px;
    padding: 16px;
    border-radius: 16px;
    background: white;
    border: 1px solid rgba(15, 23, 42, 0.08);
  }

  .fpk-slide-list {
    margin: 0;
    padding-left: 18px;
    color: #334155;
    line-height: 1.6;
  }

  .fpk-media-preview {
    display: grid;
    place-items: center;
    min-height: 180px;
    background: #0f172a;
  }

  .fpk-media-preview img,
  .fpk-media-preview video {
    max-width: 100%;
    max-height: 480px;
    object-fit: contain;
  }

  .fpk-media-preview audio {
    width: min(100%, 420px);
    padding: 24px;
  }

  .fpk-pdf-preview iframe {
    width: 100%;
    min-height: 640px;
    border: 0;
    background: white;
  }

  .fpk-pdf-preview {
    display: grid;
    gap: 12px;
    padding: 16px;
    background: #f8fafc;
  }

  .fpk-pdf-fallback-note {
    display: grid;
    gap: 6px;
    padding: 12px 14px;
    border-radius: 14px;
    color: #854d0e;
    background: #fef3c7;
    border: 1px solid #fcd34d;
  }

  .fpk-pdf-fallback-note p {
    margin: 0;
    line-height: 1.55;
  }

  .fpk-pdf-toolbar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .fpk-pdf-button {
    border: 0;
    border-radius: 999px;
    padding: 10px 14px;
    font: inherit;
    color: white;
    background: #0f172a;
    cursor: pointer;
  }

  .fpk-pdf-button:disabled {
    opacity: 0.45;
    cursor: default;
  }

  .fpk-pdf-page-counter {
    min-width: 110px;
    text-align: center;
    color: #334155;
    font-size: 13px;
    font-weight: 600;
  }

  .fpk-pdf-status {
    color: #64748b;
    font-size: 12px;
    font-weight: 600;
    min-width: 64px;
    text-align: right;
  }

  .fpk-pdf-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    padding: 10px 16px;
    color: #0f172a;
    text-decoration: none;
    background: #e2e8f0;
    font-weight: 600;
  }

  .fpk-pdf-canvas-wrap {
    overflow: auto;
    display: grid;
    place-items: center;
    padding: 12px;
    border-radius: 16px;
    background: white;
    border: 1px solid rgba(15, 23, 42, 0.08);
  }

  .fpk-pdf-canvas {
    max-width: 100%;
    box-shadow: 0 20px 40px rgba(15, 23, 42, 0.12);
  }

  .fpk-message {
    display: grid;
    gap: 8px;
    padding: 20px;
  }

  .fpk-message strong {
    font-size: 16px;
  }

  .fpk-message p {
    margin: 0;
    color: #4b5563;
    line-height: 1.6;
  }

  .empty,
  .error,
  .loading {
    display: grid;
    place-items: center;
    min-height: 180px;
    padding: 20px;
    text-align: center;
    color: #4b5563;
  }
`;
