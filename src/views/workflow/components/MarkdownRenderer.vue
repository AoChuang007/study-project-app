<template>
  <div class="markdown-body" v-html="renderedContent"></div>
</template>

<script>
import { marked } from "marked";
import { computed, defineComponent } from "vue";

export default defineComponent({
  name: "MarkdownRenderer",
  props: {
    content: {
      type: String,
      default: "",
    },
  },
  setup(props) {
    // 配置 marked 选项
    marked.setOptions({
      breaks: true,
      gfm: true,
    });

    const renderedContent = computed(() => {
      if (!props.content) return "";
      return marked.parse(props.content);
    });

    return {
      renderedContent,
    };
  },
});
</script>

<style scoped>
.markdown-body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial,
    sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  background: white;
  padding: 16px;
  border-radius: 6px;
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3) {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-body :deep(h1) {
  font-size: 1.5em;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 0.3em;
}

.markdown-body :deep(h2) {
  font-size: 1.25em;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 0.3em;
}

.markdown-body :deep(h3) {
  font-size: 1em;
}

.markdown-body :deep(p) {
  margin-top: 0;
  margin-bottom: 16px;
}

.markdown-body :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 16px;
  overflow: auto;
}

.markdown-body :deep(table th),
.markdown-body :deep(table td) {
  padding: 8px 12px;
  border: 1px solid #dfe2e5;
  text-align: left;
}

.markdown-body :deep(table th) {
  background-color: #f6f8fa;
  font-weight: 600;
}

.markdown-body :deep(table tr:nth-child(2n)) {
  background-color: #f6f8fa;
}

.markdown-body :deep(table tr:hover) {
  background-color: #e8f4fc;
}

.markdown-body :deep(a) {
  color: #0366d6;
  text-decoration: none;
}

.markdown-body :deep(a:hover) {
  text-decoration: underline;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  padding-left: 2em;
  margin-top: 0;
  margin-bottom: 16px;
}

.markdown-body :deep(li) {
  margin-bottom: 4px;
}

.markdown-body :deep(code) {
  background-color: rgba(27, 31, 35, 0.05);
  border-radius: 3px;
  font-size: 85%;
  margin: 0;
  padding: 0.2em 0.4em;
  font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
}

.markdown-body :deep(pre) {
  background-color: #f6f8fa;
  border-radius: 6px;
  font-size: 85%;
  line-height: 1.45;
  overflow: auto;
  padding: 16px;
  margin-bottom: 16px;
}

.markdown-body :deep(pre code) {
  background-color: transparent;
  border: 0;
  display: inline;
  line-height: inherit;
  margin: 0;
  overflow: visible;
  padding: 0;
  word-wrap: normal;
}

.markdown-body :deep(blockquote) {
  border-left: 4px solid #dfe2e5;
  color: #6a737d;
  margin: 0 0 16px 0;
  padding: 0 16px;
}

.markdown-body :deep(hr) {
  background-color: #e1e4e8;
  border: 0;
  height: 1px;
  margin: 24px 0;
}
</style>
