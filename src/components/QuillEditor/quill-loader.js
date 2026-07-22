/**
 * Quill 统一入口（编辑器页按需加载）
 *
 * 项目使用 Quill 2.x。旧包 quill-image-resize-module 只适配 Quill 1，
 * 会读 window.Quill.imports.parchment，在 Quill 2 下无法正确注册，表现为：
 *   Cannot import modules/imageResize. Are you sure it was registered?
 *
 * 改用 quill-resize-module（支持 Quill 2），模块名注册为 modules/resize。
 */
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import QuillResize from 'quill-resize-module';
import 'quill-resize-module/dist/resize.css';

if (typeof window !== 'undefined') {
  window.Quill = Quill;
}

const ResizeModule = QuillResize && (QuillResize.default || QuillResize);
Quill.register('modules/resize', ResizeModule);

export default Quill;
