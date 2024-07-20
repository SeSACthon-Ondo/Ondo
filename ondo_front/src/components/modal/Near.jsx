import { useState } from 'react';

import style from './BottomModal.module.css';
import icon from '../../assets/icon.png';

const Near = () => {
    const type = localStorage.getItem('type');
    console.log(type);

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
    });
    
    return(
        <div className={style.near_container}>
            {type === '꿈나무' ? 
            <p className={style.near_title}>주변에 있는 추천 맛집이에요!</p> 
            :
            <p className={style.near_title}>주변에 있는 추천 문화 시설이에요!</p>}
            <div className={style.list_container}> 
                {Object.keys(menu).map(key => (
                    <div key={key} className={style.list}>
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