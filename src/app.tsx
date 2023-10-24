import { SettingDrawer } from '@ant-design/pro-components';
import type { RunTimeLayoutConfig } from '@umijs/max';
import { history } from '@umijs/max';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import Footer from '@/components/Footer';
import RightContent from '@/components/RightContent';
import defaultSettings from '../config/defaultSettings';
import requestConfig from '@/utils/request';
import { getRemoteMenu, getRoutersInfo, getUserInfo, patchRouteWithRemoteMenus, setRemoteMenu, getMatchMenuItem } from '@/services/session';
import { PageEnum } from './enums/pagesEnums';
import { getAccessToken } from "@/utils/auth";

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

export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  return {
    rightContentRender: () => <RightContent />,
    menu: {
      locale: false,
      params: {
        userId: initialState?.currentUser?.userId,
      },
      request: async () => {
        if (!initialState?.currentUser?.userId) {
          return [];
        }
        return getRemoteMenu();
      },
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
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
          {children}
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
  const menus = getRemoteMenu();
  const lastItem = getMatchMenuItem(location.pathname,menus)[0];
  console.log(lastItem);
  if(menus === null && location.pathname !== PageEnum.LOGIN) {
    history.go(0);
  } else if (lastItem.component == "Layout") {
    history.back();
  }
}

export async function patchClientRoutes({ routes }) {
  patchRouteWithRemoteMenus(routes);
}

export function render(oldRender: () => void) {
  const token = getAccessToken();
  if(!token || token?.length === 0) {
    oldRender();
    return;
  }
  getRoutersInfo().then(res => {
    setRemoteMenu(res);
    oldRender();
  });
};

export const request = {...requestConfig};