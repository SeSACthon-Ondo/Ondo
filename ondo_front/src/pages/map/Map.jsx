import { useEffect, useState } from "react";
import Header from "../../components/header/Header";
const { kakao } = window;

import BottomModal from "../../components/modal/BottomModal";
import Loading from "../../components/modal/Loading";
import Near from "../../components/modal/Near";

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
            newMarkers.push(marker);
            setMarkers(newMarkers);
          })
          .catch(error => {
            console.error(error);
          });
      });
    }
  }, [map, geocoder]);

  const type = localStorage.getItem('type');
  const placeholder = type === '꿈나무'? '무엇이 드시고 싶나요?' : '무엇을 하고 싶나요?';
  const [keywords, setKeywords] = useState(['떡볶이', '한식', '백반', '분식']);
  const [menu, setMenu] = useState({
    menu1: {
      name: 'CU 편의점 부천상동점',
      category: '편의점'
    },
    menu2: {
      name: 'GS 편의점 부천상동점',
      category: '편의점'
    },
  });

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

      <div className={style.keywords}>
        <div className={style.keyword_title}>AI 추천 키워드</div>
        {keywords.map((keyword, index) => (
          <div key={index} className={style.keyword}>
            {keyword}
          </div>
        ))}
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
/**
 * <Loading />
 <div>
   <span className="title">내 위치</span>
   <p id="centerAddr">{address}</p>
 </div>
 * 
 */