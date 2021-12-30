import { MouseEvent } from 'react';

type direction = 'left' | 'right';
export default function useSlide(threshold = 60) {
  let mousePosition = { x: 0, y: 0 }; //保存鼠标按下的坐标
  let diffMoveY: number = 0;
  let diffMoveX: number = 0;
  let isClick = false; // 是否在元素上点击
  let isMoveSuccess = false; // 是否移动成功;
  const maxMoveDistance = 210;
  const thresholdDistance = threshold;
  let prevTargetElement: HTMLElement | null = null;// 保存上一个滑动元素的DOM引用

  const handleMouseDown = (ev: MouseEvent) => {
    isClick = true;
    mousePosition.x = ev.clientX;
    mousePosition.y = ev.clientY;
  };

  const handleMouseMove = (ev: MouseEvent) => {
    if (!isClick) return false;
    diffMoveX = ev.clientX - mousePosition.x;
    diffMoveY = ev.clientY - mousePosition.y;
    // 如果存在上一个dom元素已经滚动过了,则重置它的style 并将其归位
    if (prevTargetElement && prevTargetElement !== ev.currentTarget) {
      setDirection(ev, 'left', prevTargetElement);
      moveDom(prevTargetElement, 0);
      prevTargetElement = null;
    }
    const direction = getDirection(ev);
    // 左滑
    if (diffMoveX < 0 && direction === 'left') {
      handleMove(
        ev.currentTarget as HTMLElement,
        'right',
        -maxMoveDistance,
        ev
      );
    }
    // 右滑
    if (diffMoveX > 0 && direction === 'right') {
      handleMove(ev.currentTarget as HTMLElement, 'left', 0, ev);
    }
  };

  const handleMouseUp = (ev: MouseEvent) => {
    if (!isClick) return;
    const isWhether = Math.abs(diffMoveX) < thresholdDistance && !isMoveSuccess;
    isMoveSuccess = false;
    isClick = false; //鼠标抬起后赋值为false
    const direction = getDirection(ev);
    prevTargetElement = ev.currentTarget as HTMLElement;
    // 如果结束滑动时移动距离不满足条件则回弹
    if (isWhether && direction === 'left') {
      moveDom(ev.currentTarget as HTMLElement, 0);
    }
    if (isWhether && direction === 'right') {
      moveDom(ev.currentTarget as HTMLElement, -maxMoveDistance);
    }
  };

  const handleMove = (
    target: HTMLElement,
    nextDirection: direction,
    successDistance: number,
    ev: MouseEvent
  ) => {
    // 如果移动距离小于阈值 则移动dom, 否者固定DOM元素
    if (Math.abs(diffMoveX) < thresholdDistance) {
      let moveX = diffMoveX;

      // 如果nextDirection为left, 说明此时进行的时右滑操作 此时需要计算滑动的距离
      if (nextDirection === 'left') {
        const matchTransform = target.style.transform.match(
          /translateX\((-?\d+)px\)/
        );

        if (matchTransform) {
          const translateX = +matchTransform[1];
          if (translateX < 0) {
            moveX = translateX + Math.abs(diffMoveX);
          }
        }
      }
      moveDom(target, moveX, false);
    } else {
      moveDom(target, successDistance);
      isMoveSuccess = true;
      setDirection(ev, nextDirection);
    }
  };

  const moveDom = (
    target: HTMLElement,
    moveX: number,
    isSetTransition: boolean = true
  ) => {
    if (isSetTransition) {
      target.style.transition = 'transform 0.1s ease-in';
    } else {
      target.style.transition = 'none';
    }

    if (moveX < 0) {
      moveX = Math.abs(moveX);
      target.style.transform = `translateX(-${moveX}px)`;
    } else {
      target.style.transform = `translateX(${moveX}px)`;
    }
  };

  const getDirection = (ev: MouseEvent) => {
    return (ev.currentTarget as HTMLElement).getAttribute(
      'data-move-direction'
    ) as direction;
  };

  const setDirection = (
    ev: MouseEvent,
    direction: direction,
    ele?: HTMLElement
  ) => {
    if (ele) {
      return ele.setAttribute('data-move-direction', direction);
    }
    return (ev.currentTarget as HTMLElement).setAttribute(
      'data-move-direction',
      direction
    );
  };
  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}
