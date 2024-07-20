import style from './BottomModal.module.css';

const Near = () => {
    const type = localStorage.getItem('type');
    console.log(type);
    
    return(
        <div>
            {type === '꿈나무' ? 
            <p>주변에 있는 추천 맛집이에요!</p> 
            :
            <p>주변에 있는 추천 문화 시설이에요!</p>}
            <div className={style.list_container}></div>
        </div>
    )
};

export default Near;