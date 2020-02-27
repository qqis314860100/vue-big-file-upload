<template>
  <div id="app">
    <div>
      <input type="file" @change="handleFileChange" />
      <el-button @click="handleUpload">上传</el-button>
    </div>
    <div>
      <div>计算文件hash</div>
      <el-progress :percentage="hashPercentage"></el-progress>
    </div>
  </div>
</template>
  
<script>
// hash串的意义
// 无论是前端还是后端，传输文件，特别是大文件，有可能发生丢失文件的情况，网速或者服务器超时，如何 避免。
// 文件名并不是唯一，不同名的文件，但内容是一样的，hash会针对文件内容进行hash计算，相同内容的文件，hash串一定是一样的
// hash前端先算一个，后端拿到内容再算一下，对比hash串一样说明没有丢失，如果不一样那要重新上传
//
const Status = {
  wait: "wait",
  pause: "pause",
  uploading: "uploading"
};
const SIZE = 0.5 * 1024 * 1024;
export default {
  name: "App",
  data: () => ({
    container: {
      // 将我们的任务放到一起
      file: null,
      hash: ""
    },
    hashPercentage: 0,
    status: Status.waiting
  }),
  methods: {
    async calculateHash(fileChunkList) {
      return new Promise(resolve => {
        // 用promise封装花时间的任务
        // web workers 单独再开一个线程，不会影响原来的UI //js 单线程的，UI是主线程，花费时间再这计算ui就会被卡住，动不了

        this.container.worker = new Worker("/hash.js");
        this.container.worker.postMessage({ fileChunkList });
        this.container.worker.onmessage = e => {
          const { percentage, hash } = e.data;
          this.hashPercentage = percentage;
          if (hash) {
            resolve(hash);
          }
        };
      });
    },

    async handleUpload(e) {
      // 大量任务
      if (!this.container.file) return;
      this.status = Status.uploading;
      const fileChunkList = this.createFileChunk(this.container.file);
      console.log(fileChunkList);
      this.container.hash = await this.calculateHash(fileChunkList);
    },
    // 创建切片
    createFileChunk(file, size = SIZE) {
      const fileChunkList = [];
      let cur = 0;
      while (cur < file.size) {
        fileChunkList.push({ file: file.slice(cur, cur + size) });
        cur += size;
      }
      return fileChunkList;
    },
    handleFileChange(e) {
      // 文件分割
      const [file] = e.target.files;
      this.container.file = file;
    }
  },
  components: {}
};
</script>

<style></style>
