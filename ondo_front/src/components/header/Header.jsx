import { useNavigate } from 'react-router-dom';
import style from './Header.module.css';
import back from '../../assets/back.png';
import home from '../../assets/home.png';

const Header = () => {
    const navigate = useNavigate();
    const backHandler = () => {
        navigate('/main');
    }
    const homeHandler = () => {
        navigate('/main');
    }
    return (
        <div className={style.header_container}>
            <div className={style.back_container} onClick={backHandler}>
                <img src={back} alt='back'/>
                <span>온도</span>
            </div>
            <img src={home} alt='home' className={style.home} onClick={homeHandler}/>
        </div>
    );
}

export default Header; 