// 构建时将 ```mermaid 代码块渲染成内联 SVG，最终页面不依赖 mermaid.js。
// 源码中继续保留 mermaid 语法，方便后续修改；渲染只发生在 Astro 构建期。
import { visit } from 'unist-util-visit';
import { createMermaidRenderer } from 'mermaid-isomorphic';

// 复用同一个浏览器实例，避免每个文件都启动一次 Chromium。
let rendererPromise;

function getRenderer() {
  if (!rendererPromise) {
    rendererPromise = createMermaidRenderer();
  }
  return rendererPromise;
}

export function remarkMermaid() {
  return async (tree) => {
    const hits = [];
    visit(tree, 'code', (node, index, parent) => {
      if (node.lang === 'mermaid' && parent && typeof index === 'number') {
        hits.push({ value: node.value, index, parent });
      }
    });

    if (hits.length === 0) return;

    const renderer = await getRenderer();
    const results = await renderer(hits.map((h) => h.value));

    results.forEach((result, i) => {
      const { index, parent } = hits[i];
      if (result.status === 'fulfilled') {
        // 渲染成功：用内联 SVG（包一层容器，便于套用站点主题样式）。
        const { svg } = result.value;
        parent.children[index] = {
          type: 'html',
          value: `<figure class="mermaid-figure">${svg}</figure>`,
        };
      }
      // 渲染失败时保留原始代码块，不阻塞整体构建。
    });
  };
}