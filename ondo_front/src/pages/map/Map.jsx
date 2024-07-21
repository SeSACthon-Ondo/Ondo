import { useEffect, useState } from "react";
import Header from "../../components/header/Header";
const { kakao } = window;

import BottomModal from "../../components/modal/BottomModal";
import Loading from "../../components/modal/Loading";
import Near from "../../components/modal/Near";

import style from './Map.module.css';
import search from '../../assets/search.png'
import reload from '../../assets/reload.png';

export default function Map() {
  const [lat, setLat] = useState(33.450701); // 초기 위도
  const [lon, setLon] = useState(126.570667); // 초기 경도
  const [map, setMap] = useState(null); // 지도 객체
  const [geocoder, setGeocoder] = useState(null); // 지오코더 객체
  const [marker, setMarker] = useState(null); // 마커 객체
  const [infowindow, setInfowindow] = useState(null); // 인포윈도우 객체
  const [address, setAddress] = useState('알 수 없음'); // 주소 상태

  const [refresh, setRefresh] = useState(1);
  const handleRefresh = () => {
    setRefresh(refresh * -1);
  }

  // 지도 중심 좌표의 주소 정보를 표시하는 함수
  const displayCenterInfo = (geocoder, coords) => {
    geocoder.coord2RegionCode(coords.getLng(), coords.getLat(), (result, status) => {
      if (status === kakao.maps.services.Status.OK) {
        for (let i = 0; i < result.length; i++) {
          if (result[i].region_type === 'H') {
            setAddress(result[i].address_name);
            break;
          }
        } 
      }
    });
  };

  // 클릭한 좌표의 상세 주소 정보를 검색하는 함수
  const searchDetailAddrFromCoords = (geocoder, coords, marker, infowindow, mapInstance) => {
    geocoder.coord2Address(coords.getLng(), coords.getLat(), (result, status) => {
      if (status === kakao.maps.services.Status.OK) {
        const roadAddr = result[0].road_address ? result[0].road_address.address_name : '';
        let detailAddr = roadAddr ? `<div>도로명주소 : ${roadAddr}</div>` : '';
        detailAddr += `<div>지번 주소 : ${result[0].address.address_name}</div>`;

        const content = `<div>
            <span>내 위치</span>
            ${detailAddr}
          </div>`;

        // 클릭한 위치에 마커를 표시
        marker.setPosition(coords);
        marker.setMap(mapInstance);

        // 클릭한 위치의 주소 정보를 인포윈도우에 표시
        infowindow.setContent(content);
        infowindow.open(mapInstance, marker);
      }
    });
  };

  // 지도 초기화 및 이벤트 설정
  useEffect(() => {
    const container = document.getElementById("map");
    const options = {
      center: new kakao.maps.LatLng(lat, lon),
      level: 3,
    };
    const mapInstance = new kakao.maps.Map(container, options);
    setMap(mapInstance);

    const geocoderInstance = new kakao.maps.services.Geocoder();
    setGeocoder(geocoderInstance);

    const markerInstance = new kakao.maps.Marker();
    setMarker(markerInstance);

    const infowindowInstance = new kakao.maps.InfoWindow({ zindex: 1 });
    setInfowindow(infowindowInstance);

    // 지도 클릭 이벤트 등록
    kakao.maps.event.addListener(mapInstance, 'click', function (mouseEvent) {
      searchDetailAddrFromCoords(geocoderInstance, mouseEvent.latLng, markerInstance, infowindowInstance, mapInstance);
    });

    // 지도 중심 변경 이벤트 등록
    kakao.maps.event.addListener(mapInstance, 'center_changed', function () {
      displayCenterInfo(geocoderInstance, mapInstance.getCenter());
    });

    // 초기 중심 주소 정보 표시
    displayCenterInfo(geocoderInstance, mapInstance.getCenter());

  }, [refresh]);

  // 현재 위치 가져오기 및 지도 중심 이동
  useEffect(() => {
    if (map && geocoder) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
          const x = position.coords.latitude;
          const y = position.coords.longitude;
          setLat(x);
          setLon(y);

          const moveLatLon = new kakao.maps.LatLng(x, y);
          map.setCenter(moveLatLon);

          // 현재 위치의 주소 정보 표시
          displayCenterInfo(geocoder, moveLatLon);

          // 현재 위치 정보를 백엔드로 POST 요청
          fetch('http://localhost:8080/api/location', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ latitude: x, longitude: y }),
          })
          .then(response => response.json())
          .then(data => {
            console.log('Response from server:', data);
          })
          .catch(error => {
            console.error('Error:', error);
          });

        });
      } else {
        alert('접속정보를 불러올 수 없어요!\n 권한을 체크해주세요!');
      }
    }
  }, [map, geocoder, refresh]);

  const type = localStorage.getItem('type');

  const placeholder = type === '꿈나무'? '무엇이 드시고 싶나요?' : '무엇을 하고 싶나요?'

  const [kewords, setKeywords] = useState(['떡볶이', '한식', '백반', '분식']);

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

  return (
    <div className={style.map_container}>
      <Header />

      <div className={style.search_bar}>
        <input type="text" placeholder={placeholder} spellCheck='false'/>
        <img src={search}/>
      </div>

      <div className={style.keywords}>
      <div className={style.keyword_title}>AI 추천 키워드</div>
      {kewords.map((keyword, index) => (
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
        <img src={reload}/>
      </div>
      <BottomModal 
        inner = {<Near />}
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