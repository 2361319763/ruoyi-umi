import { updateUserProfile } from '@/services/system/user';
import { ProForm, ProFormRadio, ProFormText } from '@ant-design/pro-components';
import { Form, message, Row } from 'antd';
import React from 'react';

export type BaseInfoProps = {
  values: Partial<API.CurrentUser> | undefined;
};

const BaseInfo: React.FC<BaseInfoProps> = (props) => {
  const [form] = Form.useForm();

  const handleFinish = async (values: Record<string, any>) => {
    const data = { ...props.values, ...values } as API.CurrentUser;
    const resp = await updateUserProfile(data);
    if (resp.code === 200) {
      message.success('修改成功');
    } else {
      message.warning(resp.msg);
    }
  };

  return (
    <>
      <ProForm form={form} onFinish={handleFinish} initialValues={props.values}>
        <Row>
          <ProFormText
            name="nickName"
            label="用户昵称"
            width="xl"
            placeholder="请输入用户昵称"
            rules={[
              {
                required: true,
                message: '请输入用户昵称！',
              },
            ]}
          />
        </Row>
        <Row>
          <ProFormText
            name="phonenumber"
            label="手机号码"
            width="xl"
            placeholder="请输入手机号码"
            rules={[
              {
                required: false,
                message: '请输入手机号码！',
              },
            ]}
          />
        </Row>
        <Row>
          <ProFormText
            name="email"
            label="邮箱"
            width="xl"
            placeholder="请输入邮箱"
            rules={[
              {
                type: 'email',
                message: '无效的邮箱地址!',
              },
              {
                required: false,
                message: '请输入邮箱！',
              },
            ]}
          />
        </Row>
        <Row>
          <ProFormRadio.Group
            options={[
              {
                label: '男',
                value: '0',
              },
              {
                label: '女',
                value: '1',
              },
            ]}
            name="sex"
            label="sex"
            width="xl"
            rules={[
              {
                required: false,
                message: '请输入性别！',
              },
            ]}
          />
        </Row>
      </ProForm>
    </>
  );
};

export default BaseInfo;
