import React from 'react';
import { Descriptions, Modal } from 'antd';
import { DictValueEnumObj } from '@/components/DictTag';
import { getValueEnumLabel } from '@/utils/options';

export type OperlogFormData = Record<string, unknown> & Partial<API.Monitor.Operlog>;

export type OperlogFormProps = {
  onCancel: (flag?: boolean, formVals?: OperlogFormData) => void;
  onSubmit: (values: OperlogFormData) => Promise<void>;
  open: boolean;
  values: Partial<API.Monitor.Operlog>;
  businessTypeOptions: DictValueEnumObj;
  operatorTypeOptions: DictValueEnumObj;
  statusOptions: DictValueEnumObj;
};

const OperlogDetailForm: React.FC<OperlogFormProps> = (props) => {

  const { values, businessTypeOptions, operatorTypeOptions, statusOptions, } = props;

  const handleOk = () => {
    console.log("handle ok");
  };
  const handleCancel = () => {
    props.onCancel();
  };

  return (
    <Modal
      width={640}
      title='编辑操作日志记录'
      open={props.open}
      destroyOnClose
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <Descriptions column={24}>
        <Descriptions.Item
          span={12}
          label="操作模块"
        >
          {`${values.title}/${getValueEnumLabel(businessTypeOptions, values.businessType)}`}
        </Descriptions.Item>
        <Descriptions.Item
          span={12}
          label="请求方式"
        >
          {values.requestMethod}
        </Descriptions.Item>
        <Descriptions.Item
          span={12}
          label="操作人员"
        >
          {`${values.operName}/${values.operIp}`}
        </Descriptions.Item>
        <Descriptions.Item
          span={12}
          label="操作类别"
        >
          {getValueEnumLabel(operatorTypeOptions, values.operatorType)}
        </Descriptions.Item>
        <Descriptions.Item
          span={24}
          label="方法名称"
        >
          {values.method}
        </Descriptions.Item>
        <Descriptions.Item
          span={24}
          label="请求URL"
        >
          {values.operUrl}
        </Descriptions.Item>
        <Descriptions.Item
          span={24}
          label="请求参数"
        >
          {values.operParam}
        </Descriptions.Item>
        <Descriptions.Item
          span={24}
          label="返回参数"
        >
          {values.jsonResult}
        </Descriptions.Item>
        <Descriptions.Item
          span={24}
          label="错误消息"
        >
          {values.errorMsg}
        </Descriptions.Item>
        <Descriptions.Item
          span={12}
          label="操作状态"
        >
          {getValueEnumLabel(statusOptions, values.status)}
        </Descriptions.Item>
        <Descriptions.Item
          span={12}
          label="操作时间"
        >
          {values.operTime?.toString()}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default OperlogDetailForm;
