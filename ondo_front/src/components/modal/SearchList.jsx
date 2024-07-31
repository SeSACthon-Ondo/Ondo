import style from './BottomModal.module.css';
import back from '../../assets/back_black.png'
import korea from '../../assets/한식.png';
import china from '../../assets/중식.png';
import japan from '../../assets/일식.png';
import western from '../../assets/양식.png';
import conv from '../../assets/편의점.png';
import elseThing from '../../assets/else.png';

const SearchList = (props) => {
  let imgSrc = null;
  console.log(props.category)

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
      imgSrc = elseThing;
  }

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
        </ul></> : <></>}
      </div>
  );
}

export default SearchList;