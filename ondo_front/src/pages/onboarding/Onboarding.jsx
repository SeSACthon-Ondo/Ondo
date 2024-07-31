import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

import icon from '../../assets/ondo_white.png';
import style from './Onboarding.module.css';

const Onboarding = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/main');
        }, 2000);

        // Clean up the timer if the component is unmounted before the timeout
        return () => clearTimeout(timer);
    }, [navigate]);

    const goMainHandler = () => {
        navigate('/main');
    }

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
