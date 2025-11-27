/*
 * @Descripttion: your project
 * @version: 1.0
 * @Author: chuang.ao
 * @Date: 2025-06-25 13:12:12
 * @LastEditors: chuang.ao
 * @LastEditTime: 2025-07-08 18:52:30
 */

export default function setPageTitle(title) {
  let appName = "智学轨迹";
  window.document.title = title ? `${title} - ${appName}` : appName;
}
