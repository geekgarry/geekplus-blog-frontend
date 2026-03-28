import axios from "axios";
import constant from "./constant";
//处理url参数
import qs from "qs";

import store from "../store";
import jsonp from "jsonp";

// const service = axios.create({
//     timeout: 90000, // 超过11秒提示超时
//     baseURL: process.env.VUE_APP_BASE_API,
// });

// // axios.defaults.baseURL = constant.baseURL;

// // 添加请求拦截器
// service.interceptors.request.use(
//     function(config) {
//         // 在发送请求之前做些什么
//         return config;
//     },
//     function(error) {
//         this.$message({
//             message: "请求服务超时或服务器错误！",
//             type: "error",
//             duration: 3000,
//         });
//         // 对请求错误做些什么
//         return Promise.reject(error);
//     }
// );

// // 添加响应拦截器
// service.interceptors.response.use(
//     function(response) {
//         const res = response.data;
//         const status = response.status; //网络请求状态
//         if (
//             res !== null &&
//             res.hasOwnProperty("code") &&
//             res.code !== 200
//         ) {
//             if (response.data.code === 300) {
//                 store.commit("loadCurrentUser", {});
//                 localStorage.removeItem("userToken");
//                 store.commit("loadCurrentAdmin", {});
//                 localStorage.removeItem("adminToken");
//                 window.location.href = constant.webURL + "/user";
//             }
//             return Promise.reject(new Error(response.data.message));
//         } else {
//             return res;
//         }
//     },
//     function(error) {
//         // 对响应错误做点什么
//         return Promise.reject(error);
//     }
// );

// 当data为URLSearchParams对象时设置为application/x-www-form-urlencoded;charset=utf-8
// 当data为普通对象时，会被设置为application/json;charset=utf-8

export default {
    post(url, params = {}, isAdmin = false, json = true) {
        let config;
        if (isAdmin) {
            config = {
                headers: { Authorization: localStorage.getItem("adminToken") },
            };
        }
        // else {
        //     config = {
        //         headers: { Authorization: localStorage.getItem("userToken") },
        //     };
        // }

        return new Promise((resolve, reject) => {
            axios
                .post(url, json ? params : qs.stringify(params), config)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    },

    get(url, params = {}, isAdmin = false) {
        let headers;
        if (isAdmin) {
            headers = { Authorization: localStorage.getItem("adminToken") };
        } else {
            headers = { Authorization: localStorage.getItem("userToken") };
        }

        return new Promise((resolve, reject) => {
            axios
                .get(url, {
                    params: params,
                    headers: headers,
                })
                .then((res) => {
                    resolve(res.data);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    },

    upload(url, param, isAdmin = false, option) {
        let config;
        if (isAdmin) {
            config = {
                headers: {
                    Authorization: localStorage.getItem("adminToken"),
                    "Content-Type": "multipart/form-data",
                },
                timeout: 60000,
            };
        } else {
            config = {
                headers: {
                    Authorization: localStorage.getItem("userToken"),
                    "Content-Type": "multipart/form-data",
                },
                timeout: 60000,
            };
        }
        if (typeof option !== "undefined") {
            config.onUploadProgress = (progressEvent) => {
                if (progressEvent.total > 0) {
                    progressEvent.percent =
                        (progressEvent.loaded / progressEvent.total) * 100;
                }
                option.onProgress(progressEvent);
            };
        }

        return new Promise((resolve, reject) => {
            axios
                .post(url, param, config)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    },

    uploadQiniu(url, param) {
        let config = {
            headers: { "Content-Type": "multipart/form-data" },
            timeout: 60000,
        };

        return new Promise((resolve, reject) => {
            axios
                .post(url, param, config)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    },

    jsonp(url, options) {
        return new Promise((resolve, reject) => {
            jsonp(url, options, (err, data) => {
                if (err) {
                    reject(err);
                }
                resolve(data);
            });
        });
    }
};
