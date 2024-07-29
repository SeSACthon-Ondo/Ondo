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

    return () => {
      document.body.classList.remove(style.noScroll);
    };
  }, [isOpen]);

  //모달 오픈
  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  //모달 오픈 시, 배경 누르면 닫힘
  const handleOutsideClick = (e) => {
    if (e.target.classList.contains(style.modal_overlay)) {
      setIsOpen(false);
    }
  };

  const headerHeight = header ? style.header_container : style.header_none_container;

  return (
    <>
      <button onClick={toggleModal}>Toggle Modal</button> {/* 모달을 열기 위한 버튼 */}
      <div
        className={`${style.modal_overlay} ${isOpen ? style.modalOpen : ""}`}
        onClick={handleOutsideClick}
      />
      <div className={`${style.modal_container} ${isOpen ? style.modalOpen : ""}`}>
        <div className={style.modalContent} onClick={(e) => e.stopPropagation()}>
          <div className={headerHeight} onClick={toggleModal}>
            <img className={style.img} src={swap} alt="swap" />
            {header ? <p className={style.near_title}>{header}</p> : <></>}
          </div>
          {inner}
        </div>
      </div>
    </>
  );
};

/* eslint-enable react/prop-types */
export default BottomModal;
