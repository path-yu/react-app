import classNames from 'classnames';
import { log } from 'console';
import React, { FC, useEffect, useRef, useState } from 'react';
import './style.scss';
interface CalculatorProps {}

type calculatorType = number | operator | 'AC';

interface InputLineListItem {
  is_color_orange: boolean;
  is_bg_pale: boolean;
  value: calculatorType;
}

type operator =
  | '='
  | '+'
  | '-'
  | '*'
  | '÷'
  | '%'
  | '('
  | ')'
  | '.'
  | 'x'
  | '/'
  | 'remove';
let operatorList = ['-', '+', 'x', '÷', '%', '(', ')', 'AC'];

type InputLineList = InputLineListItem[];
const Calculator: FC<CalculatorProps> = (props) => {
  const [result, setResult] = useState({
    value: '',
    isActive: false,
  });
  const [expression, setExpression] = useState({
    value: '',
    isActive: true,
  });
  const isWarning = useRef(false);
  const isNumberClick = useRef(false);// 确保先从数字键盘开始点击
  const fontStyle = {
    resultStyle: {
      fontSize: result.isActive ? '26px' : '13px',
    },
    expressionStyle: {
      fontSize: expression.isActive ? '26px' : '13px',
    },
  };
  useEffect(() => {
    if (!isWarning.current) {
      handleComputeResult();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [expression.value]);

  const handleNumberClick = (number: calculatorType) => {
    isNumberClick.current = true;
    changeExpression(number);
  };
  // 监听键盘事件
  const handleKeyDown = (ev: KeyboardEvent) => {
    let key = ev.key;
    const dom = document.querySelector(
      `#uuid${key.charCodeAt(0)}`
    ) as HTMLElement;
    const keyList = ['/', '-', '*', '+', '.', 'Enter', 'Backspace'];
    if (keyList.includes(key) || (typeof +key === 'number' && dom)) {
      dom.click();
    }
  };
  const changeExpression = (value: string | number) => {
    
    if (expression.value.length > 21) {
      return maxDigitWarning();
    }
    if (validateExpressionLastIsOperator(expression.value, value.toString())) {
      isWarning.current = false;
      setExpression((pre) => {
        return {
          value: `${pre.value}${value}`,
          isActive: true,
        };
      });
      setResult({
        ...result,
        isActive: false,
      });
    }
  };
  const handleOperateClick = (operate: calculatorType) => {
    // 如果为第一次点击
    if(!isNumberClick.current){
      return
    }
    if (!['=', 'AC', 'remove'].includes(operate as operator)) {
      changeExpression(operate);
    } else if (operate === '=') {
      // 点击equals
      toggleActive();
    } else if (operate === 'AC') {
      // clear清空
      handleClear();
    } else {
      //删除
      handleRemoveLastOperator();
    }
  };
  //计算结果
  const handleComputeResult = () => {
    if (expression.value) {
      let result = transformOperator();
      let normalExpression: number | string = normalizeExpression(result);
      // 尝试去掉0开头的数字前面的0
      let transformOperatorNum = normalExpression.replace(/^0\d+/g, (p) => {
        p = parseFloat(p).toString();
        return p;
      });
      try {
        let answer =
        Math.round(1000000000000 * eval(transformOperatorNum)) /
        1000000000000;
      setResult({
        value: answer.toString(),
        isActive: false,
      });
      } catch (error) {
      }
    }
  };
  const toggleActive = () => {
    setResult((pre) => {
      return {
        ...pre,
        isActive: true,
      };
    });
    setExpression((pre) => {
      return {
        ...pre,
        isActive: false,
      };
    });
  };
  // 校验表达式是否结尾是否为运算符 如果是则添加0 或1 结尾
  const normalizeExpression = (expression: string) => {
    let length = expression.length;
    let last = expression[length - 1];
    // 如果为 + 或 - 则追加0 否者追加1
    if (last === '-' || last === '+') {
      return expression + '0';
    } else if (last === '*' || last === '/' || last === '%') {
      return expression + '1';
    } else {
      return expression;
    }
  };
  // 校验表达式是否一运算符为运算符结尾和当前需要添加的字符串
  const validateExpressionLastIsOperator = (
    expression: string,
    value: string
  ) => {
    if (expression === '') return true;
    let length = expression.length;
    let last = expression[length - 1];
    let lastIsOperator = operatorList.includes(last);
    let valueIsOperator = operatorList.includes(value);
    // 如果最后一位为运算符
    if (lastIsOperator) {
      if (valueIsOperator && last === value) {
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  };
  const handleClear = () => {
    setExpression({
      isActive: true,
      value: '',
    });
    setResult({
      isActive: false,
      value: '',
    });
  };
  // 将运算符中的 ÷ 和 x 转换为 / 和 *
  const transformOperator = () => {
    return expression.value.replace(/x/g, '*').replace(/÷/g, '/');
  };
  const handleRemoveLastOperator = () => {
    let newExpression = expression.value.substring(
      0,
      expression.value.length - 1
    );
    if (newExpression === '') {
      setResult({ value: '', isActive: false });
    }
    setExpression({
      value: newExpression,
      isActive: true,
    });
  };
  const maxDigitWarning = () => {
    isWarning.current = true;
    setResult({
      value: 'Digit Limit Met',
      isActive: true,
    });
    setExpression({
      value: '',
      isActive: false,
    });
  };
  const transformOperatorToKeyBoardKey = (key: string) => {
    const keyMaps: {
      [key: string]: string;
    } = {
      '÷': '/',
      x: '*',
      '=': 'Enter',
      remove: 'Backspace',
    };
    const value = keyMaps[key]?.charCodeAt(0);
    return value ? value : key.toString().charCodeAt(0);
  };
  const renderInputLineItem = (operator: InputLineList) => {
    const list = operator.map((v, index) => {
      const classes = classNames({
        color_orange: v.is_color_orange,
        border_bottom: index === operator.length - 1,
        bg_pale: v.is_bg_pale,
        border_right_bottom: index !== operator.length - 1,
      });
      const clickEvents = {
        onClick: isNaN(+v.value)
          ? () => handleOperateClick(v.value)
          : () => handleNumberClick(v.value),
      };

      return (
        <div
          id={'uuid' + transformOperatorToKeyBoardKey(v.value as string)}
          key={index}
          className={classes}
          {...clickEvents}>
          <span>{v.value}</span>
        </div>
      );
    });
    return <div className='op_new_cal_line'>{list}</div>;
  };
  return (
    <div className='center'>
      <div className='calculator '>
        <div className='output'>
          <p className='process' style={fontStyle.expressionStyle}>
            <span>{expression.value}</span>
          </p>
          <p className='result' style={fontStyle.resultStyle}>
            <span>
              {result.value ? (
                <span>
                  <span style={{ paddingRight: '5px' }}>=</span>
                  {result.value}
                </span>
              ) : (
                result.value
              )}
            </span>
          </p>
        </div>
        <div className='input'>
          {renderInputLineItem([
            { value: '(', is_color_orange: true, is_bg_pale: true },
            { value: ')', is_color_orange: true, is_bg_pale: true },
            { value: '%', is_color_orange: true, is_bg_pale: true },
            { value: 'AC', is_color_orange: false, is_bg_pale: true },
            { value: 'remove', is_color_orange: true, is_bg_pale: true },
          ])}
          {renderInputLineItem([
            { value: 7, is_color_orange: false, is_bg_pale: false },
            { value: 8, is_color_orange: false, is_bg_pale: false },
            { value: 9, is_color_orange: false, is_bg_pale: false },
            { value: '÷', is_color_orange: true, is_bg_pale: true },
          ])}
          {renderInputLineItem([
            { value: 4, is_color_orange: false, is_bg_pale: false },
            { value: 5, is_color_orange: false, is_bg_pale: false },
            { value: 6, is_color_orange: false, is_bg_pale: false },
            { value: 'x', is_color_orange: true, is_bg_pale: true },
          ])}
          {renderInputLineItem([
            { value: 1, is_color_orange: false, is_bg_pale: false },
            { value: 2, is_color_orange: false, is_bg_pale: false },
            { value: 3, is_color_orange: false, is_bg_pale: false },
            { value: '-', is_color_orange: true, is_bg_pale: true },
          ])}
          {renderInputLineItem([
            { value: 0, is_color_orange: false, is_bg_pale: false },
            { value: '.', is_color_orange: true, is_bg_pale: false },
            { value: '=', is_color_orange: true, is_bg_pale: false },
            { value: '+', is_color_orange: true, is_bg_pale: true },
          ])}
        </div>
      </div>
    </div>
  );
};

export default Calculator;
