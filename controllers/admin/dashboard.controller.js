exports.showDashboard = (req, res) => {

    res.render("admin/dashboard", {
        title: "Dashboard Admin",
    });
};