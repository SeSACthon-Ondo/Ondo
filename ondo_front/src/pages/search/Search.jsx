/* eslint-disable react/prop-types */
import style from './Search.module.css';

const Search = ({keywords}) => {
    return (
        <div className={style.search_container}>
            <p className={style.recommend}>AI추천🪄</p>
            <p className={style.ai_info}>원하는 메뉴를 검색 혹은 선택하시면 AI분석을 통해 맛집을 추천드려요!</p>
            <div className={style.hr}></div>

            <p className={style.recommend}>이런 메뉴를 먹어보는 건 어떨까요? 😉</p>
            <p className={style.reco_info}>* AI가 지금까지 검색 기록을 분석해 건강한 식습관을 도와드립니다.</p>

            <div className={style.keyword_container}>
                {keywords.map((keyword, index) => (
                    <div key={index} className={style.keyword}>
                    {keyword}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Search;
/* eslint-disable react/prop-types */