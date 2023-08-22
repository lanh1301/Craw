// Based on the information in the spreadsheets in the link below, normalize the data
// https://docs.google.com/spreadsheets/d/1GqSdZjjYCACyENtjTh_lcS_N0AuDhSVJU8SMTzk1MFs

import { allowedLocation, allowdCategories } from './constants.js'

const normalizePayload = (payload) => {
    let employer = payload['employer']
    let job      = payload['job']

    // Employer Location
    let empLocation = employer['location'] || []
    empLocation = empLocation.map((location) => normalizeLocation(location)).filter(ele => ele)

    // Employer Category
    let empCategory = employer['category']
    if ( Array.isArray( empCategory ) ) {
        let tmpArr  = empCategory.map((category) => normalizeCategory(category)).filter(ele => ele)
        empCategory = tmpArr
    } else {
        empCategory = normalizeCategory(employer['category']) || ''
    }

    // Job Categories
    let categories = job['industry'] || []
    categories = categories.map((category) => normalizeCategory(category)).filter(ele => ele)

    // Job Employment Type
    let employmentType = normalizeEmploymentTypes(job['employmentType'])
    
    // Job Location
    let jobLocation = job['jobLocation'] || []
    jobLocation.forEach((item, index) => {
        if ( 'addressRegion' in item ) {
            item.addressRegion = normalizeLocation(item.addressRegion)
        }
    })
    
    // Job Salary
    let jobSalary = job['baseSalary'] || {}
    if ( 'unitText' in jobSalary ) {
        jobSalary['unitText'] = normalizeSalaryUnit(jobSalary['unitText'])
    }

    payload['employer']['location'] = empLocation
    payload['employer']['category'] = empCategory
    payload['job']['industry']      = categories
    payload['job']['employmentType']= employmentType
    payload['job']['jobLocation']   = jobLocation
    payload['job']['baseSalary']    = jobSalary

    return payload
}

/**
 * @param {string} location
 */
const normalizeLocation = (location) => {
    if (!location)
        return undefined 

    let result = ''
    
    switch (location.toLowerCase()) {
        case 'tp hcm':
        case 'tp.hcm':
        case 'tp hồ chí minh':
        case 'tp.hồ chí minh':
        case 'tp. hồ chí minh':
        case 'thành phố hồ chí minh':
            result = 'Hồ Chí Minh'
            break
        case 'thừa thiên huế':
        case 'thừa thiên - huế':
            result = 'Thừa Thiên Huế'
            break
        default:
            result = location
    }

    if ( allowedLocation.includes(result.toLowerCase()) ) {
        return result.trim()
    } return undefined
    
}

/**
 * @param {string} category
 */
const normalizeCategory = (category) => {
    if (!category)
        return undefined

    let result = ''

    switch (category.toLowerCase()) {
        case 'khoa học - kỹ thuật':
        case 'bán hàng kỹ thuật':
            result = 'Khoa học - Kỹ thuật'
            break
        case 'bán lẻ - bán sỉ':
        case 'bán buôn - bán lẻ - quản lý cửa hàng':
            result = 'Bán buôn'
            break
        case 'báo chí - truyền hình':
        case 'thông tin - truyền thông - xuất bản - in ấn':
            result = 'Thông tin - Truyền thông'
            break
        case 'bảo trì - sửa chữa':
        case 'vận hành máy - bảo trì - bảo dưỡng thiết bị':
            result = 'Bảo trì - Sửa chữa'
            break
        case 'biên - phiên dịch':
        case 'biên phiên dịch':
        case 'thông dịch viên':
            result = 'Biên - Phiên dịch'
            break
        case 'cơ khí - chế tạo - tự động hóa':
        case 'sản xuất - lắp ráp - chế biến':
            result = 'Cơ khí - Chế tạo - Tự động hóa'
            break
        case 'khai thác năng lượng - khoáng sản':
        case 'dầu khí - hóa chất':
            result = 'Khai thác năng lượng - Khoáng sản'
            break
        case 'chăm sóc khách hàng':
        case 'dịch vụ khách hàng':
            result = 'Dịch vụ khách hàng'
            break
        case 'hành chính - văn phòng':
        case 'hành chính - thư ký':
            result = 'Hành chính - Văn phòng'
            break
        case 'quản lý dự án - chương trình':
        case 'hoạch định - dự án':
            result = 'Hoạch định - Dự án'
            break
        case 'thông tin - truyền thông - xuất bản - in ấn':
        case 'in ấn - xuất bản':
            result = 'In ấn - Xuất bản'
            break
        case 'it phần cứng - mạng':
        case 'it phần cứng - mạng - viễn thông':
            result = 'IT Phần cứng - Mạng'
            break
        case 'kế toán':
        case 'kiểm toán':
        case 'kế toán - kiểm toán':
            result = 'Kế toán - Kiểm toán'
            break
        case 'du lịch':
        case 'khách sạn - nhà hàng - du lịch':
        case 'khách sạn - nhà hàng':
            result = 'Khách sạn - Nhà hàng - Du lịch'
            break
        case 'kiến trúc':
        case 'kiến trúc - thiết kế nội thất':
        case 'thiết kế nội thất':
            result = 'Kiến trúc - Thiết kế nội thất'
            break
        case 'kinh doanh':
        case 'kinh doanh - bán hàng':
            result = 'Kinh doanh'
            break
        case 'logistics':
        case 'thu mua - kho vận - chuỗi cung ứng':
            result = 'Logistics'
            break
        case 'pháp lý - tuân thủ':
        case 'luật - pháp lý':
            result = 'Luật - Pháp lý'
            break
        case 'marketing':
        case 'marketing - truyền thông - quảng cáo':
            result = 'Marketing'
            break
        case 'mỹ thuật - nghệ thuật - điện ảnh':
        case 'thiết kế - sáng tạo nghệ thuật':
            result = 'Thiết kế - Sáng tạo nghệ thuật'
            break
        case 'ngân hàng':
        case 'ngân hàng - tài chính':
            result = 'Ngân hàng'
            break
        case 'ngành nghề khác':
        case 'nghề nghiệp khác':
        case 'khác':
            result = 'Ngành nghề khác'
            break
        case 'ngo - phi chính phủ - phi lợi nhuận':
        case 'phi chính phủ - phi lợi nhuận':
            result = 'NGO - Phi chính phủ - Phi lợi nhuận'
            break
        case 'quản lý chất lượng (qa/qc)':
        case 'quản lý tiêu chuẩn và chất lượng':
            result = 'Quản lý chất lượng (QA-QC)'
            break
        case 'tài chính - đầu tư':
        case 'chứng khoán - vàng - ngoại tệ':
            result = 'Tài chính - Đầu tư'
            break
        case 'vận tải - kho vận':
        case 'vận tải - lái xe - giao nhận':
            result = 'Vận tải - Kho vận'
            break
        case 'y tế - chăm sóc sức khỏe':
        case 'y tế - dược':
            result = 'Y tế'
            break
        default:
            result = category
    }

    if ( allowdCategories.includes(result.toLowerCase()) ) {
        return result.trim()
    } return undefined

}

/**
 * @param {string} employmentType
 */
const normalizeEmploymentTypes = (employmentType) => {
    if (!employmentType)
        return 'Khác'

    let result = ''

    switch (employmentType.toLowerCase()) {
        case 'full_time':
        case 'full-time':
        case 'full time':
        case 'toàn thời gian cố định':
        case 'toàn thời gian tạm thời':
        case 'toàn thời gian':
            result = 'Toàn thời gian'
            break
        case 'part_time':
        case 'part-time':
        case 'part time':
        case 'bán thời gian cố định':
        case 'bán thời gian tạm thời':
        case 'bán thời gian':
            result = 'Bán thời gian'
            break
        case 'contractor':
            result = 'Hợp đồng dịch vụ'
            break
        case 'temporary':
            result = 'Thời vụ'
            break
        case 'intern':
            result = 'Thực tập'
            break
        case 'volunteer':
            result = 'Tình nguyện'
            break
        case 'per_diem':
            result = 'Theo ngày'
            break
        default:
            result = 'Khác'
    }

    return result.trim()
}

/**
 * @param {string} salaryUnit
 */
const normalizeSalaryUnit = (salaryUnit) => {
    if (!salaryUnit)
        return ''
        
    let result = ''

    switch (salaryUnit.toLowerCase()) {
        case 'year':
            result = 'yearly'
            break
        case 'month':
            result = 'monthly'
            break
        case 'week':
            result = 'weekly'
            break
        case 'hour':
            result = 'hourly'
            break
        default:
            result = ''
    }

    return result
}

export {
    normalizePayload
}