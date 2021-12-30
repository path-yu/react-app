import React, { ChangeEvent, DragEvent, FC, useRef, useState } from 'react';
import { CSSTransition } from 'react-transition-group';
import { v4 as uuidv4 } from 'uuid';
import TaskItemFc from './TaskItem';
import './_style.scss';
export type TaskStatus = 'Prepare' | 'Learning' | 'Complete';
type TaskList = Array<TaskListItem>;
export enum TaskStatusEnum {
  'Prepare' = 'Prepare',
  'Learning' = 'Learning',
  'Complete' = 'Complete',
}
interface TaskListItem {
  value: string;
  id: string;
  status: TaskStatus;
  showDeleteIcon?: boolean;
  show: boolean;
}
interface CurrantDrag extends TaskListItem {
  index: number;
}
export interface TaskItem {
  list: TaskList;
  isActive: boolean;
  status: TaskStatus;
}
type setAction = React.Dispatch<React.SetStateAction<TaskItem>>;
const Task: FC = () => {
  const [prepareTaskItem, setPrepareTaskItem] = useState<TaskItem>({
    isActive: false,
    status: 'Prepare',
    list: [],
  });
  const [learningTaskItem, setLearningTaskItem] = useState<TaskItem>({
    isActive: false,
    status: 'Learning',
    list: [],
  });
  const [completeTaskItem, setCompleteTaskItem] = useState<TaskItem>({
    isActive: false,
    status: 'Complete',
    list: [],
  });
  const addTask = () => {
    let id = uuidv4();
    let item: TaskListItem = {
      value: '',
      id,
      status: 'Prepare',
      showDeleteIcon: false,
      show: false,
    };
    addTaskItem(item, TaskStatusEnum.Prepare);
  };
  const addTaskItem = (item: TaskListItem, status: TaskStatus) => {
    const { setState, data } = getSetAction(status);
    let timer: any;
    setState({
      ...data,
      list: data.list.concat(item),
    });
    clearTimeout(timer);
    timer = setTimeout(() => {
      setState((pre) => {
        return {
          ...pre,
          list: pre.list.map((item) => ({ ...item, show: true })),
        };
      });
    });
  };
  const handleChange = (
    e: ChangeEvent,
    index: number,
    item: TaskItem,
    status: TaskStatus
  ) => {
    const value = (e.target as HTMLInputElement).value;
    let copy = { ...item };
    copy.list[index].value = value;
    const { setState } = getSetAction(status);
    setState(copy);
  };
  const dragIsSuccess = useRef(false);
  const currentDragItem = useRef<CurrantDrag>({
    value: '',
    id: '0',
    status: 'Prepare',
    show: false,
    index: 0,
  });
  const activeStyle = {
    Prepare: {
      borderColor: prepareTaskItem.isActive ? 'blue' : 'transparent',
    },
    Learning: {
      borderColor: learningTaskItem.isActive ? 'blue' : 'transparent',
    },
    Complete: {
      borderColor: completeTaskItem.isActive ? 'blue' : 'transparent',
    },
  };
  const changeActive = (active: boolean, status: TaskStatus, e: DragEvent) => {
    const { setState, data } = getSetAction(status);
    if (active !== data.isActive) {
      setState((pre) => {
        return {
          ...pre,
          isActive: active,
        };
      });
    }
  };
  // 目标元素触发的钩子
  const handleDragEnter = (e: DragEvent, status: TaskStatus) => {
    if (getStatus(e) !== currentDragItem.current.status) {
      changeActive(true, status, e);
    }
  };
  const getStatus = (e: DragEvent | ChangeEvent) => {
    const currentTarget = e.currentTarget as HTMLElement;
    return currentTarget.getAttribute('data-status') as TaskStatus;
  };

  const getSetAction = (status: TaskStatus) => {
    if (status === TaskStatusEnum.Prepare) {
      return { setState: setPrepareTaskItem, data: prepareTaskItem };
    } else if (status === TaskStatusEnum.Learning) {
      return { setState: setLearningTaskItem, data: learningTaskItem };
    } else {
      return { setState: setCompleteTaskItem, data: completeTaskItem };
    }
  };
  const handleDragLeave = (e: DragEvent, status: TaskStatus) => {
    if (status !== currentDragItem.current.status) {
      changeActive(false, status, e);
    }
  };
  const getCurrentDragTaskItem = () => {
    return {
      value: currentDragItem.current?.value,
      id: currentDragItem.current?.id,
      status: currentDragItem.current?.status,
      showDeleteIcon: currentDragItem.current?.showDeleteIcon,
      show: currentDragItem.current?.show,
    };
  };
  const handleDrop = (status: TaskStatus, e: DragEvent) => {
    let item: TaskListItem = getCurrentDragTaskItem();
    const { setState, data } = getSetAction(status);
    let isContain = data.list.find((val) => val.id === item.id);
    item.status = status;
    if (!isContain) {
      item.show = true;
      item.showDeleteIcon = false;

      setState({
        isActive: false,
        list: data.list.concat(item),
        status,
      });
      dragIsSuccess.current = true;
    } else {
      setState({
        ...data,
        isActive: false,
      });
    }
    handleDragSwap(e, status);
  };
  // 拖拽元素触发的钩子
  const handleDragStart = (item: TaskListItem, index: number) => {
    currentDragItem.current!.id = item.id;
    currentDragItem.current!.value = item.value;
    currentDragItem.current!.status = item.status;
    currentDragItem.current!.showDeleteIcon = item.showDeleteIcon;
    currentDragItem.current!.index = index;
  };
  const handleDragend = (
    target: TaskListItem,
    list: TaskList,
    status: TaskStatus
  ) => {
    // 如果拖拽成功 则删除源数据
    if (dragIsSuccess.current) {
      let currentDragItem = getCurrentDragTaskItem();
      let cloneList = list.slice();
      let index = list.findIndex((val) => val.id === currentDragItem.id);
      cloneList.splice(index, 1);
      const { setState, data } = getSetAction(status);
      setState({
        ...data,
        list: cloneList,
      });
      dragIsSuccess.current = false;
    }
  };
  const handleMouseEnter = (status: TaskStatus, index: number) => {
    changeTaskItemShowDeleteIcon(true, index, status);
  };
  const handleDragSwap = (e: DragEvent, status: TaskStatus) => {
    const target = e.target as HTMLInputElement;
    if (target.nodeName == 'INPUT') {
      let index: string | null | number = target.getAttribute('data-index');
      if (index) {
        index = +index;
        if (index !== currentDragItem.current.index) {
          const { setState, data } = getSetAction(status);
          taskItemListSwap(
            setState,
            data,
            currentDragItem.current.index,
            index
          );
        }
      }
    }
  };
  const taskItemListSwap = (
    setAction: setAction,
    data: TaskItem,
    oldIndex: number,
    newIndex: number
  ) => {
    const copyList = [...data.list];
    [copyList[oldIndex], copyList[newIndex]] = [
      copyList[newIndex],
      copyList[oldIndex],
    ];
    setAction({
      ...data,
      list: copyList,
    });
  };
  const handleMouseLeave = (status: TaskStatus, index: number) => {
    changeTaskItemShowDeleteIcon(false, index, status);
  };
  const changeTaskItemShowDeleteIcon = (
    show: boolean,
    index: number,
    status: TaskStatus
  ) => {
    const { data, setState } = getSetAction(status);
    const copy = { ...data };
    copy.list[index].showDeleteIcon = show;
    setState(copy);
  };
  const handleDeleteIconClick = (status: TaskStatus, index: number) => {
    const { data, setState } = getSetAction(status);
    const copy = { ...data };
    copy.list[index].show = false;
    setState(copy);
  };
  // 动画结束清删除数据
  const handleAnimateEnter = (status: TaskStatus, index: number) => {
    const { data, setState } = getSetAction(status);
    const copy = { ...data };
    copy.list.splice(index, 1);
    setState(copy);
  };

  const renderTaskList = (target: TaskItem, status: TaskStatus) => {
    return target.list.map((item, index) => {
      return (
        <CSSTransition
          unmountOnExit={true}
          timeout={300}
          classNames="fade"
          in={item.show}
          onExited={() => handleAnimateEnter(status, index)}
          key={item.id}
        >
          <div
            onMouseEnter={() => handleMouseEnter(status, index)}
            onMouseLeave={() => handleMouseLeave(status, index)}
          >
            <input
              draggable
              data-status={status}
              data-index={index}
              onDragStart={(e: DragEvent) => handleDragStart(item, index)}
              onDragEnd={() => handleDragend(item, target.list, status)}
              onChange={(e: ChangeEvent) =>
                handleChange(e, index, target, status)
              }
              value={item.value}
              type="text"
            />
            <span
              onClick={() => handleDeleteIconClick(status, index)}
              style={{ display: item.showDeleteIcon ? 'block' : 'none' }}
            >
              <i className="icon-qingchu iconfont" />
            </span>
          </div>
        </CSSTransition>
      );
    });
  };
  const commonProps = {
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    renderTaskList,
  };
  return (
    <div className="center">
      <div className="task">
        {/* Prepare study*/}
        <TaskItemFc
          title="Prepare study"
          dataStatus={TaskStatusEnum.Prepare}
          activeStyle={activeStyle.Prepare}
          {...commonProps}
          taskItem={prepareTaskItem}
          index={1}
          showAdd={true}
          addTask={addTask}
        />
        {/* learning */}
        <TaskItemFc
          title="learning"
          dataStatus={TaskStatusEnum.Learning}
          activeStyle={activeStyle.Learning}
          {...commonProps}
          taskItem={learningTaskItem}
          index={2}
        />
        {/* Complete */}
        <TaskItemFc
          title="Complete"
          dataStatus={TaskStatusEnum.Complete}
          activeStyle={activeStyle.Complete}
          {...commonProps}
          taskItem={completeTaskItem}
          index={3}
        />
      </div>
    </div>
  );
};

export default Task;
