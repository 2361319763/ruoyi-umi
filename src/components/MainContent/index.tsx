import React, { ReactNode, useEffect, useState } from 'react';
import KeepAlive,{ AliveScope, useAliveController } from 'react-activation';
import { history } from '@umijs/max';
import { DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Dropdown, Space } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import { getMatchMenuItem } from '@/services/session';
import Breadcrumb from "./Breadcrumb";

interface PropsInterface {
  children: ReactNode;
}
interface TabInterface {
  key: string;
  tab: string | undefined;
  meta: {
    noCache?: boolean;
  }
}

const items: MenuProps['items'] = [{
  label: (
    <Space> 刷新页面 </Space>
  ),
  key: '0',
},{
  label: (
    <Space> 关闭当前 </Space>
  ),
  key: '1',
},{
  label: (
    <Space> 关闭其他 </Space>
  ),
  key: '2',
},{
  label: (
    <Space> 全部关闭 </Space>
  ),
  key: '3',
}]

const MainContent: React.FC<PropsInterface> = (props) => {
  const { location } = history;
  const { drop, refresh } = useAliveController();
  const matchingMenuItem = getMatchMenuItem(location.pathname)[0] || null;
  const [ noCache, setNoCache ] = useState(false);
  const [ tabList, setTabList ] = useState<TabInterface[]>([]);
  const [ refreshKey, setRefreshKey ] = useState(0);

  useEffect(()=>{
    setNoCache(matchingMenuItem?.meta?.noCache ?? true);
    if (matchingMenuItem && tabList.findIndex(J=>J.key===location.pathname) === -1 && location.pathname!='/' && location.pathname!='/home' && matchingMenuItem?.component!='Layout') {
      setTabList([...tabList,{
        key: location.pathname,
        tab: matchingMenuItem?.name,
        meta: matchingMenuItem?.meta
      }])
    }
  },[location])

  const handleTabRemove = (key: string) => {
    const tabIndex = tabList.findIndex(J=>J.key===key);
    const newTabList = [...tabList.slice(0, tabIndex), ...tabList.slice(tabIndex + 1)];
    if(key == location.pathname) {
      if(tabIndex === newTabList.length) {
        history.push(newTabList[tabIndex - 1]?.key || '/')
      } else {
        history.push(newTabList[tabIndex]?.key || '/')
      }
    }
    !noCache && drop(key);
    setTabList(newTabList);
  }

  const refreshSelectedTag = (key:string) => {
    if (noCache) {
      setRefreshKey((prevKey) => prevKey + 1);
    } else {
      refresh(key);
    }
  }

  const closeOthersTags = () => {
    tabList.forEach(J=>{
      if(J.key!==location.pathname) {
        !J.meta.noCache && drop(J.key)
      }
    })
    setTabList(tabList.filter(J=>J.key===location.pathname));
  }

  const closeAllTags = () => {
    tabList.forEach(J=>{
      !J.meta.noCache && drop(J.key)
    })
    setTabList([]);
    history.push('/');
  }

  const handleMenu = (key:string) => {
    switch (key) {
      case '0':
        refreshSelectedTag(location.pathname);
        break;
      case '1':
        handleTabRemove(location.pathname);
        break;
      case '2':
        closeOthersTags();
        break;
      case '3':
        closeAllTags();
        break;
    
      default:
        break;
    }
  }

  return (
    <PageContainer
      tabList={tabList}
      tabProps={{
        type: 'editable-card',
        size: 'small',
        hideAdd: true,
        onEdit: (e, action) => {
          action=='remove' && handleTabRemove(e);
        },
        onTabClick: (key, e) => history.push(key),
      }}
      tabActiveKey={location.pathname}
      tabBarExtraContent={
        <Dropdown menu={{
          items,
          onClick: ({ key })=>{
            handleMenu(key);
          }
        }}>
          <a onClick={e=>e.preventDefault()}>
            <Space>
              更多
              <DownOutlined />
            </Space>
          </a>
        </Dropdown>
      }
      header={{
        breadcrumbRender: (props)=>{
          return( props?.breadcrumb?.items && <Breadcrumb item={props.breadcrumb.items} />)
        }
      }}
    >
      <AliveScope>
        {
          !noCache && <KeepAlive autoFreeze={false} when={true} cacheKey={location.pathname} name={location.pathname}>
            { props.children }
          </KeepAlive>
        }
        {
          noCache && <div key={refreshKey}>
            { props.children }
          </div>
        }
      </AliveScope>
    </PageContainer>
  )
}

export default MainContent;