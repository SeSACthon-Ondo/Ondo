// src/utils/kakaoMap.js
const { kakao } = window;

export const initializeMap = (containerId, lat, lon, setMap, setGeocoder, setMarker, setInfowindow, setAddress) => {
    const container = document.getElementById(containerId);
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
      displayCenterInfo(geocoderInstance, mapInstance.getCenter(), setAddress);
    });
  
    // 초기 중심 주소 정보 표시
    displayCenterInfo(geocoderInstance, mapInstance.getCenter(), setAddress);
  };
  
  export const displayCenterInfo = (geocoder, coords, setAddress) => {
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
  
export const setMarkerHandler = (geocoder, address, map, infowindow, name, category) => {
  return new Promise((resolve, reject) => {
    geocoder.addressSearch(address, function(result, status) {
      if (status === kakao.maps.services.Status.OK) {
        const coords = new kakao.maps.LatLng(result[0].y, result[0].x);

        // 결과값으로 받은 위치를 새로운 마커로 표시합니다
        const marker = new kakao.maps.Marker({
          position: coords,
          map: map
        });

        // 인포윈도우로 장소에 대한 설명을 표시합니다
        const infoContent = `<div style="width:150px;text-align:center;padding:6px 0;">${name}<br>${category}</div>`;
        const infoWindow = new kakao.maps.InfoWindow({
          content: infoContent
        });
        infoWindow.open(map, marker);

        // 마커 클릭 시 인포윈도우를 표시하도록 이벤트 등록
        kakao.maps.event.addListener(marker, 'click', () => {
          infoWindow.open(map, marker);
        });

        // 지도의 중심을 결과값으로 받은 위치로 이동시킵니다
        //map.setCenter(coords);

        resolve(marker);
      } else {
        reject(new Error('Failed to search address'));
      }
    });
  });
};

