import { getValueEnumLabel } from '@/utils/options';
import { Descriptions, Modal } from 'antd';
import React, { useEffect } from 'react';
import { DictValueEnumObj } from '@/components/DictTag';

export type JobLogFormValueType = Record<string, unknown> & Partial<API.Monitor.JobLog>;

export type JobLogFormProps = {
  onCancel: (flag?: boolean, formVals?: JobLogFormValueType) => void;
  open: boolean;
  values: Partial<API.Monitor.JobLog>;
  statusOptions: DictValueEnumObj;
  jobGroupOptions: DictValueEnumObj;
};

const JobLogDetailForm: React.FC<JobLogFormProps> = (props) => {

  const { values, statusOptions, jobGroupOptions } = props;

  useEffect(() => {
  }, []);

  const handleOk = () => {
  };
  const handleCancel = () => {
    props.onCancel();
  };
  
  return (
    <Modal
      width={640}
      title='定时任务调度日志'
      open={props.open}
      forceRender
      destroyOnClose
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <Descriptions column={24}>
        <Descriptions.Item
          span={12}
          label="任务编号"
        >
          {values.jobLogId}
        </Descriptions.Item>
        <Descriptions.Item
          span={12}
          label="执行时间"
        >
          {values.createTime?.toString()}
        </Descriptions.Item>
        <Descriptions.Item
          span={12}
          label="任务名称"
        >
          {values.jobName}
        </Descriptions.Item>
        <Descriptions.Item
          span={12}
          label="任务组名"
        >
          {getValueEnumLabel(jobGroupOptions, values.jobGroup, '无')}
        </Descriptions.Item>
        <Descriptions.Item
          span={24}
          label="调用目标"
        >
          {values.invokeTarget}
        </Descriptions.Item>
        <Descriptions.Item
          span={24}
          label="日志信息"
        >
          {values.jobMessage}
        </Descriptions.Item>
        <Descriptions.Item
          span={24}
          label="异常信息"
        >
          {values.exceptionInfo}
        </Descriptions.Item>
        <Descriptions.Item
          span={12}
          label="执行状态"
        >
          {getValueEnumLabel(statusOptions, values.status, '未知')}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default JobLogDetailForm;
