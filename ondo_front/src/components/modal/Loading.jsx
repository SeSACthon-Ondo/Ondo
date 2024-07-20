import style from './BottomModal.module.css';
import spinner from '../../assets/spinner.gif';

const Loading = () => {
    return(
        <div className={style.loading_container}>
            <img src={spinner}/>
            <p>AI 분석 중...</p>
        </div>
    );
}

export default Loading;