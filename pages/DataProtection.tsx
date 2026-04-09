import React from 'react';
import { Shield, Users, Lock, Zap, CheckCircle } from 'lucide-react';

export default function DataProtection() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="mb-8 border-b-4 border-purple-600 pb-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold text-gray-900">Data Protection & Security</h1>
          </div>
          <p className="text-gray-600">
            Last Updated: <span className="font-semibold">March 23, 2026</span>
          </p>
        </div>

        {/* Introduction */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Our Commitment to Data Protection</h2>
          <p className="text-gray-700 leading-relaxed">
            At BusWay Pro, protecting your data is our highest priority. We are committed to implementing and maintaining robust security measures to safeguard all personal and financial information you entrust to us. This Data Protection Policy outlines our security practices and data handling procedures.
          </p>
        </section>

        {/* Data Classification */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Data Classification & Sensitivity</h2>
          <p className="text-gray-700 mb-4">We classify data into categories based on sensitivity:</p>
          <div className="space-y-4">
            <div className="p-4 border-l-4 border-red-500 bg-red-50">
              <h3 className="font-semibold text-gray-900 text-red-700">Highly Sensitive (Level 1)</h3>
              <p className="text-gray-700">
                Financial information, payment details, SSN/ID numbers, authentication credentials
              </p>
              <p className="text-sm text-gray-600 mt-2">Protected by: Encryption at rest & in transit, access logs, PIN verification</p>
            </div>
            <div className="p-4 border-l-4 border-orange-500 bg-orange-50">
              <h3 className="font-semibold text-gray-900 text-orange-700">Sensitive (Level 2)</h3>
              <p className="text-gray-700">
                Student information, parent contact details, location data, academic records
              </p>
              <p className="text-sm text-gray-600 mt-2">Protected by: Role-based access, encryption, audit trails</p>
            </div>
            <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50">
              <h3 className="font-semibold text-gray-900 text-yellow-700">Standard (Level 3)</h3>
              <p className="text-gray-700">
                Non-identifying usage data, app preferences, session logs
              </p>
              <p className="text-sm text-gray-600 mt-2">Protected by: Standard access controls, encryption</p>
            </div>
          </div>
        </section>

        {/* Security Measures */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Lock className="w-6 h-6 text-purple-600" />
            3. Technical Security Measures
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-2">Encryption</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>TLS 1.3 encryption for all data in transit</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>AES-256 encryption for data at rest in databases</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>End-to-end encryption for sensitive transactions</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-2">Authentication & Access Control</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Two-factor authentication (2FA) support</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Role-based access control (RBAC) for staff</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Session management with automatic timeout</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Device fingerprinting and location verification</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-2">Database Security</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Regular automated backups with encryption</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Offsite backup storage for disaster recovery</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>SQL injection prevention with parameterized queries</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Database activity monitoring and logging</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-2">Application Security</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Regular code reviews and security audits</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>OWASP Top 10 vulnerability scanning</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Dependency vulnerability management</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Content Security Policy (CSP) implementation</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Operational Security */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Operational Security</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Staff Training</h3>
              <p className="text-gray-700">
                All staff members handling data receive mandatory security training including data privacy, incident response, and phishing awareness.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Audit Logging</h3>
              <p className="text-gray-700">
                All administrative actions, data access, and modifications are logged with timestamps and user identification for compliance and forensic purposes.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Change Management</h3>
              <p className="text-gray-700">
                All system changes follow a strict change management process with testing, approval, and rollback procedures.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Incident Response</h3>
              <p className="text-gray-700">
                We maintain a documented incident response plan with procedures for detection, containment, notification, and remediation.
              </p>
            </div>
          </div>
        </section>

        {/* Network Security */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Network Security</h2>
          <div className="space-y-3 text-gray-700">
            <p className="flex gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span>WAF (Web Application Firewall) protection</span>
            </p>
            <p className="flex gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span>DDoS protection and rate limiting</span>
            </p>
            <p className="flex gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span>VPN support for secure remote access</span>
            </p>
            <p className="flex gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span>Network segmentation and firewalls</span>
            </p>
            <p className="flex gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span>Regular penetration testing</span>
            </p>
          </div>
        </section>

        {/* Payment Security */}
        <section className="mb-8 p-6 bg-purple-50 rounded-lg border border-purple-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Payment Processing Security</h2>
          <div className="space-y-3 text-gray-700">
            <p>
              <strong>PCI DSS Compliance:</strong> All payment processing complies with Payment Card Industry Data Security Standard (PCI DSS v3.2.1)
            </p>
            <p>
              <strong>Tokenization:</strong> Credit card numbers are never stored; instead, secure tokens are used
            </p>
            <p>
              <strong>Third-Party Security:</strong> Payment gateways (PayU, Stripe) undergo regular security audits
            </p>
            <p>
              <strong>SSL Certificates:</strong> All payment pages use 256-bit SSL encryption
            </p>
          </div>
        </section>

        {/* Data Minimization */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Minimization</h2>
          <p className="text-gray-700 mb-4">
            We follow the principle of data minimization:
          </p>
          <ul className="space-y-2 text-gray-700">
            <li className="flex gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Collect only necessary data for stated purposes</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Retain data only as long as needed</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Securely delete data when no longer required</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Anonymize data where possible</span>
            </li>
          </ul>
        </section>

        {/* Compliance */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Regulatory Compliance</h2>
          <p className="text-gray-700 mb-4">
            BusWay Pro complies with relevant data protection regulations including:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <h3 className="font-semibold text-gray-900 mb-1">GDPR (EU)</h3>
              <p className="text-sm text-gray-700">General Data Protection Regulation compliance</p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <h3 className="font-semibold text-gray-900 mb-1">CCPA (USA)</h3>
              <p className="text-sm text-gray-700">California Consumer Privacy Act compliance</p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <h3 className="font-semibold text-gray-900 mb-1">COPPA (USA)</h3>
              <p className="text-sm text-gray-700">Children's Online Privacy Protection Act compliance</p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <h3 className="font-semibold text-gray-900 mb-1">PCI DSS</h3>
              <p className="text-sm text-gray-700">Payment Card Industry Data Security Standard</p>
            </div>
          </div>
        </section>

        {/* Data Breach Notification */}
        <section className="mb-8 p-6 bg-red-50 rounded-lg border border-red-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Data Breach Notification</h2>
          <p className="text-gray-700 mb-4">
            In the unlikely event of a data breach affecting your personal information:
          </p>
          <ul className="space-y-2 text-gray-700">
            <li className="flex gap-2">
              <Zap className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span>We will notify affected individuals within 30 days</span>
            </li>
            <li className="flex gap-2">
              <Zap className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span>Notification will include nature of breach and steps taken</span>
            </li>
            <li className="flex gap-2">
              <Zap className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span>We will report to relevant authorities as required</span>
            </li>
            <li className="flex gap-2">
              <Zap className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span>Credit monitoring will be offered if appropriate</span>
            </li>
          </ul>
        </section>

        {/* Contact & Support */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Security Questions?</h2>
          <p className="text-gray-700 mb-4">
            For security concerns or to report a vulnerability:
          </p>
          <div className="space-y-2 text-gray-700">
            <p>
              <strong>Security Email:</strong>{' '}
              <a href="mailto:security@buswayapp.com" className="text-purple-600 hover:underline">
                security@buswayapp.com
              </a>
            </p>
            <p>
              <strong>Support:</strong> Use Help & Support in the app
            </p>
          </div>
        </section>

        {/* Footer */}
        <div className="border-t pt-6 mt-8">
          <p className="text-center text-sm text-gray-600">
            Your data security is our responsibility. Thank you for trusting BusWay Pro.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-3 text-xs text-gray-500">
            <a href="/privacy" className="hover:underline">Privacy Policy</a>
            <a href="/terms" className="hover:underline">Terms of Service</a>
            <a href="/cookie-policy" className="hover:underline">Cookie Policy</a>
            <a href="/refund-policy" className="hover:underline">Refund Policy</a>
            <a href="/shipping-policy" className="hover:underline">Shipping Policy</a>
          </div>
          <p className="text-center text-xs text-gray-500 mt-2">
            © 2026 BusWay Pro. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
