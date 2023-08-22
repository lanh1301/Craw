from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
import time
from datetime import datetime
import re
from validate_email import validate_email


def findFather(child, nameFather):
    
    parent_element = child
    while parent_element.tag_name != nameFather:
        parent_element = parent_element.find_element(By.XPATH,'..')
    return parent_element.text
def next_(present):
    present = present.find_element(By.XPATH,"following-sibling::*[1]")
    return present
def parent(present):
    present = present.find_element(By.XPATH,'..')
    return present


def Type2(driver,result):
    Domain = driver.current_url.split('/')[-2]
    name               = driver.title.split('|')[0].split('-')[0].strip()
    emailValidate = ''
    try:
        logo                = driver.find_element(By.CSS_SELECTOR, f'svg[aria-label="{name}"]').find_element(By.CSS_SELECTOR,'g image').get_attribute('xurl:href')
    except: logo            = ''
    try:
        email     = findFather(driver.find_element(By.XPATH, "//div[text()='Email']"),'li').split('\n')[0]
    except: email     = ''
    if email != '':
        is_valid = validate_email(email, check_mx=True)
        if is_valid:
            emailValidate = 'True'
        else:
            emailValidate = 'False'    
    try:
        telephone     = findFather(driver.find_element(By.XPATH, "//div[text()='Mobile']"),'li').split('\n')[0]
    except: telephone     = ''
    try:
        website   = findFather(driver.find_element(By.XPATH, "//div[text()='Website']"),'li').split('\n')[0]
    except: website     = ''
    try:
        child_Hours     = findFather(driver.find_element(By.XPATH, "//div[text()='Hours']"),'li').split('\n')[0]
    except: child_Hours     = ''
    try:
        categories      = next_(parent(driver.find_element(By.CSS_SELECTOR,'img[src="https://static.xx.fbcdn.net/rsrc.php/v3/yr/r/lhdCVH10kLz.png"]'))).text.split('\n')[0]
    except: categories      = ''
    try:
        address         = next_(parent(driver.find_element(By.CSS_SELECTOR,'img[src="https://static.xx.fbcdn.net/rsrc.php/v3/yS/r/poZ_P5BwYaV.png"]'))).text.split('\n')[0]
    except: address         = ''
    try:
        ratingCheckin            = next_(parent(driver.find_element(By.CSS_SELECTOR,'img[src="https://static.xx.fbcdn.net/rsrc.php/v3/yz/r/IawsY0Yjegk.png"]'))).text.split('\n')[0]
    except: ratingCheckin            = ''
    try:
        rantingFollow          = driver.find_element(By.CSS_SELECTOR, f'a[href="https://www.facebook.com/{Domain}/followers/"]').text.split(' ')[0]
    except: rantingFollow          = ''
    try:
        ratingLike            = driver.find_element(By.CSS_SELECTOR, f'a[href="https://www.facebook.com/{Domain}/friends_likes/"]').text.split(' ')[0] 
    except: ratingLike            = ''
    latitude = ''
    longitude = ''
    try:
        Coordinates = parent(parent(driver.find_element(By.CSS_SELECTOR, 'div[aria-label="View map info"]'))).find_element(By.CSS_SELECTOR,"div").get_attribute('style')

        match = re.search(r'center=([\d\.]+)%2C([\d\.]+)', Coordinates)
        
        if match:
            latitude = match.group(1)
            longitude = match.group(2)
            
    except: Coordinates         = ''
    # crawl 
    driver.execute_script("window.scrollTo(0, 200);")
    driver.find_element(By.XPATH, "//span[text()='Page transparency']").click()
    time.sleep(1)
    try:
        pageID         = next_(parent(driver.find_element(By.CSS_SELECTOR,'img[src="https://static.xx.fbcdn.net/rsrc.php/v3/y-/r/olD6qzqyixJ.png"]'))).text.split('\n')[0]
    except: pageID         = ''
    try:
        dateCreated         = next_(parent(driver.find_element(By.CSS_SELECTOR,'img[src="https://static.xx.fbcdn.net/rsrc.php/v3/yG/r/p7Pf4gSWotr.png"]'))).text.split('\n')[0]
        date_str            = dateCreated
        date_obj            = datetime.strptime(date_str, '%d %B %Y')
        dateCreated         = date_obj.strftime('%d/%m/%Y')
    except: dateCreated         = ''
    try:
        owns         = next_(parent(driver.find_element(By.CSS_SELECTOR,'img[src="https://static.xx.fbcdn.net/rsrc.php/v3/yV/r/VHDIl6nNAEW.png"]'))).text.split('\n')[1]
    except: owns         = ''
    try:
        advertisement         = next_(parent(driver.find_element(By.CSS_SELECTOR,'img[src="https://static.xx.fbcdn.net/rsrc.php/v3/yb/r/Ix9L9CJxYBf.png"]'))).text
    except: advertisement         = ''
    
    url                    = driver.current_url.split('/about')[0]
    
    result                      = {
        'id'            : '',
        'name'          : name,
        'categories'    : categories,
        'logo'          : logo,
        'email'         : email,
        'emailValidate' : emailValidate,
        'telephone'     : telephone,
        'website'       : website,
        'HoursOpen'     : child_Hours,
        'pageID'        : pageID,
        'dateCreated'   : dateCreated,
        'owns'          : owns,
        
        }   
     
    result['place']             = {
        'address'       : address,
        'latitude'      : latitude,
        'longitude'     : longitude
    }
    
    result['ratingValue']       = {
        'ratingCheckin' : ratingCheckin,
        'ratingLike'    : ratingLike,
        'rantingFollow' : rantingFollow,
    }
    result['advertisement']     = advertisement
    result['sourceBrandname']   =  'Facebook'
    result['url'] =  url
    
    return result


def Type1(driver,result):
    name               = driver.title.split('|')[0].split('-')[0].strip()
    logo                = driver.find_element(By.CSS_SELECTOR,'g[mask] image').get_attribute('xlink:href')
    latitude = ''
    longitude = ''
    Info = parent(parent(driver.find_element(By.XPATH, "//span[text()='ADDITIONAL CONTACT INFO']"))).text.replace(' ', '')
    try:
        Coordinates         = parent(parent(driver.find_element(By.CSS_SELECTOR, 'div[aria-label="View map info"]'))).find_element(By.CSS_SELECTOR,"div").get_attribute('style')

        match = re.search(r'center=([\d\.]+)%2C([\d\.]+)', Coordinates)
        
        if match:
            latitude = match.group(1)
            longitude = match.group(2)
    except: Coordinates         = ''
    try:
        address             = next_(parent(driver.find_element(By.CSS_SELECTOR, 'div[aria-label="Map view"]'))).text
    except : address = ''
    try:
        ratingLike             = parent(driver.find_element(By.XPATH, "//span[text()='like this']")).text.split(' ')[0]
    except : ratingLike = ''
    try:
        ratingFollow             = driver.find_element(By.XPATH, "//span[contains(text(), 'follow this') or contains(text(), 'follow this')]").text.split(' ')[0]
    except : ratingFollow = ''
    try:
        ratingCheckin             = parent(driver.find_element(By.XPATH, "//span[text()=' checked in here']")).text.split(' ')[0]
    except : ratingCheckin = ''
    try:
        categories             = parent(parent(parent(parent(driver.find_element(By.XPATH, "//span[text()='GENERAL']"))).find_element(By.CSS_SELECTOR,'a'))).text
    except : categories = ''
    try:
        website             = re.findall(r"(?P<web>http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+)", Info)[0]
    except :website = ''
    try:
        telephone             = re.findall(r'\b\d{10}\b', Info)[0]
    except : telephone = ''
    try:
        email             = re.findall(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', Info)[0]
    except : email = ''
    if email != '':
        is_valid = validate_email(email, check_mx=True)
        if is_valid:
            emailValidate = 'True'
        else:
            emailValidate = 'False' 
    try:
        openingHours             = parent(parent(driver.find_element(By.XPATH,'//i[contains(@style, "background-image") and contains(@style, "-147px -145px")]'))).text
    except : openingHours = ''
    try:
        abstract             = parent(parent(parent(driver.find_element(By.XPATH, "//span[text()='MORE INFO']")))).text.replace('About\n','').replace('Additional information','').split('\n')[1:]
    except : abstract = ''
    
    
    url                    = driver.current_url.split('/about')[0]
    
    result     = {
        'id'            : '',
        'name'          : name,
        'categories'    : categories,
        'logo'          : logo,
        'email'         : email,
        'emailValidate' : emailValidate,
        'telephone'     : telephone,
        'website'       : website,
        'openingHours'  : openingHours,
        }    
    result['place'] = {
        'address'       : address,
        'latitude'      : latitude,
        'longitude'     : longitude
        }
    result['ratingValue'] = {
        'ratingCheckin'       : ratingCheckin,
        'ratingLike'          : ratingLike,
        'ratingFollow'        : ratingFollow
    }
    result['abstract']      = abstract
    result['sourceBrandname'] =  'Facebook'
    result['url'] =  url
    
    return result
def run(link):
    result = {}
    options = Options()
    options.add_argument('--lang=en')
    driver = webdriver.Chrome(options=options) 
    driver.get(link)
    try:
        try:
            if driver.find_element(By.CSS_SELECTOR,'h2').text == "This page isn't available":
                driver.quit()
                return result
            time.sleep(2)
            driver.execute_script("window.scrollTo(0, 200);")
            driver.find_element(By.XPATH, "//span[text()='Page transparency']")
            result = Type2(driver, result)
            driver.quit()
            return result
        except:     
            time.sleep(2)
            result = Type1(driver, result)
            driver.quit()
            return result
    except:
        driver.quit()
        return result  