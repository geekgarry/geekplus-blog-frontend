import request from "@/utils/request";
import { downloadFile } from "@/utils/downloadZip";

export function list_file(query) {
  return request({
    url: "/sys/file-manager/list",
    method: "get",
    params: query,
  });
}

export function search_file(query) {
  return request({
    url: "/sys/file-manager/search",
    method: "get",
    params: query,
  });
}

export function delete_batch_file(reqData) {
  return request({
    url: "/sys/file-manager/delete/batch",
    method: "post",
    data: reqData,
  });
}

export function delete_file(param) {
  return request({
    url: "/sys/file-manager/delete",
    method: "post",
    params: param,
  });
}

export function copy_file(reqData) {
  return request({
    url: "/sys/file-manager/copy",
    method: "post",
    data: reqData,
  });
}

export function move_file(reqData) {
  return request({
    url: "/sys/file-manager/move",
    method: "post",
    data: reqData,
  });
}

export function compress_file(reqData) {
  return request({
    url: "/sys/file-manager/compress",
    method: "post",
    data: reqData,
  });
}

export function rename_file(param) {
  return request({
    url: "/sys/file-manager/rename",
    method: "post",
    params: param,
  });
}

//通用上传文件
export function upload_file(formData, onUploadProgress) {
  return request({
    url: "/sys/file-manager/upload",
    method: "post",
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });
}

export function list_recycle_file() {
  return request({
    url: "/sys/file-manager/recycle/list",
    method: "get",
  });
}

export function restore_recycle_file(reqData) {
  return request({
    url: "/sys/file-manager/recycle/restore",
    method: "post",
    data: reqData,
  });
}

export function delete_recycle_file(reqData) {
  return request({
    url: "/sys/file-manager/recycle/delete",
    method: "post",
    data: reqData,
  });
}

export function read_text_file(param) {
  return request({
    url: "/sys/file-manager/read-text",
    method: "post",
    params: param,
  });
}

export function save_text_file(data) {
  return request({
    url: "/sys/file-manager/save-text",
    method: "post",
    data: data,
  });
}

export function create_file(param) {
  return request({
    url: "/sys/file-manager/create",
    method: "post",
    params: param,
  });
}

export function check_exist(req) {
  return request({
    url: "/sys/file-manager/check-exist",
    method: "post",
    data: req,
  });
}

export function downloadRecycleFile(fileName) {
  downloadFile(
    `/sys/file-manager/recycle/download?recycleName=${encodeURIComponent(
      fileName
    )}`
  );
}

export function downloadCommonFile(path, preview) {
  downloadFile(
    `/sys/file-manager/download?path=${path}&preview=${preview}`
  );
}

export function getDownloadUrl(path, preview) {
  return `/sys/file-manager/download?path=${encodeURIComponent(path)}&preview=${preview}`;
}
