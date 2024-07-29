import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import icon from '../../assets/ondo_white.png';
import style from './Send_address.module.css';

const Send_address_Test = () => {
    const navigate = useNavigate();
    const [address, setAddress] = useState(''); // 주소 상태 추가
    const [latitude, setLatitude] = useState(''); // 위도 상태 추가
    const [longitude, setLongitude] = useState(''); // 경도 상태 추가
    const [error, setError] = useState(''); // 오류 상태 추가
    const [sentData, setSentData] = useState(null); // 전송된 데이터 상태 추가

    const goMainHandler = async () => {
        if (!address) {
            setError('주소를 입력하세요.'); // 주소가 비어 있을 때 오류 처리
            return;
        }

        const sendData = await sendAddress(); // 주소 전송 함수 호출
        if (sendData) {
            setSentData(sendData); // 전송된 데이터 상태 업데이트
            setError(''); // 오류 상태 초기화
        } else {
            setError('주소 전송에 실패했습니다.'); // 오류 발생 시 상태 업데이트
        }
    };

    const sendAddress = async () => {
        try {
            const response = await fetch(
                'http://127.0.0.1:8000/db/adong/send_address/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        road_name: address,
                        latitude: latitude, // 위도 추가
                        longitude: longitude // 경도 추가
                    }) // 주소, 위도, 경도를 JSON 형태로 전송
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Error! status: ${response.status}, message: ${errorData.error || errorData.message}`);
            }

            const data = await response.json();
            console.log('주소 전송 결과:', data);
            return data; // 성공적으로 주소를 전송
        } catch (error) {
            console.error('Error sending address:', error);
            setError(error.message); // 오류 메시지를 상태에 저장
            return null; // 오류 발생 시 null 반환
        }
    };

    return (
        <div className={style.container}>
            <div className={style.title_wrapper} role="button" tabIndex={0}>
                <img src={icon} className={style.mainImg} alt="온 도" />
                <p className={style.title}>온 도</p>
                <p className={style.info}>따뜻함을 나눠주는 지도</p>
            </div>
            <input
                type="text"
                className={style.addressInput}
                placeholder="도로명 주소를 입력하세요"
                value={address}
                onChange={(e) => setAddress(e.target.value)} // 주소 입력 시 상태 업데이트
            />
            <input
                type="text"
                className={style.addressInput}
                placeholder="위도를 입력하세요"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)} // 위도 입력 시 상태 업데이트
            />
            <input
                type="text"
                className={style.addressInput}
                placeholder="경도를 입력하세요"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)} // 경도 입력 시 상태 업데이트
            />
            {error && <p className={style.error}>{error}</p>} {/* 오류 메시지 표시 */}
            {sentData && (
                <div className={style.sentData}>
                    <p>전송된 데이터:</p>
                    <pre>{JSON.stringify(sentData, null, 2)}</pre> {/* 전송된 데이터 표시 */}
                </div>
            )}
            <button onClick={goMainHandler} className={style.submitButton}>주소 전송</button> {/* 버튼 추가 */}
        </div>
    );
};

export default Send_address_Test;
