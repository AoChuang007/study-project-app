<template> 
    <div class="content">
    <div class="cell" v-for="(items,values) in testData" :key="values" @click="handleCellClick(values)">
      <h6>{{ items.title }}</h6>
      <van-text-ellipsis :content="items.content" />
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';
export default {
  props: {
    //父组件数据
    testData:{
      type:Array,
      default:null,
      required:true
    },
  },
    setup (props) {
      const router = useRouter();
      const handleCellClick = (path) => {
        switch (path) {
          case 0:
            router.push('/essay');
            break;
            default:
            break;
        }
      // 这里可以添加更多的点击事件处理逻辑
    };
      console.log(props.testData)

        return {
          handleCellClick

        };
    }
}
</script>

<style lang="less" scoped>
.content {
	//渐变
  background: linear-gradient(to bottom, rgba(192, 223, 124, 1), rgba(255, 255, 255, 0.5));
  height: 100vh;
  padding-top: 5px;
  .cell{
    width: 355px;
    height: 60px;
    background-color: rgb(255, 255, 255);
    border: #808080 1px dashed;
    border-radius: 10px;
    margin-bottom: 10px;
    padding-top: 5px;
    padding-left: 10px;
    margin-left: 10px;

    .van-text-ellipsis{
      margin-top: 5px;
      --van-text-ellipsis-line-height: 2;
      font-size: 12px;
      color: gray;
    }
  }

}


</style>