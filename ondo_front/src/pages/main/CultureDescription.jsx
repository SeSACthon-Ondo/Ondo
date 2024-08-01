import style from './Main.module.css';
import icon from '../../assets/ondo_white.png';
import { useNavigate } from 'react-router-dom';

const CultureDescription = () => {
    const navigate = useNavigate();

    return (
        <div className={style.container}>
            <div className={style.title} onClick={() => navigate('/main')}>
                <img src={icon}/>
                <span>온도</span>
            </div>
            
            <div className={style.inner_container}>
                <div className={style.text_wrapper}>
                    <h1>문화누리 카드 🎞️</h1>
                    <div className={style.hr}></div>
                    <h2>발급 대상</h2>
                    <p>6세 이상 기초생활수급자 및 차상위계층(2018.12.31. 이전 출생자)</p>
                    <h2>카드 설명</h2>
                    <p>문화누리카드는 삶의 질 향상과 문화격차 완화를 위해
                    기초생활수급자, 차상위계층을 대상으로 문화예술, 국내여행, 체육활동을
                    지원하는 카드입니다. (2024년에는 1인당 연간 13만원 지원)
                    문화누리카드는 기획재정부 복권위원회의 복권기금을 지원받아 추진하고 있는 공익사업입니다.</p>

                    <a href='https://www.mnuri.kr/munhwa/introduceNuri.do'>더 알아보기</a>
                </div>
            </div>
        </div>
    )
}

export default CultureDescription;