import React, { CSSProperties, DragEvent, FC, ReactElement } from 'react';
import { TaskItem, TaskStatus } from './Task';

interface ITaskItemProps {
  title: string;
  index: number;
  showAdd?: boolean;
  activeStyle: CSSProperties;
  dataStatus: TaskStatus;
  taskItem: TaskItem;
  handleDragEnter: (e: DragEvent, status: TaskStatus) => void;
  handleDragLeave: (e: DragEvent, status: TaskStatus) => void;
  handleDrop: handleDropCallBackType;
  renderTaskList: (target: TaskItem, status: TaskStatus) => ReactElement[];
  addTask?: () => void;
}
export type handleDropCallBackType = (status: TaskStatus, e: DragEvent) => void;
const TaskItemFc: FC<ITaskItemProps> = (props: ITaskItemProps) => {
  const {
    title,
    index,
    showAdd,
    activeStyle,
    dataStatus,
    taskItem,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    renderTaskList,
    addTask,
  } = props;
  return (
    <div
      className="taskItem"
      style={activeStyle}
      onDragEnter={(e: DragEvent) => handleDragEnter(e, dataStatus)}
      onDragLeave={(e: DragEvent) => handleDragLeave(e, dataStatus)}
      data-status={dataStatus}
      onDragOver={(ev) => {
        ev.preventDefault();
      }}
      onDrop={(e: DragEvent) => handleDrop(dataStatus, e)}
    >
      <p className={`item-${index}`}>{title}</p>
      <div className={`item-${index} context-${index}`}>
        <div className="inputList">{renderTaskList(taskItem, dataStatus)}</div>
        {showAdd && (
          <div className="add" onClick={addTask}>
            <span>+</span>
          </div>
        )}
      </div>
    </div>
  );
};
TaskItemFc.defaultProps = {
  addTask: () => {},
  showAdd: false,
};
export default TaskItemFc;
