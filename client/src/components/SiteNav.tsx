import { Link } from 'react-router'

function SiteNav() {
  return (
    <nav className="site-nav" aria-label="Chính">
      <Link to="/" className="site-nav-brand">
        Sử dụng thuốc - LT
      </Link>
      <div className="site-nav-links">
        <Link to="/" className="site-nav-link">
          Trang chủ
        </Link>
        <Link to="/lessons/new" className="site-nav-cta">
          Viết bài
        </Link>
      </div>
    </nav>
  )
}

export default SiteNav
