// public/js/script.js
// Bạn có thể thêm các script chung cho trang web ở đây
// Ví dụ: xử lý menu mobile, slider, ajax request nhỏ,...

console.log("Script chung đã load!");

// Ví dụ: đóng thông báo sau vài giây
document.addEventListener('DOMContentLoaded', function() {
    const successMessage = document.querySelector('p[style="color: green;"]');
    const errorMessage = document.querySelector('p[style="color: red;"]');

    if (successMessage) {
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 5000); // Ẩn sau 5 giây
    }
    if (errorMessage) {
         setTimeout(() => {
             errorMessage.style.display = 'none';
         }, 5000); // Ẩn sau 5 giây
     }

});