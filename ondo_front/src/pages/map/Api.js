function customSplit(text) {
    // 정규 표현식 패턴: 숫자와 숫자 사이에 있는 ,를 찾습니다.
    const pattern = /(?<=\d),(?=\d)/g;
    // 패턴에 맞는 ,를 기준으로 분리합니다.
    return text.split(pattern);
}

const transformGptData = (data) => {
    return data.map((item) => {
        const menuArray = item.menu.split(', ');
        const menuObject = {};
        menuArray.forEach((menuItem, idx) => {
            menuObject[`메뉴${idx + 1}`] = menuItem.trim();
        });

        return {
            name: item.name.trim(),
            address: item.address.trim(),
            category: item.category.trim(),
            menu: menuObject,
        };
    });
};

const transformNooriData = (data) => {
    console.log(data);
    return data.map((item) => {
        console.log(`Transforming item:`, item); // 데이터 변환 전 출력

        // menu 필드가 없는 데이터 처리
        return {
            name: item.name ? item.name.trim() : null,
            address: item.address ? item.address.trim() : null,
            category: item.category ? item.category.trim() : null,
            menu: {} // menu 필드가 없으므로 빈 객체로 설정
        };
    });
};


const transformFavoriteData = (data) => {
    return data[0].recommend.split(',').map((item) => item.trim());
};

const transformReviewData = (data) => {
    return data[0].recommend.split(',').map((item) => item.trim());
};



// 꿈나무 카드
// 근처
export const nearFoodHandler = async (address, lat, lon, setDummyData, setDummyAI, setRefresh, refresh, setIsLoading) => {
    // 로딩 시작
    setIsLoading(true);

    // 전송 데이터
    const req_data = {
        road_name: address,
        latitude: lat,
        longitude: lon
    };

    console.log('꿈나무 근처');
    console.log(req_data);

    try {
        const response = await fetch('http://127.0.0.1:8000/db/adong/send_address/', {
            method: 'POST',
            body: JSON.stringify(req_data),
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if (!response.ok) {
            throw new Error(`Error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);
        console.log(data.gpt_data);

        // gpt_data 변환
        const transformedGptData = transformGptData(data.gpt_data);
        setDummyData(transformedGptData);

        // favorite_data 변환
        const transformedFavoriteData = transformFavoriteData(data.favorite_data);
        setDummyAI(transformedFavoriteData);

        
        setRefresh(refresh * -1);
    } catch (error) {
        console.error('Error fetching study data:', error);
    } finally {
        // 로딩 종료
        setIsLoading(false);
    }
};

//검색
export const searchFoodHandler = async (address, lat, lon, text, setDummyData, setIsClicked, setRefresh, refresh, setIsLoading) => {
    setIsLoading(true);

    const req_data = {
        road_name: address,
        latitude: lat,
        longitude: lon,
        query: text
    };
    console.log('꿈나무 검색');
    console.log(req_data);

    try {
        const response = await fetch(
        'http://127.0.0.1:8000/db/adong/search/',
        {
            method: 'POST',
            body: JSON.stringify(req_data),
            headers: {
            'Content-Type': 'application/json'
            },
        }
        );

        if (!response.ok) {
            throw new Error(`Error! status: ${response.status}`);
        }
        
        const data = await response.json();

        console.log(data);
        const transformedData = transformGptData(data);
        setDummyData(transformedData);
        setIsClicked(false);
        setIsLoading(false);
        setRefresh(refresh * -1);
    } catch (error) {
        console.error('Error fetching study data:', error);
    }
};

///////////////////////////////////////////////////////////////
//문화누리카드
//근처
export const nearCultureHandler = async (address, lat, lon, setDummyData, setDummyAI, setRefresh, refresh, setIsLoading) => {
    // 로딩 시작
    setIsLoading(true);

    // 전송 데이터
    const req_data = {
        road_name: address,
        latitude: lat,
        longitude: lon
    };
    console.log('문화누리 근처');
    console.log(req_data);

    try {
        const response = await fetch(
        'http://127.0.0.1:8000/db/noori/send_address/',
        {
            method: 'POST',
            body: JSON.stringify(req_data),
            headers: {
            'Content-Type': 'application/json'
            },
        }
        );

    if (!response.ok) {
    throw new Error(`Error! status: ${response.status}`);
    }
    const data = await response.json();
        console.log(data);

        // gpt_data 변환
        const transformedGptData = transformNooriData(data);
        setDummyData(transformedGptData);

        // favorite_data 변환
        // const transformedFavoriteData = transformFavoriteData(data.favorite_data);
        // setDummyAI(transformedFavoriteData);

        setRefresh(refresh * -1);
    } catch (error) {
        console.error('Error fetching study data:', error);
    } finally {
        // 로딩 종료
        setIsLoading(false);
    }
};

//검색
export const searchCultureHandler = async (address, lat, lon, text, setDummyData, setIsClicked, setRefresh, refresh, setIsLoading) => {
    setIsLoading(true);

    const req_data = {
        road_name: address,
        latitude: lat,
        longitude: lon,
        query: text
    };

    console.log('문화누리 검색');
    console.log(req_data);

    try {
        const response = await fetch(
        'http://127.0.0.1:8000/db/noori/search/',
        {
            method: 'POST',
            body: JSON.stringify(req_data),
            headers: {
            'Content-Type': 'application/json'
            },
        }
        );

    if (!response.ok) {
    throw new Error(`Error! status: ${response.status}`);
    }

    const data = await response.json();

    console.log(data);
    const transformedData = transformNooriData(data);
    setDummyData(transformedData);
    setIsClicked(false);
    setIsLoading(false);
    setRefresh(refresh * -1);

    } catch (error) {
        console.error('Error fetching study data:', error);
    } finally {
        // 로딩 종료
        setIsLoading(false);
    }
}