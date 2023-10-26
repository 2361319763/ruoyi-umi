import React, { ReactNode, useEffect, useState } from 'react';
import KeepAlive,{ AliveScope, useAliveController } from 'react-activation';
import { history } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import { getMatchMenuItem } from '@/services/session';

interface PropsInterface {
  children: ReactNode;
}
interface TabInterface {
  key: string;
  tab: string | undefined;
}

const MainContent: React.FC<PropsInterface> = (props) => {
  const { location } = history;
  const { drop } = useAliveController();
  const matchingMenuItem = getMatchMenuItem(location.pathname)[0] || null;
  const [ noCache, setNoCache ] = useState(false);
  const [ tabList, setTabList ] = useState<TabInterface[]>([]);

  useEffect(()=>{
    setNoCache(matchingMenuItem?.meta?.noCache);
    if (matchingMenuItem && tabList.findIndex(J=>J.key===location.pathname) === -1 && location.pathname!='/' && location.pathname!='/home' && matchingMenuItem?.component!='Layout') {
      setTabList([...tabList,{
        key: location.pathname,
        tab: matchingMenuItem?.name
      }])
    }
    // console.log('MainContent history', matchingMenuItem, location, history);
  },[location])

  const handleTabRemove = (key: string) => {
    const tabIndex = tabList.findIndex(J=>J.key===key);
    const newTabList = [...tabList.slice(0, tabIndex), ...tabList.slice(tabIndex + 1)];
    // console.log('handleTabRemove', key, tabIndex , newTabList, tabList);
    if(tabIndex === newTabList.length) {
      history.push(newTabList[tabIndex - 1]?.key || '/')
    } else {
      history.push(newTabList[tabIndex]?.key || '/')
    }
    drop(key);
    setTabList(newTabList);
  }

  return (
    <PageContainer
      tabList={tabList}
      tabProps={{
        type: 'editable-card',
        hideAdd: true,
        onEdit: (e, action) => {
          action=='remove' && handleTabRemove(e);
        },
        onTabClick: (key, e) => history.push(key),
      }}
      tabActiveKey={location.pathname}
    >
      <AliveScope>
        {
          !noCache && <KeepAlive cacheKey={location.pathname} name={location.pathname}>
            { props.children }
          </KeepAlive>
        }
        {
          noCache && props.children
        }
      </AliveScope>
    </PageContainer>
  )
}

export default MainContent;