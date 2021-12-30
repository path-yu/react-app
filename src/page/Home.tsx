import React, { CSSProperties, FC } from 'react';
import { Link, useHistory } from 'react-router-dom';
interface IHomeProps {
  title?: string;
}
const style: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  height: '100vh',
  width: '400px',
  alignItems: 'center',
};
const Home: FC<IHomeProps> = ({ title }) => {
  const history = useHistory();
  return (
    <div className="center">
      <div className="Home" style={style}>
        <Link to="/task">任务拖拽演示</Link>
        <Link to="/todoList">todoList任务清单</Link>
        <Link to="calculator">简单计算器</Link>
        <Link to="renju">五子棋</Link>
      </div>
    </div>
  );
};
Home.defaultProps = {
  title: 'Start App',
};
export default Home;
