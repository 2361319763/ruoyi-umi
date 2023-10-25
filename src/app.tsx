import Footer from '@/components/Footer';
import RightContent from '@/components/RightContent';
import MainContent from '@/components/MainContent';
import {
  getMatchMenuItem,
  getRemoteMenu,
  getRoutersInfo,
  getUserInfo,
  patchRouteWithRemoteMenus,
  setRemoteMenu,
  getKeepAliveRoutes
} from '@/services/session';
import { getAccessToken } from '@/utils/auth';
import requestConfig from '@/utils/request';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import type { RunTimeLayoutConfig } from '@umijs/max';
import { history } from '@umijs/max';
import defaultSettings from '../config/defaultSettings';
import { PageEnum } from './enums/pagesEnums';

const baseApi = '/dev-api';
// 全局初始化数据配置，用于 Layout 用户信息和权限初始化
// 更多信息见文档：https://umijs.org/docs/api/runtime-config#getinitialstate
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
}> {
  const fetchUserInfo = async () => {
    console.log('App fetchUserInfo getUserInfo');
    try {
      const response = await getUserInfo({
        skipErrorHandler: true,
      });
      if (response.user.avatar === '') {
        response.user.avatar =
          'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png';
      } else {
        response.user.avatar = baseApi + response.user.avatar;
      }
      return {
        ...response.user,
        permissions: response.permissions,
        roles: response.roles,
      } as API.CurrentUser;
    } catch (error) {
      console.log(error);
      history.push(PageEnum.LOGIN);
    }
    return undefined;
  };
  // 如果不是登录页面，执行
  const { location } = history;
  if (location.pathname !== PageEnum.LOGIN) {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      settings: defaultSettings as Partial<LayoutSettings>,
    };
  }
  return {
    fetchUserInfo,
    settings: defaultSettings as Partial<LayoutSettings>,
  };
}

export const layout: RunTimeLayoutConfig = ({
  initialState,
  setInitialState,
}) => {
  return {
    rightContentRender: () => <RightContent />,
    menu: {
      locale: false,
      params: {
        userId: initialState?.currentUser?.userId,
      },
      request: async () => {
        console.log('App layout menu request');
        if (!initialState?.currentUser?.userId) {
          return [];
        }
        return getRemoteMenu();
      },
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      console.log('App layout onPageChange');
      const { location } = history;

      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !== PageEnum.LOGIN) {
        history.push(PageEnum.LOGIN);
      }
    },
    links: [],
    menuHeaderRender: undefined,
    childrenRender: (children) => {
      return (
        <>
          <MainContent>
            { children }
          </MainContent>
          <SettingDrawer
            disableUrlParams
            enableDarkTheme
            settings={initialState?.settings}
            onSettingChange={(settings) => {
              setInitialState((preInitialState) => ({
                ...preInitialState,
                settings,
              }));
            }}
          />
        </>
      );
    },
    ...initialState?.settings,
  };
};

export async function onRouteChange({ location }) {
  console.log('App onRouteChange => getRemoteMenu');
  const menus = getRemoteMenu();
  const lastItem = getMatchMenuItem(location.pathname, menus)[0];
  if (menus === null && location.pathname !== PageEnum.LOGIN) {
    history.go(0);
  } else if (lastItem?.component === 'Layout') {
    history.back();
  }
}

export async function patchClientRoutes({ routes }) {
  console.log('App patchClientRoutes');
  patchRouteWithRemoteMenus(routes);
}

export function render(oldRender: () => void) {
  console.log('App render => getRoutersInfo');
  const token = getAccessToken();
  if (!token || token?.length === 0) {
    history.push(PageEnum.LOGIN);
    oldRender();
    return;
  }
  getRoutersInfo().then((res) => {
    setRemoteMenu(res);
    oldRender();
  });
}

export const request = { ...requestConfig };
