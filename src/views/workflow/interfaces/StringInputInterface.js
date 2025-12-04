/*
 * @Author: Chuang Ao chuang.ao@ly.com
 * @LastEditors: Chuang Ao chuang.ao@ly.com
 * @LastEditTime: 2025-12-04 18:00:00
 * @FilePath: /study-ai-zy-dev_0602 2/src/views/workflow/interfaces/StringInputInterface.js
 */
import { NodeInterface } from "baklavajs";
import { defineComponent, h, ref } from "vue";

// 防抖函数
function debounce(fn, delay = 500) {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

// 创建自定义文本输入组件
const StringInputComponent = defineComponent({
  props: ["modelValue", "intf"],
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const inputRef = ref(null);

    // 创建防抖处理的回调
    const debouncedCallback = debounce((value) => {
      if (props.intf && props.intf.onInputComplete) {
        props.intf.onInputComplete(value);
      }
    }, props.intf?.debounceDelay || 500);

    const handleInput = (e) => {
      const value = e.target.value;
      emit("update:modelValue", value);
      // 输入时触发防抖回调
      debouncedCallback(value);
    };

    return () =>
      h("input", {
        ref: inputRef,
        type: "text",
        value: props.modelValue,
        placeholder: props.intf?.placeholder || "请输入关键词...",
        style: {
          width: "100%",
          padding: "4px 8px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          fontSize: "12px",
          backgroundColor: "#fff",
          color: "#333",
        },
        onInput: handleInput,
      });
  },
});

// 自定义字符串输入接口
export class StringInputInterface extends NodeInterface {
  constructor(name, value = "", options = {}) {
    super(name, value);
    this.component = StringInputComponent;
    this.setPort(false);

    // 配置选项
    this.debounceDelay = options.debounceDelay || 500;
    this.placeholder = options.placeholder || "请输入关键词...";
    this.onInputComplete = options.onInputComplete || null;
  }

  // 设置输入完成回调
  setOnInputComplete(callback) {
    this.onInputComplete = callback;
    return this;
  }

  // 设置防抖延迟
  setDebounceDelay(delay) {
    this.debounceDelay = delay;
    return this;
  }
}
