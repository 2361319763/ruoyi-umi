import { updateUserPwd } from '@/services/system/user';
import { ProForm, ProFormText } from '@ant-design/pro-components';
import { Form, message } from 'antd';
import React from 'react';

const ResetPassword: React.FC = () => {
  const [form] = Form.useForm();

  const handleFinish = async (values: Record<string, any>) => {
    const resp = await updateUserPwd(values.oldPassword, values.newPassword);
    if (resp.code === 200) {
      message.success('密码重置成功。');
    } else {
      message.warning(resp.msg);
    }
  };

  const checkPassword = (rule: any, value: string) => {
    const login_password = form.getFieldValue('newPassword');
    if (value === login_password) {
      return Promise.resolve();
    }
    return Promise.reject(new Error('两次密码输入不一致'));
  };

  return (
    <>
      <ProForm form={form} onFinish={handleFinish}>
        <ProFormText.Password
          name="oldPassword"
          label="旧密码"
          width="xl"
          placeholder="请输入旧密码"
          rules={[
            {
              required: true,
              message: '请输入旧密码！',
            },
          ]}
        />
        <ProFormText.Password
          name="newPassword"
          label="新密码"
          width="xl"
          placeholder="请输入新密码"
          rules={[
            {
              required: true,
              message: '请输入新密码！',
            },
          ]}
        />
        <ProFormText.Password
          name="confirmPassword"
          label="确认密码"
          width="xl"
          placeholder="请输入确认密码"
          rules={[
            {
              required: true,
              message: '请输入确认密码！',
            },
            { validator: checkPassword },
          ]}
        />
      </ProForm>
    </>
  );
};

export default ResetPassword;
