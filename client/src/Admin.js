
import { useState, useEffect } from 'react';
import CourseForm from './CourseForm';
import './Admin.css';

const API =process.env.REACT_APP_API;

// Single course card in the admin grid
function AdminCourseCard({ course, onEdit, onDelete }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete "${course.title}"? This cannot be undone.`
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      const res = await fetch(`${API}/courses/${course._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      if (res.ok) {
        onDelete(course._id);
      } else {
        const data = await res.json();
        alert(data.message || 'Delete failed');
      }
    } catch {
      alert('Cannot connect to server');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        {course.category && (
          <span className="admin-card-tag">{course.category}</span>
        )}
        <span className="admin-card-price">
          {course.price === 0 ? 'Free' : `₹${course.price}`}
        </span>
      </div>
      <h3 className="admin-card-title">{course.title}</h3>
      <p className="admin-card-desc">{course.description}</p>
      <div className="admin-card-actions">
        <button className="admin-btn-edit" onClick={() => onEdit(course)}>
          Edit
        </button>
        <button
          className="admin-btn-delete"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
}

// Main admin page
function Admin({ token }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  // Store token for delete calls inside AdminCourseCard
  if (token) localStorage.setItem('adminToken', token);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/courses`);
      const data = await res.json();
      if (!res.ok) { setError('Failed to load courses'); return; }
      setCourses(data);
    } catch {
      setError('Cannot connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setCourses((prev) => prev.filter((c) => c._id !== id));
  };

  const handleFormSuccess = (savedCourse, isEdit) => {
    if (isEdit) {
      setCourses((prev) =>
        prev.map((c) => (c._id === savedCourse._id ? savedCourse : c))
      );
    } else {
      setCourses((prev) => [...prev, savedCourse]);
    }
    setShowForm(false);
    setEditingCourse(null);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCourse(null);
  };

  return (
    <div className="admin-page">

      {/* Header */}
      <div className="admin-header">
        <div>
          <p className="admin-eyebrow">Management</p>
          <h1 className="admin-title">Course Dashboard</h1>
          <p className="admin-sub">{courses.length} courses in the platform</p>
        </div>
        <button
          className="admin-add-btn"
          onClick={() => { setEditingCourse(null); setShowForm(true); }}
        >
          + Add Course
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="admin-modal-overlay" onClick={handleCloseForm}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">
                {editingCourse ? 'Edit Course' : 'Add New Course'}
              </h2>
              <button className="admin-modal-close" onClick={handleCloseForm}>
                ✕
              </button>
            </div>
            <CourseForm
              token={token}
              course={editingCourse}
              onSuccess={handleFormSuccess}
              onCancel={handleCloseForm}
            />
          </div>
        </div>
      )}

      {/* States */}
      {loading && (
        <div className="admin-skeleton-grid">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="admin-skeleton-card">
              <div className="admin-skeleton-line pulse" />
              <div className="admin-skeleton-line short pulse" />
              <div className="admin-skeleton-line pulse" />
              <div className="admin-skeleton-line short pulse" />
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <p className="admin-error">{error}</p>
      )}

      {!loading && !error && courses.length === 0 && (
        <div className="admin-empty">
          <p>No courses yet.</p>
          <button
            className="admin-add-btn"
            onClick={() => setShowForm(true)}
          >
            Add your first course
          </button>
        </div>
      )}

      {/* Course grid */}
      {!loading && !error && courses.length > 0 && (
        <div className="admin-grid">
          {courses.map((course) => (
            <AdminCourseCard
              key={course._id}
              course={course}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

    </div>
  );
}

export default Admin;
console.log("API URL:", process.env.REACT_APP_API);