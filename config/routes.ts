export default [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '*',
    layout: false,
    component: './404',
  },
  {
    name: 'login',
    path: '/login',
    layout: false,
    component: './Login',
  },
  {
    name: '首页',
    path: '/home',
    component: './Home',
  },
  {
    path: '/account',
    routes: [
      {
        name: 'acenter',
        path: '/account/center',
        component: './User/Center',
      },
      {
        name: 'asettings',
        path: '/account/settings',
        component: './User/Settings',
      },
    ],
  },
  {
    name: '系统管理',
    path: '/system',
    routes: [
      {
        name: '字典数据',
        path: '/system/dict-data/index/:id',
        component: './System/DictData',
      },
      {
        name: '分配用户',
        path: '/system/role-auth/user/:id',
        component: './System/Role/authUser',
      },
    ],
  },
  {
    name: 'monitor',
    path: '/monitor',
    routes: [
      {
        name: '任务日志',
        path: '/monitor/job-log/index/:id',
        component: './Monitor/JobLog',
      },
    ],
  },
  {
    name: 'tool',
    path: '/tool',
    routes: [
      {
        name: '导入表',
        path: '/tool/gen/import',
        component: './Tool/Gen/import',
      },
      {
        name: '编辑表',
        path: '/tool/gen/edit',
        component: './Tool/Gen/edit',
      },
    ],
  },
];
