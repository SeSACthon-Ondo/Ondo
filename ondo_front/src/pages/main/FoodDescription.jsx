import { useNavigate } from 'react-router-dom';

import style from './Main.module.css';
import icon from '../../assets/ondo_white.png';

const FoodDescription = () => {
    const navigate = useNavigate();
    return (
        <div className={style.container}>
            <div className={style.title} onClick={() => navigate('/main')}>
                <img src={icon}/>
                <span>온도</span>
            </div>
            
            <div className={style.inner_container}></div>
        </div>

    )
}

export default FoodDescription;