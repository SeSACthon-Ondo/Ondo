import getpass
import os
import pandas as pd

from dotenv import load_dotenv
from langchain.chains.llm import LLMChain
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
from langchain_core.prompts import PromptTemplate

load_dotenv()

os.environ["LANGCHAIN_TRACING_V2"] = "true"

llm = ChatOpenAI(openai_api_key=os.environ["OPENAI_API_KEY"], model_name='gpt-4o-mini', temperature=0.9)

product_prompt = """
당신은 유저가 원하는 물품{product_query}에 대한 정보를 받고 그 정보를 기반으로 {store_candidates}를 기반하여 어느 가맹점에서 해당 물품을 구매하거나 해당 행위를 할 수 있는 장소를 찾아주는 챗봇의 역할을 수행합니다.
유저의 현재 위치(위도, 경도)는 {user_location}이고 유저를 중심으로 주변에 있는 가맹점 리스트로 {store_candidates}가 있습니다.
유저가 원하는 것({product_query}을 구매할 수 있는 장소 또는 해당 행위를 할 수 있는 장소를 {store_candidates} 중에서 3곳을 추천해주세요.
분류는 공연, 체육용품, 영상, 문화체험, 도서, 미술, 여행사, 교통수단, 숙박, 음악, 관광지, 체육시설, 스포츠관람 로 나누어집니다.
유저가 원하는 것({product_query})와 가장 관련이 높은 가맹점을 위의 분류를 기반으로 찾아주시면 됩니다.
예를 들면, 책(독서)는 도서, 영화는 공연 또는 영상, 자전거는 체육용품, 미술용품은 미술, 여행상품은 여행사, 숙박은 숙박 등으로 분류됩니다.
각각의 가맹점에 대해 가맹점 이름, 가맹점 분류, 가맹점 위치(주소)를 제공해주시면 됩니다.
음식점 중 술과 관련된 음식점 또는 유흥업소는 제외합니다.

이러한 정보를 제외하고는 어떠한 말도 포함되어 있어서는 안됩니다.
출력의 형식은 아래의 예시와 같이 출력하면 됩니다. 반드시 준수해야 합니다.
다른 형식이 아닌 아래 예시의 형태로 반드시 출력해야 합니다.
예시)
[
   {{
      가맹점 이름: 한국마술문화협회,
      가맹점 카테고리: 공연,
      가맹점 위치: 서울시 강남구 역삼동 123-45,
   }},
   {{
      가맹점 이름: 삼천리자전거신월2동점,
      가맹점 카테고리: 체육용품,
      가맹점 위치: 서울 양천구 오목로 61,
   }},
   {{
      가맹점 이름: CGV 미아,
      가맹점 카테고리: 영상,
      가맹점 위치: 서울 강북구 도봉로 34트레지오 쇼핑몰 9층 일부 1 (미아동),
   }}
]

"""

prompt = PromptTemplate.from_template(template=product_prompt)
chain = LLMChain(prompt=prompt, llm=llm)

def get_noori_from_csv(csv_file_path):
    # CSV 파일 읽기
    df = pd.read_csv(csv_file_path)

    # 필요한 정보 추출
    user_location = df['user_location'][0]  # 첫 번째 행의 사용자 위치
    product_query = df['product_query'][0]  # 첫 번째 행의 사용자 음식
    store_candidates = df['store_candidates'][0].split(', ')  # 음식점 리스트를 쉼표로 분할

    # 추천 음식점 정보 요청
    recommended_stores = chain.invoke(input={
        "user_location": user_location,
        "product_query": product_query,
        "store_candidates": store_candidates
    })

    return recommended_stores