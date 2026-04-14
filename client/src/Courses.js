import { useState, useEffect } from 'react';

const API = 'https://skillnest-backend-kvc2.onrender.com/api';

// Category → emoji mapping for card thumbnails
const categoryEmoji = {
  'Web Dev': '💻',
  'Design': '🎨',
  'DSA': '📊',
  'AI / ML': '🤖',
  'Placement': '🚀',
};

// Learning Paths (frontend only)
const learningPaths = [
  { name: 'DSA Path', category: 'DSA' },
  { name: 'Web Dev Path', category: 'Web Dev' },
  { name: 'Design Path', category: 'Design' },
];

// Single course card component
function CourseCard({ course, token, enrolled, onEnroll }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEnroll = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API}/courses/${course._id}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Enroll failed');
        return;
      }

      onEnroll(course._id);

    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="course-card">
      <div className="card-thumb">
        {categoryEmoji[course.category] || '📚'}
      </div>
      <div className="card-body">
        <span className="card-tag">{course.category}</span>
        <h3 className="card-title">{course.title}</h3>
        <p className="card-desc">{course.description}</p>
        <div className="card-footer">
          <span className="card-instructor">By {course.instructor}</span>
          <span className="card-price">
            {course.price === 0 ? 'Free' : `₹${course.price}`}
          </span>
        </div>
        {error && <p className="error-msg" style={{ marginTop: '8px' }}>{error}</p>}
        <button
          className={`enroll-btn ${enrolled ? 'enrolled' : ''}`}
          onClick={handleEnroll}
          disabled={enrolled || loading}
        >
          {enrolled ? 'Enrolled ✅' : loading ? 'Enrolling...' : 'Enroll Now'}
        </button>
      </div>
    </div>
  );
}

// Main courses page
function Courses({ token }) {
  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPath, setSelectedPath] = useState(null);

  // Fetch all courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`${API}/courses`);
        const data = await res.json();

        if (!res.ok) {
          setError('Failed to load courses');
          return;
        }

        setCourses(data);
      } catch (err) {
        setError('Cannot connect to server');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // ── NEW: seed enrolledIds from MongoDB on mount ──────
  // Calls GET /api/auth/me (already exists in your backend)
  // which returns the user's enrolledCourses array.
  // We convert it to a Set so enrolled buttons show correctly
  // after refresh — no localStorage, no new backend routes.
  useEffect(() => {
    const fetchEnrolled = async () => {
      try {
        const res = await fetch(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.enrolledCourses) {
          setEnrolledIds(new Set(data.enrolledCourses.map((id) => id.toString())));
        }
      } catch (err) {
        // silent — not critical, page still works
      }
    };

    fetchEnrolled();
  }, [token]);
  // ────────────────────────────────────────────────────

  const handleEnroll = (courseId) => {
    setEnrolledIds((prev) => new Set([...prev, courseId]));
    alert('Successfully enrolled!');
  };

  const recommended = courses.slice(0, 2);

  const filteredCourses = selectedPath
    ? courses.filter((c) => c.category === selectedPath)
    : courses.slice(2);

  if (loading) {
    return (
      <div className="courses-page">
        <div className="skeleton-grid">
          {[1, 2, 3].map((n) => (
            <div key={n} className="skeleton-card">
              <div className="skeleton-thumb pulse" />
              <div className="skeleton-body">
                <div className="skeleton-line pulse" />
                <div className="skeleton-line short pulse" />
                <div className="skeleton-line pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="courses-page">
        <p className="error-msg">{error}</p>
      </div>
    );
  }

  return (
    <div className="courses-page">

      {/* 🔥 NEW HERO STYLE LEARNING PATHS */}
      <div className="learning-paths-hero">
        <div className="paths-hero-header">
          <p className="paths-eyebrow">Your Progress</p>
          <h2 className="paths-hero-title">Your Learning Paths</h2>
          <p className="paths-hero-sub">
            Filter courses by the path you're building.
          </p>
        </div>

        <div className="paths-container">
          {learningPaths.map((path) => (
            <button
              key={path.name}
              className={`path-btn ${
                selectedPath === path.category ? 'active' : ''
              }`}
              onClick={() => setSelectedPath(path.category)}
            >
              {path.name}
            </button>
          ))}
          <button
            className="path-btn"
            onClick={() => setSelectedPath(null)}
          >
            All
          </button>
        </div>

        <p className="paths-showing">
          Showing: {selectedPath || 'All Courses'}
        </p>
      </div>

      {/* Recommended section */}
      <section className="section">
        <div className="section-header">
          <h2>Recommended for you</h2>
          <span className="badge-ux">Smart Discovery</span>
        </div>
        <div className="courses-grid recommended-grid">
          {recommended.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              token={token}
              enrolled={enrolledIds.has(course._id)}
              onEnroll={handleEnroll}
            />
          ))}
        </div>
      </section>

      {/* Courses */}
      <section className="section">
        <h2>Courses</h2>
        <div className="courses-grid">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              token={token}
              enrolled={enrolledIds.has(course._id)}
              onEnroll={handleEnroll}
            />
          ))}
        </div>
      </section>

    </div>
  );
}

export default Courses;