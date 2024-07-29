/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';

import style from './BottomModal.module.css';
import icon from '../../assets/icon.png';

const Near = (props) => {
    const type = localStorage.getItem('type');

    const [menu, setMenu] = useState({
        menu1: {
          name: 'CU 편의점 부천상동점',
          category: '편의점'
        },
        menu2: {
          name: 'GS 편의점 부천상동점',
          category: '편의점'
        },
        menu3: {
          name: 'CU 편의점 부천상동점',
          category: '편의점'
        },
        menu4: {
          name: 'GS 편의점 부천상동점',
          category: '편의점'
        },
        menu5: {
          name: 'CU 편의점 부천상동점',
          category: '편의점'
        },
        menu6: {
          name: 'GS 편의점 부천상동점',
          category: '편의점'
        },
        menu7: {
          name: 'GS 편의점 부천상동점',
          category: '편의점'
        },
        menu8: {
          name: 'CU 편의점 부천상동점',
          category: '편의점'
        },
        menu9: {
          name: 'GS 편의점 부천상동점',
          category: '편의점'
        },
    });

    useEffect(() => {
      setMenu(props.list);
    }, [props])
    
    return(
        <div className={style.near_container}>
            <div className={style.list_container}> 
                {Object.keys(menu).map((key, index) => (
                    <div 
                        key={key} 
                        className={style.list}
                        onClick={() => props.onListItemClick(props.markers[index])} // 리스트 아이템 클릭 시
                    >
                        <img src={icon}/>
                        <div className={style.list_info}>
                            <p>{menu[key].name}</p>
                            <span># {menu[key].category}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
};

export default Near;
/* eslint-disable react/prop-types */
