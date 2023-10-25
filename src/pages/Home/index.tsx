import Guide from '@/components/Guide';
import { useModel } from '@umijs/max';
import styles from './index.less';

const HomePage: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  console.log(initialState);

  return (
    <div>
      <div className={styles.container}>
        <Guide name={initialState?.currentUser?.nickName ?? ''} />
      </div>
    </div>
  );
};

export default HomePage;
