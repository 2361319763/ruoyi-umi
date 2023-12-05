import React from 'react';
import { Breadcrumb } from 'antd';

type ItemType = {
  title: string;
  component: string;
  linkPath: string;
}
type BreadcrumbIndexProps = {
  item: ItemType[]
}

const breadcrumbIndex: React.FC<BreadcrumbIndexProps> = (props) => {
  const { item } = props;
  const breadcrumbList = item.map(J=>{
    let data = {
      title:J.title,
    }
    if(J.component.indexOf('/')!=-1) {
      data.href = J.linkPath;
    }
    return data;
  })
  return (
    <Breadcrumb style={{paddingTop: "18px"}} items={breadcrumbList}></Breadcrumb>
  )
}

export default breadcrumbIndex;