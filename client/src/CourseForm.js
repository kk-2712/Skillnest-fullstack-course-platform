import { useState, useEffect } from 'react';

const API =process.env.REACT_APP_API;

function CourseForm({ token, course, onSuccess, onCancel }) {
  console.log("TOKEN INSIDE FORM:", token); // ✅ safe debug

  const isEdit = Boolean(course);

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    instructor: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (course) {
      setForm({
        title: course.title || '',
        description: course.description || '',
        price: course.price ?? '',
        category: course.category || '',
        instructor: course.instructor || '',
      });
    }
  }, [course]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!token) {
      setError('User not authenticated (token missing)');
      console.error("❌ TOKEN MISSING");
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      price: Number(form.price) || 0,
      category: form.category.trim(),
      instructor: form.instructor.trim(),
    };

    const url = isEdit
      ? `${API}/courses/${course._id}`
      : `${API}/courses`;

    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      console.log("RESPONSE:", data); // ✅ debug

      if (!res.ok) {
        setError(data.message || 'Something went wrong');
        return;
      }

      onSuccess(data, isEdit);

    } catch (err) {
      console.error("❌ FETCH ERROR:", err);
      setError('Cannot connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="course-form" onSubmit={handleSubmit}>

      <div className="form-group">
        <label>Title *</label>
        <input
          name="title"
          type="text"
          placeholder="e.g. Full Stack React + Node.js"
          value={form.title}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          name="description"
          placeholder="What will students learn?"
          value={form.description}
          onChange={handleChange}
          rows={3}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Price (₹)</label>
          <input
            name="price"
            type="number"
            placeholder="0"
            min="0"
            value={form.price}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          <select name="category" value={form.category} onChange={handleChange}>
            <option value="">Select category</option>
            <option value="Web Dev">Web Dev</option>
            <option value="Design">Design</option>
            <option value="DSA">DSA</option>
            <option value="AI / ML">AI / ML</option>
            <option value="Placement">Placement</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Instructor</label>
        <input
          name="instructor"
          type="text"
          placeholder="Instructor name"
          value={form.instructor}
          onChange={handleChange}
        />
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        <button type="button" className="form-btn-cancel" onClick={onCancel}>
          Cancel
        </button>

        <button type="submit" className="form-btn-submit" disabled={loading}>
          {loading
            ? 'Saving...'
            : isEdit
            ? 'Update Course'
            : 'Add Course'}
        </button>
      </div>

    </form>
  );
}

export default CourseForm;