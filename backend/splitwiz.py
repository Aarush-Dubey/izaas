from splitwise import Splitwise
CONSUMER_KEY = "mXO5tSLPpWkCXUo1IX3aGaCzi8qO9dSHC6D1jlOK"
CONSUMER_SECRET = "cXLRsCEgXI0d15CSNkRimgWdRhKGwkgCORMMeyNj"
sObj = Splitwise(consumer_key=CONSUMER_KEY, consumer_secret=CONSUMER_SECRET, api_key="VbRTLeFeibMAemgWLphNnpd5UkjDnMnGPBDAvNki ")
url, secret = sObj.getAuthorizeURL()
current = sObj.getCurrentUser()
expenses = sObj.getExpenses(limit=20) 
            
synced_count = 0

for exp in expenses:
    print(exp.getId(), exp.getDescription(), exp.getCost())
print(url, secret, current)