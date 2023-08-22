from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
import time
import pandas as pd

def fb_Search(companyname):
    count = 0
    data = pd.DataFrame()
    driver = webdriver.Chrome()
    driver.get('https://www.social-searcher.com/facebook-search')
    for i in companyname:
        name = i
        if 'TNHH' in i.upper(): 
            name = (i.upper().replace('CÔNG TY TNHH','') )
        elif 'CP' in i.upper():
            name = (i.upper().replace('CÔNG TY CP','') )
        else:
            name = (i.upper().replace('CÔNG TY CỔ PHẦN','') )
        driver.find_element(By.CSS_SELECTOR,'#facebooksearchinput').send_keys(name)
        driver.find_element(By.CSS_SELECTOR,'.facebook-page-form__btn').click()
        time.sleep(1)
        facebook_link = driver.find_element(By.CSS_SELECTOR,'.gsc-wrapper a').get_attribute('href')
        print(facebook_link)
        driver.find_element(By.CSS_SELECTOR,'#facebooksearchinput').clear()
        time.sleep(2)
        data.at[count, 'link_fb'] = 'https://www.facebook.com/' + facebook_link.split('/')[3] + '/about'
        count+=1
    driver.quit()
    data.to_excel('./../linkfb.xlsx', index=False)