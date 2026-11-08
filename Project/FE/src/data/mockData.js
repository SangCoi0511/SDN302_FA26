/**
 * @fileoverview Mock Data for Sports Field Booking System
 *
 * This file contains mock data extracted from the real database (MongoDB)
 * Used for frontend development and testing before API integration
 *
 * Data Structure:
 * - Categories (5): Football, Tennis, Badminton, Basketball, Volleyball
 * - Field Types (10): Sân 5/7/11 người, Sân đơn/đôi, etc.
 * - Managers (3): Field owners
 * - Users (24): 22 Customers, 1 Admin, + reviewer accounts for feedbacks
 * - Fields (10): Actual sports fields with full details
 * - Booking Details (11): Booked time slots for availability checking
 * - Bookings (30): User booking orders with full history & status
 * - Feedbacks (25): User reviews with star ratings (1-5) for each field
 *
 * @author San Sieu Toc Team
 * @date 2026-02-24
 */

// ============================================================================
// CATEGORIES (5 items)
// ============================================================================

/**
 * Sport categories available in the system
 * @type {Array<{_id: string, categoryName: string, createdAt: string, updatedAt: string}>}
 */
export const mockCategories = [
  {
    _id: "6984ade0031fcdd6b5e78704",
    categoryName: "Football",
    createdAt: "2026-02-05T14:49:04.538Z",
    updatedAt: "2026-02-05T14:49:04.538Z",
  },
  {
    _id: "6984ade0031fcdd6b5e78705",
    categoryName: "Tennis",
    createdAt: "2026-02-05T14:49:04.538Z",
    updatedAt: "2026-02-05T14:49:04.538Z",
  },
  {
    _id: "6984ade0031fcdd6b5e78706",
    categoryName: "Badminton",
    createdAt: "2026-02-05T14:49:04.538Z",
    updatedAt: "2026-02-05T14:49:04.538Z",
  },
  {
    _id: "6984ade0031fcdd6b5e78707",
    categoryName: "Basketball",
    createdAt: "2026-02-05T14:49:04.538Z",
    updatedAt: "2026-02-05T14:49:04.538Z",
  },
  {
    _id: "6984ade0031fcdd6b5e78708",
    categoryName: "Volleyball",
    createdAt: "2026-02-05T14:49:04.539Z",
    updatedAt: "2026-02-05T14:49:04.539Z",
  },
];

// ============================================================================
// FIELD TYPES (7 items)
// ============================================================================

/**
 * Field types for each sport category
 *
 * Business Rule: Only Football has multiple types
 * - Football: Sân 5 người, Sân 7 người, Sân 11 người
 * - Other sports: Sân Tiêu Chuẩn (Standard Court)
 *
 * Rationale: Simplified UX - most sports have standardized court sizes
 *
 * @type {Array<{_id: string, typeName: string, categoryID: string, createdAt: string, updatedAt: string}>}
 */
export const mockFieldTypes = [
  // Football (3 types - ONLY sport with multiple types)
  {
    _id: "6984ade0031fcdd6b5e7870a",
    typeName: "Sân 5 người",
    categoryID: "6984ade0031fcdd6b5e78704",
    createdAt: "2026-02-05T14:49:04.584Z",
    updatedAt: "2026-02-05T14:49:04.584Z",
  },
  {
    _id: "6984ade0031fcdd6b5e7870b",
    typeName: "Sân 7 người",
    categoryID: "6984ade0031fcdd6b5e78704",
    createdAt: "2026-02-05T14:49:04.584Z",
    updatedAt: "2026-02-05T14:49:04.584Z",
  },
  {
    _id: "6984ade0031fcdd6b5e7870c",
    typeName: "Sân 11 người",
    categoryID: "6984ade0031fcdd6b5e78704",
    createdAt: "2026-02-05T14:49:04.584Z",
    updatedAt: "2026-02-05T14:49:04.584Z",
  },
  // Tennis - Standard Court Only
  {
    _id: "6984ade0031fcdd6b5e7870d",
    typeName: "Sân Tiêu Chuẩn",
    categoryID: "6984ade0031fcdd6b5e78705",
    createdAt: "2026-02-05T14:49:04.584Z",
    updatedAt: "2026-02-05T14:49:04.584Z",
  },
  // Badminton - Standard Court Only
  {
    _id: "6984ade0031fcdd6b5e7870f",
    typeName: "Sân Tiêu Chuẩn",
    categoryID: "6984ade0031fcdd6b5e78706",
    createdAt: "2026-02-05T14:49:04.584Z",
    updatedAt: "2026-02-05T14:49:04.584Z",
  },
  // Basketball - Standard Court Only
  {
    _id: "6984ade0031fcdd6b5e78711",
    typeName: "Sân Tiêu Chuẩn",
    categoryID: "6984ade0031fcdd6b5e78707",
    createdAt: "2026-02-05T14:49:04.584Z",
    updatedAt: "2026-02-05T14:49:04.584Z",
  },
  // Volleyball - Standard Court Only
  {
    _id: "6984ade0031fcdd6b5e78713",
    typeName: "Sân Tiêu Chuẩn",
    categoryID: "6984ade0031fcdd6b5e78708",
    createdAt: "2026-02-05T14:49:04.584Z",
    updatedAt: "2026-02-05T14:49:04.584Z",
  },
];

// ============================================================================
// MANAGERS (3 items)
// ============================================================================

/**
 * Field owners/managers
 * @type {Array<{_id: string, email: string, name: string, phone: string, image: string}>}
 */
export const mockManagers = [
  {
    _id: "6984ade0031fcdd6b5e786fa",
    email: "manager1@sansieutoc.com",
    name: "Nguyễn Văn Manager",
    phone: "0901234567",
    password: "Manager@123",
    image: "https://i.pravatar.cc/300?img=1",
    imageQR:
      "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=manager1",
    createdAt: "2026-02-05T14:49:04.440Z",
    updatedAt: "2026-02-05T14:49:04.440Z",
  },
  {
    _id: "6984ade0031fcdd6b5e786fb",
    email: "manager2@sansieutoc.com",
    name: "Trần Thị Quản Lý",
    phone: "0902345678",
    password: "Manager@123",
    image: "https://i.pravatar.cc/300?img=2",
    imageQR:
      "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=manager2",
    createdAt: "2026-02-05T14:49:04.443Z",
    updatedAt: "2026-02-05T14:49:04.443Z",
  },
  {
    _id: "6984ade0031fcdd6b5e786fc",
    email: "manager3@sansieutoc.com",
    name: "Lê Văn Giám Đốc",
    phone: "0903456789",
    password: "Manager@123",
    image: "https://i.pravatar.cc/300?img=3",
    imageQR:
      "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=manager3",
    createdAt: "2026-02-05T14:49:04.443Z",
    updatedAt: "2026-02-05T14:49:04.443Z",
  },
];

// ============================================================================
// USERS (24 items) - CUSTOMER & ADMIN ACCOUNTS
// ============================================================================

/**
 * User accounts in the system
 * Includes 22 customer accounts (1 main + 21 reviewers) and 1 admin account
 * @type {Array<{
 *   _id: string,
 *   name: string,
 *   email: string,
 *   phone: string,
 *   password: string,
 *   role: string,
 *   image: string,
 *   isActive: boolean,
 *   createdAt: string,
 *   updatedAt: string
 * }>}
 */
export const mockUsers = [
  // ==================== MAIN CUSTOMER ====================
  {
    _id: "6984ade0031fcdd6b5e78710",
    name: "Phạm Minh Khách",
    email: "customer@sansieutoc.com",
    phone: "0911223344",
    password: "customer123",
    role: "customer",
    image: "https://i.pravatar.cc/300?img=10",
    address: "15 Hàng Bài, Quận Hoàn Kiếm, Hà Nội",
    isActive: true,
    createdAt: "2026-02-10T08:30:00.000Z",
    updatedAt: "2026-02-20T15:45:00.000Z",
  },

  // ==================== ADMIN ====================
  {
    _id: "6984ade0031fcdd6b5e78711",
    name: "Võ Thị Admin",
    email: "admin@sansieutoc.com",
    phone: "0900000001",
    password: "admin123",
    role: "admin",
    image: "https://i.pravatar.cc/300?img=5",
    address: "25 Lý Thường Kiệt, Quận Hoàn Kiếm, Hà Nội",
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-02-25T10:00:00.000Z",
  },

  // ==================== REVIEWER CUSTOMERS (22 accounts) ====================
  {
    _id: "u_review_01",
    name: "Trần Hoàng Anh",
    email: "hoang.anh@gmail.com",
    phone: "0912345001",
    password: "user@123",
    role: "customer",
    image: "https://i.pravatar.cc/300?img=11",
    address: "45 Trần Hưng Đạo, Quận Hoàn Kiếm, Hà Nội",
    isActive: true,
    createdAt: "2026-01-15T10:00:00.000Z",
    updatedAt: "2026-02-20T10:00:00.000Z",
  },
  {
    _id: "u_review_02",
    name: "Lê Quốc Bảo",
    email: "quoc.bao@gmail.com",
    phone: "0912345002",
    password: "user@123",
    role: "customer",
    image: "https://i.pravatar.cc/300?img=12",
    address: "78 Hàng Bông, Quận Hoàn Kiếm, Hà Nội",
    isActive: true,
    createdAt: "2026-01-16T08:00:00.000Z",
    updatedAt: "2026-02-18T08:00:00.000Z",
  },
  {
    _id: "u_review_03",
    name: "Nguyễn Đức Huy",
    email: "duc.huy@gmail.com",
    phone: "0912345003",
    password: "user@123",
    role: "customer",
    image: "https://i.pravatar.cc/300?img=13",
    address: "12 Xã Đàn, Quận Đống Đa, Hà Nội",
    isActive: true,
    createdAt: "2026-01-18T14:00:00.000Z",
    updatedAt: "2026-02-15T14:00:00.000Z",
  },
  {
    _id: "u_review_04",
    name: "Võ Thanh Tùng",
    email: "thanh.tung@gmail.com",
    phone: "0912345004",
    password: "user@123",
    role: "customer",
    image: "https://i.pravatar.cc/300?img=14",
    address: "234 Nguyễn Trãi, Quận Thanh Xuân, Hà Nội",
    isActive: true,
    createdAt: "2026-01-20T09:00:00.000Z",
    updatedAt: "2026-02-22T09:00:00.000Z",
  },
  {
    _id: "u_review_05",
    name: "Huỳnh Minh Đạt",
    email: "minh.dat@gmail.com",
    phone: "0912345005",
    password: "user@123",
    role: "customer",
    image: "https://i.pravatar.cc/300?img=15",
    address: "56 Tôn Đức Thắng, Quận Đống Đa, Hà Nội",
    isActive: true,
    createdAt: "2026-01-22T11:00:00.000Z",
    updatedAt: "2026-02-19T11:00:00.000Z",
  },
  {
    _id: "u_review_06",
    name: "Đặng Văn Phong",
    email: "van.phong@gmail.com",
    phone: "0912345006",
    password: "user@123",
    role: "customer",
    image: "https://i.pravatar.cc/300?img=16",
    address: "89 Phố Huế, Quận Hai Bà Trưng, Hà Nội",
    isActive: true,
    createdAt: "2026-01-23T07:30:00.000Z",
    updatedAt: "2026-02-17T07:30:00.000Z",
  },
  {
    _id: "u_review_07",
    name: "Bùi Thanh Long",
    email: "thanh.long@gmail.com",
    phone: "0912345007",
    password: "user@123",
    role: "customer",
    image: "https://i.pravatar.cc/300?img=17",
    address: "321 Bạch Mai, Quận Hai Bà Trưng, Hà Nội",
    isActive: true,
    createdAt: "2026-01-25T16:00:00.000Z",
    updatedAt: "2026-02-16T16:00:00.000Z",
  },
  {
    _id: "u_review_08",
    name: "Phan Quốc Việt",
    email: "quoc.viet@gmail.com",
    phone: "0912345008",
    password: "user@123",
    role: "customer",
    image: "https://i.pravatar.cc/300?img=18",
    address: "67 Bà Triệu, Quận Hoàn Kiếm, Hà Nội",
    isActive: true,
    createdAt: "2026-01-10T13:00:00.000Z",
    updatedAt: "2026-02-14T13:00:00.000Z",
  },
  {
    _id: "u_review_09",
    name: "Ngô Thị Mai Anh",
    email: "mai.anh@gmail.com",
    phone: "0912345009",
    password: "user@123",
    role: "customer",
    image: "https://i.pravatar.cc/300?img=20",
    address: "145 Nguyễn Lương Bằng, Quận Đống Đa, Hà Nội",
    isActive: true,
    createdAt: "2026-01-28T08:30:00.000Z",
    updatedAt: "2026-02-21T08:30:00.000Z",
  },
  {
    _id: "u_review_10",
    name: "Dương Minh Trí",
    email: "minh.tri@gmail.com",
    phone: "0912345010",
    password: "user@123",
    role: "customer",
    image: "https://i.pravatar.cc/300?img=21",
    address: "98 Khâm Thiên, Quận Đống Đa, Hà Nội",
    isActive: true,
    createdAt: "2026-01-30T10:00:00.000Z",
    updatedAt: "2026-02-20T10:00:00.000Z",
  },
  {
    _id: "u_review_11",
    name: "Lý Hoàng Nam",
    email: "hoang.nam@gmail.com",
    phone: "0912345011",
    password: "user@123",
    role: "customer",
    image: "https://i.pravatar.cc/300?img=22",
    address: "200 Đội Cấn, Quận Ba Đình, Hà Nội",
    isActive: true,
    createdAt: "2026-02-01T09:00:00.000Z",
    updatedAt: "2026-02-22T09:00:00.000Z",
  },
  {
    _id: "u_review_12",
    name: "Trương Thị Hương",
    email: "thi.huong@gmail.com",
    phone: "0912345012",
    password: "user@123",
    role: "customer",
    image: "https://i.pravatar.cc/300?img=23",
    address: "55 Tạ Hiện, Quận Hoàn Kiếm, Hà Nội",
    isActive: true,
    createdAt: "2026-02-02T14:30:00.000Z",
    updatedAt: "2026-02-23T14:30:00.000Z",
  },
  {
    _id: "u_review_13",
    name: "Cao Thị Ngọc Trinh",
    email: "ngoc.trinh@gmail.com",
    phone: "0912345013",
    password: "user@123",
    role: "customer",
    image: "https://i.pravatar.cc/300?img=24",
    address: "33 Trần Duy Hưng, Quận Cầu Giấy, Hà Nội",
    isActive: true,
    createdAt: "2026-02-03T11:00:00.000Z",
    updatedAt: "2026-02-24T11:00:00.000Z",
  },
  {
    _id: "u_review_14",
    name: "Đinh Công Sơn",
    email: "cong.son@gmail.com",
    phone: "0912345014",
    password: "user@123",
    role: "customer",
    image: "https://i.pravatar.cc/300?img=25",
    address: "77 Yên Phụ, Quận Tây Hồ, Hà Nội",
    isActive: true,
    createdAt: "2026-02-04T15:00:00.000Z",
    updatedAt: "2026-02-24T15:00:00.000Z",
  },
  {
    _id: "u_review_15",
    name: "Hồ Văn Cường",
    email: "van.cuong@gmail.com",
    phone: "0912345015",
    password: "user@123",
    role: "customer",
    image: "https://i.pravatar.cc/300?img=26",
    address: "111 Láng Hạ, Quận Đống Đa, Hà Nội",
    isActive: true,
    createdAt: "2026-02-05T08:00:00.000Z",
    updatedAt: "2026-02-25T08:00:00.000Z",
  },
  {
    _id: "u_review_16",
    name: "Lâm Thị Bích Ngọc",
    email: "bich.ngoc@gmail.com",
    phone: "0912345016",
    password: "user@123",
    role: "customer",
    image: "https://i.pravatar.cc/300?img=27",
    address: "22 Nguyễn Trãi, Quận Thanh Xuân, Hà Nội",
    isActive: true,
    createdAt: "2026-02-06T09:30:00.000Z",
    updatedAt: "2026-02-25T09:30:00.000Z",
  },
  {
    _id: "u_review_17",
    name: "Mai Xuân Thành",
    email: "xuan.thanh@gmail.com",
    phone: "0912345017",
    password: "user@123",
    role: "customer",
    image: "https://i.pravatar.cc/300?img=28",
    address: "88 Lò Đúc, Quận Hai Bà Trưng, Hà Nội",
    isActive: true,
    createdAt: "2026-02-07T12:00:00.000Z",
    updatedAt: "2026-02-25T12:00:00.000Z",
  },
  {
    _id: "u_review_18",
    name: "Trịnh Đình Quang",
    email: "dinh.quang@gmail.com",
    phone: "0912345018",
    password: "user@123",
    role: "customer",
    image: "https://i.pravatar.cc/300?img=30",
    address: "44 Khuất Duy Tiến, Quận Thanh Xuân, Hà Nội",
    isActive: true,
    createdAt: "2026-02-01T07:00:00.000Z",
    updatedAt: "2026-02-24T07:00:00.000Z",
  },
  {
    _id: "u_review_19",
    name: "Nguyễn Hải Đăng",
    email: "hai.dang@gmail.com",
    phone: "0912345019",
    password: "user@123",
    role: "customer",
    image: "https://i.pravatar.cc/300?img=31",
    address: "66 Mễ Trì, Quận Nam Từ Liêm, Hà Nội",
    isActive: true,
    createdAt: "2026-02-03T10:30:00.000Z",
    updatedAt: "2026-02-23T10:30:00.000Z",
  },
  {
    _id: "u_review_20",
    name: "Phùng Thị Lan",
    email: "thi.lan@gmail.com",
    phone: "0912345020",
    password: "user@123",
    role: "customer",
    image: "https://i.pravatar.cc/300?img=32",
    address: "99 Lê Đức Thọ, Quận Nam Từ Liêm, Hà Nội",
    isActive: true,
    createdAt: "2026-02-05T14:00:00.000Z",
    updatedAt: "2026-02-25T14:00:00.000Z",
  },
  {
    _id: "u_review_21",
    name: "Tạ Quang Hưng",
    email: "quang.hung@gmail.com",
    phone: "0912345021",
    password: "user@123",
    role: "customer",
    image: "https://i.pravatar.cc/300?img=33",
    address: "150 Nguyễn Văn Cừ, Quận Long Biên, Hà Nội",
    isActive: true,
    createdAt: "2026-02-08T08:00:00.000Z",
    updatedAt: "2026-02-25T08:00:00.000Z",
  },
  {
    _id: "u_review_22",
    name: "Vũ Thị Phương Thảo",
    email: "phuong.thao@gmail.com",
    phone: "0912345022",
    password: "user@123",
    role: "customer",
    image: "https://i.pravatar.cc/300?img=34",
    address: "200 Ngô Gia Tự, Quận Long Biên, Hà Nội",
    isActive: true,
    createdAt: "2026-02-10T11:00:00.000Z",
    updatedAt: "2026-02-25T11:00:00.000Z",
  },
];

// ============================================================================
// FIELDS (10 items) - WITH POPULATED RELATIONSHIPS
// ============================================================================

/**
 * Sports fields with complete information
 * Each field has populated relationships to fieldType, category, and manager
 *
 * @type {Array<{
 *   _id: string,
 *   fieldName: string,
 *   address: string,
 *   description: string,
 *   hourlyPrice: number,
 *   slotDuration: number,
 *   openingTime: string,
 *   closingTime: string,
 *   status: string,
 *   utilities: string[],
 *   image: string[],
 *   fieldType: object,
 *   manager: object,
 *   district: string
 * }>}
 */
export const mockFields = [
  // ==================== FOOTBALL FIELDS ====================
  {
    _id: "6984ade0031fcdd6b5e78715",
    fieldName: "Sân Bóng Đá A1",
    address: "45 Đường Trần Duy Hưng, Quận Cầu Giấy, Hà Nội",
    description: "Sân cỏ nhân tạo thế hệ mới, có mái che, đầy đủ tiện nghi",
    hourlyPrice: 200000,
    slotDuration: 60,
    openingTime: "06:00",
    closingTime: "23:00",
    status: "Available",
    utilities: ["Wifi", "Parking", "Shower", "Changing Room", "Water"],
    image: [
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
      "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800",
    ],
    // Populated fieldType with category
    fieldType: {
      _id: "6984ade0031fcdd6b5e7870a",
      typeName: "Sân 5 người",
      category: {
        _id: "6984ade0031fcdd6b5e78704",
        categoryName: "Football",
      },
    },
    // Populated manager
    manager: {
      _id: "6984ade0031fcdd6b5e786fa",
      name: "Nguyễn Văn Manager",
      phone: "0901234567",
      image: "https://i.pravatar.cc/300?img=1",
    },
    // Computed field (extracted from address)
    district: "Quận Cầu Giấy",
    createdAt: "2026-02-05T14:49:04.654Z",
    updatedAt: "2026-02-05T14:49:04.654Z",
  },
  {
    _id: "6984ade0031fcdd6b5e78716",
    fieldName: "Sân Bóng Đá A2",
    address: "45 Đường Trần Duy Hưng, Quận Cầu Giấy, Hà Nội",
    description: "Sân cỏ tự nhiên, phù hợp cho các trận đấu lớn",
    hourlyPrice: 350000,
    slotDuration: 90,
    openingTime: "06:00",
    closingTime: "23:00",
    status: "Available",
    utilities: [
      "Wifi",
      "Parking",
      "Shower",
      "Changing Room",
      "Water",
      "First Aid",
    ],
    image: [
      "https://images.unsplash.com/photo-1624880357913-a8539238245b?w=800",
    ],
    fieldType: {
      _id: "6984ade0031fcdd6b5e7870b",
      typeName: "Sân 7 người",
      category: {
        _id: "6984ade0031fcdd6b5e78704",
        categoryName: "Football",
      },
    },
    manager: {
      _id: "6984ade0031fcdd6b5e786fa",
      name: "Nguyễn Văn Manager",
      phone: "0901234567",
      image: "https://i.pravatar.cc/300?img=1",
    },
    district: "Quận Cầu Giấy",
    createdAt: "2026-02-05T14:49:04.655Z",
    updatedAt: "2026-02-05T14:49:04.655Z",
  },
  {
    _id: "6984ade0031fcdd6b5e78717",
    fieldName: "Sân Bóng Đá A3",
    address: "45 Đường Trần Duy Hưng, Quận Cầu Giấy, Hà Nội",
    description: "Sân mini có mái che toàn bộ, sạch sẽ",
    hourlyPrice: 180000,
    slotDuration: 60,
    openingTime: "06:00",
    closingTime: "22:00",
    status: "Available",
    utilities: ["Parking", "Shower", "Water"],
    image: [
      "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800",
    ],
    fieldType: {
      _id: "6984ade0031fcdd6b5e7870a",
      typeName: "Sân 5 người",
      category: {
        _id: "6984ade0031fcdd6b5e78704",
        categoryName: "Football",
      },
    },
    manager: {
      _id: "6984ade0031fcdd6b5e786fa",
      name: "Nguyễn Văn Manager",
      phone: "0901234567",
      image: "https://i.pravatar.cc/300?img=1",
    },
    district: "Quận Cầu Giấy",
    createdAt: "2026-02-05T14:49:04.655Z",
    updatedAt: "2026-02-05T14:49:04.655Z",
  },
  {
    _id: "6984ade0031fcdd6b5e7871e",
    fieldName: "Sân Bóng Đá A4 (Bảo trì)",
    address: "45 Đường Trần Duy Hưng, Quận Cầu Giấy, Hà Nội",
    description: "Sân đang trong quá trình bảo trì, sẽ mở lại sớm",
    hourlyPrice: 200000,
    slotDuration: 60,
    openingTime: "06:00",
    closingTime: "23:00",
    status: "Maintenance",
    utilities: ["Wifi", "Parking", "Shower"],
    image: [],
    fieldType: {
      _id: "6984ade0031fcdd6b5e7870a",
      typeName: "Sân 5 người",
      category: {
        _id: "6984ade0031fcdd6b5e78704",
        categoryName: "Football",
      },
    },
    manager: {
      _id: "6984ade0031fcdd6b5e786fa",
      name: "Nguyễn Văn Manager",
      phone: "0901234567",
      image: "https://i.pravatar.cc/300?img=1",
    },
    district: "Quận Cầu Giấy",
    createdAt: "2026-02-05T14:49:04.656Z",
    updatedAt: "2026-02-05T14:49:04.656Z",
  },

  // ==================== TENNIS FIELDS ====================
  {
    _id: "6984ade0031fcdd6b5e78718",
    fieldName: "Sân Tennis Elite 1",
    address: "88 Đường Hai Bà Trưng, Quận Hoàn Kiếm, Hà Nội",
    description: "Sân tennis đơn chuyên nghiệp, mặt sân cứng",
    hourlyPrice: 150000,
    slotDuration: 60,
    openingTime: "05:00",
    closingTime: "22:00",
    status: "Available",
    utilities: ["Wifi", "Parking", "Shower", "Equipment Rental", "Coaching"],
    image: ["https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800"],
    fieldType: {
      _id: "6984ade0031fcdd6b5e7870d",
      typeName: "Sân Tiêu Chuẩn",
      category: {
        _id: "6984ade0031fcdd6b5e78705",
        categoryName: "Tennis",
      },
    },
    manager: {
      _id: "6984ade0031fcdd6b5e786fb",
      name: "Trần Thị Quản Lý",
      phone: "0902345678",
      image: "https://i.pravatar.cc/300?img=2",
    },
    district: "Quận Hoàn Kiếm",
    createdAt: "2026-02-05T14:49:04.655Z",
    updatedAt: "2026-02-05T14:49:04.655Z",
  },
  {
    _id: "6984ade0031fcdd6b5e78719",
    fieldName: "Sân Tennis Elite 2",
    address: "88 Đường Hai Bà Trưng, Quận Hoàn Kiếm, Hà Nội",
    description: "Sân tennis đôi tiêu chuẩn quốc tế",
    hourlyPrice: 200000,
    slotDuration: 90,
    openingTime: "05:00",
    closingTime: "22:00",
    status: "Available",
    utilities: [
      "Wifi",
      "Parking",
      "Shower",
      "Equipment Rental",
      "Coaching",
      "Cafe",
    ],
    image: [
      "https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?w=800",
    ],
    fieldType: {
      _id: "6984ade0031fcdd6b5e7870d",
      typeName: "Sân Tiêu Chuẩn",
      category: {
        _id: "6984ade0031fcdd6b5e78705",
        categoryName: "Tennis",
      },
    },
    manager: {
      _id: "6984ade0031fcdd6b5e786fb",
      name: "Trần Thị Quản Lý",
      phone: "0902345678",
      image: "https://i.pravatar.cc/300?img=2",
    },
    district: "Quận Hoàn Kiếm",
    createdAt: "2026-02-05T14:49:04.655Z",
    updatedAt: "2026-02-05T14:49:04.655Z",
  },

  // ==================== BADMINTON FIELDS ====================
  {
    _id: "6984ade0031fcdd6b5e7871a",
    fieldName: "Sân Cầu Lông VIP 1",
    address: "120 Đường Tây Sơn, Quận Đống Đa, Hà Nội",
    description: "Sân cầu lông trong nhà, điều hòa mát mẻ",
    hourlyPrice: 80000,
    slotDuration: 60,
    openingTime: "06:00",
    closingTime: "23:00",
    status: "Available",
    utilities: [
      "Air Conditioning",
      "Parking",
      "Shower",
      "Equipment Rental",
      "Water",
    ],
    image: [
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800",
    ],
    fieldType: {
      _id: "6984ade0031fcdd6b5e7870f",
      typeName: "Sân Tiêu Chuẩn",
      category: {
        _id: "6984ade0031fcdd6b5e78706",
        categoryName: "Badminton",
      },
    },
    manager: {
      _id: "6984ade0031fcdd6b5e786fb",
      name: "Trần Thị Quản Lý",
      phone: "0902345678",
      image: "https://i.pravatar.cc/300?img=2",
    },
    district: "Quận Đống Đa",
    createdAt: "2026-02-05T14:49:04.655Z",
    updatedAt: "2026-02-05T14:49:04.655Z",
  },
  {
    _id: "6984ade0031fcdd6b5e7871b",
    fieldName: "Sân Cầu Lông VIP 2",
    address: "120 Đường Tây Sơn, Quận Đống Đa, Hà Nội",
    description: "Sân đôi rộng rãi, ánh sáng tốt",
    hourlyPrice: 100000,
    slotDuration: 60,
    openingTime: "06:00",
    closingTime: "23:00",
    status: "Available",
    utilities: [
      "Air Conditioning",
      "Parking",
      "Shower",
      "Equipment Rental",
      "Water",
      "Snack Bar",
    ],
    image: [
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800",
    ],
    fieldType: {
      _id: "6984ade0031fcdd6b5e7870f",
      typeName: "Sân Tiêu Chuẩn",
      category: {
        _id: "6984ade0031fcdd6b5e78706",
        categoryName: "Badminton",
      },
    },
    manager: {
      _id: "6984ade0031fcdd6b5e786fb",
      name: "Trần Thị Quản Lý",
      phone: "0902345678",
      image: "https://i.pravatar.cc/300?img=2",
    },
    district: "Quận Đống Đa",
    createdAt: "2026-02-05T14:49:04.655Z",
    updatedAt: "2026-02-05T14:49:04.655Z",
  },

  // ==================== BASKETBALL FIELD ====================
  {
    _id: "6984ade0031fcdd6b5e7871c",
    fieldName: "Sân Bóng Rổ Champions",
    address: "55 Đường Nguyễn Trãi, Quận Thanh Xuân, Hà Nội",
    description: "Sân bóng rổ ngoài trời, tiêu chuẩn NBA",
    hourlyPrice: 250000,
    slotDuration: 90,
    openingTime: "06:00",
    closingTime: "22:00",
    status: "Available",
    utilities: ["Parking", "Shower", "Water", "Scoreboard"],
    image: ["https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800"],
    fieldType: {
      _id: "6984ade0031fcdd6b5e78711",
      typeName: "Sân Tiêu Chuẩn",
      category: {
        _id: "6984ade0031fcdd6b5e78707",
        categoryName: "Basketball",
      },
    },
    manager: {
      _id: "6984ade0031fcdd6b5e786fc",
      name: "Lê Văn Giám Đốc",
      phone: "0903456789",
      image: "https://i.pravatar.cc/300?img=3",
    },
    district: "Quận Thanh Xuân",
    createdAt: "2026-02-05T14:49:04.655Z",
    updatedAt: "2026-02-05T14:49:04.655Z",
  },

  // ==================== VOLLEYBALL FIELD ====================
  {
    _id: "6984ade0031fcdd6b5e7871d",
    fieldName: "Sân Bóng Chuyền Olympia",
    address: "200 Đường Nguyễn Văn Cừ, Quận Long Biên, Hà Nội",
    description: "Sân bóng chuyền bãi biển, cát trắng mịn",
    hourlyPrice: 120000,
    slotDuration: 60,
    openingTime: "06:00",
    closingTime: "21:00",
    status: "Available",
    utilities: ["Parking", "Shower", "Changing Room", "Water"],
    image: [
      "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800",
    ],
    fieldType: {
      _id: "6984ade0031fcdd6b5e78713",
      typeName: "Sân Tiêu Chuẩn",
      category: {
        _id: "6984ade0031fcdd6b5e78708",
        categoryName: "Volleyball",
      },
    },
    manager: {
      _id: "6984ade0031fcdd6b5e786fc",
      name: "Lê Văn Giám Đốc",
      phone: "0903456789",
      image: "https://i.pravatar.cc/300?img=3",
    },
    district: "Quận Long Biên",
    createdAt: "2026-02-05T14:49:04.655Z",
    updatedAt: "2026-02-05T14:49:04.655Z",
  },

  // ==================== ADDITIONAL FIELDS (5 more) ====================

  // Football 11 người — Manager 1: Nguyễn Văn Manager (Quận Cầu Giấy)
  {
    _id: "6984ade0031fcdd6b5e7871f",
    fieldName: "Sân Bóng Đá A5",
    address: "45 Đường Trần Duy Hưng, Quận Cầu Giấy, Hà Nội",
    description:
      "Sân 11 người tiêu chuẩn, mặt cỏ nhân tạo thế hệ 4, hệ thống chiếu sáng LED 500W cho thi đấu ban đêm. Khán đài 100 chỗ ngồi.",
    hourlyPrice: 500000,
    slotDuration: 120,
    openingTime: "06:00",
    closingTime: "23:00",
    status: "Available",
    utilities: [
      "Wifi",
      "Parking",
      "Shower",
      "Changing Room",
      "Water",
      "First Aid",
      "Scoreboard",
    ],
    image: [
      "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800",
      "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800",
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
    ],
    fieldType: {
      _id: "6984ade0031fcdd6b5e7870c",
      typeName: "Sân 11 người",
      category: {
        _id: "6984ade0031fcdd6b5e78704",
        categoryName: "Football",
      },
    },
    manager: {
      _id: "6984ade0031fcdd6b5e786fa",
      name: "Nguyễn Văn Manager",
      phone: "0901234567",
      image: "https://i.pravatar.cc/300?img=1",
    },
    district: "Quận Cầu Giấy",
    createdAt: "2026-02-10T09:00:00.000Z",
    updatedAt: "2026-02-10T09:00:00.000Z",
  },

  // Tennis 3 — Manager 2: Trần Thị Quản Lý (Quận Hoàn Kiếm)
  {
    _id: "6984ade0031fcdd6b5e78720",
    fieldName: "Sân Tennis Elite 3",
    address: "88 Đường Hai Bà Trưng, Quận Hoàn Kiếm, Hà Nội",
    description:
      "Sân tennis mặt đất nện (clay court), tiêu chuẩn Roland Garros. Lưới chính hãng Wilson, ghế trọng tài có mái che.",
    hourlyPrice: 250000,
    slotDuration: 90,
    openingTime: "05:00",
    closingTime: "22:00",
    status: "Available",
    utilities: [
      "Wifi",
      "Parking",
      "Shower",
      "Equipment Rental",
      "Coaching",
      "Cafe",
      "Water",
    ],
    image: [
      "https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?w=800",
      "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800",
    ],
    fieldType: {
      _id: "6984ade0031fcdd6b5e7870d",
      typeName: "Sân Tiêu Chuẩn",
      category: {
        _id: "6984ade0031fcdd6b5e78705",
        categoryName: "Tennis",
      },
    },
    manager: {
      _id: "6984ade0031fcdd6b5e786fb",
      name: "Trần Thị Quản Lý",
      phone: "0902345678",
      image: "https://i.pravatar.cc/300?img=2",
    },
    district: "Quận Hoàn Kiếm",
    createdAt: "2026-02-12T10:00:00.000Z",
    updatedAt: "2026-02-12T10:00:00.000Z",
  },

  // Basketball 2 — Manager 3: Lê Văn Giám Đốc (Quận Thanh Xuân)
  {
    _id: "6984ade0031fcdd6b5e78721",
    fieldName: "Sân Bóng Rổ Champions 2",
    address: "55 Đường Nguyễn Trãi, Quận Thanh Xuân, Hà Nội",
    description:
      "Sân bóng rổ trong nhà có mái che, sàn gỗ chuyên dụng. Bảng rổ kính cường lực tiêu chuẩn FIBA, hệ thống điều hòa.",
    hourlyPrice: 300000,
    slotDuration: 90,
    openingTime: "07:00",
    closingTime: "23:00",
    status: "Available",
    utilities: [
      "Air Conditioning",
      "Parking",
      "Shower",
      "Water",
      "Scoreboard",
      "Snack Bar",
    ],
    image: [
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800",
      "https://images.unsplash.com/photo-1505666287802-931dc83948e5?w=800",
    ],
    fieldType: {
      _id: "6984ade0031fcdd6b5e78711",
      typeName: "Sân Tiêu Chuẩn",
      category: {
        _id: "6984ade0031fcdd6b5e78707",
        categoryName: "Basketball",
      },
    },
    manager: {
      _id: "6984ade0031fcdd6b5e786fc",
      name: "Lê Văn Giám Đốc",
      phone: "0903456789",
      image: "https://i.pravatar.cc/300?img=3",
    },
    district: "Quận Thanh Xuân",
    createdAt: "2026-02-14T08:30:00.000Z",
    updatedAt: "2026-02-14T08:30:00.000Z",
  },

  // Badminton 3 — Manager 3: Lê Văn Giám Đốc (Quận Long Biên)
  {
    _id: "6984ade0031fcdd6b5e78722",
    fieldName: "Sân Cầu Lông Star",
    address: "200 Đường Nguyễn Văn Cừ, Quận Long Biên, Hà Nội",
    description:
      "Sân cầu lông trong nhà cao cấp, sàn thể thao Yonex chính hãng. Hệ thống quạt thông gió không ảnh hưởng cầu, đèn LED chống chói.",
    hourlyPrice: 90000,
    slotDuration: 60,
    openingTime: "06:00",
    closingTime: "22:00",
    status: "Available",
    utilities: [
      "Air Conditioning",
      "Parking",
      "Shower",
      "Equipment Rental",
      "Water",
      "Changing Room",
    ],
    image: [
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800",
    ],
    fieldType: {
      _id: "6984ade0031fcdd6b5e7870f",
      typeName: "Sân Tiêu Chuẩn",
      category: {
        _id: "6984ade0031fcdd6b5e78706",
        categoryName: "Badminton",
      },
    },
    manager: {
      _id: "6984ade0031fcdd6b5e786fc",
      name: "Lê Văn Giám Đốc",
      phone: "0903456789",
      image: "https://i.pravatar.cc/300?img=3",
    },
    district: "Quận Long Biên",
    createdAt: "2026-02-16T11:00:00.000Z",
    updatedAt: "2026-02-16T11:00:00.000Z",
  },

  // Football 7 người — Manager 2: Trần Thị Quản Lý (Quận Đống Đa)
  {
    _id: "6984ade0031fcdd6b5e78723",
    fieldName: "Sân Bóng Đá Phú Nhuận",
    address: "120 Đường Tây Sơn, Quận Đống Đa, Hà Nội",
    description:
      "Sân bóng đá 7 người nằm trong khu thể thao Phú Nhuận, mặt cỏ nhân tạo chất lượng cao. Có mái che một phần cho khán giả.",
    hourlyPrice: 300000,
    slotDuration: 90,
    openingTime: "06:00",
    closingTime: "22:00",
    status: "Maintenance",
    utilities: ["Wifi", "Parking", "Shower", "Water", "First Aid"],
    image: [
      "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800",
      "https://images.unsplash.com/photo-1624880357913-a8539238245b?w=800",
    ],
    fieldType: {
      _id: "6984ade0031fcdd6b5e7870b",
      typeName: "Sân 7 người",
      category: {
        _id: "6984ade0031fcdd6b5e78704",
        categoryName: "Football",
      },
    },
    manager: {
      _id: "6984ade0031fcdd6b5e786fb",
      name: "Trần Thị Quản Lý",
      phone: "0902345678",
      image: "https://i.pravatar.cc/300?img=2",
    },
    district: "Quận Đống Đa",
    createdAt: "2026-02-18T14:00:00.000Z",
    updatedAt: "2026-02-18T14:00:00.000Z",
  },
];

// ============================================================================
// BOOKING DETAILS (11 items) - For Availability Checking
// ============================================================================

/**
 * Booked time slots for availability checking
 * Used to determine if a field is available at a specific date/time
 *
 * @type {Array<{
 *   _id: string,
 *   fieldID: string,
 *   bookingID: string,
 *   startTime: string,
 *   endTime: string,
 *   priceSnapshot: number,
 *   status: string
 * }>}
 */
export const mockBookingDetails = [
  {
    _id: "6984b01b6c0e60352a2a992f",
    fieldID: "6984ade0031fcdd6b5e78715", // Sân Bóng Đá A1
    bookingID: "6984b01b6c0e60352a2a992d",
    startTime: "2026-01-20T08:00:00.000Z",
    endTime: "2026-01-20T10:00:00.000Z",
    priceSnapshot: 200000,
    status: "Active",
    createdAt: "2026-02-05T14:58:35.672Z",
    updatedAt: "2026-02-05T14:58:35.672Z",
  },
  {
    _id: "6984b01b6c0e60352a2a9933",
    fieldID: "6984ade0031fcdd6b5e78716", // Sân Bóng Đá A2
    bookingID: "6984b01b6c0e60352a2a9931",
    startTime: "2026-02-10T14:00:00.000Z",
    endTime: "2026-02-10T15:30:00.000Z",
    priceSnapshot: 350000,
    status: "Active",
    createdAt: "2026-02-05T14:58:35.753Z",
    updatedAt: "2026-02-05T14:58:35.753Z",
  },
  {
    _id: "6984b01b6c0e60352a2a9937",
    fieldID: "6984ade0031fcdd6b5e78715", // Sân Bóng Đá A1
    bookingID: "6984b01b6c0e60352a2a9935",
    startTime: "2026-02-05T16:00:00.000Z",
    endTime: "2026-02-05T18:00:00.000Z",
    priceSnapshot: 200000,
    status: "Active",
    createdAt: "2026-02-05T14:58:35.853Z",
    updatedAt: "2026-02-05T14:58:35.853Z",
  },
  {
    _id: "6984b01b6c0e60352a2a9939",
    fieldID: "6984ade0031fcdd6b5e78717", // Sân Bóng Đá A3
    bookingID: "6984b01b6c0e60352a2a9935",
    startTime: "2026-02-05T18:00:00.000Z",
    endTime: "2026-02-05T20:00:00.000Z",
    priceSnapshot: 180000,
    status: "Active",
    createdAt: "2026-02-05T14:58:35.893Z",
    updatedAt: "2026-02-05T14:58:35.893Z",
  },
  {
    _id: "6984b01b6c0e60352a2a993d",
    fieldID: "6984ade0031fcdd6b5e78718", // Sân Tennis Elite 1
    bookingID: "6984b01b6c0e60352a2a993b",
    startTime: "2026-02-08T10:00:00.000Z",
    endTime: "2026-02-08T11:00:00.000Z",
    priceSnapshot: 150000,
    status: "Cancelled", // This slot is available (cancelled)
    createdAt: "2026-02-05T14:58:35.978Z",
    updatedAt: "2026-02-05T14:58:35.978Z",
  },
  {
    _id: "6984b01c6c0e60352a2a9941",
    fieldID: "6984ade0031fcdd6b5e7871a", // Sân Cầu Lông VIP 1
    bookingID: "6984b01c6c0e60352a2a993f",
    startTime: "2026-02-12T19:00:00.000Z",
    endTime: "2026-02-12T22:00:00.000Z",
    priceSnapshot: 80000,
    status: "Active",
    createdAt: "2026-02-05T14:58:36.062Z",
    updatedAt: "2026-02-05T14:58:36.062Z",
  },
  {
    _id: "6984b01c6c0e60352a2a9945",
    fieldID: "6984ade0031fcdd6b5e78719", // Sân Tennis Elite 2
    bookingID: "6984b01c6c0e60352a2a9943",
    startTime: "2026-02-15T08:00:00.000Z",
    endTime: "2026-02-15T10:30:00.000Z",
    priceSnapshot: 200000,
    status: "Active",
    createdAt: "2026-02-05T14:58:36.140Z",
    updatedAt: "2026-02-05T14:58:36.140Z",
  },
  {
    _id: "6984b01c6c0e60352a2a9949",
    fieldID: "6984ade0031fcdd6b5e7871c", // Sân Bóng Rổ Champions
    bookingID: "6984b01c6c0e60352a2a9947",
    startTime: "2026-02-06T15:00:00.000Z",
    endTime: "2026-02-06T18:00:00.000Z",
    priceSnapshot: 250000,
    status: "Active",
    createdAt: "2026-02-05T14:58:36.216Z",
    updatedAt: "2026-02-05T14:58:36.216Z",
  },
  {
    _id: "6984b01c6c0e60352a2a994d",
    fieldID: "6984ade0031fcdd6b5e7871d", // Sân Bóng Chuyền Olympia
    bookingID: "6984b01c6c0e60352a2a994b",
    startTime: "2026-02-18T17:00:00.000Z",
    endTime: "2026-02-18T20:00:00.000Z",
    priceSnapshot: 120000,
    status: "Active",
    createdAt: "2026-02-05T14:58:36.293Z",
    updatedAt: "2026-02-05T14:58:36.293Z",
  },
  {
    _id: "6984b01c6c0e60352a2a9951",
    fieldID: "6984ade0031fcdd6b5e7871b", // Sân Cầu Lông VIP 2
    bookingID: "6984b01c6c0e60352a2a994f",
    startTime: "2026-02-07T20:00:00.000Z",
    endTime: "2026-02-07T23:00:00.000Z",
    priceSnapshot: 100000,
    status: "Active",
    createdAt: "2026-02-05T14:58:36.371Z",
    updatedAt: "2026-02-05T14:58:36.371Z",
  },
  {
    _id: "6984b01c6c0e60352a2a9955",
    fieldID: "6984ade0031fcdd6b5e78715", // Sân Bóng Đá A1
    bookingID: "6984b01c6c0e60352a2a9953",
    startTime: "2026-01-18T14:00:00.000Z",
    endTime: "2026-01-18T15:00:00.000Z",
    priceSnapshot: 200000,
    status: "Active",
    createdAt: "2026-02-05T14:58:36.455Z",
    updatedAt: "2026-02-05T14:58:36.455Z",
  },
];

// ============================================================================
// FEEDBACKS / REVIEWS (25 items) - Ratings & Comments for each field
// ============================================================================

/**
 * User feedback and ratings for sports fields
 * Each review includes star rating (1-5), comment, and user info
 *
 * Rating Distribution Strategy:
 * - Top fields: 4.5-5.0 average
 * - Good fields: 3.5-4.5 average
 * - Maintenance field: fewer reviews, lower avg
 *
 * @type {Array<{
 *   _id: string,
 *   fieldID: string,
 *   userID: string,
 *   userName: string,
 *   userImage: string,
 *   rating: number,
 *   comment: string,
 *   createdAt: string,
 *   updatedAt: string
 * }>}
 */
export const mockFeedbacks = [
  // ==================== Sân Bóng Đá A1 (4 reviews, avg 4.5) ====================
  {
    _id: "fb001",
    fieldID: "6984ade0031fcdd6b5e78715",
    userID: "6984ade0031fcdd6b5e78710",
    userName: "Phạm Minh Khách",
    userImage: "https://i.pravatar.cc/300?img=10",
    rating: 5,
    comment:
      "Sân cỏ nhân tạo rất đẹp, mái che tốt. Chơi buổi tối rất thoải mái, đèn sáng rõ. Sẽ quay lại!",
    createdAt: "2026-01-22T10:30:00.000Z",
    updatedAt: "2026-01-22T10:30:00.000Z",
  },
  {
    _id: "fb002",
    fieldID: "6984ade0031fcdd6b5e78715",
    userID: "u_review_01",
    userName: "Trần Hoàng Anh",
    userImage: "https://i.pravatar.cc/300?img=11",
    rating: 4,
    comment:
      "Sân ổn, cỏ nhân tạo khá mới. Có điểm trừ nhỏ là khu vực gửi xe hơi chật vào giờ cao điểm.",
    createdAt: "2026-01-25T15:00:00.000Z",
    updatedAt: "2026-01-25T15:00:00.000Z",
  },
  {
    _id: "fb003",
    fieldID: "6984ade0031fcdd6b5e78715",
    userID: "u_review_02",
    userName: "Lê Quốc Bảo",
    userImage: "https://i.pravatar.cc/300?img=12",
    rating: 5,
    comment:
      "Tuyệt vời! Nhân viên nhiệt tình, sân sạch sẽ. Wifi mạnh, ngồi chờ cũng thoải mái.",
    createdAt: "2026-02-01T09:15:00.000Z",
    updatedAt: "2026-02-01T09:15:00.000Z",
  },
  {
    _id: "fb004",
    fieldID: "6984ade0031fcdd6b5e78715",
    userID: "u_review_03",
    userName: "Nguyễn Đức Huy",
    userImage: "https://i.pravatar.cc/300?img=13",
    rating: 4,
    comment:
      "Sân tốt, giá hợp lý cho khu vực Quận 7. Phòng thay đồ sạch sẽ. Recommend cho anh em!",
    createdAt: "2026-02-10T20:45:00.000Z",
    updatedAt: "2026-02-10T20:45:00.000Z",
  },

  // ==================== Sân Bóng Đá A2 (3 reviews, avg 4.7) ====================
  {
    _id: "fb005",
    fieldID: "6984ade0031fcdd6b5e78716",
    userID: "u_review_04",
    userName: "Võ Thanh Tùng",
    userImage: "https://i.pravatar.cc/300?img=14",
    rating: 5,
    comment:
      "Sân 7 người cỏ tự nhiên rất đã! Mặt sân phẳng, bóng lăn chuẩn. Xứng đáng giá tiền.",
    createdAt: "2026-02-11T18:00:00.000Z",
    updatedAt: "2026-02-11T18:00:00.000Z",
  },
  {
    _id: "fb006",
    fieldID: "6984ade0031fcdd6b5e78716",
    userID: "6984ade0031fcdd6b5e78710",
    userName: "Phạm Minh Khách",
    userImage: "https://i.pravatar.cc/300?img=10",
    rating: 5,
    comment:
      "Lần thứ 3 đặt sân này rồi. Chất lượng luôn ổn định, dịch vụ chu đáo.",
    createdAt: "2026-02-14T21:30:00.000Z",
    updatedAt: "2026-02-14T21:30:00.000Z",
  },
  {
    _id: "fb007",
    fieldID: "6984ade0031fcdd6b5e78716",
    userID: "u_review_05",
    userName: "Huỳnh Minh Đạt",
    userImage: "https://i.pravatar.cc/300?img=15",
    rating: 4,
    comment:
      "Sân rộng, đá 7 người thoải mái. Có khu vực nghỉ ngơi riêng. Hơi xa trung tâm một chút.",
    createdAt: "2026-02-18T11:00:00.000Z",
    updatedAt: "2026-02-18T11:00:00.000Z",
  },

  // ==================== Sân Bóng Đá A3 (2 reviews, avg 3.5) ====================
  {
    _id: "fb008",
    fieldID: "6984ade0031fcdd6b5e78717",
    userID: "u_review_06",
    userName: "Đặng Văn Phong",
    userImage: "https://i.pravatar.cc/300?img=16",
    rating: 4,
    comment:
      "Sân mini có mái che, không sợ mưa. Giá rẻ nhất khu vực. Phù hợp chơi vui với bạn bè.",
    createdAt: "2026-02-03T17:30:00.000Z",
    updatedAt: "2026-02-03T17:30:00.000Z",
  },
  {
    _id: "fb009",
    fieldID: "6984ade0031fcdd6b5e78717",
    userID: "u_review_07",
    userName: "Bùi Thanh Long",
    userImage: "https://i.pravatar.cc/300?img=17",
    rating: 3,
    comment: "Sân tạm ổn, cỏ bắt đầu cũ một số chỗ. Không có wifi. Bãi xe ổn.",
    createdAt: "2026-02-08T19:00:00.000Z",
    updatedAt: "2026-02-08T19:00:00.000Z",
  },

  // ==================== Sân Bóng Đá A4 - Bảo trì (1 review, avg 2.0) ====================
  {
    _id: "fb010",
    fieldID: "6984ade0031fcdd6b5e7871e",
    userID: "u_review_08",
    userName: "Phan Quốc Việt",
    userImage: "https://i.pravatar.cc/300?img=18",
    rating: 2,
    comment:
      "Sân xuống cấp nhiều, cỏ hỏng nhiều chỗ. Mong sớm bảo trì xong để chơi lại.",
    createdAt: "2026-01-15T14:00:00.000Z",
    updatedAt: "2026-01-15T14:00:00.000Z",
  },

  // ==================== Sân Tennis Elite 1 (3 reviews, avg 4.3) ====================
  {
    _id: "fb011",
    fieldID: "6984ade0031fcdd6b5e78718",
    userID: "u_review_09",
    userName: "Ngô Thị Mai Anh",
    userImage: "https://i.pravatar.cc/300?img=20",
    rating: 5,
    comment:
      "Sân tennis chất lượng cao, mặt sân cứng rất chuẩn. Có HLV hướng dẫn tận tình.",
    createdAt: "2026-02-09T08:30:00.000Z",
    updatedAt: "2026-02-09T08:30:00.000Z",
  },
  {
    _id: "fb012",
    fieldID: "6984ade0031fcdd6b5e78718",
    userID: "u_review_10",
    userName: "Dương Minh Trí",
    userImage: "https://i.pravatar.cc/300?img=21",
    rating: 4,
    comment:
      "Sân đẹp, thuê vợt chất lượng tốt. Nhân viên thân thiện. Giá hơi cao nhưng xứng đáng.",
    createdAt: "2026-02-12T16:00:00.000Z",
    updatedAt: "2026-02-12T16:00:00.000Z",
  },
  {
    _id: "fb013",
    fieldID: "6984ade0031fcdd6b5e78718",
    userID: "6984ade0031fcdd6b5e78710",
    userName: "Phạm Minh Khách",
    userImage: "https://i.pravatar.cc/300?img=10",
    rating: 4,
    comment:
      "Vị trí Quận 1 tiện lợi. Sân sạch sẽ, có chỗ đậu xe ô tô. Phòng tắm đầy đủ.",
    createdAt: "2026-02-20T07:45:00.000Z",
    updatedAt: "2026-02-20T07:45:00.000Z",
  },

  // ==================== Sân Tennis Elite 2 (2 reviews, avg 4.5) ====================
  {
    _id: "fb014",
    fieldID: "6984ade0031fcdd6b5e78719",
    userID: "u_review_11",
    userName: "Lý Hoàng Nam",
    userImage: "https://i.pravatar.cc/300?img=22",
    rating: 5,
    comment:
      "Sân đôi tiêu chuẩn quốc tế thực sự! Mặt sân tuyệt vời. Có quán cafe ngồi chờ rất chill.",
    createdAt: "2026-02-16T10:00:00.000Z",
    updatedAt: "2026-02-16T10:00:00.000Z",
  },
  {
    _id: "fb015",
    fieldID: "6984ade0031fcdd6b5e78719",
    userID: "u_review_12",
    userName: "Trương Thị Hương",
    userImage: "https://i.pravatar.cc/300?img=23",
    rating: 4,
    comment:
      "Sân rộng rãi, chơi đôi rất thoải mái. Giá 200k/h hợp lý cho sân đôi ở Quận 1.",
    createdAt: "2026-02-19T14:30:00.000Z",
    updatedAt: "2026-02-19T14:30:00.000Z",
  },

  // ==================== Sân Cầu Lông VIP 1 (3 reviews, avg 4.7) ====================
  {
    _id: "fb016",
    fieldID: "6984ade0031fcdd6b5e7871a",
    userID: "u_review_13",
    userName: "Cao Thị Ngọc Trinh",
    userImage: "https://i.pravatar.cc/300?img=24",
    rating: 5,
    comment:
      "Sân trong nhà có điều hòa mát lạnh, chơi cầu lông không sợ gió. Đèn sáng rõ ràng!",
    createdAt: "2026-02-13T20:00:00.000Z",
    updatedAt: "2026-02-13T20:00:00.000Z",
  },
  {
    _id: "fb017",
    fieldID: "6984ade0031fcdd6b5e7871a",
    userID: "u_review_14",
    userName: "Đinh Công Sơn",
    userImage: "https://i.pravatar.cc/300?img=25",
    rating: 5,
    comment:
      "Giá 80k/h quá rẻ cho sân có điều hòa! Thuê vợt cầu lông chất lượng Yonex. Top 1 khu Phú Nhuận.",
    createdAt: "2026-02-15T21:15:00.000Z",
    updatedAt: "2026-02-15T21:15:00.000Z",
  },
  {
    _id: "fb018",
    fieldID: "6984ade0031fcdd6b5e7871a",
    userID: "u_review_15",
    userName: "Hồ Văn Cường",
    userImage: "https://i.pravatar.cc/300?img=26",
    rating: 4,
    comment:
      "Sân tốt, dịch vụ ổn. Nước uống miễn phí là điểm cộng lớn. Chỗ đậu xe hơi ít.",
    createdAt: "2026-02-22T18:30:00.000Z",
    updatedAt: "2026-02-22T18:30:00.000Z",
  },

  // ==================== Sân Cầu Lông VIP 2 (2 reviews, avg 4.0) ====================
  {
    _id: "fb019",
    fieldID: "6984ade0031fcdd6b5e7871b",
    userID: "u_review_16",
    userName: "Lâm Thị Bích Ngọc",
    userImage: "https://i.pravatar.cc/300?img=27",
    rating: 4,
    comment:
      "Sân đôi rộng, ánh sáng đều. Có snack bar tiện lợi. Giá 100k hợp lý cho sân đôi.",
    createdAt: "2026-02-08T19:45:00.000Z",
    updatedAt: "2026-02-08T19:45:00.000Z",
  },
  {
    _id: "fb020",
    fieldID: "6984ade0031fcdd6b5e7871b",
    userID: "u_review_17",
    userName: "Mai Xuân Thành",
    userImage: "https://i.pravatar.cc/300?img=28",
    rating: 4,
    comment:
      "Chất lượng sân tốt, điều hòa mát. Nhân viên phục vụ nhanh. Sẽ đặt lại lần sau.",
    createdAt: "2026-02-17T20:30:00.000Z",
    updatedAt: "2026-02-17T20:30:00.000Z",
  },

  // ==================== Sân Bóng Rổ Champions (3 reviews, avg 4.3) ====================
  {
    _id: "fb021",
    fieldID: "6984ade0031fcdd6b5e7871c",
    userID: "u_review_18",
    userName: "Trịnh Đình Quang",
    userImage: "https://i.pravatar.cc/300?img=30",
    rating: 5,
    comment:
      "Sân bóng rổ outdoor đẹp nhất Bình Thạnh! Mặt sân tiêu chuẩn, bảng điểm điện tử xịn.",
    createdAt: "2026-02-07T16:30:00.000Z",
    updatedAt: "2026-02-07T16:30:00.000Z",
  },
  {
    _id: "fb022",
    fieldID: "6984ade0031fcdd6b5e7871c",
    userID: "u_review_19",
    userName: "Nguyễn Hải Đăng",
    userImage: "https://i.pravatar.cc/300?img=31",
    rating: 4,
    comment:
      "Sân rộng, rổ đúng chuẩn. Có vòi nước uống. Hơi nắng buổi chiều vì ngoài trời.",
    createdAt: "2026-02-12T17:00:00.000Z",
    updatedAt: "2026-02-12T17:00:00.000Z",
  },
  {
    _id: "fb023",
    fieldID: "6984ade0031fcdd6b5e7871c",
    userID: "u_review_20",
    userName: "Phùng Thị Lan",
    userImage: "https://i.pravatar.cc/300?img=32",
    rating: 4,
    comment:
      "Giá 250k hơi cao nhưng chất lượng xứng đáng. Phòng tắm sạch. Nên đi buổi tối mát hơn.",
    createdAt: "2026-02-20T19:00:00.000Z",
    updatedAt: "2026-02-20T19:00:00.000Z",
  },

  // ==================== Sân Bóng Chuyền Olympia (2 reviews, avg 4.0) ====================
  {
    _id: "fb024",
    fieldID: "6984ade0031fcdd6b5e7871d",
    userID: "u_review_21",
    userName: "Tạ Quang Hưng",
    userImage: "https://i.pravatar.cc/300?img=33",
    rating: 4,
    comment:
      "Sân bóng chuyền bãi biển cát trắng thật sự! Cảm giác chơi rất vui, y như đi biển. Cát mịn, sạch.",
    createdAt: "2026-02-19T08:00:00.000Z",
    updatedAt: "2026-02-19T08:00:00.000Z",
  },
  {
    _id: "fb025",
    fieldID: "6984ade0031fcdd6b5e7871d",
    userID: "u_review_22",
    userName: "Vũ Thị Phương Thảo",
    userImage: "https://i.pravatar.cc/300?img=34",
    rating: 4,
    comment:
      "Sân đẹp, concept bãi biển độc đáo ở Quận 9. Đóng cửa hơi sớm (21h). Phòng thay đồ sạch sẽ.",
    createdAt: "2026-02-23T17:30:00.000Z",
    updatedAt: "2026-02-23T17:30:00.000Z",
  },
];

/**
 * Helper: Get feedbacks for a specific field
 * @param {string} fieldID
 * @returns {Array} feedbacks for that field
 */
export const getFeedbacksByFieldID = (fieldID) => {
  return mockFeedbacks.filter((fb) => fb.fieldID === fieldID);
};

/**
 * Helper: Get average rating for a specific field
 * @param {string} fieldID
 * @returns {{averageRating: number, totalReviews: number}}
 */
export const getFieldRating = (fieldID) => {
  const feedbacks = mockFeedbacks.filter((fb) => fb.fieldID === fieldID);
  if (feedbacks.length === 0) return { averageRating: 0, totalReviews: 0 };
  const total = feedbacks.reduce((sum, fb) => sum + fb.rating, 0);
  return {
    averageRating: Math.round((total / feedbacks.length) * 10) / 10,
    totalReviews: feedbacks.length,
  };
};

/**
 * Pre-computed ratings for all fields (for list pages)
 * @type {Object<string, {averageRating: number, totalReviews: number}>}
 */
export const fieldRatings = mockFields.reduce((acc, field) => {
  acc[field._id] = getFieldRating(field._id);
  return acc;
}, {});

// ============================================================================
// BOOKINGS (30 items) - User Booking Orders with full history
// ============================================================================

/**
 * Booking orders linking users to fields with complete history
 * Each booking has a unique code, status, payment info, and timing
 *
 * Status Flow: Pending → Confirmed → Completed
 *                    ↘ Cancelled
 *
 * Member Tier Logic (based on total completed bookings):
 * - Thành viên Đồng (Bronze): 0-4 bookings
 * - Thành viên Bạc (Silver): 5-9 bookings
 * - Thành viên Vàng (Gold): 10-19 bookings
 * - Thành viên Kim Cương (Diamond): 20+ bookings
 *
 * @type {Array<{
 *   _id: string,
 *   bookingCode: string,
 *   userID: string,
 *   fieldID: string,
 *   fieldName: string,
 *   fieldImage: string,
 *   date: string,
 *   startTime: string,
 *   endTime: string,
 *   totalPrice: number,
 *   depositAmount: number,
 *   status: string,
 *   paymentMethod: string,
 *   createdAt: string,
 *   updatedAt: string
 * }>}
 */
export const mockBookings = [
  // ==================== Phạm Minh Khách - Main Customer (12 bookings: 8 completed, 2 confirmed, 2 cancelled) ====================
  {
    _id: "bk_001",
    bookingCode: "BK-8821",
    userID: "6984ade0031fcdd6b5e78710",
    fieldID: "6984ade0031fcdd6b5e78716",
    fieldName: "Sân Bóng Đá A2",
    fieldImage:
      "https://images.unsplash.com/photo-1624880357913-a8539238245b?w=800",
    date: "2026-02-28",
    startTime: "18:00",
    endTime: "19:30",
    totalPrice: 350000,
    depositAmount: 105000,
    status: "Confirmed",
    paymentMethod: "Momo",
    createdAt: "2026-02-25T10:00:00.000Z",
    updatedAt: "2026-02-25T10:00:00.000Z",
  },
  {
    _id: "bk_002",
    bookingCode: "BK-8805",
    userID: "6984ade0031fcdd6b5e78710",
    fieldID: "6984ade0031fcdd6b5e78715",
    fieldName: "Sân Bóng Đá A1",
    fieldImage:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
    date: "2026-03-02",
    startTime: "08:00",
    endTime: "09:00",
    totalPrice: 200000,
    depositAmount: 60000,
    status: "Confirmed",
    paymentMethod: "Bank Transfer",
    createdAt: "2026-02-26T08:30:00.000Z",
    updatedAt: "2026-02-26T08:30:00.000Z",
  },
  {
    _id: "bk_003",
    bookingCode: "BK-7742",
    userID: "6984ade0031fcdd6b5e78710",
    fieldID: "6984ade0031fcdd6b5e7871a",
    fieldName: "Sân Cầu Lông VIP 1",
    fieldImage:
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800",
    date: "2026-02-20",
    startTime: "09:00",
    endTime: "11:00",
    totalPrice: 160000,
    depositAmount: 48000,
    status: "Completed",
    paymentMethod: "Momo",
    createdAt: "2026-02-18T14:00:00.000Z",
    updatedAt: "2026-02-20T11:05:00.000Z",
  },
  {
    _id: "bk_004",
    bookingCode: "BK-7120",
    userID: "6984ade0031fcdd6b5e78710",
    fieldID: "6984ade0031fcdd6b5e78716",
    fieldName: "Sân Bóng Đá A2",
    fieldImage:
      "https://images.unsplash.com/photo-1624880357913-a8539238245b?w=800",
    date: "2026-02-15",
    startTime: "17:00",
    endTime: "18:30",
    totalPrice: 350000,
    depositAmount: 105000,
    status: "Cancelled",
    paymentMethod: "Momo",
    createdAt: "2026-02-12T09:00:00.000Z",
    updatedAt: "2026-02-14T16:30:00.000Z",
  },
  {
    _id: "bk_005",
    bookingCode: "BK-6905",
    userID: "6984ade0031fcdd6b5e78710",
    fieldID: "6984ade0031fcdd6b5e78718",
    fieldName: "Sân Tennis Elite 1",
    fieldImage:
      "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800",
    date: "2026-02-10",
    startTime: "20:00",
    endTime: "22:00",
    totalPrice: 300000,
    depositAmount: 90000,
    status: "Completed",
    paymentMethod: "Bank Transfer",
    createdAt: "2026-02-08T07:45:00.000Z",
    updatedAt: "2026-02-10T22:05:00.000Z",
  },
  {
    _id: "bk_006",
    bookingCode: "BK-6540",
    userID: "6984ade0031fcdd6b5e78710",
    fieldID: "6984ade0031fcdd6b5e78715",
    fieldName: "Sân Bóng Đá A1",
    fieldImage:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
    date: "2026-02-05",
    startTime: "16:00",
    endTime: "18:00",
    totalPrice: 400000,
    depositAmount: 120000,
    status: "Completed",
    paymentMethod: "Cash",
    createdAt: "2026-02-03T10:00:00.000Z",
    updatedAt: "2026-02-05T18:05:00.000Z",
  },
  {
    _id: "bk_007",
    bookingCode: "BK-6210",
    userID: "6984ade0031fcdd6b5e78710",
    fieldID: "6984ade0031fcdd6b5e7871c",
    fieldName: "Sân Bóng Rổ Champions",
    fieldImage:
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800",
    date: "2026-01-28",
    startTime: "15:00",
    endTime: "16:30",
    totalPrice: 375000,
    depositAmount: 112500,
    status: "Completed",
    paymentMethod: "Momo",
    createdAt: "2026-01-26T11:00:00.000Z",
    updatedAt: "2026-01-28T16:35:00.000Z",
  },
  {
    _id: "bk_008",
    bookingCode: "BK-5880",
    userID: "6984ade0031fcdd6b5e78710",
    fieldID: "6984ade0031fcdd6b5e78717",
    fieldName: "Sân Bóng Đá A3",
    fieldImage:
      "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800",
    date: "2026-01-22",
    startTime: "18:00",
    endTime: "20:00",
    totalPrice: 360000,
    depositAmount: 108000,
    status: "Completed",
    paymentMethod: "Bank Transfer",
    createdAt: "2026-01-20T09:30:00.000Z",
    updatedAt: "2026-01-22T20:05:00.000Z",
  },
  {
    _id: "bk_009",
    bookingCode: "BK-5501",
    userID: "6984ade0031fcdd6b5e78710",
    fieldID: "6984ade0031fcdd6b5e78719",
    fieldName: "Sân Tennis Elite 2",
    fieldImage:
      "https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?w=800",
    date: "2026-01-18",
    startTime: "08:00",
    endTime: "09:30",
    totalPrice: 300000,
    depositAmount: 90000,
    status: "Completed",
    paymentMethod: "Momo",
    createdAt: "2026-01-16T15:00:00.000Z",
    updatedAt: "2026-01-18T09:35:00.000Z",
  },
  {
    _id: "bk_010",
    bookingCode: "BK-5102",
    userID: "6984ade0031fcdd6b5e78710",
    fieldID: "6984ade0031fcdd6b5e7871d",
    fieldName: "Sân Bóng Chuyền Olympia",
    fieldImage:
      "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800",
    date: "2026-01-12",
    startTime: "17:00",
    endTime: "19:00",
    totalPrice: 240000,
    depositAmount: 72000,
    status: "Completed",
    paymentMethod: "Cash",
    createdAt: "2026-01-10T08:00:00.000Z",
    updatedAt: "2026-01-12T19:05:00.000Z",
  },
  {
    _id: "bk_011",
    bookingCode: "BK-4780",
    userID: "6984ade0031fcdd6b5e78710",
    fieldID: "6984ade0031fcdd6b5e7871b",
    fieldName: "Sân Cầu Lông VIP 2",
    fieldImage:
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800",
    date: "2026-01-08",
    startTime: "20:00",
    endTime: "22:00",
    totalPrice: 200000,
    depositAmount: 60000,
    status: "Cancelled",
    paymentMethod: "Momo",
    createdAt: "2026-01-06T14:30:00.000Z",
    updatedAt: "2026-01-07T10:00:00.000Z",
  },
  {
    _id: "bk_012",
    bookingCode: "BK-4350",
    userID: "6984ade0031fcdd6b5e78710",
    fieldID: "6984ade0031fcdd6b5e78715",
    fieldName: "Sân Bóng Đá A1",
    fieldImage:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
    date: "2026-01-03",
    startTime: "08:00",
    endTime: "10:00",
    totalPrice: 400000,
    depositAmount: 120000,
    status: "Completed",
    paymentMethod: "Bank Transfer",
    createdAt: "2026-01-01T12:00:00.000Z",
    updatedAt: "2026-01-03T10:05:00.000Z",
  },

  // ==================== Trần Hoàng Anh (3 bookings: 2 completed, 1 cancelled) ====================
  {
    _id: "bk_013",
    bookingCode: "BK-8100",
    userID: "u_review_01",
    fieldID: "6984ade0031fcdd6b5e78715",
    fieldName: "Sân Bóng Đá A1",
    fieldImage:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
    date: "2026-01-20",
    startTime: "08:00",
    endTime: "10:00",
    totalPrice: 400000,
    depositAmount: 120000,
    status: "Completed",
    paymentMethod: "Momo",
    createdAt: "2026-01-18T11:00:00.000Z",
    updatedAt: "2026-01-20T10:05:00.000Z",
  },
  {
    _id: "bk_014",
    bookingCode: "BK-7650",
    userID: "u_review_01",
    fieldID: "6984ade0031fcdd6b5e78718",
    fieldName: "Sân Tennis Elite 1",
    fieldImage:
      "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800",
    date: "2026-02-02",
    startTime: "07:00",
    endTime: "08:00",
    totalPrice: 150000,
    depositAmount: 45000,
    status: "Completed",
    paymentMethod: "Bank Transfer",
    createdAt: "2026-01-30T09:00:00.000Z",
    updatedAt: "2026-02-02T08:05:00.000Z",
  },
  {
    _id: "bk_015",
    bookingCode: "BK-8400",
    userID: "u_review_01",
    fieldID: "6984ade0031fcdd6b5e78716",
    fieldName: "Sân Bóng Đá A2",
    fieldImage:
      "https://images.unsplash.com/photo-1624880357913-a8539238245b?w=800",
    date: "2026-02-22",
    startTime: "14:00",
    endTime: "15:30",
    totalPrice: 350000,
    depositAmount: 105000,
    status: "Cancelled",
    paymentMethod: "Momo",
    createdAt: "2026-02-20T08:00:00.000Z",
    updatedAt: "2026-02-21T12:00:00.000Z",
  },

  // ==================== Võ Thanh Tùng (4 bookings: 3 completed, 1 confirmed) ====================
  {
    _id: "bk_016",
    bookingCode: "BK-6800",
    userID: "u_review_04",
    fieldID: "6984ade0031fcdd6b5e78716",
    fieldName: "Sân Bóng Đá A2",
    fieldImage:
      "https://images.unsplash.com/photo-1624880357913-a8539238245b?w=800",
    date: "2026-02-10",
    startTime: "14:00",
    endTime: "15:30",
    totalPrice: 350000,
    depositAmount: 105000,
    status: "Completed",
    paymentMethod: "Momo",
    createdAt: "2026-02-08T10:00:00.000Z",
    updatedAt: "2026-02-10T15:35:00.000Z",
  },
  {
    _id: "bk_017",
    bookingCode: "BK-7200",
    userID: "u_review_04",
    fieldID: "6984ade0031fcdd6b5e78715",
    fieldName: "Sân Bóng Đá A1",
    fieldImage:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
    date: "2026-01-25",
    startTime: "19:00",
    endTime: "21:00",
    totalPrice: 400000,
    depositAmount: 120000,
    status: "Completed",
    paymentMethod: "Cash",
    createdAt: "2026-01-23T14:00:00.000Z",
    updatedAt: "2026-01-25T21:05:00.000Z",
  },
  {
    _id: "bk_018",
    bookingCode: "BK-5900",
    userID: "u_review_04",
    fieldID: "6984ade0031fcdd6b5e7871c",
    fieldName: "Sân Bóng Rổ Champions",
    fieldImage:
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800",
    date: "2026-01-15",
    startTime: "16:00",
    endTime: "17:30",
    totalPrice: 375000,
    depositAmount: 112500,
    status: "Completed",
    paymentMethod: "Bank Transfer",
    createdAt: "2026-01-13T08:00:00.000Z",
    updatedAt: "2026-01-15T17:35:00.000Z",
  },
  {
    _id: "bk_019",
    bookingCode: "BK-8900",
    userID: "u_review_04",
    fieldID: "6984ade0031fcdd6b5e78716",
    fieldName: "Sân Bóng Đá A2",
    fieldImage:
      "https://images.unsplash.com/photo-1624880357913-a8539238245b?w=800",
    date: "2026-03-01",
    startTime: "18:00",
    endTime: "19:30",
    totalPrice: 350000,
    depositAmount: 105000,
    status: "Confirmed",
    paymentMethod: "Momo",
    createdAt: "2026-02-25T16:00:00.000Z",
    updatedAt: "2026-02-25T16:00:00.000Z",
  },

  // ==================== Ngô Thị Mai Anh (3 bookings: 2 completed, 1 confirmed) ====================
  {
    _id: "bk_020",
    bookingCode: "BK-7500",
    userID: "u_review_09",
    fieldID: "6984ade0031fcdd6b5e78718",
    fieldName: "Sân Tennis Elite 1",
    fieldImage:
      "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800",
    date: "2026-02-08",
    startTime: "10:00",
    endTime: "11:00",
    totalPrice: 150000,
    depositAmount: 45000,
    status: "Completed",
    paymentMethod: "Momo",
    createdAt: "2026-02-06T09:00:00.000Z",
    updatedAt: "2026-02-08T11:05:00.000Z",
  },
  {
    _id: "bk_021",
    bookingCode: "BK-6300",
    userID: "u_review_09",
    fieldID: "6984ade0031fcdd6b5e78719",
    fieldName: "Sân Tennis Elite 2",
    fieldImage:
      "https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?w=800",
    date: "2026-01-28",
    startTime: "15:00",
    endTime: "16:30",
    totalPrice: 300000,
    depositAmount: 90000,
    status: "Completed",
    paymentMethod: "Bank Transfer",
    createdAt: "2026-01-26T07:00:00.000Z",
    updatedAt: "2026-01-28T16:35:00.000Z",
  },
  {
    _id: "bk_022",
    bookingCode: "BK-8950",
    userID: "u_review_09",
    fieldID: "6984ade0031fcdd6b5e78718",
    fieldName: "Sân Tennis Elite 1",
    fieldImage:
      "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800",
    date: "2026-03-03",
    startTime: "06:00",
    endTime: "07:00",
    totalPrice: 150000,
    depositAmount: 45000,
    status: "Confirmed",
    paymentMethod: "Momo",
    createdAt: "2026-02-26T10:00:00.000Z",
    updatedAt: "2026-02-26T10:00:00.000Z",
  },

  // ==================== Cao Thị Ngọc Trinh (2 bookings: 2 completed) ====================
  {
    _id: "bk_023",
    bookingCode: "BK-7300",
    userID: "u_review_13",
    fieldID: "6984ade0031fcdd6b5e7871a",
    fieldName: "Sân Cầu Lông VIP 1",
    fieldImage:
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800",
    date: "2026-02-12",
    startTime: "19:00",
    endTime: "22:00",
    totalPrice: 240000,
    depositAmount: 72000,
    status: "Completed",
    paymentMethod: "Cash",
    createdAt: "2026-02-10T08:00:00.000Z",
    updatedAt: "2026-02-12T22:05:00.000Z",
  },
  {
    _id: "bk_024",
    bookingCode: "BK-6100",
    userID: "u_review_13",
    fieldID: "6984ade0031fcdd6b5e7871a",
    fieldName: "Sân Cầu Lông VIP 1",
    fieldImage:
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800",
    date: "2026-01-30",
    startTime: "20:00",
    endTime: "22:00",
    totalPrice: 160000,
    depositAmount: 48000,
    status: "Completed",
    paymentMethod: "Momo",
    createdAt: "2026-01-28T12:00:00.000Z",
    updatedAt: "2026-01-30T22:05:00.000Z",
  },

  // ==================== Trịnh Đình Quang (3 bookings: 2 completed, 1 cancelled) ====================
  {
    _id: "bk_025",
    bookingCode: "BK-7800",
    userID: "u_review_18",
    fieldID: "6984ade0031fcdd6b5e7871c",
    fieldName: "Sân Bóng Rổ Champions",
    fieldImage:
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800",
    date: "2026-02-06",
    startTime: "15:00",
    endTime: "18:00",
    totalPrice: 750000,
    depositAmount: 225000,
    status: "Completed",
    paymentMethod: "Bank Transfer",
    createdAt: "2026-02-04T10:00:00.000Z",
    updatedAt: "2026-02-06T18:05:00.000Z",
  },
  {
    _id: "bk_026",
    bookingCode: "BK-6600",
    userID: "u_review_18",
    fieldID: "6984ade0031fcdd6b5e7871c",
    fieldName: "Sân Bóng Rổ Champions",
    fieldImage:
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800",
    date: "2026-01-22",
    startTime: "10:00",
    endTime: "11:30",
    totalPrice: 375000,
    depositAmount: 112500,
    status: "Completed",
    paymentMethod: "Momo",
    createdAt: "2026-01-20T09:00:00.000Z",
    updatedAt: "2026-01-22T11:35:00.000Z",
  },
  {
    _id: "bk_027",
    bookingCode: "BK-8200",
    userID: "u_review_18",
    fieldID: "6984ade0031fcdd6b5e78715",
    fieldName: "Sân Bóng Đá A1",
    fieldImage:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
    date: "2026-02-18",
    startTime: "19:00",
    endTime: "21:00",
    totalPrice: 400000,
    depositAmount: 120000,
    status: "Cancelled",
    paymentMethod: "Bank Transfer",
    createdAt: "2026-02-15T14:00:00.000Z",
    updatedAt: "2026-02-17T08:00:00.000Z",
  },

  // ==================== Tạ Quang Hưng (2 bookings: 1 completed, 1 confirmed) ====================
  {
    _id: "bk_028",
    bookingCode: "BK-7900",
    userID: "u_review_21",
    fieldID: "6984ade0031fcdd6b5e7871d",
    fieldName: "Sân Bóng Chuyền Olympia",
    fieldImage:
      "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800",
    date: "2026-02-18",
    startTime: "17:00",
    endTime: "20:00",
    totalPrice: 360000,
    depositAmount: 108000,
    status: "Completed",
    paymentMethod: "Cash",
    createdAt: "2026-02-16T08:00:00.000Z",
    updatedAt: "2026-02-18T20:05:00.000Z",
  },
  {
    _id: "bk_029",
    bookingCode: "BK-8850",
    userID: "u_review_21",
    fieldID: "6984ade0031fcdd6b5e7871d",
    fieldName: "Sân Bóng Chuyền Olympia",
    fieldImage:
      "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800",
    date: "2026-03-05",
    startTime: "08:00",
    endTime: "10:00",
    totalPrice: 240000,
    depositAmount: 72000,
    status: "Confirmed",
    paymentMethod: "Momo",
    createdAt: "2026-02-25T11:00:00.000Z",
    updatedAt: "2026-02-25T11:00:00.000Z",
  },

  // ==================== Đinh Công Sơn (1 booking: 1 completed) ====================
  {
    _id: "bk_030",
    bookingCode: "BK-7400",
    userID: "u_review_14",
    fieldID: "6984ade0031fcdd6b5e7871a",
    fieldName: "Sân Cầu Lông VIP 1",
    fieldImage:
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800",
    date: "2026-02-14",
    startTime: "20:00",
    endTime: "22:00",
    totalPrice: 160000,
    depositAmount: 48000,
    status: "Completed",
    paymentMethod: "Momo",
    createdAt: "2026-02-12T15:00:00.000Z",
    updatedAt: "2026-02-14T22:05:00.000Z",
  },
];

/**
 * Booking order status constants
 * @type {{PENDING: string, CONFIRMED: string, COMPLETED: string, CANCELLED: string}}
 */
export const BOOKING_ORDER_STATUS = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

/**
 * Member tier thresholds (based on completed bookings)
 * @type {Array<{name: string, minBookings: number, color: string}>}
 */
export const MEMBER_TIERS = [
  { name: "Thành viên Kim Cương", minBookings: 20, color: "#b9f2ff" },
  { name: "Thành viên Vàng", minBookings: 10, color: "#ffd700" },
  { name: "Thành viên Bạc", minBookings: 5, color: "#c0c0c0" },
  { name: "Thành viên Đồng", minBookings: 0, color: "#cd7f32" },
];

/**
 * Helper: Get bookings for a specific user
 * @param {string} userID
 * @returns {Array} bookings sorted by date (newest first)
 */
export const getBookingsByUserID = (userID) => {
  return mockBookings
    .filter((b) => b.userID === userID)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

/**
 * Helper: Get booking stats for a user
 * @param {string} userID
 * @returns {{total: number, completed: number, confirmed: number, cancelled: number, totalSpent: number}}
 */
export const getUserBookingStats = (userID) => {
  const bookings = mockBookings.filter((b) => b.userID === userID);
  return {
    total: bookings.length,
    completed: bookings.filter((b) => b.status === "Completed").length,
    confirmed: bookings.filter((b) => b.status === "Confirmed").length,
    cancelled: bookings.filter((b) => b.status === "Cancelled").length,
    pending: bookings.filter((b) => b.status === "Pending").length,
    totalSpent: bookings
      .filter((b) => b.status === "Completed")
      .reduce((sum, b) => sum + b.totalPrice, 0),
  };
};

/**
 * Helper: Get member tier for a user
 * @param {string} userID
 * @returns {{name: string, minBookings: number, color: string}}
 */
export const getUserMemberTier = (userID) => {
  const { completed } = getUserBookingStats(userID);
  return (
    MEMBER_TIERS.find((tier) => completed >= tier.minBookings) ||
    MEMBER_TIERS[MEMBER_TIERS.length - 1]
  );
};

// ============================================================================
// UTILITY CONSTANTS
// ============================================================================

/**
 * All available utilities across all fields
 * @type {string[]}
 */
export const ALL_UTILITIES = [
  "Wifi",
  "Parking",
  "Shower",
  "Changing Room",
  "Water",
  "First Aid",
  "Equipment Rental",
  "Coaching",
  "Cafe",
  "Air Conditioning",
  "Snack Bar",
  "Scoreboard",
];

/**
 * Utility English → Vietnamese mapping for display
 * @type {Object<string, string>}
 */
export const UTILITY_LABELS = {
  'Wifi': 'Wifi miễn phí',
  'Parking': 'Gửi xe miễn phí',
  'Shower': 'Phòng tắm sạch sẽ',
  'Changing Room': 'Phòng thay đồ',
  'Water': 'Nước suối miễn phí (2 chai)',
  'First Aid': 'Dụng cụ y tế sơ cứu',
  'Equipment Rental': 'Cho thuê dụng cụ thể thao',
  'Coaching': 'Huấn luyện viên hỗ trợ',
  'Cafe': 'Quán cà phê khu vực sân',
  'Air Conditioning': 'Điều hòa không khí',
  'Snack Bar': 'Căn tin phục vụ đồ ăn nhẹ',
  'Scoreboard': 'Bảng điểm điện tử',
};

/**
 * Default field rules per sport category
 * @type {Object<string, string[]>}
 */
export const FIELD_RULES_BY_CATEGORY = {
  Football: [
    'Có mặt trước 15 phút để làm thủ tục nhận sân.',
    'Sử dụng giày chuyên dụng cho cỏ nhân tạo.',
    'Không mang chất dễ cháy nổ vào khu vực sân.',
    'Không hút thuốc trong khu vực sân bóng.',
  ],
  Badminton: [
    'Có mặt trước 10 phút để nhận sân.',
    'Mang giày thể thao trong nhà (đế không trầy sàn).',
    'Không ăn uống trên sân thi đấu.',
    'Giữ gìn vệ sinh chung sau khi sử dụng.',
  ],
  Tennis: [
    'Có mặt trước 15 phút để nhận sân.',
    'Sử dụng giày tennis chuyên dụng.',
    'Không mang đồ ăn ra khu vực sân.',
    'Trả sân đúng giờ để không ảnh hưởng lịch tiếp theo.',
  ],
  Basketball: [
    'Có mặt trước 10 phút để nhận sân.',
    'Mang giày bóng rổ hoặc giày thể thao.',
    'Không treo bám vào vành rổ.',
    'Giữ gìn vệ sinh khu vực sân.',
  ],
  Volleyball: [
    'Có mặt trước 10 phút để nhận sân.',
    'Mang giày thể thao đế bằng.',
    'Không chạm vào lưới khi đang thi đấu.',
    'Giữ gìn vệ sinh chung.',
  ],
  Pickleball: [
    'Có mặt trước 10 phút để nhận sân.',
    'Mang giày thể thao đế bằng.',
    'Sử dụng bóng pickleball tiêu chuẩn.',
    'Giữ gìn vệ sinh chung.',
  ],
};

/**
 * Booking status display config (icon, label, CSS class)
 * @type {Object}
 */
export const BOOKING_STATUS_CONFIG = {
  Pending: {
    icon: 'hourglass_top',
    label: 'Chờ xác nhận',
    bannerClass: 'pending',
    badgeClass: 'status-pending',
  },
  Confirmed: {
    icon: 'check_circle',
    label: 'Đã xác nhận',
    bannerClass: 'confirmed',
    badgeClass: 'status-confirmed',
  },
  Completed: {
    icon: 'task_alt',
    label: 'Đã hoàn thành',
    bannerClass: 'completed',
    badgeClass: 'status-completed',
  },
  Cancelled: {
    icon: 'cancel',
    label: 'Đã hủy',
    bannerClass: 'cancelled',
    badgeClass: 'status-cancelled',
  },
};

/**
 * All districts in Hà Nội where fields are located
 * @type {string[]}
 */
export const ALL_DISTRICTS = [
  "Quận Hoàn Kiếm",
  "Quận Ba Đình",
  "Quận Đống Đa",
  "Quận Hai Bà Trưng",
  "Quận Cầu Giấy",
  "Quận Thanh Xuân",
  "Quận Long Biên",
  "Quận Tây Hồ",
  "Quận Nam Từ Liêm",
  "Quận Hà Đông",
];

/**
 * Price range constants (in VND)
 * @type {{min: number, max: number}}
 */
export const PRICE_RANGE = {
  min: 80000,
  max: 500000,
};

/**
 * Field status constants
 * @type {string[]}
 */
export const FIELD_STATUS = {
  AVAILABLE: "Available",
  MAINTENANCE: "Maintenance",
};

/**
 * Booking detail status constants
 * @type {string[]}
 */
export const BOOKING_STATUS = {
  ACTIVE: "Active",
  CANCELLED: "Cancelled",
};

/**
 * User role constants
 * @type {{CUSTOMER: string, ADMIN: string}}
 */
export const USER_ROLES = {
  CUSTOMER: "customer",
  ADMIN: "admin",
};
