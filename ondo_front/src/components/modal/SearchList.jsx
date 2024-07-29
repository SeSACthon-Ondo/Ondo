/* eslint-disable react/prop-types */
import style from './BottomModal.module.css';
import back from '../../assets/back_black.png'
import korea from '../../assets/한식.png';
import china from '../../assets/중식.png';
import japan from '../../assets/일식.png';
import western from '../../assets/양식.png';

const SearchList = (props) => {
    return (
        <div className={style.result_container}>
          <div className={style.controller}>
              <img className={style.back} src={back} alt='back' onClick={props.refresh}/>
              <img className={style.food} src={korea} alt='food'/>
              <div className={style.name}>
                  <h2>{props.name}</h2>
                  <p># {props.category}</p>
              </div>
          </div>
          <div className={style.hr}></div>
          <h3>메뉴</h3>
          <ul>
            {Object.keys(props.menu).map(key => (
              <li key={key}>{props.menu[key]}</li>
            ))}
          </ul>
        </div>
    )
}
/* eslint-disable react/prop-types */
export default SearchList;