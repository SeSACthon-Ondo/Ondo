import style from './BottomModal.module.css';
import swap from '../../assets/swap_bar.png';

const BottomModal = (props) => {
    return(
        <div className={style.modal_container}>
            <img src={swap} />
            {props.inner}
        </div>
    );
};

export default BottomModal;