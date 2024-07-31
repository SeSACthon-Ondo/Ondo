// 꿈나무 카드
// 근처
export const nearFoodHandler = async (address, lat, lon) => {
    const req_data = {
        road_name: address,
        latitude: lat,
        longitude: lon
    };
    console.log('꿈나무 근처');
    console.log(req_data);

    // try {
    //     const response = await fetch(
    //     'http://127.0.0.1:8000/db/noori/send_address',
    //     {
    //         method: 'POST',
    //         body: JSON.stringify(req_data),
    //         headers: {
    //         'Content-Type': 'application/json'
    //         },
    //     }
    //     );

    // if (!response.ok) {
    // throw new Error(`Error! status: ${response.status}`);
    // }
    // const data = await response.json();
    // console.log(data);
    // } catch (error) {
    //     console.error('Error fetching study data:', error);
    // }
};

//검색
export const searchFoodHandler = async (address, lat, lon, text) => {
    const req_data = {
        road_name: address,
        latitude: lat,
        longitude: lon,
        query: text
    };
    console.log('꿈나무 검색');
    console.log(req_data);

    // try {
    //     const response = await fetch(
    //     'http://127.0.0.1:8000/db/adong/search',
    //     {
    //         method: 'POST',
    //         body: JSON.stringify(req_data),
    //         headers: {
    //         'Content-Type': 'application/json'
    //         },
    //     }
    //     );

    // if (!response.ok) {
    // throw new Error(`Error! status: ${response.status}`);
    // }
    // const data = await response.json();
    // console.log(data);
    // } catch (error) {
    //     console.error('Error fetching study data:', error);
    // }
}

///////////////////////////////////////////////////////////////
//문화누리카드
//근처
export const nearCultureHandler = async (address, lat, lon) => {
    const req_data = {
        road_name: address,
        latitude: lat,
        longitude: lon,
    };
    console.log('문화누리 근처');
    console.log(req_data);

    // try {
    //     const response = await fetch(
    //     'http://127.0.0.1:8000/db/adong/send_address',
    //     {
    //         method: 'POST',
    //         body: JSON.stringify(req_data),
    //         headers: {
    //         'Content-Type': 'application/json'
    //         },
    //     }
    //     );

    // if (!response.ok) {
    // throw new Error(`Error! status: ${response.status}`);
    // }
    // const data = await response.json();
    // console.log(data);
    // } catch (error) {
    //     console.error('Error fetching study data:', error);
    // }
}
//검색
export const searchCultureHandler = async (address, lat, lon, text) => {
    const req_data = {
        road_name: address,
        latitude: lat,
        longitude: lon,
        query: text
    };
    console.log('문화누리 검색');
    console.log(req_data);

    // try {
    //     const response = await fetch(
    //     'http://127.0.0.1:8000/db/noori/search',
    //     {
    //         method: 'POST',
    //         body: JSON.stringify(req_data),
    //         headers: {
    //         'Content-Type': 'application/json'
    //         },
    //     }
    //     );

    // if (!response.ok) {
    // throw new Error(`Error! status: ${response.status}`);
    // }
    // const data = await response.json();
    // console.log(data);
    // } catch (error) {
    //     console.error('Error fetching study data:', error);
    // }
}