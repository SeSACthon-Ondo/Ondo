const { kakao } = window;

import markerImgSrc from '../../assets/marker.png';
import myMarker from '../../assets/my.png';
import style from './Map.module.css';

// 지도 초기화 함수
export const initializeMap = (containerId, lat, lon, setMap, setGeocoder,  setAddress, setLat, setLon) => {
  const container = document.getElementById(containerId); // 지도를 표시할 HTML 요소를 가져옵니다.
  const options = {
    // 위치임의 설정
    center: new kakao.maps.LatLng(37.54902570673794, 127.07489169741761),
    //center: new kakao.maps.LatLng(lat, lon), // 지도의 중심 좌표 설정
    level: 6, // 지도의 확대 레벨 설정
  };
  const mapInstance = new kakao.maps.Map(container, options); // 지도 객체 생성
  setMap(mapInstance); // 생성된 지도 객체를 상태로 설정

  const geocoderInstance = new kakao.maps.services.Geocoder(); // 지오코더 객체 생성
  setGeocoder(geocoderInstance); // 생성된 지오코더 객체를 상태로 설정

  // 지도 중심 변경 이벤트 등록
  kakao.maps.event.addListener(mapInstance, 'center_changed', function () {
    displayCenterInfo(geocoderInstance, mapInstance.getCenter(), setAddress, setLat, setLon);
  });

  // 초기 중심 주소 정보 표시
  displayCenterInfo(geocoderInstance, mapInstance.getCenter(), setAddress, setLat, setLon);
};

// 중심좌표 설정
// export const setCenter = (map, lat, lon, setAddress, setLat, setLon) => {
//   const geocoder = new kakao.maps.services.Geocoder();
//   const newCenter = new kakao.maps.LatLng(lat, lon);
//   map.setCenter(newCenter); // 지도의 중심 좌표를 임의로 설정

//   // 설정된 중심 좌표의 주소 정보 업데이트
//   displayCenterInfo(geocoder, newCenter, setAddress, setLat, setLon);
// };

  
// 지도 중심 좌표의 주소 정보를 표시하는 함수
export const displayCenterInfo = (geocoder, coords, setAddress, setLat, setLon) => {
  geocoder.coord2RegionCode(coords.getLng(), coords.getLat(), (result, status) => {
    if (status === kakao.maps.services.Status.OK) {
      for (let i = 0; i < result.length; i++) {
        if (result[i].region_type === 'H') {
          setAddress(result[i].address_name); // 중심 좌표의 주소 정보를 상태로 설정

          //위도, 경도 저장하기
          if(coords.getLat() !== 33.450701 && coords.getLng() !== 126.570667) {
            setLat(coords.getLat());
            setLon(coords.getLng());
          }
          break;
        }
      } 
    }
  });
};
  
// 주소를 좌표로 변환하고 마커를 생성 및 설정하는 함수
export const setMarkerHandler = (geocoder, address, map, name, category, handleListItemClick, markers) => {
  return new Promise((resolve, reject) => {
    // 사용자의 현재 위치를 가져옵니다.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        const userCoords = new kakao.maps.LatLng(position.coords.latitude, position.coords.longitude);
        
        geocoder.addressSearch(address, function(result, status) {
          if (status === kakao.maps.services.Status.OK) {
            const coords = new kakao.maps.LatLng(result[0].y, result[0].x);

            // 마커 이미지 사이즈
            const imageSize = new kakao.maps.Size(31, 46);

            // 마커 이미지 선언
            const markerImage = new kakao.maps.MarkerImage(markerImgSrc, imageSize);

            const userMarkerImage = new kakao.maps.MarkerImage(myMarker, imageSize);

            // 결과값으로 받은 위치를 새로운 마커로 표시
            const marker = new kakao.maps.Marker({
              position: coords,
              map: map,
              image: markerImage // 마커이미지 설정
            });

            // 사용자 위치에 마커를 추가
            // const userRealMarker = new kakao.maps.Marker({
            //   position: userCoords,
            //   map: map,
            //   image: userMarkerImage // 마커이미지 설정
            // });

            const userMarker = new kakao.maps.Marker({
              position: new kakao.maps.LatLng(37.54902570673794, 127.07489169741761),
              map: map,
              image: userMarkerImage // 마커이미지 설정
            });

            // 커스텀 오버레이로 사용할 HTML 생성
            const overlayContent = document.createElement('div');
            overlayContent.className = style.infoBox;
            overlayContent.innerHTML = `<h3>${name}</h3><p># ${category}<p>`;

            // 커스텀 오버레이 생성
            const customOverlay = new kakao.maps.CustomOverlay({
              content: overlayContent,
              clickable: true,
              position: coords,
              xAnchor: 0.5,
              yAnchor: 1,
              zIndex: 3
            });

            // 커스텀 오버레이를 지도에 추가
            customOverlay.setMap(map);

            // 커스텀 오버레이 클릭 시 handleListItemClick 호출
            customOverlay.getContent().addEventListener('click', () => {
              handleListItemClick(marker);
              map.setCenter(coords);
            });

            // 지도의 중심을 사용자의 현재 위치로 이동시킵니다
            //map.setCenter(userCoords);

            resolve(marker);
          } else {
            reject(new Error('Failed to search address'));
          }
        });
      }, function(error) {
        reject(new Error('Geolocation failed: ' + error.message));
      });
    } else {
      reject(new Error('Geolocation not supported.'));
    }
  });
};

// 좌표를 주소로 변환하고 해당 위치에 마커를 표시하는 함수
// const searchDetailAddrFromCoords = (geocoder, coords) => {
//   geocoder.coord2Address(coords.getLng(), coords.getLat(), (result, status) => {
//     if (status === kakao.maps.services.Status.OK) {
//       const roadAddr = result[0].road_address ? result[0].road_address.address_name : '';
//       let detailAddr = roadAddr ? `<div>도로명주소 : ${roadAddr}</div>` : '';
//       detailAddr += `<div>지번 주소 : ${result[0].address.address_name}</div>`;
//     }
//   });
// };

// 마커에 클릭이벤트를 등록하는 함수 (현재 사용되지 않음)
// export const markerClickHandler = () => {
//   // 마커에 클릭이벤트를 등록합니다
//   kakao.maps.event.addListener(marker, 'click', function() {
//     map.setCenter(coords);
//   });
// };