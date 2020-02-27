// 通过内容计算md5值
self.importScripts('/spark-md5.min.js');

self.onmessage = e => {
  const { fileChunkList } = e.data;
  let percentage = 0;
  let count = 0;
  // 接受一个二进制缓冲
  const spark = new self.SparkMD5.ArrayBuffer();
  // 计算hash
  const loadNext = index => {
    // fileReader读取文件到内存
    const reader = new FileReader(); // 文件阅读对象
    reader.readAsArrayBuffer(fileChunkList[index].file);
    // 读完出发onload
    reader.onload = e => {
      count++;
      spark.append(e.target.result);
      if (count === fileChunkList.length) {
        self.postMessage({ percentage: 100, hash: spark.end() });
      } else {
        percentage += 100 / fileChunkList.length;
        self.postMessage({ percentage });
        loadNext(count);
      }
    };
  };
  loadNext(count);
}; // web work代表当前的线程
