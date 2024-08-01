import os
import pandas as pd

from dotenv import load_dotenv
from langchain.chains.llm import LLMChain
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate

load_dotenv()

os.environ["LANGCHAIN_TRACING_V2"] = "true"

llm = ChatOpenAI(openai_api_key=os.environ["OPENAI_API_KEY"], model_name='gpt-4o-mini', temperature=0.9)

nutrient_prompt = """
당신은 유저가 그동안 먹었던 음식에 대한 정보를 받고, 그 정보를 기반으로 유저가 어떠한 음식을 좋아하는지 분석하여 해당 음식을 판매하는 음식점을 찾아주는 챗봇의 역할을 수행합니다.
유저의 현재 위치(위도, 경도)는 {user_location}이고, 유저가 먹은 음식들은 {user_cuisine_history}입니다.
각 가맹점의 리뷰에 해당하는 데이터로 {review_data}가 제공됩니다.

유저를 중심으로 주변에 있는 음식점의 리스트로 {restaurant_candidates}가 있습니다.
{user_cuisine_history}에 대한 음식 정보를 바탕으로 유저가 어떠한 음식을 좋아하는지 파악해 {restaurant_candidates}에서 판매하는 메뉴 중 3개를 추천해주세요.
{user_cuisine_history}에 대한 정보가 없다면 {user_cuisine_history} 대신 "한식", "김밥" 으로 반영해서 추천해주세요.
음식점 중 술과 관련된 음식점 또는 유흥업소는 제외합니다.

각각의 메뉴에 대해 음식점 이름, 음식점 카테고리, 음식점 위치(주소), 해당 메뉴, 리뷰를 제공해주시면 됩니다.
만약, 유저가 원하는 음식을 판매하는 음식점이 없다면 추천하는 음식점 3곳을 추천해주면 됩니다.
리뷰의 경우, 해당 가맹점에 있는 모든 리뷰를 가져와 출력해주세요. 리뷰의 갯수가 10개면 10개 모두, 하나도 없으면 "-"로 출력하면 됩니다.

이러한 정보를 제외하고는 어떠한 말도 포함되어 있어서는 안됩니다.
출력의 형식은 아래의 예시와 같이 출력하면 됩니다. 반드시 준수해야 합니다.
다른 형식이 아닌 아래 예시의 형태로 반드시 출력해야 합니다.
출력을 할 때에는 \와 같은 특수문자들이 독립적으로 사용되는 것들은 지우고 출력해주세요. 개행문자, 줄넘김 표현과 같은 것은 유지하고 큰 따옴표나 작은 따옴표 같은 것도 지우지 말고 유지해주세요.
큰 따옴표도 출력에서 제외시켜주세요.
예시)
[
   {{
      음식점 이름: 미스터피자,
      음식점 카테고리: 피자,
      음식점 위치: 서울시 강남구 역삼동 123-45,
      음식점 메뉴: 피자, 파스타, 스테이크,
      음식점 리뷰: 맛있어요, 피자가 커요, 토핑이 많아요
   }},
   {{
      음식점 이름: 미스터도넛,
      음식점 카테고리: 도넛,
      음식점 위치: 서울시 강남구 역삼동 123-46,
      음식점 메뉴: -,
      음식점 리뷰: 맛있어요, 너무 달아요, 양이 많아요
   }},
   {{
      음식점 이름: 미스터김밥,
      음식점 카테고리: -,
      음식점 위치: 서울시 강남구 역삼동 123-47,
      음식점 메뉴: 김밥, 라면, 떡볶이,
      음식점 리뷰: 맛없어요, 양이 많아요, 가격이 싸요
   }}
]

"""

prompt = PromptTemplate.from_template(template=nutrient_prompt)
chain = LLMChain(prompt=prompt, llm=llm)

def get_recommendations_from_history(csv_file_path):
    # CSV 파일 읽기
    df = pd.read_csv(csv_file_path)

    # 필요한 정보 추출
    user_location = df['user_location'][0]  # 첫 번째 행의 사용자 위치
    user_cuisine_history = df['user_cuisine_history'][0].split(', ')
    restaurant_candidates = df['restaurant_candidates'][0].split(', ')  # 음식점 리스트를 쉼표로 분할
    review_data = df['review_data'][0].split(', ')

    # 추천 음식점 정보 요청
    recommand_restaurants = chain.invoke(input={
        "user_location": user_location,
        "user_cuisine_history": user_cuisine_history,
        "restaurant_candidates": restaurant_candidates,
        "review_data": review_data
    })

    return recommand_restaurants