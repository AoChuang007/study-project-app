/*
 * @Author: Chuang Ao chuang.ao@ly.com
 * @LastEditors: Chuang Ao chuang.ao@ly.com
 * @LastEditTime: 2025-12-01 20:56:19
 * @FilePath: /study-ai-zy-dev_0602 2/src/views/workflow/interfaces/StringInputInterface.js
 */
import { NodeInterface } from "baklavajs";
import { defineComponent, h } from "vue";

// 创建自定义文本输入组件
const StringInputComponent = defineComponent({
  props: ["modelValue"],
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    return () =>
      h("input", {
        type: "text",
        value: props.modelValue,
        placeholder: "请输入关键词...",
        style: {
          width: "100%",
          padding: "4px 8px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          fontSize: "12px",
          backgroundColor: "#fff",
          color: "#333",
        },
        onInput: (e) => emit("update:modelValue", e.target.value),
      });
  },
});

// 自定义字符串输入接口
export class StringInputInterface extends NodeInterface {
  constructor(name, value = "") {
    super(name, value);
    this.component = StringInputComponent;
    this.setPort(false);
  }
}
