from facebook_process.facebook_process import run
from chromedriver_autoinstaller import install
import pandas as pd
import json
install()

path_url = 'C:/Users/ASUS/OneDrive/Desktop/RTA_test/Code_Train/crawlers-master/src/LamGiauDuLieu/linkfb.xlsx'
path_to_save_data = 'C:/Users/ASUS/OneDrive/Desktop/RTA_test/Code_Train/crawlers-master/src/LamGiauDuLieu/danhGia'
if __name__ == "__main__":
    results = []
    Successfully = 0
    Unsuccessfully = 0
    test = pd.read_excel(path_url)
    for i in range(len(test['link_fb'])):
        result = run(test['link_fb'][i])
        if result != {}:
            results.append(result)
            print(f'Crawl Successfully URL{i}')
            Successfully+=1
        else:
            print(f'Crawl Unsuccessfully URL{i}')
            Unsuccessfully+=1
    print(f'Number of successful crawl urls:{Successfully}')
    print(f'Number of unsuccessful crawl urls:{Unsuccessfully}')
    
    with open(f'{path_to_save_data}/result1.json', "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=4)  


    