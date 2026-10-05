// Import MongoClient từ thư viện mongodb
const { MongoClient } = require("mongodb");
// Địa chỉ MongoDB
// 27017 = port mặc định của MongoDB
const url = "mongodb://127.0.0.1:27017";
// Tạo đối tượng MongoClient
const client = new MongoClient(url);
// Hàm main() là nơi chạy chương trình
async function main() {
  try {
    // 1. Kết nối đến MongoDB
    await client.connect();
    console.log("Connected to MongoDB");
    console.log("================================");
    // 2. Chọn database
    // Ở đây database có tên là sdn302_db
    const db = client.db("sdn302_db");
    // 3. Chọn collection students
    const students = db.collection("students");

    // 4. Kiểm tra tên database
    console.log("Database:", db.databaseName);
    // Có thể sử dụng biến students
    // để thực hiện các thao tác với collection students
    console.log("Collection: students");
  } catch (error) {
    // Nếu kết nối hoặc thao tác bị lỗi
    // thì hiển thị thông báo lỗi
    console.error("Lỗi kết nối MongoDB:", error);
  } finally {
    // 5. Đóng kết nối MongoDB
    await client.close();
    console.log("Đã đóng kết nối MongoDB.");
  }
}
// Gọi hàm main() để chạy chương trình
main();