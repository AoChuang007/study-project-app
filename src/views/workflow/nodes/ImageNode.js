import { defineNode } from "baklavajs";
import { CustomImageInterface } from "./CustomImageInterface";

export const ImageNode = defineNode({
  type: "ImageNode",
  title: "图片节点",
  inputs: {
    imageUrl: () => new CustomImageInterface("Url", 1),
  },
  interfaces: {
    customImage: () => {
      const customImageInterface = new CustomImageInterface();
      customImageInterface.setImageUrl(this.imputs.imageUrl);
      return customImageInterface;
    },
  },
});
