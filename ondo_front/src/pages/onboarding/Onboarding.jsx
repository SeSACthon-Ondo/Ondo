import { useNavigate } from 'react-router-dom';

import icon from '../../assets/ondo_white.png';
import style from './Onboarding.module.css';

const Onboarding = () => {
    const navigate = useNavigate();
    const goMainHandler = () => {
        navigate('/main');
    }

    const testHandler = () => {};
    return (
        <div className={style.container}>
            <div className={style.title_wrapper} onClick={goMainHandler}>
            <img src={icon} className={style.mainImg}/>
                <p className={style.title}>온 도</p>
                <p className={style.info}>따뜻함을 나눠주는 지도</p>
            </div>
        </div>
    );
};

export default Onboarding;
