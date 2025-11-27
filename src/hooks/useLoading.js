import { showLoadingToast } from "vant";
import { onBeforeUnmount } from "vue";

export function useLoading(msg = "加载中...") {
  let toast = null;
  const startLoading = () => {
    toast = showLoadingToast({
      duration: 0,
      forbidClick: true,
      message: msg,
      overlay: true,
    });
  };
  const stopLoading = () => {
    toast && toast.close();
  };

  onBeforeUnmount(stopLoading);

  return { startLoading, stopLoading };
}
