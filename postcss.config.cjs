// postcss.config.cjs

// eslint-disable-next-line no-undef
module.exports = {
  plugins: {
    // postcss-pxtorem 插件的版本需要 >= 5.0.0
    "postcss-pxtorem": {
      rootValue({ file }) {
        return file.indexOf("vant") !== -1 ? 37.5 : 75;
      },
      // eslint-disable-next-line no-dupe-keys
      rootValue: 37.5,
      // 根节点 fontSize值
      propList: ["*"],
      selectorBlackList: [":root"],
      exclude: (file) => {
        // 排除包含 "baklavajs" 和 "@antv/g6" 的文件
        const excludePatterns = ["element", "baklavajs", "@antv/g6"];
        // 检查是否在 src/views/workflow 路径下
        const isInWorkflowPath = file.includes("src/views/workflow");
        // 如果文件路径包含任意一个排除模式，或者在 workflow 路径下，则排除
        return (
          excludePatterns.some((pattern) => file.includes(pattern)) ||
          isInWorkflowPath
        );
      },
    },
  },
};
