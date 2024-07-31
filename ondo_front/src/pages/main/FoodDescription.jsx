import style from './Main.module.css';

const FoodDescription = () => {
    return (
        <div className={style.container}>
            <div className={style.title}>
                <img src={icon}/>
                <span>온도</span>
            </div>
            
            <div className={style.inner_container}></div>
        </div>

    )
}

export default FoodDescription;