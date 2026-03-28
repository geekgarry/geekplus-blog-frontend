<template>
  <div>
    <!-- <button v-if="!showSignaturePad" @click="clearCanvas">清除</button> -->
    <!-- <button v-if="!showSignaturePad" @click="saveSignature">保存签名</button> -->
    <button v-if="!showSignaturePad" @click="resetSigned">重置</button>
    <div>
      <button @click="showSignaturePadMethod">签署图片</button>
      <input type="file" @change="loadImage" accept="image/*">
    </div>
    <!-- <div>
      <button @click="signPdf">签署PDF</button>
      <input type="file" @change="loadPdf" accept=".pdf">
    </div> -->
    <div v-if="showSignaturePad" class="signature-pad-modal" @click.self="closeSignaturePad">
      <div class="signature-pad-container" ref="signaturePadContainer">
        <canvas ref="signatureCanvas" class="signature-canvas" @mousedown="startFullDrawing" @mousemove="drawFull"
          @mouseup="stopFullDrawing" @mouseout="stopFullDrawing" @touchstart.prevent="startTouchDrawing"
          @touchmove.prevent="drawTouch" @touchend.prevent="stopTouchDrawing"></canvas>
        <div class="signature-pad-buttons">
          <button @click="clearFullSignature">清除</button>
          <button @click="closeSignaturePad">关闭</button>
          <button @click="applySignature">应用</button>
        </div>
      </div>
    </div>
    <div>
      <img class="signed-image" :src="signedImageUrl" v-if="signedImageUrl" alt="Signed Image">
      <!-- <img class="signed-image" :src="pdf" v-if="pdf" alt="Signed PDF"> -->
    </div>
  </div>
</template>

<script>
import html2canvas from 'html2canvas';
// const { jsPDF } = require("jspdf"); // will automatically load the node version

export default {
  data() {
    return {
      signatureDataUrl: null,
      signedImageUrl: null,
      signedPdfUrl: null,
      image: null,
      pdf: null,
      showSignaturePad: false,
      signatureCtx: null,
      isDrawingFull: false, // Add this for full screen canvas drawing
    };
  },
  mounted() {
  },
  computed: {
    isMobile() {
      return this.$common.isMobile();
    }
  },
  methods: {
    getTouchMovePos(canvasDom, e) {
      const rect = canvasDom.getBoundingClientRect();
      return {
        x: e.touches ? e.touches[0].clientX - rect.left : e.clientX - rect.left,
        y: e.touches ? e.touches[0].clientY - rect.top : e.clientY - rect.top
      };
    },
    clearCanvas() {
      this.ctx.clearRect(0, 0, this.$refs.canvas.width, this.$refs.canvas.height);
    },
    resetSigned() {
      this.signedImageUrl = null;
      this.signedPdfUrl = null;
    },
    saveSignature() {
      // this.signatureDataUrl = this.$refs.canvas.toDataURL('image/png');
      // this.shareCardImg = imgData;
      // var link = document.createElement('a');
      // link.download = 'signature.png';
      // link.href = this.signatureDataUrl;
      // link.click();
    },
    setBrushStyle(context) {
      context.lineWidth = 2; // Thicker line
      context.lineCap = 'round'; // Rounded ends
      context.lineJoin = 'round'; // Rounded corners
      context.strokeStyle = 'black'; // Black color
      context.shadowColor = 'rgba(0, 0, 0, 0.3)'; // Subtle shadow
      context.font = "normal 16px 宋体";
      context.shadowBlur = 2; // Small blur radius
      context.shadowOffsetX = 1; // Slight horizontal offset
      context.shadowOffsetY = 1; // Slight vertical offset
    },
    showSignaturePadMethod() {
      this.showSignaturePad = true;
      // this.lockOrientation('landscape'); // Lock to landscape mode
      this.$nextTick(() => {
        // if (this.isMobile) { // Only rotate if on mobile
        //   const container = this.$refs.signaturePadContainer;
        //   const canvas = this.$refs.signatureCanvas;
        //   const height = window.innerHeight;
        //   const width = window.innerWidth;

        //   canvas.width = width - 40;
        //   canvas.height = height - 90;

        //   container.style.width = `${width}px`;
        //   container.style.height = `${height}px`;
        //   //  container.style.transform = 'rotate(90deg) translate(0, 0)';
        // } else {
        //   // For desktop, just set canvas dimensions to container size
        //   //  const containerWidth = this.$refs.signaturePadContainer.offsetWidth;
        //   //  const containerHeight = this.$refs.signaturePadContainer.offsetHeight;
        //   this.$refs.signatureCanvas.width = window.innerWidth - 40;
        //   this.$refs.signatureCanvas.height = window.innerHeight - 90;
        // }
        this.$refs.signatureCanvas.width = window.innerWidth - 40;
        this.$refs.signatureCanvas.height = window.innerHeight - 90;
        this.signatureCtx = this.$refs.signatureCanvas.getContext('2d');
        this.setBrushStyle(this.signatureCtx);  // Set brush style for fullscreen canvas
        const rect = this.$refs.signatureCanvas.getBoundingClientRect();
      });
    },
    closeSignaturePad() {
      this.showSignaturePad = false;
      // this.unlockOrientation(); // Unlock orientation
      if (this.isMobile) {
        const container = this.$refs.signaturePadContainer;
        container.style.transform = '';
        container.style.width = '';
        container.style.height = '';
      }
    },

    // Methods for the full screen canvas

    startFullDrawing(event) {
      this.isDrawingFull = true;
      // const { offsetX, offsetY } = event; // Get offset directly from mouse event
      const pos = this.getTouchMovePos(this.$refs.signatureCanvas, event);
      this.signatureCtx.beginPath();
      this.signatureCtx.moveTo(pos.x, pos.y);
    },

    drawFull(event) {
      if (!this.isDrawingFull) return;
      // const { offsetX, offsetY } = event; // Get offset directly from mouse event
      const pos = this.getTouchMovePos(this.$refs.signatureCanvas, event);
      this.signatureCtx.lineTo(pos.x, pos.y);
      this.signatureCtx.stroke();
    },

    stopFullDrawing() {
      this.isDrawingFull = false;
    },

    startTouchDrawing(event) {
      this.isDrawingFull = true;
      const pos = this.getTouchMovePos(this.$refs.signatureCanvas, event);
      this.signatureCtx.beginPath();
      this.signatureCtx.moveTo(pos.x, pos.y);
    },

    drawTouch(event) {
      if (!this.isDrawingFull) return;
      const pos = this.getTouchMovePos(this.$refs.signatureCanvas, event);
      this.signatureCtx.lineTo(pos.x, pos.y);
      this.signatureCtx.stroke();
    },

    stopTouchDrawing(event) {
      event.preventDefault();
      this.isDrawingFull = false; // Use isDrawingFull for full screen
    },

    clearFullSignature() {
      this.signatureCtx.clearRect(0, 0, this.$refs.signatureCanvas.width, this.$refs.signatureCanvas.height);
    },

    // async applySignature() {
    //   if (!this.image) return;

    //   const canvas = document.createElement('canvas');
    //   const ctx = canvas.getContext('2d');
    //   canvas.width = this.image.width;
    //   canvas.height = this.image.height + this.$refs.signatureCanvas.height;
    //   ctx.drawImage(this.image, 0, 0);

    //   const signatureDataUrl = this.$refs.signatureCanvas.toDataURL();
    //   const signatureImg = new Image();
    //   signatureImg.src = signatureDataUrl;
    //   await new Promise(resolve => signatureImg.onload = resolve);

    //   // Draw signature at the bottom, scaled to image width
    //   ctx.drawImage(signatureImg, 0, this.image.height - 100, this.image.width, this.$refs.signatureCanvas.height * (this.image.width / this.$refs.signatureCanvas.width));

    //   this.signedImageUrl = canvas.toDataURL();
    //   this.showSignaturePad = false;
    // },

    async applySignature() {
      if (!this.image || !this.signatureCtx) return;
      // Calculate the bounding box of the signature
      let minX = Infinity, minY = Infinity, maxX = 0, maxY = 0;
      const imageData = this.signatureCtx.getImageData(0, 0, this.$refs.signatureCanvas.width, this.$refs.signatureCanvas.height);
      for (let i = 0; i < imageData.data.length; i += 4) {
        if (imageData.data[i + 3] > 0) { // Check alpha channel
          const x = (i / 4) % this.$refs.signatureCanvas.width;
          const y = Math.floor((i / 4) / this.$refs.signatureCanvas.width);
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }

      const signatureWidth = maxX - minX;
      const signatureHeight = maxY - minY;

      if (signatureWidth === 0 || signatureHeight === 0) {
        // No signature drawn, just apply the original image
        this.signedImageUrl = this.image.src;
        this.showSignaturePad = false;
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = this.image.width;
      canvas.height = this.image.height;
      ctx.drawImage(this.image, 0, 0);

      // Scale the signature proportionally to a fixed size
      const targetWidth = this.image.width * 0.3; // Example: 30% of image width
      const scale = targetWidth / signatureWidth;
      const targetHeight = signatureHeight * scale;

      // Draw the cropped and scaled signature at a fixed position (e.g., bottom right)
      ctx.drawImage(
        this.$refs.signatureCanvas,
        minX, minY, signatureWidth, signatureHeight,
        this.image.width - targetWidth - 10, this.image.height - targetHeight - 10, targetWidth, targetHeight  // Positioning: 10px margin from bottom and right
      );

      this.signedImageUrl = canvas.toDataURL();
      this.showSignaturePad = false;
    },

    loadImage(event) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.image = new Image();
        this.image.onload = () => { };
        this.image.src = reader.result;
      };
      reader.readAsDataURL(file);
    },

    loadPdf(event) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {

        this.image = new Image();
        this.image.src = reader.result;
        this.pdf = reader.result;
        this.image.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = this.pdf.width;
          canvas.height = this.pdf.height;
          ctx.drawImage(this.pdf, 0, 0);
          this.convertCanvasToImage(canvas); // 调用转换函数
        };
        // html2canvas(document.createElement('canvas')).then(canvas => {
        //   this.image.src = canvas.toDataURL('image/png');
        // })
      };
      reader.readAsDataURL(file);
    },

    convertCanvasToImage(canvas) {
      const image = canvas.toDataURL('image/png');//.replace('image/png', 'image/octet-stream'); // 转换为PNG格式的Base64字符串，然后转换为Blob或其他格式（如果需要）
      this.image = new Image();
      this.image.onload = () => { };
      this.image.src = image;
      console.log(image)
      // 例如，创建一个下载链接或者以其他方式使用这个图片数据
      // const link = document.createElement('a');
      // link.href = image;
      // link.download = 'pdf-image.png'; // 设置下载文件名
      // link.click(); // 触发下载
    },

    async signPdf() {
      if (!this.signatureDataUrl || !this.pdf) return;

      const pdfDoc = new jsPDF();
      const img = new Image();
      img.src = this.pdf.src;
      await new Promise(resolve => img.onload = resolve);

      pdfDoc.addImage(img, 'PNG', 0, 0, pdfDoc.internal.pageSize.getWidth(), pdfDoc.internal.pageSize.getHeight());

      const signatureImg = new Image();
      signatureImg.src = this.signatureDataUrl;

      await new Promise(resolve => signatureImg.onload = resolve);
      pdfDoc.addImage(signatureImg, 'PNG', 100, 150, 100, 50); // 调整位置和大小

      pdfDoc.save('signed_document.pdf');

      this.signedPdfUrl = URL.createObjectURL(pdfDoc.output('blob'));
    },

    //强制锁定转换横屏
    lockOrientation(orientation) {
      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock(orientation).catch(error => {
          console.error("Orientation lock failed:", error);
          // Handle the error appropriately (e.g., show a message to the user)
        });
      } else if (screen.msLockOrientation) { // Older Microsoft browsers
        screen.msLockOrientation(orientation);
      } else { // Orientation lock not supported
        console.warn("Orientation lock not supported by this browser.");
        // Consider providing alternative solutions or user instructions
      }

      // Add a listener for orientation change to force landscape if needed
      window.addEventListener("orientationchange", this.forceLandscape);
    },

    unlockOrientation() {
      try {
        if (screen.orientation && screen.orientation.unlock) {
          screen.orientation.unlock();
        } else if (screen.msUnlockOrientation) {
          screen.msUnlockOrientation();
        }
      } catch (error) {
        console.error("Unlock orientation failed:", error);
      }
      window.removeEventListener("orientationchange", this.forceLandscape);
    },

    forceLandscape() {
      if (screen.orientation.type !== "landscape-primary" && screen.orientation.type !== "landscape-secondary") {
        // Force landscape-primary as a default
        this.lockOrientation('landscape-primary');
      }
    },
  }
};
</script>

<style scoped>
.signature-pad-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.signature-pad-container {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 100%;
  height: 100%;
}

.signature-canvas {
  border: 1px solid black;
  width: 100%;
  height: auto;
  /* Or adjust as needed */
  touch-action: none;
}

.signature-pad-buttons {
  margin-top: 10px;
  display: flex;
  justify-content: space-around;
  height: 40px;
  line-height: 40px;
}

.signed-image {
  width: auto;
  height: 300px;
}
</style>
