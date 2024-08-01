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
            
            <div className={style.inner_container}>
                <div className={style.text_wrapper}>
                    <h1>꿈나무 카드 🍱</h1>
                    <div className={style.hr}></div>
                    <h2>발급 대상</h2>
                    <p>A 국민기초생활보장 수급자 및 차상위 저소득계층 중 가정환경상(소년소녀 · 한부모 · 부양자의 학대 방임, 맞벌이 등)식사제공이 어려워 결식 우려가 있는 18세 미만 아동이 대상이 됩니다. 본인이 발급대상 여부를 확인하시려면 동 주민센터를 방문하셔서 아동 급식당담과 상담을 받으시고 신청서를 작성하시기 바랍니다.</p>
                    <h2>카드 설명</h2>
                    <p>1식은 9,000원에 해당하며 매월 일수로 계산된 금액을 전월 말일 카드계좌로 입금해 드리면 발급받으신 꿈나무카드를 가지고 꿈나무 카드 가맹 음식점에서 식사를 하고 식사비를 결재하면 직불로 식당에 바로 계산이 됩니다.</p>

                    <a href='https://www.ddm.go.kr/www/contents.do?key=664'>더 알아보기</a>
                </div>
            </div>
        </div>

    )
}

export default FoodDescription;