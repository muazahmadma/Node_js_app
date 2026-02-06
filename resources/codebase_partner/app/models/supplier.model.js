// Accepts dbConfig from the caller (after secrets are loaded)
const mysql = require("mysql2");

module.exports = function (dbConfig) {
    const connection = mysql.createConnection(dbConfig);
    connection.connect((err) => {
        if (err) throw err;
        console.log("✅ Connected to DB");
    });

    const Supplier = function (supplier) {
        this.id = supplier.id;
        this.name = supplier.name;
        this.address = supplier.address;
        this.city = supplier.city;
        this.state = supplier.state;
        this.email = supplier.email;
        this.phone = supplier.phone;
    };

    Supplier.create = (newSupplier, result) => {
        connection.query("INSERT INTO students SET ?", newSupplier, (err, res) => {
            if (err) return result(err, null);
            result(null, { id: res.insertId, ...newSupplier });
        });
    };

    Supplier.getAll = (result) => {
        connection.query("SELECT * FROM students", (err, res) => {
            if (err) return result(err, null);
            result(null, res);
        });
    };

    Supplier.findById = (id, result) => {
        connection.query("SELECT * FROM students WHERE id = ?", [id], (err, res) => {
            if (err) return result(err, null);
            if (res.length) return result(null, res[0]);
            result({ kind: "not_found" }, null);
        });
    };

    Supplier.updateById = (id, supplier, result) => {
        connection.query(
            "UPDATE students SET name=?, city=?, address=?, email=?, phone=?, state=? WHERE id=?",
            [supplier.name, supplier.city, supplier.address, supplier.email, supplier.phone, supplier.state, id],
            (err, res) => {
                if (err) return result(err, null);
                if (res.affectedRows === 0) return result({ kind: "not_found" }, null);
                result(null, { id, ...supplier });
            }
        );
    };

    Supplier.delete = (id, result) => {
        connection.query("DELETE FROM students WHERE id = ?", [id], (err, res) => {
            if (err) return result(err, null);
            if (res.affectedRows === 0) return result({ kind: "not_found" }, null);
            result(null, res);
        });
    };

    Supplier.removeAll = (result) => {
        connection.query("DELETE FROM students", (err, res) => {
            if (err) return result(err, null);
            result(null, res);
        });
    };

    return Supplier;
};