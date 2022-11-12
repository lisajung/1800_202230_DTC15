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
    writer = writer(file)
    header = ['Title', 'Link', 'Location', 'Cost', 'Date', 'NumericalDate', 'Image', 'Description', 'Likes']
    writer.writerow(header)
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
            date = list.find('p', class_ = "event_date").text.rstrip()
            StartDate = list.find('span', itemprop = "startDate").text.rstrip()


        title = str(title).replace(',',"")
        link = str(link).replace(',',"")
        location = str(location).replace(',',"")
        cost = str(cost).replace(',',"")
        date = str(date).replace(',',"")
        src = str(src).replace(',',"")
        likes = 0

        if date != 'Not Specified':
            months = {'January': 1, 'February': 2, 'March': 3, 'April': 4, 'May': 5, 'June': 6, 'July': 7, 'August': 8, 'September': 9, 'October': 10, 'November': 11, 'December': 12}
            listdate = StartDate.split(" ")
            numericaldate = 0
            numericaldate += int(listdate[2]) * 10000 + months.get(listdate[0]) * 100 + int(listdate[1].replace(",", ""))



            url = link
            headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36'}
            page = requests.get(url, headers= headers)

            soup = BeautifulSoup(page.content, 'html.parser')
            paragraphs = str(soup.find_all('div', class_ ="entry-content frontend-entry-content"))
            paragraphs.replace(',', '')
            paragraph_list = paragraphs.split('<p>')
            description = paragraph_list[1]
            text = description.split('</p>')[0]
            text = text.replace('<span class=""TextRun SCXW197544240 BCX0"" data-contrast=""none"" lang=""EN-US"" xml:lang=""EN-US"">', '')
            text = text.replace('<span class=""NormalTextRun CommentStart SCXW197544240 BCX0"">', '')
            text = text.replace('</span>', '')
            text = text.replace('<span class=""NormalTextRun SCXW197544240 BCX0"">', '')
            text = text.replace('<br/>', '')
            text = text.replace(',', '')
            if 'span' in text or len(text) <= 1:
                text = 'No Description Available'

            print(text)
            
        url = "https://www.todocanada.ca/things-vancouver-weekend/"
        headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36'}
        page = requests.get(url, headers= headers)

        soup = BeautifulSoup(page.content, 'html.parser')
        lists = soup.find_all('article')

        if date != 'Not Specified':
            info = [title, link, location, cost, date, numericaldate, src, text, likes]
            print(info)
            writer.writerow(info)