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

favorite_prompt = """
당신은 유저가 그동안 먹었던 음식에 대한 정보를 받고, 그 정보를 기반으로 유저가 어떠한 음식을 좋아하는지 분석하여 해당 음식을 판매하는 음식점을 찾아주는 챗봇의 역할을 수행합니다.
유저의 현재 위치(위도, 경도)는 {user_location}이고, 유저가 먹은 음식들은 {user_cuisine_history}입니다.
{user_cuisine_history}에 대한 음식 정보를 바탕으로 유저가 어떠한 음식을 좋아하는지 파악해 유저가 여태 먹은 음식 취향과 비슷한 음식 3개를 추천해주세요.

각각의 메뉴에 대해 해당 메뉴를 제공해주시면 됩니다.
만약, 유저가 원하는 음식을 판매하는 음식점이 없다면 추천하는 음식 3가지를 출력해주면 됩니다.

이러한 정보를 제외하고는 어떠한 말도 포함되어 있어서는 안됩니다.
출력의 형식은 아래의 예시와 같이 출력하면 됩니다. 반드시 준수해야 합니다.
다른 형식이 아닌 아래 예시의 형태로 반드시 출력해야 합니다.
예시)
[
   {{
      추천 메뉴 : 닭갈비
   }},
   {{
      추천 메뉴 : 불고기
   }},
   {{
      추천 메뉴 : 삼겹살
   }}
]

"""

prompt = PromptTemplate.from_template(template=favorite_prompt)
chain = LLMChain(prompt=prompt, llm=llm)

def get_favorite_recommend(csv_file_path):
    # CSV 파일 읽기
    df = pd.read_csv(csv_file_path)

    # 필요한 정보 추출
    user_location = df['user_location'][0]  # 첫 번째 행의 사용자 위치
    user_cuisine_history = df['user_cuisine_history'][0].split(', ')

    # 추천 음식점 정보 요청
    recommend_foods = chain.invoke(input={
        "user_location": user_location,
        "user_cuisine_history": user_cuisine_history,
    })

    return recommend_foods