/* eslint-disable react/prop-types */
import { useState } from 'react';
import style from './BottomModal.module.css';
import swap from '../../assets/swap_bar.png';

const BottomModal = ({ inner }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`${style.modal_container} ${isOpen ? style.modalOpen : ""}`} onClick={toggleModal}>
      <div className={style.modalContent}>
        <img src={swap} alt="swap"/>
        {inner}
      </div>
    </div>
  );
};

/* eslint-enable react/prop-types */
export default BottomModal;
