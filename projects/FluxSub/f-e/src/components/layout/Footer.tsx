export default function Footer() {
  const footerLinks = {
    product: ['Features', 'Pricing', 'API Documentation', 'Integrations'],
    company: ['About Us', 'Careers', 'Blog', 'Contact'],
    support: ['Help Center', 'Community', 'Security', 'Status']
  };

  const socialIcons = ['🐦', '💼', '📧', '🌐'];
  const legalLinks = ['Privacy Policy', 'Terms of Service', 'Cookie Policy'];

  return (
    <footer style={{
      marginTop: 'auto',
      padding: '3rem 0 2rem 0',
      borderTop: '1px solid var(--gray-alpha-200)',
      background: 'var(--background)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 2rem'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {/* Company Info */}
          <div>
            <h3 style={{
              fontSize: '1.3rem',
              fontWeight: '700',
              marginBottom: '1rem',
              fontFamily: 'var(--font-geist-sans)',
              background: 'linear-gradient(135deg, var(--foreground), #666)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              FluxSub
            </h3>
            <p style={{
              fontSize: '0.9rem',
              opacity: '0.7',
              lineHeight: '1.6',
              marginBottom: '1.5rem',
              fontFamily: 'var(--font-geist-sans)'
            }}>
              The future of subscription management. Decentralized, transparent, and secure Conflux blockchain-powered platform.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {socialIcons.map((icon, index) => (
                <a key={index} href="/coming-soon" style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: 'var(--gray-alpha-100)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '1.2rem',
                  textDecoration: 'none',
                  color: 'inherit'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--gray-alpha-200)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--gray-alpha-100)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: '600',
              marginBottom: '1rem',
              fontFamily: 'var(--font-geist-sans)'
            }}>
              Product
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {footerLinks.product.map((link) => (
                <a key={link} href="/coming-soon" style={{
                  fontSize: '0.9rem',
                  opacity: '0.7',
                  textDecoration: 'none',
                  color: 'inherit',
                  fontFamily: 'var(--font-geist-sans)',
                  transition: 'opacity 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '0.7';
                }}>
                  {link}
                </a>
              ))}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: '600',
              marginBottom: '1rem',
              fontFamily: 'var(--font-geist-sans)'
            }}>
              Company
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {footerLinks.company.map((link) => (
                <a key={link} href="/coming-soon" style={{
                  fontSize: '0.9rem',
                  opacity: '0.7',
                  textDecoration: 'none',
                  color: 'inherit',
                  fontFamily: 'var(--font-geist-sans)',
                  transition: 'opacity 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '0.7';
                }}>
                  {link}
                </a>
              ))}
            </div>
          </div>

          {/* Support Links */}
          <div>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: '600',
              marginBottom: '1rem',
              fontFamily: 'var(--font-geist-sans)'
            }}>
              Support
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {footerLinks.support.map((link) => (
                <a key={link} href="/coming-soon" style={{
                  fontSize: '0.9rem',
                  opacity: '0.7',
                  textDecoration: 'none',
                  color: 'inherit',
                  fontFamily: 'var(--font-geist-sans)',
                  transition: 'opacity 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '0.7';
                }}>
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div style={{
          paddingTop: '2rem',
          borderTop: '1px solid var(--gray-alpha-200)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{
            fontSize: '0.85rem',
            opacity: '0.6',
            fontFamily: 'var(--font-geist-sans)'
          }}>
            © 2024 FluxSub. All rights reserved. Built with Conflux blockchain technology.
          </div>
          <div style={{ display: 'flex', gap: '2rem' }}>
            {legalLinks.map((link) => (
              <a key={link} href="/coming-soon" style={{
                fontSize: '0.85rem',
                opacity: '0.6',
                textDecoration: 'none',
                color: 'inherit',
                fontFamily: 'var(--font-geist-sans)',
                transition: 'opacity 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '0.6';
              }}>
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}