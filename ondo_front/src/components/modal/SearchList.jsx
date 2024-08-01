import { useState } from 'react';

import style from './BottomModal.module.css';
import back from '../../assets/back_black.png'
import korea from '../../assets/한식.png';
import china from '../../assets/중식.png';
import japan from '../../assets/일식.png';
import western from '../../assets/양식.png';
import conv from '../../assets/편의점.png';
import heart from '../../assets/heart.png';

const SearchList = (props) => {
  const [newComment, setNewComment] = useState('');
  let imgSrc = null;

  switch(props.category) {
    case '한식':
      imgSrc = korea;
      break;
    case '일식':
      imgSrc = japan;
      break;
    case '중식':
      imgSrc = china;
      break;
    case '양식':
      imgSrc = western;
      break;
    case '편의점':
      imgSrc = conv;
      break;
    default:
      imgSrc = heart;
  }

  const handleInputChange = (event) => {
    setNewComment(event.target.value);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
        props.setComment([...props.comment, newComment]);
        setNewComment('');
    }
  };

  return (
      <div className={style.result_container}>
        <div className={style.controller}>
            <img className={style.back} src={back} alt='back' onClick={props.refresh}/>
            <img className={style.food} src={imgSrc} alt='food'/>
            <div className={style.name}>
                <h2>{props.name}</h2>
                <p># {props.category}</p>
            </div>
        </div>
        <div className={style.hr}></div>
        <h3>주소</h3>
        <p className={style.address}>{props.address}</p>
        
        {props.type === '꿈나무' ? <><h3>메뉴</h3>
        <ul>
          {Object.keys(props.menu).map(key => (
            <li key={key}>{props.menu[key]}</li>
          ))}
        </ul>
        </> : <></>}

        <h3>리뷰</h3>
        <div className={style.comment_wrapper}>
        {props.comment.map((text, index) => (
                <p key={index} className={style.comment_text}>{text}</p>
            ))}
          </div>
        <div className={style.comment_box}>
          <input type='text' value={newComment} onChange={handleInputChange}/> 
          <button onClick={handleAddComment}>등록</button>
        </div>
        
      </div>
  );
}

export default SearchList;