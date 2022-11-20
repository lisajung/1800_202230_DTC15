from bs4 import BeautifulSoup
import requests
import re
from csv import writer


# Website information
url = "https://www.todocanada.ca/things-vancouver-weekend/"
headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36'}
page = requests.get(url, headers= headers)

# Initialize Beautiful Soup
soup = BeautifulSoup(page.content, 'html.parser')
lists = soup.find_all('article')

# Open CSV to write
with open('event_data.csv', 'w', encoding='utf8', newline='') as file:
    writer = writer(file)
    header = ['Title', 'Link', 'Location', 'Cost', 'StartDate', 'EndDate', 'NumericalDate', 'Image', 'Poster', 'Description', "Preview"]
    writer.writerow(header)
    
    # Iterate over each article
    for list in lists:
        h2 = list.find('h2', class_ = "entry-title")
        a = h2.find('a', attrs={'href': re.compile("^https://")})
        img = list.find('img', attrs={'data-lazy-src': re.compile("^https://")})

        title = h2.find('a').text
        link = a.get('href')
        image = img.get('data-lazy-src')
        location = "Not Specified"
        cost = "Not Specified"
        date = "Not Specified"
        for p in list.find_all('p', class_="address"):
            location = list.find('p', class_ = "address").text
        for p in list.find_all('p', class_="ampprice"):
            cost = list.find('p', class_ = "ampprice").text
        for p in list.find_all('p', class_="event_date"):
            date = list.find('p', class_ = "event_date").text.rstrip()


        if date != 'Not Specified':
            # Scrape each specific article
            url = link
            headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36'}
            page = requests.get(url, headers= headers)

            # Reinitialize Beautiful Soup
            soup = BeautifulSoup(page.content, 'html.parser')
            paragraphs = str(soup.find_all('div', class_ ="entry-content frontend-entry-content"))
            paragraphs.replace(',', '')
            paragraph_list = paragraphs.split('<p>')
            description = paragraph_list[1]
            poster = str(soup.find_all('img', attrs={'src': re.compile("https://")})[2])
            StartDate = soup.find('span', class_="frontend_st_date frontend_datepicker").text
            EndDate = soup.find('span', class_="frontend_end_date frontend_datepicker").text

            months = {'January': 1, 'February': 2, 'March': 3, 'April': 4, 'May': 5, 'June': 6, 'July': 7, 'August': 8, 'September': 9, 'October': 10, 'November': 11, 'December': 12}
            listdate = EndDate.split(" ")
            numericaldate = 0
            numericaldate += int(listdate[2]) * 10000 + months.get(listdate[0]) * 100 + int(listdate[1].replace(",", ""))
            

        # Event Title
        title = str(title).replace(',',"")
        # Event Link
        link = str(link).replace(',',"")
        # Event Location
        location = str(location).replace(',',"")
        # Event Cost
        cost = str(cost).replace(',',"")
        # Event Start Date
        StartDate = str(StartDate).replace(',',"")
        # Event End Date
        EndDate = str(EndDate).replace(',',"")
        # Event Image
        image = str(image).replace(',',"")
        # Poster Image
        poster = poster.replace('<img src="', '')
        poster = poster.replace('"/>', '')
        # Description
        text = description.split('</p>')[0]
        text = text.replace('<span class=""TextRun SCXW197544240 BCX0"" data-contrast=""none"" lang=""EN-US"" xml:lang=""EN-US"">', '')
        text = text.replace('<span class=""NormalTextRun CommentStart SCXW197544240 BCX0"">', '')
        text = text.replace('</span>', '')
        text = text.replace('<span class=""NormalTextRun SCXW197544240 BCX0"">', '')
        text = text.replace('<br/>', '')
        text = text.replace(',', '')
        if 'span' in text or len(text) <= 1:
            text = 'No Description Available'
        # Preview
        if len(text) > 80:
            preview = text[:80] + "..."
        else:
            preview = text

        if date != 'Not Specified':
            info = [title, link, location, cost, StartDate, EndDate, numericaldate, image, poster, text, preview]
            print(info)
            # print(info)
            writer.writerow(info)