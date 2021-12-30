import {Select, Space} from 'antd';
import React, {
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import hoverImg from './hover.png';
import './style.scss';
const cellSize = 30; // 单元格大小
const padding = 30; // 棋盘内边距
const themeColor = '#FAFAFA';
const borderColor = '#B2B2B2';
import white from './img/white.png';
import black from './img/black.png';
interface cellItem {
  positionX: number;
  positionY: number;
  position_x_y: number;
  position_y_x: number;
  value: chessValue;
}

type chessValue = 'white' | 'black' | null;
const Renju = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [row, setRow] = useState(15);
  const [col, setCol] = useState(15);
  const [cellInfoList, setCellInfoList] = useState<cellItem[][]>([]);
  let [nextChess, setNextChess] = useState<'white' | 'black'>('black');
  let prevMovePosition = {x: 0, y: 0};
  const canvasSize = useMemo(() => {
    return {
      width: cellSize * row + padding * 2,
      height: cellSize * col + padding * 2,
    };
  }, [row, col]);

  const getCtx = useCallback(() => {
    return canvasRef?.current?.getContext('2d') as CanvasRenderingContext2D;
  }, [canvasRef]);

  useEffect(() => {
    drawStage(getCtx());
  }, [canvasRef]);

  useEffect(() => {

    drawStage(getCtx(), true);
  }, [row, col]);
  const strokeLine = (
    ctx: CanvasRenderingContext2D,
    index: number,
    isRow: boolean
  ) => {
    ctx.beginPath();
    const paddingSize = padding + 0.5;
    if (isRow) {
      ctx.moveTo(cellSize * index + paddingSize, padding);
      ctx.lineTo(cellSize * index + paddingSize, canvasSize.height - padding);
    } else {
      ctx.moveTo(padding, cellSize * index + paddingSize);
      ctx.lineTo(canvasSize.width - padding, cellSize * index + paddingSize);
    }
    ctx.stroke();
  };
  const initData = () => {
    let list: cellItem[][] = [];
    for (let r = 0; r < row + 1; r++) {
      let data = [];
      for (let c = 0; c < col + 1; c++) {
        let item = {
          positionX: r,
          positionY: c,
          value: null,
          position_x_y: r - c,
          position_y_x: r + c,
        };
        data.push(item);
      }
      list.push(data);
    }
    setCellInfoList(list);
  };
  const getClickTargetPosition = (ev: MouseEvent) => {
    const {offsetX, offsetY} = ev.nativeEvent;
    let x = Math.floor(offsetX / cellSize);
    let y = Math.floor(offsetY / cellSize);
    return [x, y];
  };
  const drawStage = (
    ctx: CanvasRenderingContext2D,
    isRefresh: boolean = false
  ) => {
    console.log('drag')
    ctx.strokeStyle = 'transparent';
    ctx.fillStyle = themeColor;
    ctx.strokeRect(0, 0, canvasSize.width, canvasSize.height);
    const paddingSize = padding * 2;
    ctx.fillRect(
      padding,
      padding,
      canvasSize.width - paddingSize,
      canvasSize.height - paddingSize
    );
    ctx.strokeStyle = borderColor;
    ctx.strokeRect(
      padding,
      padding,
      canvasSize.width - paddingSize,
      canvasSize.height - paddingSize
    );
    // row
    for (let i = 1; i < row; i++) {
      strokeLine(ctx, i, true);
    }
    // col
    for (let j = 1; j < col; j++) {
      strokeLine(ctx, j, false);
    }

    if (!cellInfoList.length || isRefresh) {
      initData();
    } else {
      cellInfoList.flat().forEach((item, index) => {
        const {positionX, positionY, value} = item;
        if (value) {
          // drawChess(positionX, positionY, value);
        }
      });
    }
  };
  const handleClick = (ev: MouseEvent) => {
    let [x, y] = getClickTargetPosition(ev);
    if (validatePosition(x, y)) {
      const data = cellInfoList[x][y];
      if (!data.value) {
        drawToggleChess(getCtx(), x, y);
      }
    }
  };
  // 边界值限定
  const validatePosition = (x: number, y: number) => {
    return x >= 0 && x <= row && y >= 0 && y <= col;
  };
  const handleMouseMove = (ev: MouseEvent) => {
    let [x, y] = getClickTargetPosition(ev);
    if (validatePosition(x, y) && cellInfoList.length) {
      if (cellInfoList[x][y].value) return;
      const centerX = x === 0 ? cellSize / 2 : x * cellSize + cellSize / 2;
      const centerY = y === 0 ? cellSize / 2 : y * cellSize + cellSize / 2;
      const ctx = getCtx();
      // //清空上一次的画布
      (canvasRef.current as HTMLCanvasElement).width = canvasSize.width;
      (canvasRef.current as HTMLCanvasElement).height = canvasSize.height;
      drawStage(ctx);

      const img = new Image();
      img.src = hoverImg;
      ctx.drawImage(img, centerX, centerY, cellSize, cellSize);
      prevMovePosition = {x: centerX, y: centerY};
    }
  };
  const drawToggleChess = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number
  ) => {
    const centerX = x === 0 ? padding : x * cellSize + padding;
    const centerY = y === 0 ? padding : y * cellSize + padding;
    ctx.beginPath();
    let copyList = [...cellInfoList];
    if (nextChess === 'black') {
      ctx.fillStyle = 'black';
      setNextChess('white');
      copyList[x][y].value = 'black';
    } else {
      
      ctx.fillStyle = '#D5D5D5';
      setNextChess('black');
      copyList[x][y].value = 'white';
    }
    ctx.arc(centerX, centerY, cellSize / 2.5, 0, 2 * Math.PI);
    ctx.fill();

    setCellInfoList(copyList);
  };
  const drawChess = (x: number, y: number, value: 'white' | 'black') => {
    const ctx = getCtx();
    const centerX = x === 0 ? padding : x * cellSize + padding;
    const centerY = y === 0 ? padding : y * cellSize + padding;
    const image = new Image();
    if (value === 'black') {
      image.src = black
      ctx.fillStyle = 'black';
    } else {
      ctx.fillStyle = '#D5D5D5';
      image.src = white
    }
    console.log(image)
    ctx.beginPath();
    ctx.arc(centerX, centerY, cellSize / 2.5, 0, 2 * Math.PI);
    ctx.fill();
  };
  return (
    <div className="center">
      <div className="renju">
        <div className="center" style={{height: '100%'}}>
          <Space direction="horizontal" style={{marginBottom: '10px'}}>
            <Select
              defaultValue={row}
              placeholder="选择row"
              style={{width: 80}}
              onChange={(value) => setRow(+value)}
            >
              {['8', '9', '10', '11', '12', '13', '14', '15', '16'].map(
                (item, index) => {
                  return (
                    <Select.Option key={item} value={item}>
                      {item}
                    </Select.Option>
                  );
                }
              )}
            </Select>

            <Select
              defaultValue={col}
              placeholder="选择col"
              style={{width: 80}}
              onChange={(value) => setCol(+value)}
            >
              {['8', '9', '10', '11', '12', '13', '14', '15', '16'].map(
                (item, index) => {
                  return (
                    <Select.Option key={item} value={item}>
                      {item}
                    </Select.Option>
                  );
                }
              )}
            </Select>
          </Space>
        </div>
        <canvas
          onMouseMove={handleMouseMove}
          onClick={handleClick}
          {...canvasSize}
          ref={canvasRef}
        />
      </div>
    </div>
  );
};
export default Renju;
