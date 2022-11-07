from bs4 import BeautifulSoup
import requests
import re
from csv import writer


url = "https://www.todocanada.ca/things-vancouver-weekend/"
headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36'}
page = requests.get(url, headers= headers)

soup = BeautifulSoup(page.content, 'html.parser')
lists = soup.find_all('article')

with open('event_data.csv', 'w', encoding='utf8', newline='') as file:
    thewriter = writer(file)
    header = ['Title', 'Link', 'Location', 'Cost', 'Date', 'Image']
    thewriter.writerow(header)
    for list in lists:
        h2 = list.find('h2', class_ = "entry-title")
        a = h2.find('a', attrs={'href': re.compile("^https://")})
        img = list.find('img', attrs={'data-lazy-src': re.compile("^https://")})

        title = h2.find('a').text
        link = a.get('href')
        src = img.get('data-lazy-src')
        location = "Not Specified"
        cost = "Not Specified"
        date = "Not Specified"
        for p in list.find_all('p', class_="address"):
            location = list.find('p', class_ = "address").text
        for p in list.find_all('p', class_="ampprice"):
            cost = list.find('p', class_ = "ampprice").text
        for p in list.find_all('p', class_="event_date"):
            date = list.find('p', class_ = "event_date").text


        info = [title, link, location, cost, date, src]
        thewriter.writerow(info)