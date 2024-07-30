/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';

import style from './BottomModal.module.css';
import icon from '../../assets/icon.png';

const Near = (props) => {
  const [menu, setMenu] = useState([]);

  useEffect(() => {
    setMenu(props.list);
  }, [props.list]);

  return (
    <div className={style.near_container}>
      <div className={style.list_container}>
        {menu.map((item, index) => (
          <div
            key={index}
            className={style.list}
            onClick={() => {
              props.onListItemClick(item.marker);
              console.log(item.marker);
            }} // 리스트 아이템 클릭 시
          >
            <img src={icon} alt="icon" />
            <div className={style.list_info}>
              <p>{item.name}</p>
              <span># {item.category}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Near;
/* eslint-disable react/prop-types */
