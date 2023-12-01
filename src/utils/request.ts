import {
  clearSessionToken,
  getAccessToken,
  getRefreshToken,
  getTokenExpireTime,
} from '@/utils/auth';
import errorCode from '@/utils/errorCode';
import type { RequestConfig } from '@umijs/max';
import { history } from '@umijs/max';
import { message, notification } from 'antd';
import { PageEnum } from '../enums/pagesEnums';

const baseApi = '/dev-api';
const checkRegion = 5 * 60 * 1000;

// 错误处理方案： 错误类型
enum ErrorShowType {
  SILENT = 0,
  WARN_MESSAGE = 1,
  ERROR_MESSAGE = 2,
  NOTIFICATION = 3,
  REDIRECT = 9,
}
// 与后端约定的响应数据格式
interface ResponseStructure {
  success: boolean;
  data: any;
  errorCode?: number;
  errorMessage?: string;
  showType?: ErrorShowType;
}

const requestConfig: RequestConfig = {
  // 错误处理： umi@3 的错误处理方案。
  errorConfig: {
    // 错误抛出
    errorThrower: (res) => {
      const { success, data, errorCode, errorMessage, showType } =
        res as unknown as ResponseStructure;
      if (!success) {
        const error: any = new Error(errorMessage);
        error.name = 'BizError';
        error.info = { errorCode, errorMessage, showType, data };
        throw error; // 抛出自制的错误
      }
    },
    // 错误接收及处理
    errorHandler: (error: any, opts: any) => {
      if (opts?.skipErrorHandler) throw error;
      // 我们的 errorThrower 抛出的错误。
      if (error.name === 'BizError') {
        const errorInfo: ResponseStructure | undefined = error.info;
        if (errorInfo) {
          const { errorMessage, errorCode } = errorInfo;
          switch (errorInfo.showType) {
            case ErrorShowType.SILENT:
              // do nothing
              break;
            case ErrorShowType.WARN_MESSAGE:
              message.warning(errorMessage);
              break;
            case ErrorShowType.ERROR_MESSAGE:
              message.error(errorMessage);
              break;
            case ErrorShowType.NOTIFICATION:
              notification.open({
                description: errorMessage,
                message: errorCode,
              });
              break;
            case ErrorShowType.REDIRECT:
              // TODO: redirect
              break;
            default:
              message.error(errorMessage);
          }
        }
      } else if (error.response) {
        // Axios 的错误
        // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
        message.error(`Response status:${error.response.status}`);
      } else if (error.request) {
        // 请求已经成功发起，但没有收到响应
        // \`error.request\` 在浏览器中是 XMLHttpRequest 的实例，
        // 而在node.js中是 http.ClientRequest 的实例
        message.error('None response! Please retry.');
      } else {
        // 发送请求时出了点问题
        message.error('Request error, please retry.');
      }
    },
  },
  // 请求拦截器
  requestInterceptors: [
    (url: any, options: { headers: any }) => {
      const headers = options.headers ? options.headers : [];

      const authHeader = headers['Authorization'];
      const isToken = headers['isToken'];
      if (!authHeader && isToken !== false) {
        const expireTime = getTokenExpireTime();
        if (expireTime) {
          const left = Number(expireTime) - new Date().getTime();
          const refreshToken = getRefreshToken();
          if (left < checkRegion && refreshToken) {
            if (left < 0) {
              clearSessionToken();
            }
          } else {
            const accessToken = getAccessToken();
            if (accessToken) {
              headers['Authorization'] = `Bearer ${accessToken}`;
            }
          }
        } else {
          clearSessionToken();
        }
      }
      return {
        url: baseApi + url,
        options,
      };
    },
  ],
  // 响应拦截器
  responseInterceptors: [
    (response: any) => {
      // 未设置状态码则默认成功状态
      const code: number | string = response.data.code || 200;
      const msg: string =
        errorCode[code] || response.data.msg || errorCode['default'];
      if (
        response.request.responseType === 'blob' ||
        response.request.responseType === 'arraybuffer'
      ) {
        return response.data;
      }
      if (code === 401) {
        notification.open({
          message: '无效的会话，或者会话已过期，请重新登录。',
          type: 'error',
        });
        clearSessionToken();
        history.push(PageEnum.LOGIN);
      } else if (code === 500) {
        message.error(msg);
      } else if (code === 601) {
        message.warning(msg);
      } else if (code !== 200) {
        notification.open({
          description: msg,
          message: '系统错误',
          type: 'error',
        });
      }
      return response;
    },
  ],
};

export default requestConfig;
