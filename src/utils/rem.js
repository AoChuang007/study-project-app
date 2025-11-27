// 设置 rem 函数
export const setRem = () => {
  // 375 默认字体大小37.5px; 375px = 10rem（px的数值/37.5）
  const designScreenWidth = 375;

  const scale = designScreenWidth / 37.5;
  const htmlWidth =
    document.documentElement.clientWidth || document.body.clientWidth;
  // 得到html的Dom元素
  const htmlDom = document.getElementsByTagName("html")[0];
  // 设置根元素字体大小
  htmlDom.style.fontSize = htmlWidth / scale + "px";
};

export const initRem = () => {
  // 初始化
  setRem();
  // 改变窗口大小时重新设置 rem
  window.onresize = function () {
    setRem();
  };
};
