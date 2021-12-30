import React, { FC } from 'react';
import './style.scss';
interface Props {
  text?:string,
}

const Empty:FC<Props> = (props) => {
  return (
    <div className="empty">
      {props.text}
    </div>
  )
}
Empty.defaultProps = {
  text:'空空如也'
}
export default Empty
