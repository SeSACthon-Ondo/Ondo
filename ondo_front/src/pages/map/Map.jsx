import { useEffect, useState } from "react";
import Header from "../../components/header/Header";
const { kakao } = window;

import BottomModal from "../../components/modal/BottomModal";
import Loading from "../../components/modal/Loading";
import Near from "../../components/modal/Near";
import SearchList from "../../components/modal/SearchList";

import { initializeMap, displayCenterInfo, setMarkerHandler } from './KakaoAPI';

import style from './Map.module.css';
import search from '../../assets/search.png'
import reload from '../../assets/reload.png';

export default function Map() {
  const [lat, setLat] = useState(33.450701); // 초기 위도
  const [lon, setLon] = useState(126.570667); // 초기 경도
  const [map, setMap] = useState(null); // 지도 객체
  const [geocoder, setGeocoder] = useState(null); // 지오코더 객체
  const [markers, setMarkers] = useState([]); // 마커 목록
  const [infowindow, setInfowindow] = useState(null); // 인포윈도우 객체
  const [address, setAddress] = useState('알 수 없음'); // 주소 상태
  const [selectedMarker, setSelectedMarker] = useState(null); // 선택된 마커 정보 상태

  //새로고침
  const [refresh, setRefresh] = useState(1);
  const handleRefresh = () => {
    setRefresh(refresh * -1);
    setSelectedMarker(null);
  };

  //KakaoAPI.js
  useEffect(() => {
    initializeMap("map", lat, lon, setMap, setGeocoder, () => {}, setInfowindow, setAddress);
  }, [refresh]);

  const dummyData = [
    {
      name: '우리집',
      address: '경기도 부천시 원미구 조마루로 134',
      category: 'HOME',
      menu: {
        "메뉴1": "비빔밥",
        "메뉴2": "불고기",
        "메뉴3": "김치찌개",
        "메뉴4": "비빔밥",
        "메뉴5": "불고기",
      },
    },
    {
      name: '우리집 옆',
      address: '경기도 부천시 원미구 조마루로 135',
      category: 'HOME',
      menu: {
        "메뉴1": "마라탕",
        "메뉴2": "마라샹궈",
        "메뉴3": "꿔바로우"
      },
    } 
  ];

  // 더미데이터 사용
  useEffect(() => {
    if (map && geocoder) {
      // 기존 마커 제거
      markers.forEach(marker => marker.setMap(null));

      // 새로운 마커 생성 및 설정
      const newMarkers = [];
      dummyData.forEach(data => {
        setMarkerHandler(geocoder, data.address, map, infowindow, data.name, data.category)
          .then(marker => {
            marker.name = data.name; // 마커에 name 저장
            marker.category = data.category; // 마커에 category 저장
            marker.menu = data.menu; // 마커에 menu 저장
            newMarkers.push(marker);
            setMarkers(prevMarkers => [...prevMarkers, marker]); // 마커를 상태에 추가
          })
          .catch(error => {
            console.error(error);
          });
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

  //카드 종류
  const type = localStorage.getItem('type');
  const placeholder = type === '꿈나무'? '무엇이 드시고 싶나요?' : '무엇을 하고 싶나요?';

  //카드 종류에 따른 렌더링
  const cardType = localStorage.getItem('type');
  let modalHeader = '';
  if (cardType === '꿈나무') {
    modalHeader = '주변에 있는 추천 맛집이에요!';
  } else {
    modalHeader = '주변에 있는 추천 문화 시설이에요!';
  }

  const handleListItemClick = (marker) => {
    setSelectedMarker(marker);
    // 클릭 이벤트 트리거 대신 상태 업데이트만 수행
  };

  let headerText = '';
  const renderModalContent = () => {
    if (selectedMarker) {
      headerText = '';
      return (
        <SearchList 
          name = {selectedMarker.name}
          category = {selectedMarker.category}
          menu = {selectedMarker.menu}
          refresh = {handleRefresh}
        />
        // <div>
        //   <h2>{selectedMarker.name}</h2>
        //   <p>Category: {selectedMarker.category}</p>
        //   <ul>
        //     {Object.keys(selectedMarker.menu).map(key => (
        //       <li key={key}>{selectedMarker.menu[key]}</li>
        //     ))}
        //   </ul>
        // </div>
      );
    } else {
      headerText = modalHeader;
      return <Near 
        list={dummyData}
        markers={markers}
        onListItemClick={handleListItemClick}
      />
    }
  };

  return (
    <div className={style.map_container}>
      <Header />

      <div className={style.search_bar}>
        <input
          type="text"
          placeholder={placeholder}
          spellCheck='false'
        />
        <img src={search} />
      </div>

      <div
        id="map"
        style={{
          width: "100%",
          height: "80%",
        }}
      />

      <div onClick={handleRefresh} className={style.reload_box}>
        <img src={reload} />
      </div>
      <BottomModal 
        inner={renderModalContent()} 
        header={headerText}
      />
    </div>
  );

}
