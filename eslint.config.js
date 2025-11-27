import globals from "globals";
import pluginJs from "@eslint/js";
import pluginVue from "eslint-plugin-vue";


export default [
  {files: ["**/*.{js,mjs,cjs,vue}"]},
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  ...pluginVue.configs["flat/essential"],
  {
    rules: {
      // 启用 vue/multi-word-component-names
      //由于编写代码过程中一直提示文件单命名错误，所以修改命名规则
      "vue/multi-word-component-names": ["off"]
    }
  },
];