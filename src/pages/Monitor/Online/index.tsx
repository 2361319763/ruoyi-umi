import type { FormInstance } from 'antd';
import { Button, message, Modal } from 'antd';
import React, { useRef, useEffect } from 'react';
import { useAccess } from '@umijs/max';
import { getOnlineUserList, forceLogout } from '@/services/monitor/online';
import { ActionType, ProColumns, ProTable, PageContainer } from '@ant-design/pro-components';
import { DeleteOutlined } from '@ant-design/icons';


const handleForceLogout = async (selectedRow: API.Monitor.OnlineUserType) => {
  const hide = message.loading('正在强制下线');
  try {
    await forceLogout(selectedRow.tokenId);
    hide();
    message.success('强制下线成功，即将刷新');
    return true;
  } catch (error) {
    hide();
    message.error('强制下线失败，请重试');
    return false;
  }
};

const OnlineUserTableList: React.FC = () => {
  const formTableRef = useRef<FormInstance>();
  const actionRef = useRef<ActionType>();
  const access = useAccess();

  useEffect(() => {}, []);

  const columns: ProColumns<API.Monitor.OnlineUserType>[] = [
    {
      title: "会话编号",
      dataIndex: 'tokenId',
      valueType: 'text',
      hideInSearch: true,
    },
    {
      title: "用户账号",
      dataIndex: 'userName',
      valueType: 'text',
    },
    {
      title: "部门名称",
      dataIndex: 'deptName',
      valueType: 'text',
      hideInSearch: true,
    },
    {
      title: "登录IP地址",
      dataIndex: 'ipaddr',
      valueType: 'text',
    },
    {
      title: "登录地点",
      dataIndex: 'loginLocation',
      valueType: 'text',
      hideInSearch: true,
    },
    {
      title: "浏览器类型",
      dataIndex: 'browser',
      valueType: 'text',
      hideInSearch: true,
    },
    {
      title: "操作系统",
      dataIndex: 'os',
      valueType: 'text',
      hideInSearch: true,
    },
    {
      title: "登录时间",
      dataIndex: 'loginTime',
      valueType: 'dateRange',
      render: (_, record) => <span>{record.loginTime}</span>,
      hideInSearch: true,
      search: {
        transform: (value) => {
          return {
            'params[beginTime]': value[0],
            'params[endTime]': value[1],
          };
        },
      },
    },
    {
      title: "操作",
      dataIndex: 'option',
      width: '60px',
      valueType: 'option',
      render: (_, record) => [
        <Button
          type="link"
          size="small"
          danger
          key="batchRemove"
          icon=<DeleteOutlined />
          hidden={!access.hasPerms('monitor:online:forceLogout')}
          onClick={async () => {
            Modal.confirm({
              title: '强踢',
              content: '确定强制将该用户踢下线吗？',
              okText: '确认',
              cancelText: '取消',
              onOk: async () => {
                const success = await handleForceLogout(record);
                if (success) {
                  if (actionRef.current) {
                    actionRef.current.reload();
                  }
                }
              },
            });
          }}
        >
          强退
        </Button>,
      ],
    },
  ];

  return (
      <PageContainer>
        <ProTable<API.Monitor.OnlineUserType>
          headerTitle='信息'
          actionRef={actionRef}
          formRef={formTableRef}
          rowKey="tokenId"
          key="logininforList"
          search={{
            labelWidth: 120,
          }}
          request={(params) =>
            getOnlineUserList({ ...params } as API.Monitor.OnlineUserListParams).then((res) => {
              const result = {
                data: res.rows,
                total: res.total,
                success: true,
              };
              return result;
            })
          }
          columns={columns}
        />
      </PageContainer>
  );
};

export default OnlineUserTableList;
