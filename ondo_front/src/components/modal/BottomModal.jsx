/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import style from './BottomModal.module.css';
import swap from '../../assets/swap_bar.png';

const BottomModal = ({ inner, header }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add(style.noScroll);
    } else {
      document.body.classList.remove(style.noScroll);
    }

    // Clean up the class when the component is unmounted
    return () => {
      document.body.classList.remove(style.noScroll);
    };
  }, [isOpen]);

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  const handleOutsideClick = (e) => {
    if (e.target.classList.contains(style.modal_overlay)) {
      setIsOpen(false);
    }
  };

  return (
    <>
      <button onClick={toggleModal}>Toggle Modal</button> {/* 모달을 열기 위한 버튼 */}
      <div
        className={`${style.modal_overlay} ${isOpen ? style.modalOpen : ""}`}
        onClick={handleOutsideClick}
      />
      <div className={`${style.modal_container} ${isOpen ? style.modalOpen : ""}`}>
        <div className={style.modalContent} onClick={(e) => e.stopPropagation()}>
          <div className={style.header_container} onClick={toggleModal}>
            <img src={swap} alt="swap" />
            <p className={style.near_title}>{header}</p>
          </div>
          {inner}
        </div>
      </div>
    </>
  );
};

/* eslint-enable react/prop-types */
export default BottomModal;
