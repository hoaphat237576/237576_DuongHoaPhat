
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

const emptyEmployee = {
  employeeId: "",
  fullName: "",
  gender: "Nam",
  dateOfBirth: "",
  department: "",
  position: "",
  email: "",
  phone: "",
  hireDate: "",
  status: "Dang lam viec",
};

function App() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [form, setForm] = useState(emptyEmployee);

  const loadEmployees = useCallback(async (keyword = "") => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/employees", {
        params: keyword.trim() ? { search: keyword.trim() } : {},
      });

      setEmployees(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể tải danh sách nhân viên. Hãy kiểm tra Backend."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadEmployees(search);
    }, 350);

    return () => clearTimeout(timer);
  }, [search, loadEmployees]);

  function openAddForm() {
    setForm({ ...emptyEmployee });
    setEditingId(null);
    setViewingEmployee(null);
    setShowForm(true);
    setMessage("");
    setError("");
  }

  function openEditForm(employee) {
    setForm({
      ...emptyEmployee,
      ...employee,
      dateOfBirth: employee.dateOfBirth || "",
      hireDate: employee.hireDate || "",
    });

    setEditingId(employee._id);
    setViewingEmployee(null);
    setShowForm(true);
    setMessage("");
    setError("");
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (
      !form.employeeId.trim() ||
      !form.fullName.trim() ||
      !form.email.trim()
    ) {
      setError("Vui lòng nhập mã nhân viên, họ tên và email.");
      return;
    }

    setSaving(true);

    try {
      const data = {
        ...form,
        employeeId: form.employeeId.trim(),
        fullName: form.fullName.trim(),
        email: form.email.trim(),
      };

      if (editingId) {
        await api.put(`/employees/${editingId}`, data);
        setMessage("Cập nhật nhân viên thành công.");
      } else {
        await api.post("/employees", data);
        setMessage("Thêm nhân viên thành công.");
      }

      setShowForm(false);
      setEditingId(null);
      await loadEmployees(search);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể lưu nhân viên. Vui lòng kiểm tra dữ liệu và Backend."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(employee) {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa nhân viên "${employee.fullName}" không?`
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      await api.delete(`/employees/${employee._id}`);
      setMessage("Xóa nhân viên thành công.");
      await loadEmployees(search);
    } catch (err) {
      setError(
        err.response?.data?.message || "Không thể xóa nhân viên."
      );
    }
  }

  async function handleView(employee) {
    setError("");
    setMessage("");

    try {
      const response = await api.get(`/employees/${employee._id}`);
      setViewingEmployee(response.data);
      setShowForm(false);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể tải thông tin nhân viên."
      );
    }
  }

  function closePanels() {
    setShowForm(false);
    setViewingEmployee(null);
  }

  return (
    <main className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">HR</div>
          <div>
            <h1>Quản lý nhân sự</h1>
            <p>Hệ thống quản lý thông tin nhân viên</p>
          </div>
        </div>

        <button className="primary-button" onClick={openAddForm}>
          + Thêm nhân viên
        </button>
      </header>

      <section className="summary">
        <div className="summary-card">
          <span>Tổng số nhân viên</span>
          <strong>{employees.length}</strong>
          <small>Nhân viên trong danh sách hiện tại</small>
        </div>

        <div className="summary-card">
          <span>Đang làm việc</span>
          <strong>
            {
              employees.filter(
                (employee) => employee.status === "Dang lam viec"
              ).length
            }
          </strong>
          <small>Nhân viên có trạng thái đang làm việc</small>
        </div>
      </section>

      {message && (
        <div className="alert success" role="status">
          {message}
          <button onClick={() => setMessage("")} aria-label="Đóng">
            ×
          </button>
        </div>
      )}

      {error && (
        <div className="alert danger" role="alert">
          {error}
          <button onClick={() => setError("")} aria-label="Đóng">
            ×
          </button>
        </div>
      )}

      <section className="content-card">
        <div className="section-heading">
          <div>
            <h2>Danh sách nhân viên</h2>
            <p>Tra cứu và quản lý hồ sơ nhân viên</p>
          </div>

          <div className="search-box">
            <span>⌕</span>
            <input
              type="search"
              placeholder="Tìm mã nhân viên hoặc họ tên..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Tìm kiếm nhân viên"
            />
          </div>
        </div>

        {loading ? (
          <div className="empty-state">Đang tải danh sách nhân viên...</div>
        ) : employees.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">♙</div>
            <h3>Chưa có nhân viên</h3>
            <p>
              {search
                ? "Không tìm thấy nhân viên phù hợp."
                : "Hãy thêm nhân viên đầu tiên vào hệ thống."}
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Mã nhân viên</th>
                  <th>Họ và tên</th>
                  <th>Phòng ban</th>
                  <th>Chức vụ</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {employees.map((employee) => (
                  <tr key={employee._id}>
                    <td className="employee-code">
                      {employee.employeeId}
                    </td>
                    <td className="employee-name">{employee.fullName}</td>
                    <td>{employee.department || "—"}</td>
                    <td>{employee.position || "—"}</td>
                    <td>{employee.email}</td>
                    <td>{employee.phone || "—"}</td>
                    <td>
                      <span
                        className={`status ${
                          employee.status === "Dang lam viec"
                            ? "active"
                            : "inactive"
                        }`}
                      >
                        {employee.status || "Chưa cập nhật"}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <button
                          className="icon-button view"
                          title="Xem"
                          aria-label={`Xem ${employee.fullName}`}
                          onClick={() => handleView(employee)}
                        >
                          Xem
                        </button>
                        <button
                          className="icon-button edit"
                          title="Sửa"
                          aria-label={`Sửa ${employee.fullName}`}
                          onClick={() => openEditForm(employee)}
                        >
                          Sửa
                        </button>
                        <button
                          className="icon-button delete"
                          title="Xóa"
                          aria-label={`Xóa ${employee.fullName}`}
                          onClick={() => handleDelete(employee)}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showForm && (
        <div className="modal-backdrop">
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="form-title"
          >
            <div className="modal-heading">
              <div>
                <h2 id="form-title">
                  {editingId ? "Cập nhật nhân viên" : "Thêm nhân viên"}
                </h2>
                <p>Nhập thông tin hồ sơ nhân viên</p>
              </div>
              <button
                className="close-button"
                onClick={closePanels}
                aria-label="Đóng"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <label>
                  Mã nhân viên <b>*</b>
                  <input
                    name="employeeId"
                    value={form.employeeId}
                    onChange={handleChange}
                    required
                    maxLength={30}
                  />
                </label>

                <label>
                  Họ và tên <b>*</b>
                  <input
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                    maxLength={100}
                  />
                </label>

                <label>
                  Giới tính
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nu">Nữ</option>
                    <option value="Khac">Khác</option>
                  </select>
                </label>

                <label>
                  Ngày sinh
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={form.dateOfBirth}
                    onChange={handleChange}
                  />
                </label>

                <label>
                  Phòng ban
                  <input
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                  />
                </label>

                <label>
                  Chức vụ
                  <input
                    name="position"
                    value={form.position}
                    onChange={handleChange}
                  />
                </label>

                <label>
                  Email <b>*</b>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Số điện thoại
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </label>

                <label>
                  Ngày vào làm
                  <input
                    type="date"
                    name="hireDate"
                    value={form.hireDate}
                    onChange={handleChange}
                  />
                </label>

                <label>
                  Trạng thái
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="Dang lam viec">Đang làm việc</option>
                    <option value="Tam nghi">Tạm nghỉ</option>
                    <option value="Da nghi viec">Đã nghỉ việc</option>
                  </select>
                </label>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closePanels}
                  disabled={saving}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Đang lưu..."
                    : editingId
                      ? "Lưu thay đổi"
                      : "Thêm nhân viên"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {viewingEmployee && (
        <div className="modal-backdrop">
          <section
            className="modal detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="detail-title"
          >
            <div className="modal-heading">
              <div>
                <h2 id="detail-title">Thông tin nhân viên</h2>
                <p>Chi tiết hồ sơ nhân sự</p>
              </div>
              <button
                className="close-button"
                onClick={closePanels}
                aria-label="Đóng"
              >
                ×
              </button>
            </div>

            <div className="detail-grid">
              {[
                ["Mã nhân viên", viewingEmployee.employeeId],
                ["Họ và tên", viewingEmployee.fullName],
                ["Giới tính", viewingEmployee.gender],
                ["Ngày sinh", viewingEmployee.dateOfBirth],
                ["Phòng ban", viewingEmployee.department],
                ["Chức vụ", viewingEmployee.position],
                ["Email", viewingEmployee.email],
                ["Số điện thoại", viewingEmployee.phone],
                ["Ngày vào làm", viewingEmployee.hireDate],
                ["Trạng thái", viewingEmployee.status],
              ].map(([label, value]) => (
                <div className="detail-item" key={label}>
                  <span>{label}</span>
                  <strong>{value || "Chưa cập nhật"}</strong>
                </div>
              ))}
            </div>

            <div className="modal-footer">
              <button
                className="secondary-button"
                onClick={closePanels}
              >
                Đóng
              </button>
              <button
                className="primary-button"
                onClick={() => openEditForm(viewingEmployee)}
              >
                Chỉnh sửa
              </button>
            </div>
          </section>
        </div>
      )}

      <footer className="footer">
        Hệ thống quản lý nhân sự · React & REST API
      </footer>
    </main>
  );
}

export default App;