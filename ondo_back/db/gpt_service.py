import os
import pandas as pd

from dotenv import load_dotenv
from langchain.chains.llm import LLMChain
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate

load_dotenv()

os.environ["LANGCHAIN_TRACING_V2"] = "true"

llm = ChatOpenAI(openai_api_key=os.environ["OPENAI_API_KEY"], model_name='gpt-4o-mini', temperature=0.9)

cuisine_prompt = """
당신은 음식점에 대한 정보를 받고, 그 정보를 기반으로 유저가 원하는 음식점을 찾아주는 챗봇의 역할을 수행합니다.
유저의 현재 위치(위도, 경도)는 {user_location}이고, 유저가 원하는 음식은 {user_cuisine}입니다.
유저를 중심으로 주변에 있는 음식점의 리스트로 {restaurant_candidates}가 있습니다.

유저의 현재 위치({user_location})을 기준으로 {restaurant_candidates} 중에서 유저에게 가까우면서 원하는 음식({user_cuisine})을 판매하는 음식점 3곳을 찾아줘야 합니다.
만약, 유저가 원하는 음식에 대한 정보가 없다면 거리 기준으로 가장 가까운 음식점 3곳을 추천해주면 됩니다.

유저에게 추천해줄 음식점의 정보는 음식점 이름, 음식점 카테고리, 음식점 위치(주소), 음식점 메뉴입니다.
만약, 음식점 카테고리, 음식점 메뉴에 대한 정보가 없다면 해당 정보는 '-'를 출력하면 됩니다.
또한, 유저가 원하는 음식을 판매하는 음식점이 없다면 "주변에 판매하는 식당이 없습니다"로 출력해주면 됩니다.

이러한 정보를 제외하고는 어떠한 말도 포함되어 있어서는 안됩니다.
출력의 형식은 아래의 예시와 같이 출력하면 됩니다. 반드시 준수해야 합니다.
다른 형식이 아닌 아래 예시의 형태로 반드시 출력해야 합니다.
예시)
[
   {{
      음식점 이름: 미스터피자,
      음식점 카테고리: 피자,
      음식점 위치: 서울시 강남구 역삼동 123-45,
      음식점 메뉴: 피자, 파스타, 스테이크,
   }},
   {{
      음식점 이름: 미스터도넛,
      음식점 카테고리: 도넛,
      음식점 위치: 서울시 강남구 역삼동 123-46,
      음식점 메뉴: -,
   }},
   {{
      음식점 이름: 미스터김밥,
      음식점 카테고리: -,
      음식점 위치: 서울시 강남구 역삼동 123-47,
      음식점 메뉴: 김밥, 라면, 떡볶이,
   }}
]

"""

prompt = PromptTemplate.from_template(template=cuisine_prompt)
chain = LLMChain(prompt=prompt, llm=llm)

def get_recommendations_from_csv(csv_file_path):
    # CSV 파일 읽기
    df = pd.read_csv(csv_file_path)

    # 필요한 정보 추출
    user_location = df['user_location'][0]  # 첫 번째 행의 사용자 위치
    user_cuisine = df['user_cuisine'][0]  # 첫 번째 행의 사용자 음식
    restaurant_candidates = df['restaurant_candidates'][0].split(', ')  # 음식점 리스트를 쉼표로 분할

    # 추천 음식점 정보 요청
    recommended_restaurants = chain.invoke(input={
        "user_location": user_location,
        "user_cuisine": user_cuisine,
        "restaurant_candidates": restaurant_candidates
    })

    return recommended_restaurants