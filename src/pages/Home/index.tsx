import Guide from '@/components/Guide';
import { PageContainer } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import styles from './index.less';

const HomePage: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  console.log(initialState);

  return (
    <PageContainer ghost>
      <div className={styles.container}>
        <Guide name={initialState?.currentUser?.nickName ?? ''} />
      </div>
    </PageContainer>
  );
};

export default HomePage;
