import Footer from '@/components/Footer';
import { getRoutersInfo, setRemoteMenu } from '@/services/session';
import { getCaptchaImg, login } from '@/services/system/login';
import { clearSessionToken, setSessionToken } from '@/utils/auth';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import {
  LoginForm,
  MenuDataItem,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { Helmet, history, useModel } from '@umijs/max';
import { Alert, Col, Image, Row, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import Settings from '../../../config/defaultSettings';
import './index.scss';

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => {
  return (
    <Alert
      style={{
        marginBottom: 24,
      }}
      message={content}
      type="error"
      showIcon
    />
  );
};

const Login: React.FC = () => {
  const [userLoginState, setUserLoginState] = useState<API.LoginResult>({
    code: 200,
  });
  const { initialState, setInitialState } = useModel('@@initialState');
  const [captchaCode, setCaptchaCode] = useState<string>('');
  const [uuid, setUuid] = useState<string>('');

  const containerClassName = useEmotionCss(() => {
    return {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      backgroundImage:
        "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: '100% 100%',
    };
  });

  const getCaptchaCode = async () => {
    const response = await getCaptchaImg();
    const imgdata = `data:image/png;base64,${response.img}`;
    setCaptchaCode(imgdata);
    setUuid(response.uuid);
  };

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo) {
      flushSync(() => {
        setInitialState((s) => ({
          ...s,
          currentUser: userInfo,
        }));
      });
    }
  };

  const handleSubmit = async (values: API.LoginParams) => {
    try {
      // 登录
      const response = await login({ ...values, uuid });
      if (response.code === 200) {
        const current = new Date();
        const expireTime = current.setTime(
          current.getTime() + 1000 * 12 * 60 * 60,
        );
        setSessionToken(response?.token, response?.token, expireTime);
        message.success('登录成功！');
        await fetchUserInfo();
        console.log('login ok');
        flushSync(() => {
          getRoutersInfo().then((res: MenuDataItem[]) => {
            setRemoteMenu(res);
          });
        });
        const urlParams = new URL(window.location.href).searchParams;
        history.push(urlParams.get('redirect') || '/');
        return;
      } else {
        console.log(response.msg);
        clearSessionToken();
        // 如果失败去设置用户错误信息
        setUserLoginState({ ...response });
        getCaptchaCode();
      }
    } catch (error) {
      console.log(error);
      message.error('登录失败，请重试！');
    }
  };
  const { code } = userLoginState;

  useEffect(() => {
    getCaptchaCode();
  }, []);

  return (
    <div className={containerClassName}>
      <Helmet>
        <title>登录页 - {Settings.title}</title>
      </Helmet>
      <div
        style={{
          flex: '1',
          padding: '32px 0',
        }}
      >
        <LoginForm
          logo={<img alt="logo" src="https://doc.ruoyi.vip/images/logo.png" />}
          title="Ant Design"
          subTitle="Ant Design 是西湖区最具影响力的 Web 设计规范"
          initialValues={{
            autoLogin: true,
          }}
          onFinish={async (values) => {
            await handleSubmit(values as API.LoginParams);
          }}
        >
          {code !== 200 && <LoginMessage content="账户或密码错误" />}
          <ProFormText
            name="username"
            initialValue="admin"
            fieldProps={{
              size: 'large',
              prefix: <UserOutlined />,
            }}
            placeholder="用户名: admin"
            rules={[
              {
                required: true,
                message: '请输入用户名!',
              },
            ]}
          />
          <ProFormText.Password
            name="password"
            initialValue="admin123"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined />,
            }}
            placeholder="密码: admin123"
            rules={[
              {
                required: true,
                message: '请输入密码！',
              },
            ]}
          />
          <Row>
            <Col flex={3}>
              <ProFormText
                style={{
                  float: 'right',
                }}
                name="code"
                placeholder="请输入验证"
                rules={[
                  {
                    required: true,
                    message: '请输入验证啊',
                  },
                ]}
              />
            </Col>
            <Col flex={2}>
              <Image
                src={captchaCode}
                alt="验证码"
                style={{
                  display: 'inline-block',
                  verticalAlign: 'top',
                  cursor: 'pointer',
                  paddingLeft: '10px',
                  width: '100px',
                }}
                preview={false}
                onClick={() => getCaptchaCode()}
              />
            </Col>
          </Row>

          <div
            style={{
              marginBottom: 24,
            }}
          >
            <ProFormCheckbox noStyle name="autoLogin">
              自动登录
            </ProFormCheckbox>
            <a
              style={{
                float: 'right',
              }}
            >
              忘记密码
            </a>
          </div>
        </LoginForm>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
