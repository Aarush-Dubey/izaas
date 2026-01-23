from splitwise import Splitwise
import os
from pathlib import Path
from dotenv import load_dotenv
# Load .env located in the backend directory
env_path = Path(__file__).resolve().parent / '.env'
load_dotenv(dotenv_path=env_path)
CONSUMER_KEY = os.getenv("SPLITWISE_CONSUMER_KEY")
CONSUMER_SECRET = os.getenv("SPLITWISE_CONSUMER_SECRET")
CONSUMER_API_KEY = os.getenv("SPLITWISE_API_KEY")
print(CONSUMER_KEY, CONSUMER_SECRET)

sObj = Splitwise(consumer_key=CONSUMER_KEY, consumer_secret=CONSUMER_SECRET)
url, secret = sObj.getAuthorizeURL()
print(url, secret)