import Quill from 'quill';
// import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
// import "quill/dist/quill.bubble.css";

// 避免重复注册
if (typeof window !== 'undefined' && !window.Quill) {
  window.Quill = Quill;
}

// 可在此注册扩展模块
// import ImageResize from "quill-image-resize-module";
// Quill.register("modules/imageResize", ImageResize);
export default Quill;
