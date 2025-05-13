<%- include('../../partials/header', { pageTitle: pageTitle, isAdminPage: false }); %>
<%- include('../../partials/navbar'); %>

<main role="main" class="container-fluid flex-grow-1 py-3">
<div class="container mt-4">
    <h1 class="mb-4">Giỏ Hàng Của Bạn</h1>

    <% if (locals.query && locals.query.success) { %>
        <div class="alert alert-success alert-dismissible fade show alert-auto-dismiss" role="alert">
            <% if (locals.query.success === 'added') { %>Sản phẩm đã được thêm vào giỏ! <% } %>
            <% if (locals.query.success === 'updated') { %>Giỏ hàng đã được cập nhật! <% } %>
            <% if (locals.query.success === 'removed') { %>Sản phẩm đã được xóa khỏi giỏ! <% } %>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    <% } %>
    <% if (locals.query && locals.query.error) { %>
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <% if (locals.query.error === 'product_not_found') { %>Sản phẩm không tồn tại. <% } %>
            <% else if (locals.query.error === 'insufficient_stock') { %>Không đủ số lượng tồn kho cho sản phẩm <% if(locals.query.product){ %>"<%=decodeURIComponent(locals.query.product) %>"<% } %>. <% } %>
            <% else if (locals.query.error === 'insufficient_stock_update') { %>Không đủ số lượng tồn kho để cập nhật cho sản phẩm <% if(locals.query.product){ %>"<%=decodeURIComponent(locals.query.product) %>"<% } %>. <% } %>
            <% else if (locals.query.error === 'invalid_quantity') { %>Số lượng không hợp lệ. <% } %>
            <% else if (locals.query.error === 'item_not_found') { %>Sản phẩm không tìm thấy trong giỏ. <% } %>
            <% else { %>Đã có lỗi xảy ra. Vui lòng thử lại. <% } %>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    <% } %>


    <% if (typeof cartItems !== 'undefined' && cartItems.length > 0) { %>
        <div class="row">
            <div class="col-lg-8 mb-4">
                <div class="card shadow-sm">
                    <div class="card-header bg-light">
                        <h5 class="mb-0">Sản phẩm trong giỏ (<%= cartItems.length %>)</h5>
                    </div>
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-hover mb-0 align-middle">
                                <thead class="table-light small text-muted">
                                    <tr>
                                        <th scope="col" style="width: 50%;">Sản phẩm</th>
                                        <th scope="col" class="text-center">Số lượng</th>
                                        <th scope="col" class="text-end">Đơn giá</th>
                                        <th scope="col" class="text-end">Thành tiền</th>
                                        <th scope="col" class="text-center">Xóa</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <% cartItems.forEach(item => { %>
                                        <% if (item.product) { %> <tr>
                                            <td>
                                                <div class="d-flex align-items-center">
                                                    <a href="/products/<%= item.product.id %>">
                                                        <img src="<%= item.product.imageUrl || '/images/placeholder.png' %>"
                                                             alt="<%= item.product.name %>"
                                                             class="product-img-thumb me-3 rounded">
                                                    </a>
                                                    <div>
                                                        <h6 class="mb-0 small">
                                                            <a href="/products/<%= item.product.id %>" class="text-dark text-decoration-none"><%= item.product.name %></a>
                                                        </h6>
                                                        <% if(item.product.stockQuantity < item.quantity) { %>
                                                            <small class="text-danger d-block">Chỉ còn <%= item.product.stockQuantity %> sản phẩm</small>
                                                        <% } %>
                                                    </div>
                                                </div>
                                            </td>
                                            <td class="text-center">
                                                <form action="/cart/update/<%= item.id %>" method="POST" class="d-inline-flex align-items-center">
                                                    <input type="number" name="quantity" value="<%= item.quantity %>" min="1" max="<%= item.product.stockQuantity %>" class="form-control form-control-sm text-center" style="width: 70px;">
                                                    <button type="submit" class="btn btn-sm btn-link p-1 ms-1" title="Cập nhật">
                                                        <span data-feather="refresh-cw" style="width:16px; height:16px;"></span>
                                                    </button>
                                                </form>
                                            </td>
                                            <td class="text-end"><%= new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.product.price) %></td>
                                            <td class="text-end fw-semibold"><%= new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.quantity * item.product.price) %></td>
                                            <td class="text-center">
                                                <form action="/cart/remove/<%= item.id %>" method="POST" onsubmit="return confirmDelete(event);">
                                                    <button type="submit" class="btn btn-sm btn-outline-danger border-0" title="Xóa sản phẩm">
                                                        <span data-feather="trash-2"></span>
                                                    </button>
                                                </form>
                                            </td>
                                        </tr>
                                        <% } else { %>
                                         <tr>
                                             <td colspan="5">
                                                 <div class="alert alert-warning small p-2 mb-0">
                                                     Một sản phẩm trong giỏ không còn tồn tại và đã được bỏ qua.
                                                     <form action="/cart/remove/<%= item.id %>" method="POST" class="d-inline ms-2" onsubmit="return confirm('Xóa mục này khỏi giỏ?')">
                                                        <button type="submit" class="btn btn-xs btn-outline-danger border-0 p-0"><small>(Xóa)</small></button>
                                                     </form>
                                                 </div>
                                             </td>
                                         </tr>
                                        <% } %>
                                    <% }) %>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-lg-4">
                <div class="card shadow-sm sticky-lg-top" style="top: 70px;"> <div class="card-header bg-light">
                        <h5 class="mb-0">Tổng Kết Đơn Hàng</h5>
                    </div>
                    <div class="card-body">
                        <div class="d-flex justify-content-between mb-2">
                            <span>Tạm tính:</span>
                            <span><%= new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cartTotal) %></span>
                        </div>
                        <div class="d-flex justify-content-between mb-2">
                            <span>Phí vận chuyển:</span>
                            <span>Miễn phí</span> </div>
                        <hr>
                        <div class="d-flex justify-content-between fw-bold fs-5 mb-3">
                            <span>Tổng cộng:</span>
                            <span class="text-primary"><%= new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cartTotal) %></span>
                        </div>
                        <a href="/checkout" class="btn btn-primary btn-lg w-100">Tiến Hành Thanh Toán</a>
                    </div>
                </div>
            </div>
        </div>
    <% } else { %>
        <div class="alert alert-info text-center" role="alert">
            <h4 class="alert-heading">Giỏ hàng của bạn đang trống!</h4>
            <p>Hãy khám phá các sản phẩm tuyệt vời của chúng tôi và thêm chúng vào giỏ hàng.</p>
            <hr>
            <a href="/products" class="btn btn-primary">
                <span data-feather="shopping-bag" class="align-text-bottom me-1"></span> Bắt đầu mua sắm
            </a>
        </div>
    <% } %>
</div>
</main>
<%- include('../../partials/footer'); %>