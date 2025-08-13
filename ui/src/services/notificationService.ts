import { App } from 'antd';

// Global notification service using Ant Design's App context
let messageApi: any = null;

export const initNotificationService = (api: any) => {
  messageApi = api;
};

export const notificationService = {
  success: (content: string) => {
    console.log('[NOTIFICATION] Service success:', content);
    if (messageApi) {
      messageApi.success(content);
    } else {
      console.warn('[NOTIFICATION] messageApi not initialized');
    }
  },
  error: (content: string) => {
    console.log('[NOTIFICATION] Service error:', content);
    if (messageApi) {
      messageApi.error(content);
    } else {
      console.warn('[NOTIFICATION] messageApi not initialized');
    }
  },
  info: (content: string) => {
    console.log('[NOTIFICATION] Service info:', content);
    if (messageApi) {
      messageApi.info(content);
    } else {
      console.warn('[NOTIFICATION] messageApi not initialized');
    }
  },
};
