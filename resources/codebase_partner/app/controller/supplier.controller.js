const { body, validationResult } = require("express-validator");

// Controller factory — accepts Supplier model injected from main
module.exports = function (Supplier) {
    return {
        create: [
            body('name').trim().isLength({ min: 1 }).escape(),
            body('address').trim().isLength({ min: 1 }).escape(),
            body('city').trim().isLength({ min: 1 }).escape(),
            body('state').trim().isLength({ min: 1 }).escape(),
            body('phone').trim().isMobilePhone().escape(),

            (req, res) => {
                const errors = validationResult(req);
                const supplier = new Supplier(req.body);

                if (!errors.isEmpty()) {
                    return res.render('supplier-add', { supplier, errors: errors.array() });
                }

                Supplier.create(supplier, (err) => {
                    if (err) return res.render("500", { message: "Error creating supplier." });
                    res.redirect("/students");
                });
            }
        ],

        findAll: (req, res) => {
            Supplier.getAll((err, data) => {
                if (err) return res.render("500", { message: "Failed to fetch students." });
                res.render("supplier-list-all", { students: data });
            });
        },

        findOne: (req, res) => {
            Supplier.findById(req.params.id, (err, data) => {
                if (err && err.kind === "not_found")
                    return res.status(404).send({ message: "Student not found." });
                if (err) return res.render("500", { message: "Error fetching student." });
                res.render("supplier-update", { supplier: data });
            });
        },

        update: [
            body('name').trim().isLength({ min: 1 }).escape(),
            body('address').trim().isLength({ min: 1 }).escape(),
            body('city').trim().isLength({ min: 1 }).escape(),
            body('state').trim().isLength({ min: 1 }).escape(),
            body('phone').trim().isMobilePhone().escape(),

            (req, res) => {
                const errors = validationResult(req);
                const supplier = new Supplier(req.body);

                if (!errors.isEmpty()) {
                    return res.render("supplier-update", { supplier, errors: errors.array() });
                }

                Supplier.updateById(req.body.id, supplier, (err) => {
                    if (err && err.kind === "not_found")
                        return res.status(404).send({ message: "Student not found." });
                    if (err) return res.render("500", { message: "Error updating student." });
                    res.redirect("/students");
                });
            }
        ],

        remove: (req, res) => {
            Supplier.delete(req.params.id, (err) => {
                if (err && err.kind === "not_found")
                    return res.status(404).send({ message: "Student not found." });
                if (err) return res.render("500", { message: "Error deleting student." });
                res.redirect("/students");
            });
        },

        removeAll: (req, res) => {
            Supplier.removeAll((err) => {
                if (err) return res.render("500", { message: "Error deleting all students." });
                res.send({ message: "All students deleted successfully." });
            });
        }
    };
};