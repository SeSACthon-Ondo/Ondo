import { useEffect, useState } from "react";
import Header from "../../components/header/Header";
const { kakao } = window;

import BottomModal from "../../components/modal/BottomModal";
import Loading from "../../components/modal/Loading";
import Near from "../../components/modal/Near";
import SearchList from "../../components/modal/SearchList";
import Search from "../search/Search";

import { initializeMap, setMarkerHandler } from './KakaoAPI';
import { nearFoodHandler, searchFoodHandler, nearCultureHandler, searchCultureHandler } from './Api.js';
import useDebounce from './useDebounce';

import style from './Map.module.css';
import search from '../../assets/search.png';
import reload from '../../assets/reload.png';
import back from '../../assets/back_black.png';

export default function Map() {
  const [lat, setLat] = useState(37.54902570673794); // 초기 위도
  const [lon, setLon] = useState(127.07489169741761); // 초기 경도
  const [map, setMap] = useState(null); // 지도 객체
  const [geocoder, setGeocoder] = useState(null); // 지오코더 객체
  const [markers, setMarkers] = useState([]); // 마커 목록
  const [address, setAddress] = useState('알 수 없음'); // 주소 상태
  const [selectedMarker, setSelectedMarker] = useState(null); // 선택된 마커 정보 상태
  const [isClicked, setIsClicked] = useState(false); // 검색창
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dummyData, setDummyData] = useState([
    {
      name: '춘천골 닭갈비',
      address: ' 서울 광진구 군자로 70 나동 1층 105호',
      category: '한식',
      review: '맛있어요!',
      menu: {
        "메뉴1": "뼈없는 닭갈비",
        "메뉴2": "닭순살볶음밥",
        "메뉴3": "해물볶음밥",
        "메뉴4": "막국수",
      },
    },
    {
      name: '가츠시',
      address: '서울특별시 광진구 화양동 광나루로 418',
      category: '일식',
      review: '훌륭한 맛집!',
      menu: {
        "메뉴1": "안심돈까스",
        "메뉴2": "소바정식",
        "메뉴3": "돈까스 김치 나베"
      },
    },
    {
      name: '롬곡',
      address: '서울 광진구 광나루로17길 18 1층',
      category: '카페',
      review: '아늑한 분위기!',
      menu: {
        "메뉴1": "바닐라라떼",
        "메뉴2": "카페라떼",
        "메뉴3": "돌체라떼"
      },
    }
  ]);
  
  const [dummyAI, setDummyAI] = useState(['닭갈비', '회', '돈까스', '까르보나라']);
  const debouncedAddress = useDebounce(address, 500);
  const debouncedLat = useDebounce(lat, 500);
  const debouncedLon = useDebounce(lon, 500);
  const [initialized, setInitialized] = useState(false); // 초기화 상태 추가
  const [comment, setComment] = useState('');

  
  //검색
  // 검색어 상태
  useEffect(() => {
    console.log(searchText);
  }, [searchText]);

  // 검색창 진입
  const onSearch = () => {
    setIsClicked(true);
  };

  // 새로고침
  const [refresh, setRefresh] = useState(1);
  const handleRefresh = () => {
    setRefresh(refresh * -1);
    setSelectedMarker(null);
  };


  // KakaoAPI.js
  // 맵 렌더링
  useEffect(() => {
    initializeMap("map", lat, lon, setMap, setGeocoder, setAddress, setLat, setLon);
  }, [refresh]);
  

  // 마커 렌더링
  useEffect(() => {
    if (map && geocoder) {
      // 기존 마커 제거
      markers.forEach(marker => marker.setMap(null));
  
      // 새로운 마커 생성 및 설정
      const newMarkers = [];
      const updatedData = dummyData.map(data => {
        return setMarkerHandler(geocoder, data.address, map, data.name, data.category, data.review, handleListItemClick, markers)
          .then(marker => {
            marker.name = data.name; // 마커에 name 저장
            marker.category = data.category; // 마커에 category 저장
            marker.menu = data.menu;  // 마커에 menu 저장
            marker.address = data.address; // 마커에 address 저장
            marker.review = data.review; // 마커에 review 저장
            newMarkers.push(marker);
            setMarkers(prevMarkers => [...prevMarkers, marker]); // 마커를 상태에 추가
            return { ...data, marker }; // 데이터에 마커 추가
          })
          .catch(error => {
            console.error(error);
            return data; // 에러 발생 시 기존 데이터 반환
          });
      });
  
      Promise.all(updatedData).then(results => {
        setDummyData(results);
      });
    }
  }, [map, geocoder]);  

  // 마커 클릭 이벤트 등록
  useEffect(() => {
    // 기존 이벤트 리스너 제거
    markers.forEach(marker => {
      if (marker.clickHandler) {
        kakao.maps.event.removeListener(marker, 'click', marker.clickHandler);
      }
    });

    // 새 이벤트 리스너 추가
    markers.forEach(marker => {
      const clickHandler = function() {
        setSelectedMarker(marker);
      };
      marker.clickHandler = clickHandler;
      kakao.maps.event.addListener(marker, 'click', clickHandler);
    });
  }, [markers]);


  // 카드 종류
  const type = localStorage.getItem('type');
  const placeholder = type === '꿈나무' ? '무엇이 드시고 싶나요?' : '무엇을 하고 싶나요?';

  // 모달 리스트 클릭 시
  const handleListItemClick = (marker) => {
    setSelectedMarker(marker);
    if (marker.getPosition()) {
      map.setCenter(marker.getPosition()); // 마커의 좌표로 지도의 중심 설정
    }
  };

  // 카드 종류에 따른 렌더링
  const cardType = localStorage.getItem('type');
  let modalHeader = '';
  if (cardType === '꿈나무') {
    modalHeader = '주변에 있는 추천 맛집이에요!';
  } else {
    modalHeader = '주변에 있는 추천 문화 시설이에요!';
  }

  useEffect(() => {
    if (!initialized && debouncedAddress !== '알 수 없음') {
      console.log(debouncedAddress);
      console.log(debouncedLat, debouncedLon);
  
      if (type === '꿈나무') {
        nearFoodHandler(debouncedAddress, debouncedLat, debouncedLon, setDummyData, setDummyAI, setRefresh, refresh, setIsLoading);
      } else {
        nearCultureHandler(debouncedAddress, debouncedLat, debouncedLon, setDummyData, setDummyAI, setRefresh, refresh, setIsLoading);
      }
      setInitialized(true); // 첫 실행 후 초기화 상태 설정
    }
  }, [debouncedAddress, debouncedLat, debouncedLon, type, initialized]);

  const searchHandler = () => {
    if(type === '꿈나무') {
      searchFoodHandler(address, lat, lon, searchText, setDummyData, setIsClicked, setRefresh, refresh, setIsLoading);
    } else {
      searchCultureHandler(address, lat, lon, searchText, setDummyData, setIsClicked, setRefresh, refresh, setIsLoading);
    }
  }
  

  let headerText = '';
  const renderModalContent = () => {
    if (selectedMarker) {
      headerText = '';
      return (
        <SearchList
          name= {selectedMarker.name}
          category= {selectedMarker.category}
          menu= {selectedMarker.menu}
          address = {selectedMarker.address}
          review = {selectedMarker.review}
          comment = {comment}
          setComment={setComment}
          refresh= {handleRefresh}
          map= {map}
          type= {type}
        />
      );
    } else {
      headerText = modalHeader;
      return (
        <Near
          list={dummyData}
          markers={markers}
          comment = {comment}
          setComment={setComment}
          onListItemClick={(marker) => handleListItemClick(marker, map)}
        />
      );
    }
  };

  return (
    <div className={style.map_container}>
      <Header />
      {isLoading && <Loading />}
      <div className={style.search_bar} onClick={isClicked ? undefined : onSearch}>
        {isClicked ? (
          <img
            className={style.back}
            onClick={() => { setIsClicked(false); }}
            src={back}
            alt="back"
          />
        ) : <></>}
        <input
          type="text"
          placeholder={placeholder}
          spellCheck='false'
          onChange={(e) => setSearchText(e.target.value)}
        />
        <img className={style.search} onClick={searchHandler} src={search} />
      </div>

      {isClicked ? (
        <div className={style.search_on}>
          <Search
            keywords={dummyAI}
            setSearchText={setSearchText}
            searchText = {searchText}
            type = {type}
            searchHandler = {searchHandler}
          />
        </div>
      ) : <></>}

      <div
        id="map"
        style={{
          width: "100%",
          height: "60%",
        }}
      />

      {isClicked || isLoading ? <></> : (
        <div onClick={handleRefresh} className={style.reload_box}>
          <img src={reload} />
        </div>
      )}

      {isClicked || isLoading ? <></> : (
        <BottomModal
          inner={renderModalContent()}
          header={headerText}
        />
      )}
    </div>
  );
}
