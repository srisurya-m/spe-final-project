import { useEffect, useState } from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      },
      { threshold: 0.1 }
    );

    const footerElement = document.querySelector('.footer-container');
    if (footerElement) observer.observe(footerElement);

    return () => {
      if (footerElement) observer.unobserve(footerElement);
    };
  }, []);

  return (
    <div className={`footer-container ${isVisible ? 'visible' : ''}`}>
      <div className="footer-content">
        <div className="footer-section">
          <h3>About Us</h3>
          <ul>
            <li>Company</li>
            <li>Careers</li>
            <li>Press</li>
            <li>Contact Us:-<Link to={"/"} style={{color:"blue"}}> 8309929086</Link></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Services</h3>
          <ul>
            <li>Plumbing</li>
            <li>Electricians</li>
            <li>Cleaning</li>
            <li>Maintenance</li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Follow Us</h3>
          <div className="social-icons">
            <FaFacebook />
            <FaTwitter />
            <FaInstagram />
            <FaLinkedin />
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2024 Oyo Services. All Rights Reserved.</p>
      </div>
    </div>
  );
};

export default Footer;
