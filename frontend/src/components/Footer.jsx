import { Link } from 'react-router-dom'
import { FiGithub, FiTwitter, FiInstagram, FiHeart } from 'react-icons/fi'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__glow" />
      <div className="container footer__inner">
        {/* Brand */}
        <div className="footer__brand">
          <div className="footer__logo">
            <span>🍽️</span>
            <span className="footer__logo-text">Recipe<span>AI</span></span>
          </div>
          <p className="footer__tagline">
            Turning your ingredients into culinary masterpieces with the power of AI.
          </p>
          <div className="footer__socials">
            <a href="#" aria-label="Github" className="footer__social-btn"><FiGithub size={18} /></a>
            <a href="#" aria-label="Twitter" className="footer__social-btn"><FiTwitter size={18} /></a>
            <a href="#" aria-label="Instagram" className="footer__social-btn"><FiInstagram size={18} /></a>
          </div>
        </div>

        {/* Links */}
        <div className="footer__links-group">
          <h4>Product</h4>
          <Link to="/generator">Recipe Generator</Link>
          <Link to="/saved">Saved Recipes</Link>
          <Link to="/pricing">Pricing & Plans</Link>
          <a href="#">Meal Planner</a>
          <a href="#">Nutrition Tracker</a>
        </div>

        <div className="footer__links-group">
          <h4>Cuisines</h4>
          <a href="#">Italian</a>
          <a href="#">Asian</a>
          <a href="#">Mexican</a>
          <a href="#">Mediterranean</a>
        </div>

        <div className="footer__links-group">
          <h4>Company</h4>
          <a href="#">About Us</a>
          <a href="#">Blog</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
      </div>

      <hr className="divider" style={{ margin: '0 24px' }} />

      <div className="container footer__bottom">
        <p>© 2026 RecipeAI. All rights reserved.</p>
        <p>Made with <FiHeart size={13} style={{ color: 'var(--accent-light)', margin: '0 4px', verticalAlign: 'middle' }} /> by RecipeAI Team</p>
      </div>
    </footer>
  )
}
