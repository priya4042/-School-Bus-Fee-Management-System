import React from 'react';
import { Shield, AlertCircle, Lock, Eye, Database } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        {/* Back Button */}
        <button
          onClick={() => { window.location.href = '/'; }}
          className="fixed top-4 right-4 z-50 w-10 h-10 bg-white border border-slate-200 rounded-full shadow-lg flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-all"
          style={{ top: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}
        >
          <i className="fas fa-arrow-left"></i>
        </button>

        {/* Header */}
        <div className="mb-8 border-b-4 border-blue-600 pb-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
          <p className="text-gray-600">
            Last Updated: <span className="font-semibold">March 23, 2026</span>
          </p>
        </div>

        {/* Introduction */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
          <p className="text-gray-700 leading-relaxed">
            BusWay Pro ("we," "us," "our," or "Company") is committed to protecting your privacy and ensuring you have a positive experience on our platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application, web application, and services (collectively, the "Services").
          </p>
          <p className="text-gray-700 leading-relaxed mt-4">
            Please read this Privacy Policy carefully. If you do not agree with our policies and practices, please do not use our Services.
          </p>
        </section>

        {/* Information We Collect */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-600" />
            2. Information We Collect
          </h2>
          <p className="text-gray-700 mb-4">We may collect information about you in a variety of ways:</p>
          <div className="space-y-4 ml-4">
            <div>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-500" />
                Camera Permission
              </h3>
              <p className="text-gray-700 ml-7">Used for livestreaming bus camera feeds for safety monitoring and documentation purposes</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Location Data (GPS)</h3>
              <p className="text-gray-700 ml-7">Collected to track real-time bus location, route information, and estimated arrival times</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Student Information</h3>
              <p className="text-gray-700 ml-7">Name, ID, class, grade, assigned bus, boarding point, and linked parent/guardian details</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Parent/Guardian Information</h3>
              <p className="text-gray-700 ml-7">Name, email, phone number, relationship to student, address</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Financial Information</h3>
              <p className="text-gray-700 ml-7">Payment details, transaction history, fee statements, receipts (processed via Razorpay and Stripe)</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Device Information</h3>
              <p className="text-gray-700 ml-7">Device type, operating system, app version, unique device identifiers</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Usage Information</h3>
              <p className="text-gray-700 ml-7">How you interact with the app, features used, pages visited, notifications received</p>
            </div>
          </div>
        </section>

        {/* Use of Information */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Use of Your Information</h2>
          <p className="text-gray-700 mb-4">We use information collected about you to:</p>
          <ul className="space-y-2 ml-4 text-gray-700">
            <li className="flex gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Display live bus location tracking and real-time GPS updates</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Stream bus camera feeds for safety and security monitoring</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Calculate, display, and manage monthly bus fee dues</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Process payments through integrated payment gateways</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Send notifications about schedules, delays, cancellations, and fee reminders</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Generate fee reports, payment receipts, and transaction history</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Maintain attendance records for pickup and drop-off</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Create audit logs for administrative and compliance purposes</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Improve app functionality, user experience, and features</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Ensure app security and prevent fraud or unauthorized access</span>
            </li>
          </ul>
        </section>

        {/* Data Sharing */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Sharing of Your Information</h2>
          <p className="text-gray-700 mb-4">We do not sell, trade, or rent your personal information to third parties for marketing purposes. However, we may share your information with:</p>
          <div className="space-y-3 ml-4">
            <div className="p-4 bg-blue-50 border-l-4 border-blue-600">
              <h3 className="font-semibold text-gray-900">Payment Processors</h3>
              <p className="text-gray-700">Razorpay and Stripe receive necessary information to process payments securely</p>
            </div>
            <div className="p-4 bg-blue-50 border-l-4 border-blue-600">
              <h3 className="font-semibold text-gray-900">Communication Services</h3>
              <p className="text-gray-700">Twilio receives phone numbers to send SMS notifications and OTP codes</p>
            </div>
            <div className="p-4 bg-blue-50 border-l-4 border-blue-600">
              <h3 className="font-semibold text-gray-900">Maps Services</h3>
              <p className="text-gray-700">Google Maps receives location data for route mapping and tracking</p>
            </div>
            <div className="p-4 bg-blue-50 border-l-4 border-blue-600">
              <h3 className="font-semibold text-gray-900">School Administrators</h3>
              <p className="text-gray-700">School staff access student and parent information for administrative purposes</p>
            </div>
            <div className="p-4 bg-blue-50 border-l-4 border-blue-600">
              <h3 className="font-semibold text-gray-900">Legal Compliance</h3>
              <p className="text-gray-700">Information disclosed when required by law or to protect rights and safety</p>
            </div>
          </div>
        </section>

        {/* Security */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Lock className="w-6 h-6 text-blue-600" />
            5. Security of Your Information
          </h2>
          <p className="text-gray-700 mb-4">
            We implement administrative, technical, and physical security measures to protect your personal information:
          </p>
          <div className="space-y-3 ml-4">
            <div className="flex gap-2">
              <span className="text-blue-600 font-bold">✓</span>
              <span className="text-gray-700">SSL encryption for data transmission</span>
            </div>
            <div className="flex gap-2">
              <span className="text-blue-600 font-bold">✓</span>
              <span className="text-gray-700">Secure database encryption at rest</span>
            </div>
            <div className="flex gap-2">
              <span className="text-blue-600 font-bold">✓</span>
              <span className="text-gray-700">Regular security audits and penetration testing</span>
            </div>
            <div className="flex gap-2">
              <span className="text-blue-600 font-bold">✓</span>
              <span className="text-gray-700">Role-based access control for staff</span>
            </div>
            <div className="flex gap-2">
              <span className="text-blue-600 font-bold">✓</span>
              <span className="text-gray-700">Audit logging for all administrative actions</span>
            </div>
          </div>
          <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-700">
                <strong>Important:</strong> While we strive to use commercially acceptable means to protect your information, no method of transmission over the Internet is 100% secure.
              </p>
            </div>
          </div>
        </section>

        {/* Data Retention */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Retention</h2>
          <p className="text-gray-700 mb-4">We retain your information as long as:</p>
          <ul className="space-y-2 ml-4 text-gray-700">
            <li className="flex gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Your account is active</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Necessary for legal, tax, or accounting purposes</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Required to maintain audit trails and transaction history</span>
            </li>
          </ul>
          <p className="text-gray-700 mt-4">
            You can request deletion of your account and associated data at any time through the "Settings" or "Help & Support" section of the app.
          </p>
        </section>

        {/* User Rights */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Your Rights & Choices</h2>
          <p className="text-gray-700 mb-4">You have the right to:</p>
          <div className="space-y-3 ml-4">
            <div>
              <h3 className="font-semibold text-gray-900">Access Your Data</h3>
              <p className="text-gray-700">Request a copy of all personal data we hold about you</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Correct Your Data</h3>
              <p className="text-gray-700">Request correction of inaccurate or incomplete information</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Delete Your Account</h3>
              <p className="text-gray-700">Request deletion of your account and personal data</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Withdraw Consent</h3>
              <p className="text-gray-700">Opt-out of certain data processing activities</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Notification Preferences</h3>
              <p className="text-gray-700">Manage SMS, email, and push notification settings</p>
            </div>
          </div>
        </section>

        {/* Contact Us */}
        <section className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contact Us</h2>
          <p className="text-gray-700 mb-4">
            If you have questions, concerns, or requests regarding this Privacy Policy or your personal data:
          </p>
          <div className="space-y-2 text-gray-700">
            <p>
              <strong>Email:</strong>{' '}
              <a href="mailto:privacy@buswayapp.com" className="text-blue-600 hover:underline">
                privacy@buswayapp.com
              </a>
            </p>
            <p>
              <strong>In-App Support:</strong> Use the Help & Support section in the app
            </p>
            <p>
              <strong>Response Time:</strong> We aim to respond to all privacy requests within 7 business days
            </p>
          </div>
        </section>

        {/* Changes */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Changes to This Privacy Policy</h2>
          <p className="text-gray-700">
            BusWay Pro reserves the right to modify this Privacy Policy at any time. Changes will take effect immediately upon posting. We will notify you of significant changes by updating the "Last Updated" date and sending an in-app notification to all active users.
          </p>
        </section>

        {/* Footer */}
        <div className="border-t pt-6 mt-8">
          <p className="text-center text-sm text-gray-600">
            By using BusWay Pro, you consent to this Privacy Policy and our processing of your information as described.
          </p>
          <p className="text-center text-xs text-gray-500 mt-2">
            © 2026 BusWay Pro. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
