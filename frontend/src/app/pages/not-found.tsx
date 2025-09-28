import { Link } from 'react-router-dom';
import './not-found.css';

const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <div className="not-found-icon">404</div>
        <h1>Page Not Found</h1>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="home-link">Return to Home</Link>
      </div>
    </div>
  );
};

export default NotFoundPage;