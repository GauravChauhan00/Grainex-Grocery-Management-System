import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import heroImage from '../assets/hero_grocery_saas.jpg';
import { api } from '../services/api';
import { useToast } from '../components/ToastContext';

export default function LandingPage() {
  const toast = useToast();
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactBusy, setContactBusy] = useState(false);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) {
      toast.error('Please fill in all contact fields.');
      return;
    }
    setContactBusy(true);
    try {
      const response = await api.submitContactForm({
        name: contactName,
        email: contactEmail,
        message: contactMessage,
      });
      toast.success(response.message || 'Feedback submitted successfully.');
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    } catch (err) {
      toast.error(err.message || 'Failed to submit contact message.');
    } finally {
      setContactBusy(false);
    }
  };

  const pricing = [
    {
      name: 'Startup',
      price: 'Free',
      description: 'Perfect for small local grocery shops starting out.',
      features: [
        'Up to 100 products',
        '3 product categories',
        'Basic point-of-sale recorder',
        '7-day sales reporting',
        'Single admin user account',
      ],
      cta: 'Start Free',
      link: '/register',
      popular: false,
      disabled: false,
    },
    {
      name: 'Growth',
      price: '₹1,499',
      period: '/mo',
      description: 'Best for expanding supermarket owners and multi-register shops.',
      features: [
        'Unlimited products',
        'Unlimited categories',
        'Real-time automated sync',
        'Full CSV reports export',
        'Sub-user roles & permissions',
        'Priority email support',
      ],
      cta: 'Coming Soon',
      link: '#',
      popular: true,
      disabled: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'Custom setups for franchise networks and department stores.',
      features: [
        'Dedicated server hosting',
        'Multi-location chain sync',
        'Custom integration API access',
        '24/7 dedicated support representative',
        'SLA uptime assurance',
      ],
      cta: 'Coming Soon',
      link: '#',
      popular: false,
      disabled: true,
    },
  ];

  const faqs = [
    {
      q: 'How does the multi-store data isolation work?',
      a: 'Grainex is built on a secure multi-tenant architecture. Every store operates in its own isolated database context. No tenant can ever access or view another store’s transaction records, inventory, or credentials.',
    },
    {
      q: 'Can I use Grainex offline?',
      a: 'Grainex requires a network connection to synchronise transactional stock levels and secure reports. However, our lightweight POS architecture is optimized to run smoothly even on low-bandwidth mobile connections.',
    },
    {
      q: 'What happens when a product hits its low-stock limit?',
      a: 'The system triggers an instant low-stock warning in your dashboard and lists the items under "Needs Attention" so you can plan re-orders before stock runs out.',
    },
    {
      q: 'Is there a limit to the number of sales I can record?',
      a: 'No. Even on the free tier, you can log as many sales transactions as your store handles. Limits only apply to active catalog item groups.',
    },
  ];

  return (
    <div className="landing-layout">
      {/* Navigation Header */}
      <header className="landing-nav">
        <div className="landing-nav__container">
          <div className="landing-nav__logo">
            <span className="brand-logo-icon">🍏</span>
            <strong>Grainex</strong>
          </div>
          <nav className="landing-nav__links">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
            <a href="#contact">Contact</a>
          </nav>
          <div className="landing-nav__auth">
            <Link className="btn btn--text" to="/login">Sign In</Link>
            <Link className="btn btn--primary btn--sm" to="/register">Create Store</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero__container">
          <div className="landing-hero__content">
            <div className="badge-tag">
              <Sparkles size={14} /> The Future of Retail Operations
            </div>
            <h1>The modern operating system for grocery retail.</h1>
            <p>
              Manage inventory, record point-of-sale transactions, and analyze revenue trends on a single premium platform built for store owners.
            </p>
            <div className="landing-hero__ctas">
              <Link className="btn btn--primary btn--large" to="/register">
                Start your free store <ArrowRight size={18} />
              </Link>
              <a className="btn btn--secondary btn--large" href="#pricing">
                View Pricing
              </a>
            </div>
            <div className="hero-metrics">
              <div><strong>99.9%</strong><span>Uptime SLA</span></div>
              <div className="divider-v" />
              <div><strong>2.5x</strong><span>Inventory Turnover</span></div>
              <div className="divider-v" />
              <div><strong>Real-time</strong><span>Sync Speed</span></div>
            </div>
          </div>
          <div className="landing-hero__image">
            <div className="image-card-wrapper">
              <img src={heroImage} alt="Premium 3D Grocery SaaS Illustration" />
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Mock Dashboard Section */}
      <section className="landing-preview">
        <div className="landing-preview__container">
          <div className="section-header text-center">
            <span className="section-header__eyebrow">Enterprise-grade Interface</span>
            <h2>Designed for seamless daily operations</h2>
            <p>A clutter-free, responsive layout optimized for speed on registers, tablets, and mobile screens.</p>
          </div>
          <div className="dashboard-glass-preview">
            <div className="preview-top-bar">
              <span className="dot dot--red" />
              <span className="dot dot--amber" />
              <span className="dot dot--green" />
              <span className="window-title">grainex.com/dashboard</span>
            </div>
            <div className="preview-grid">
              <div className="preview-sidebar">
                <div className="mock-logo">🏪 Grainex</div>
                <div className="mock-nav-item active">📊 Dashboard</div>
                <div className="mock-nav-item">📦 Products</div>
                <div className="mock-nav-item">🏷️ Categories</div>
                <div className="mock-nav-item">🧾 Billing POS</div>
                <div className="mock-nav-item">📈 Reports</div>
              </div>
              <div className="preview-main">
                <div className="preview-header">
                  <div className="preview-header-left">
                    <span className="store-tag">🏪 Sathya Sai Bakery</span>
                    <h3>Dashboard Overview</h3>
                  </div>
                  <div className="user-profile">
                    <div className="avatar">S</div>
                    <span>Store Admin</span>
                  </div>
                </div>
                <div className="preview-cards">
                  <div className="p-card p-card--blue">
                    <span className="p-card-label">Today's Revenue</span>
                    <strong>₹14,290.00</strong>
                    <span className="p-card-change green">↑ 12% vs yesterday</span>
                  </div>
                  <div className="p-card p-card--amber">
                    <span className="p-card-label">Low Stock Warns</span>
                    <strong>3 Items Alert</strong>
                    <span className="p-card-change red">Action required</span>
                  </div>
                  <div className="p-card p-card--green">
                    <span className="p-card-label">Active Billing Counters</span>
                    <strong>2 Terminals</strong>
                    <span className="p-card-change">Live status</span>
                  </div>
                </div>
                <div className="preview-body-grid">
                  <div className="preview-chart-box">
                    <div className="box-header">
                      <strong>Weekly Sales Growth</strong>
                      <span>Last 7 Days</span>
                    </div>
                    <div className="preview-sparkline-chart">
                      <div className="chart-bar-col"><div className="bar-val" style={{ height: '40%' }}></div><span>Mon</span></div>
                      <div className="chart-bar-col"><div className="bar-val" style={{ height: '60%' }}></div><span>Tue</span></div>
                      <div className="chart-bar-col"><div className="bar-val" style={{ height: '55%' }}></div><span>Wed</span></div>
                      <div className="chart-bar-col"><div className="bar-val" style={{ height: '80%' }}></div><span>Thu</span></div>
                      <div className="chart-bar-col"><div className="bar-val" style={{ height: '95%' }}></div><span>Fri</span></div>
                      <div className="chart-bar-col animate-pulse"><div className="bar-val" style={{ height: '110%' }}></div><span>Sat</span></div>
                    </div>
                  </div>
                  <div className="preview-transactions-box">
                    <div className="box-header">
                      <strong>Recent Transactions</strong>
                      <span>Live Feed</span>
                    </div>
                    <div className="transactions-list">
                      <div className="t-row">
                        <span>#1084</span>
                        <strong>Marie Biscuits x2</strong>
                        <span className="t-badge t-badge--green">UPI</span>
                        <strong>₹40</strong>
                      </div>
                      <div className="t-row">
                        <span>#1083</span>
                        <strong>Amul Gold Milk (1L)</strong>
                        <span className="t-badge t-badge--blue">Cash</span>
                        <strong>₹32</strong>
                      </div>
                      <div className="t-row">
                        <span>#1082</span>
                        <strong>Aashirvaad Atta 5kg</strong>
                        <span className="t-badge t-badge--green">UPI</span>
                        <strong>₹240</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Alternating Feature Showcases (Redesigned UI) */}
      <section id="features" className="landing-features">
        <div className="landing-features__container">
          <div className="section-header text-center">
            <span className="section-header__eyebrow">Platform Tour</span>
            <h2>How Grainex Empowers Your Store</h2>
            <p>Moving beyond basic spreadsheets. Explore the modules engineered to automate your daily retail workflow.</p>
          </div>

          <div className="feature-showcases">
            {/* Showcase 1: Live Stock Operations */}
            <div className="showcase-row animate-fade-in">
              <div className="showcase-text">
                <span className="showcase-badge">Inventory Control</span>
                <h3>Real-time Stock Tracking & Predictive Warnings</h3>
                <p>
                  Never run out of high-demand items or spend hours doing physical audits. Grainex monitors registers and stock logs dynamically, triggering visual warnings when units drop below your minimum threshold limits.
                </p>
                <ul className="showcase-bullets">
                  <li><Check size={16} /> Instant stock level updates upon transaction checkout</li>
                  <li><Check size={16} /> Low-stock warning status highlights on your manager desk</li>
                  <li><Check size={16} /> Track category inventory counts with custom safety margins</li>
                </ul>
              </div>
              <div className="showcase-visual">
                <div className="mock-inventory-board">
                  <div className="mock-inventory-header">
                    <strong>Live Inventory Status</strong>
                    <span className="live-indicator"><span className="pulse-dot"></span> Live Syncing</span>
                  </div>
                  <div className="mock-inventory-table">
                    <div className="mock-table-row warning">
                      <span>Amul Gold Milk (1L)</span>
                      <strong>8 units left</strong>
                      <span className="badge badge--danger">Critical</span>
                    </div>
                    <div className="mock-table-row alert">
                      <span>Aashirvaad Atta (5kg)</span>
                      <strong>14 units left</strong>
                      <span className="badge badge--warning">Low Stock</span>
                    </div>
                    <div className="mock-table-row">
                      <span>Marie Gold Biscuits</span>
                      <strong>120 units left</strong>
                      <span className="badge badge--success">In Stock</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Showcase 2: Mobile POS Slip */}
            <div className="showcase-row">
              <div className="showcase-visual">
                <div className="mock-pos-board">
                  <div className="mock-pos-header">
                    <strong>Digital POS Register</strong>
                    <span>Receipt #1084</span>
                  </div>
                  <div className="mock-pos-receipt">
                    <div className="receipt-item">
                      <span>Amul Gold Milk (1L)</span>
                      <span>1 × ₹32.00</span>
                    </div>
                    <div className="receipt-item">
                      <span>Marie Gold Biscuits</span>
                      <span>2 × ₹20.00</span>
                    </div>
                    <div className="receipt-divider"></div>
                    <div className="receipt-total">
                      <span>Total Amount</span>
                      <strong>₹72.00</strong>
                    </div>
                  </div>
                  <div className="mock-pos-actions">
                    <span className="pay-chip">UPI Pay</span>
                    <span className="pay-chip pay-chip--active">Cash Pay</span>
                    <span className="pay-chip">Card Pay</span>
                  </div>
                </div>
              </div>
              <div className="showcase-text">
                <span className="showcase-badge">Checkout Terminal</span>
                <h3>Lightning-Fast Point of Sale</h3>
                <p>
                  Speed is critical during rush hours. Our lightweight checkout interface loads instantly on any tablet, smartphone, or register screen. Scan items or filter by department to log orders in seconds.
                </p>
                <ul className="showcase-bullets">
                  <li><Check size={16} /> Tap-and-record interface optimized for touch devices</li>
                  <li><Check size={16} /> Instant search queries for product barcodes or names</li>
                  <li><Check size={16} /> Flexible billing options for Cash, UPI, and Card transactions</li>
                </ul>
              </div>
            </div>

            {/* Showcase 3: Analytics Dashboard */}
            <div className="showcase-row">
              <div className="showcase-text">
                <span className="showcase-badge">SaaS Security</span>
                <h3>Sales Analytics & Rigid Tenant Isolation</h3>
                <p>
                  Run reports for tax compliance or review net margin progress with total security. Every store operates in its own isolated database container, ensuring your stock sheets and pricing remain strictly confidential.
                </p>
                <ul className="showcase-bullets">
                  <li><Check size={16} /> Zero data-leakage across store database indices</li>
                  <li><Check size={16} /> High-performing department and category sales splits</li>
                  <li><Check size={16} /> Fast exports for accounting and daily summaries</li>
                </ul>
              </div>
              <div className="showcase-visual">
                <div className="mock-analytics-board">
                  <div className="analytics-header">
                    <strong>Category Revenue Share</strong>
                    <strong>₹43,890.00</strong>
                  </div>
                  <div className="analytics-bars">
                    <div className="bar-wrapper">
                      <div className="bar-label"><span>Dairy Products</span><span>64%</span></div>
                      <div className="bar-track"><div className="bar-fill blue" style={{ width: '64%' }}></div></div>
                    </div>
                    <div className="bar-wrapper">
                      <div className="bar-label"><span>Bakery & Bread</span><span>22%</span></div>
                      <div className="bar-track"><div className="bar-fill green" style={{ width: '22%' }}></div></div>
                    </div>
                    <div className="bar-wrapper">
                      <div className="bar-label"><span>General Groceries</span><span>14%</span></div>
                      <div className="bar-track"><div className="bar-fill purple" style={{ width: '14%' }}></div></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="landing-why">
        <div className="landing-why__container">
          <div className="why-content">
            <span className="section-header__eyebrow">Architectural Excellence</span>
            <h2>A SaaS platform built on speed, separation, and scalability</h2>
            <p>
              Unlike legacy systems that clutter local networks or merge server configurations, Grainex leverages atomic SQL transactions to prevent checkout race conditions and absolute data isolation.
            </p>
            <div className="bullet-list">
              <div className="bullet-item">
                <CheckCircle2 size={20} className="check-icon" />
                <div>
                  <strong>Race-Condition Protection</strong>
                  <p>Transactions run inside atomic SQL loops, preventing overselling even during flash sales.</p>
                </div>
              </div>
              <div className="bullet-item">
                <CheckCircle2 size={20} className="check-icon" />
                <div>
                  <strong>Future-Proof Upgrades</strong>
                  <p>Designed with modular architecture. Upgrade plans or attach barcode scanners seamlessly later.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="why-stats">
            <div className="why-stat-card">
              <h3>Zero Data Bleed</h3>
              <p>Every store gets its own context. Your pricing plans, products, and categories remain 100% confidential.</p>
            </div>
            <div className="why-stat-card">
              <h3>Speed First</h3>
              <p>Vite-powered lightweight Javascript loads instantly even on poor cellular networks inside shops.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="landing-pricing">
        <div className="landing-pricing__container">
          <div className="section-header text-center">
            <span className="section-header__eyebrow">Simple, Transparent Pricing</span>
            <h2>Fair plans for stores of any size</h2>
            <p>No hidden setup fees. Upgrade or downgrade your billing tier at any time.</p>
          </div>
          <div className="pricing-grid">
            {pricing.map((tier, idx) => (
              <div className={`pricing-card ${tier.popular ? 'pricing-card--popular' : ''}`} key={idx}>
                {tier.popular && <span className="popular-badge">Most Popular</span>}
                <h3>{tier.name}</h3>
                <div className="price-tag">
                  <strong>{tier.price}</strong>
                  {tier.period && <span>{tier.period}</span>}
                </div>
                <p>{tier.description}</p>
                {tier.disabled ? (
                  <button className="btn btn--secondary btn--full btn--disabled" disabled type="button">
                    {tier.cta}
                  </button>
                ) : (
                  <Link className={`btn ${tier.popular ? 'btn--primary' : 'btn--secondary'} btn--full`} to={tier.link}>
                    {tier.cta}
                  </Link>
                )}
                <div className="pricing-features">
                  {tier.features.map((feat, fIdx) => (
                    <div className="pricing-feature-item" key={fIdx}>
                      <Check size={16} /> <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="landing-faq">
        <div className="landing-faq__container">
          <div className="section-header text-center">
            <span className="section-header__eyebrow">Got Questions?</span>
            <h2>Frequently Asked Questions</h2>
            <p>Quick answers about accounts, setup, data safety, and plans.</p>
          </div>
          <div className="faq-list">
            {faqs.map((faq, idx) => (
              <div className="faq-item" key={idx}>
                <h4>{faq.q}</h4>
                <p>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta">
        <div className="landing-cta__container">
          <h2>Ready to transform your store operations?</h2>
          <p>Join thousands of modern retailers who trust Grainex to keep their shelves stocked and sales recorded.</p>
          <div className="landing-cta__buttons">
            <Link className="btn btn--light btn--large" to="/register">Create Store Account</Link>
            <Link className="btn btn--outline btn--large" to="/login">Sign In</Link>
          </div>
        </div>
      </section>

      {/* Contact & Feedback Form (New Section) */}
      <section id="contact" className="landing-contact">
        <div className="landing-contact__container">
          <div className="section-header text-center">
            <span className="section-header__eyebrow">Feedback Portal</span>
            <h2>Send Feedback & Contact Us</h2>
            <p>Have questions about Grainex or suggestions for improvement? Write us a message.</p>
          </div>
          <form className="contact-form-card" onSubmit={handleContactSubmit}>
            <div className="contact-form-grid">
              <label className="form-field">
                <span>Your Name</span>
                <input
                  type="text"
                  required
                  placeholder="Your full name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  disabled={contactBusy}
                />
              </label>
              <label className="form-field">
                <span>Email Address</span>
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  disabled={contactBusy}
                />
              </label>
            </div>
            <label className="form-field" style={{ marginTop: '16px' }}>
              <span>Your Message / Feedback</span>
              <textarea
                required
                rows="4"
                placeholder="Write your feedback or suggestions here..."
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                disabled={contactBusy}
                style={{ resize: 'vertical', minHeight: '100px' }}
              />
            </label>
            <button
              type="submit"
              className="button button--primary button--full"
              style={{ marginTop: '24px', height: '44px', fontWeight: 600 }}
              disabled={contactBusy}
            >
              {contactBusy ? 'Submitting Form…' : 'Submit Feedback'}
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer__container">
          <div className="footer-brand">
            <strong>Grainex</strong>
            <p>Cloud-based inventory operations for modern grocery stores.</p>
          </div>
          <div className="footer-links">
            <div className="footer-link-group">
              <strong>Product</strong>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#faq">FAQ</a>
            </div>
            <div className="footer-link-group">
              <strong>Legal</strong>
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Grainex Inc. All rights reserved.</p>
          <p style={{ marginTop: '8px', fontSize: '0.85rem' }}>
            Developer contact: <a href="mailto:gaurav94855@gmail.com" style={{ color: '#2563eb', fontWeight: 600 }}>gaurav94855@gmail.com</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
