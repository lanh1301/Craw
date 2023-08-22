# Những việc cần làm
- Kiểm tra tính chính xác của các thông tin sau :
    >Mã số thuế\
    Company Name\
    facebook_page
- Craw thêm dữ liệu trong quá trình làm
- Craw data từ facebook_page lấy ra các thông tin taxID - Organization
identifier - Person

# Hướng giải quyết 
- Kiểm tra tính chính xác của mã số thuế và Company Name:
    - Em dựa trên thông tin lấy được từ cổng thông tin quốc gia tại [đây](https://dichvuthongtin.dkkd.gov.vn/inf/Forms/Products/ProductCatalog.aspx?h)
    - Từ đó so sánh với dữ liệu crawl được để kiểm tra tính chính xác của nó.
- Kiểm tra về tính xác thực của facebook_page :
    - link facebook_page được lấy từ 2 nguồn:  
        - google search
        - website công ty
    - Truy cập vào và kiểm tra title của chúng, và so khớp với company_name để đánh giá facebook_page này.
    - vd : <**https://www.facebook.com/dottiestore/**> kết quả trà về : DOTTIE so với CÔNG TY TNHH DOTTIE --> True
- Craw thêm dữ liệu từ nhiều nguồn khác bằng:
    - Selenium
    - Requests, BeautifulSoup

# Lưu ý trong bài có validate_email check_mx cần phải có dns nhưng nó chỉ hộ trợ python 2 có thể thay thế bằng py3dns(xoá phần kiểm tra dns trong hàm check_mx)

# kết quả thu được:
- về độ lấp đầy dữ liệu.  
bảng sau thể hiện phần trăm dữ liệu bị thiếu trong bộ dữ liệu\
    company_name        : 0.00\
    website             : 0.00\
    address             : 0.00\
    location            : 0.01\
    masothue            : 0.00\
    email               : 0.16\
    is_email_valid      : 0.16\
    email_2             : 0.84\
    is_email_2_valid    : 0.84\
    phone               : 0.13\
    phone_2             : 0.86\
    latitude            : 0.00\
    longitude           : 0.00\
    facebook_page       : 0.08\
    linkedin            : 0.19\
    masothue_valid      : 0.00\
    nameCheck           : 0.00\
    nameRepla           : 0.86\
    instagram_page      : 0.84\
    titok_page          : 0.94\
    facebook_valid      : 0.06\
- facebook_page 
    - crawls được 94/100 
    - trong 94 facebook_page thì có 38 bị link False 
    - cần cải tiến độ chính xác của các phương pháp crawl này
- name_check:
    -  14/100 dữ liệu bị False 
    - Tìm được 14 tên công ty của dữ liệu bị Flase trên công thông tin quốc gia
# Hướng phát triển
- Cải thiện độ chính xác của dữ liệu 
- tiến hành không chỉ craw data ở các mạng xã hội khác ngoài facebook nếu có
- cải tiến về tốc độ ví dụ như thay vì dùng selenium ở 1 vài chỗ có thể đổi sang dùng request. 
# Liên hệ
    - Thanh Lành(lanhle@rtanalytics.vn)