import classnames from 'classnames';
import React, {
  ChangeEvent,
  CSSProperties,
  FC,
  MouseEvent,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import Empty from '../../components/empty/empty';
import { getDisplayStyle, storage } from '../../utils';
import { formateTime } from '../../utils/formatTime';
import './style.scss';
import useSlide from './useSlide';

interface todoItem {
  done: boolean;
  value: string;
  date: number;
  id: string;
  isEdit: boolean;
  isStick?: boolean;
  isFavorite: boolean;
}
type todoListFilterType = 'all' | 'completed' | 'actived' | 'favorite';
const TODO = 'todo';
const TodoList: FC = () => {
  const [todoList, setTodoList] = useState<todoItem[]>([]);
  const [todoValue, setTodoValue] = useState('');
  const [isSelectAll, setIsSelectAll] = useState(false);
  const currentIndexRef = useRef<number | null>(null);
  const [currentTodoListFilterType, setCurrentTodoListType] =
    useState<todoListFilterType>('all');
  const isContainComplete = useMemo(() => {
    return todoList.findIndex((item) => item.done);
  }, [todoList]);

  const activedTodoList = todoList.filter((item) => !item.done);

  const { handleMouseDown, handleMouseMove, handleMouseUp } = useSlide();

  useEffect(() => {
    const todo = storage.get(TODO);
    if (todo) {
      setTodoList(
        todo.map((item: todoItem) => {
          return {
            ...item,
            isEdit: false,
          };
        })
      );
    }
  }, []);

  useEffect(() => {
    document.body.addEventListener('keydown', handleBodyKeyDown);
    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.body.removeEventListener('keydown', handleBodyKeyDown);
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [todoValue, todoList]);

  const swapTodo = (oldIndex: number, newIndex: number) => {
    const copyTodoList = [...todoList];
    let temp = copyTodoList[oldIndex];
    copyTodoList[oldIndex] = copyTodoList[newIndex];
    copyTodoList[newIndex] = temp;
    return copyTodoList;
  };
  // 根据不同的todoList类型来返回不同的筛选函数
  const getFilterCallback = () => {
    if (currentTodoListFilterType === 'all') {
      return (item: todoItem) => item;
    } else if (currentTodoListFilterType === 'actived') {
      return (item: todoItem) => !item.done;
    } else if (currentTodoListFilterType === 'favorite') {
      return (item: todoItem) => item.isFavorite;
    } else {
      return (item: todoItem) => item.done;
    }
  };
  // 更新todoList某一项的编辑状态
  const changeTodoEditSate = (index: number, status: boolean = true) => {
    const copyTodoList = [...todoList];
    copyTodoList[index].isEdit = status;
    setTodoList(copyTodoList);
  };

  const setTodoListAction = (listData: todoItem[]) => {
    setTodoList(listData);
    if (listData.length) {
      storage.set(TODO, listData);
    } else {
      storage.remove(TODO);
    }
  };

  const resetDomStyle = (ev: MouseEvent) => {
    // 找到当前元素的祖先元素并更新对应的属性和样式
    const parentTarget = (ev.currentTarget as HTMLElement).parentElement
      ?.parentElement;
    parentTarget!.style.transform = 'translateX(0px)';
    parentTarget?.setAttribute('data-move-direction', 'left');
  };
  const addTodo = () => {
    if (!todoValue) return;
    let todoItem: todoItem = {
      value: todoValue,
      date: Date.now(),
      done: false,
      id: uuidv4(),
      isEdit: false,
      isStick: false,
      isFavorite: false,
    };
    setTodoListAction(todoList.concat(todoItem));
    setTodoValue('');
  };
  // 当键盘按下enter键触发, 添加一条新todo
  const handleBodyKeyDown = (ev: KeyboardEvent) => {
    if (ev.key === 'Enter') {
      addTodo();
    }
  };
  const handleBlur = () => addTodo();
  // 当文档内容区发生点击时触发
  const handleDocumentClick = (ev: globalThis.MouseEvent) => {
      console.log(1, currentIndexRef);

    if (currentIndexRef.current !== null) {

      if (!(ev.target as HTMLElement).classList.contains('edit')) {
        changeTodoEditSate(currentIndexRef.current, false);
      }
    }
    currentIndexRef.current = null;
  };
  // 点击checkbox切换对应的todo的状态是否完成
  const handleCheckBoxChange = (ev: ChangeEvent, index: number,item:todoItem) => {
    const checked = (ev.target as HTMLInputElement).checked;
    const copyTodoList = [...todoList];
    let correctIndex = index;
    // 如当前筛选类型不为所有的,则需要找到它的正确下标
    if (currentTodoListFilterType !== 'all') {
      correctIndex = todoList.findIndex((value) => value.id === item.id);
    }
    copyTodoList[correctIndex].done = checked;
    setTodoListAction(copyTodoList);
  };
  // 点击删除按钮触发=> 删除对应的todo
  const handleDestroyClick = (index: number) => {
    const copyTodoList = [...todoList];
    copyTodoList.splice(index, 1);
    setTodoListAction(copyTodoList);
  };
  // 点击全选按钮将所有todo状态进行切换
  const handleSelectAllClick = () => {
    setIsSelectAll(!isSelectAll);
    const copyTodoList = [...todoList];
    copyTodoList.forEach((item) => (item.done = !isSelectAll));
    setTodoList(copyTodoList);
    storage.set(TODO, copyTodoList);
  };
  // 双击时触发,显示更改todo内容输入框
  const handleDoubleClick = (index: number) => {
    changeTodoEditSate(index);
    currentIndexRef.current = index;
  };
  // todo内容发生更新改变时触发
  const handleUpdateTodo = (ev: ChangeEvent, index: number) => {
    const value = (ev.target as HTMLInputElement).value;
    const copyTodoList = [...todoList];
    copyTodoList[index].value = value;
    currentIndexRef.current = index;
    setTodoListAction(copyTodoList);
  };
  const handleToggleTodoListType = (type: todoListFilterType) => {
    setCurrentTodoListType(type);
  };
  const handleRemoveCompleteClick = () => {
    setTodoListAction(todoList.filter((item) => !item.done));
  };
  // 点击置顶时触发, 将todo 置于顶部或取消置顶
  const handleStickTodoClick = (ev: MouseEvent, index: number) => {
    let newTodoList: todoItem[] = [];
    const todo = todoList[index];
    if (!todo.isStick) {
      newTodoList = swapTodo(0, index);
      newTodoList.forEach((item, i) => {
        if (i === 0) {
          item.isStick = true;
        } else {
          item.isStick = false;
        }
      });
      ev.currentTarget.setAttribute('pre-index', index.toString());
    } else {
      // 取消置顶
      const oldIndex = ev.currentTarget.getAttribute('pre-index') as string;
      newTodoList = swapTodo(+oldIndex, index);
      newTodoList.forEach((item) => (item.isStick = false));
    }
    resetDomStyle(ev);
    // 动画结束更新位置
    setTimeout(() => {
      setTodoListAction(newTodoList);
    }, 100);
  };
  // 点击收藏按钮 收藏todo
  const handleFavoriteClick = (ev: MouseEvent, index: number) => {
    resetDomStyle(ev);
    // 动画结束更新位置
    setTimeout(() => {
      const copyList = [...todoList];
      copyList[index].isFavorite = !copyList[index].isFavorite;
      setTodoListAction(copyList);
    }, 100);
  };
  const renderMain = () => {
    const renderTodoList = () => {
      let filterList = todoList.filter(getFilterCallback());
      // 如果为空则显示null
      if (!filterList.length) {
        return <Empty />;
      }
      return filterList.map((item, index) => {
        const favoriteSpanClasses = classnames({
          active: item.isFavorite,
          deactivate: !item.isFavorite,
        });
        const isShowStyle: CSSProperties = {
          ...getDisplayStyle(!item.isEdit),
          textDecoration: item.done ? 'line-through' : 'none',
          color: item.done ? '#ccc' : 'black',
        };
        return (
          <li
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            key={item.id}
            data-move-direction='left'
          >
            <div className='view' data-index={index}>
              <div
                style={getDisplayStyle(item.isFavorite)}
                className='favorite'
              >
                <span className={favoriteSpanClasses}> ◤</span>
              </div>
              <input
                onChange={(ev) => handleCheckBoxChange(ev, index, item)}
                className='toggle'
                type='checkbox'
                checked={item.done}
              />
              <label onDoubleClick={() => handleDoubleClick(index)}>
                <span style={isShowStyle} className='truncate'>
                  {item.value}
                </span>
                <span style={isShowStyle} className='date'>
                  {formateTime(item.date)}
                </span>
                <input
                  className='edit'
                  style={getDisplayStyle(item.isEdit)}
                  onChange={(ev) => handleUpdateTodo(ev, index)}
                  value={item.value}
                />
              </label>
              {!item.isEdit && (
                <button
                onClick={() => handleDestroyClick(index)}
                className='destroy'
                />
              )}
            </div>
            <div className='slideMenu'>
              <p onClick={(ev) => handleStickTodoClick(ev, index)}>
                {item.isStick ? '取消置顶' : '置顶'}
              </p>
              <p onClick={(ev) => handleFavoriteClick(ev, index)}>
                {item.isFavorite ? '取消收藏' : '收藏'}
              </p>
            </div>
          </li>
        );
      });
    };
    return (
      <section className="main">
        <input
          onClick={handleSelectAllClick}
          id="toggle-all"
          className="toggle-all"
          type="checkbox"
        />
        <label htmlFor="toggle-all">将所有标记为完整</label>
        <ul className="todo-list">{renderTodoList()}</ul>
      </section>
    );
  };
  const renderFooter = () => {
    const classes = {
      all: classnames({ selected: currentTodoListFilterType === 'all' }),
      actived: classnames({
        selected: currentTodoListFilterType === 'actived',
      }),
      completed: classnames({
        selected: currentTodoListFilterType === 'completed',
      }),
      favorite: classnames({
        selected: currentTodoListFilterType === 'favorite',
      }),
    };
    const filters = [
      { text: '所有的', type: 'all', classes: classes.all },
      { text: '正在活跃的', type: 'actived', classes: classes.actived },
      { text: '已经完成', type: 'completed', classes: classes.completed },
      { text: '收藏', type: 'favorite', classes: classes.favorite },
    ];
    const renderFilterList = () => {
      return filters.map((item) => {
        return (
          <li key={item.type}>
            <a
              onClick={() =>
                handleToggleTodoListType(item.type as todoListFilterType)
              }
              className={item.classes}
            >
              {item.text}
            </a>
          </li>
        );
      });
    };
    return (
      <footer className="footer">
        <span className="todo-count">
          <strong>{activedTodoList.length}</strong> 剩余项目
        </span>
        <ul className="filters">{renderFilterList()}</ul>
        <button
          style={{ display: isContainComplete !== -1 ? 'block' : 'none' }}
          className="clear-completed"
          onClick={handleRemoveCompleteClick}
        >
          清除 已经完成
        </button>
      </footer>
    );
  };
  return (
    <div className="center">
      <section className="todoapp">
        <header className="header">
          <h1>任务列表清单</h1>
          <input
            value={todoValue}
            className="new-todo"
            placeholder="今天做什么?"
            autoFocus
            onBlur={handleBlur}
            onChange={(ev) => setTodoValue(ev.target.value)}
          />
        </header>
        {todoList.length ? renderMain() : null}
        {todoList.length ? renderFooter() : null}
      </section>
    </div>
  );
};

export default TodoList;
