import { useEffect, useState } from 'react';
import style from './Search.module.css';

const Search = ({keywords, setSearchText, searchText, type, searchHandler}) => {
    const [isClickEvent, setIsClickEvent] = useState(false);
    let info = '원하는 메뉴를 검색 혹은 선택하시면 AI분석을 통해 맛집을 추천드려요!';
    let recommend = '이런 메뉴를 먹어보는 건 어떨까요? 😉';
    let reco_info = '* AI가 지금까지 검색 기록을 분석해 건강한 식습관을 도와드립니다.'

    if (type === '문화누리') {
        info = '원하는 활동을 검색 혹은 선택하시면 AI분석을 통해 장소를 추천드려요!';
        recommend = '이런 건 어떤까요? 😉';
        reco_info = '* AI가 지금까지 검색 기록을 분석해 취미활동 분석 및 추천해 드립니다.';
    }

    useEffect(() => {
        if (isClickEvent) {
            searchHandler();
            setIsClickEvent(false); // 플래그 초기화
        }
    }, [searchText]);

    const handleClick = (keyword) => {
        setSearchText(keyword);
        setIsClickEvent(true);
    };

    return (
        <div className={style.search_container}>
            <p className={style.recommend}>AI추천🪄</p>
            <p className={style.ai_info}>{info}</p>
            <div className={style.hr}></div>

            <p className={style.recommend}>{recommend}</p>
            <p className={style.reco_info}>{reco_info}</p>

            <div className={style.keyword_container}>
                {keywords.map((keyword, index) => (
                    <div 
                    key={index} 
                    className={style.keyword}
                    onClick={() => {
                        handleClick(keyword)
                    }}
                    >
                    {keyword}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Search;