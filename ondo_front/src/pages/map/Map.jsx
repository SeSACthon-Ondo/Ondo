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

  const [refresh, setRefresh] = useState(1);
  const handleRefresh = () => {
    setRefresh(refresh * -1);
  };

  useEffect(() => {
    initializeMap("map", lat, lon, setMap, setGeocoder, () => {}, setInfowindow, setAddress);
  }, [refresh]);

  // 더미데이터 사용
  useEffect(() => {
    if (map && geocoder) {
      const dummyData = [
        {
          name: '우리집',
          address: '경기도 부천시 원미구 조마루로 134',
          category: 'HOME'
        },
        {
          name: '우리집 옆',
          address: '경기도 부천시 원미구 조마루로 135',
          category: 'HOME'
        }
      ];

      // 기존 마커 제거
      markers.forEach(marker => marker.setMap(null));

      // 새로운 마커 생성 및 설정
      const newMarkers = [];
      dummyData.forEach(data => {
        setMarkerHandler(geocoder, data.address, map, infowindow, data.name, data.category)
          .then(marker => {
            marker.name = data.name; // 마커에 name 저장
            marker.category = data.category; // 마커에 category 저장
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
    markers.forEach(marker => {
      kakao.maps.event.addListener(marker, 'click', function() {
        alert(`Marker clicked!\nName: ${marker.name}\nCategory: ${marker.category}`); // 마커 클릭 시 알림창에 이름과 카테고리 표시
      });
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
        inner={<Near />}
        header={modalHeader}
      />
    </div>
  );

}
