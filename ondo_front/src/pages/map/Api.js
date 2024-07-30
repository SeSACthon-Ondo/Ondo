// 꿈나무 카드

// 근처
export const nearFoodHandler = async () => {
    try {
        const response = await fetch(
        'http://127.0.0.1:8000/db/adong_infos/',
        {
            method: 'GET',
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
    } catch (error) {
        console.error('Error fetching study data:', error);
    }
};
//검색
export const searchFoodHandler = () => {}

//문화누리카드

//근처
export const nearCultureHandler = () => {}
//검색
export const searchCultureHandler = () => {}