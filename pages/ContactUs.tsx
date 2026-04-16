import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, AlertCircle, CheckCircle } from 'lucide-react';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const categoryLabel: Record<string, string> = {
      general: 'General Inquiry',
      technical: 'Technical Issue',
      payment: 'Payment Issue',
      privacy: 'Privacy/Security',
      billing: 'Billing',
      feature: 'Feature Request',
      feedback: 'Feedback',
    };

    const subject = `[${categoryLabel[formData.category] || 'Inquiry'}] ${formData.subject}`;
    const body = [
      `Name: ${formData.name}`,
      `Email: ${formData.email}`,
      `Category: ${categoryLabel[formData.category] || formData.category}`,
      ``,
      `Message:`,
      formData.message,
      ``,
      `---`,
      `Sent via Contact Us form on Meena Devi - Bus Transport Service website`,
    ].join('\n');

    const mailtoUrl = `mailto:choudharyajay533@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoUrl;

    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', category: 'general', message: '' });
      setSubmitted(false);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-12 text-white mb-12">
          <div className="flex items-center gap-4 mb-4">
            <Mail className="w-10 h-10" />
            <h1 className="text-4xl font-bold">Contact Us</h1>
          </div>
          <p className="text-blue-100 text-lg">
            We're here to help! Reach out with any questions, feedback, or concerns.
          </p>
        </div>

        {/* Business Info Card - For PayU Verification */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12 border-l-4 border-blue-600">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">Legal Business Name</p>
              <p className="text-lg font-semibold text-gray-900">Meena Devi – Bus Transport Service</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">Proprietor</p>
              <p className="text-lg font-semibold text-gray-900">Meena Devi</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">Business Type</p>
              <p className="text-lg font-semibold text-gray-900">Proprietorship</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">School Served</p>
              <p className="text-lg font-semibold text-gray-900">Mount Carmel School, Gaggal</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">Email Address</p>
              <a href="mailto:choudharyajay533@gmail.com" className="text-lg font-semibold text-blue-600 hover:underline break-all">choudharyajay533@gmail.com</a>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">Contact Number</p>
              <a href="tel:+918988159431" className="text-lg font-semibold text-blue-600 hover:underline">+91 89881 59431</a>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">Operating Address</p>
              <p className="text-lg font-semibold text-gray-900">
                V.P.O. Ghurkari, Tehsil & District Kangra, Himachal Pradesh - 176001, India
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">Fleet</p>
              <p className="text-lg font-semibold text-gray-900">
                2 Buses serving 100+ students on the Kangra → Gaggal and Shahpur → Gaggal routes
              </p>
            </div>
          </div>
        </div>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition">
            <Mail className="w-8 h-8 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
            <p className="text-gray-600 text-sm">
              <a href="mailto:choudharyajay533@gmail.com" className="text-blue-600 hover:underline break-all">
                choudharyajay533@gmail.com
              </a>
            </p>
            <p className="text-xs text-gray-500 mt-2">24-48 hours response</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition">
            <Phone className="w-8 h-8 text-green-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Phone</h3>
            <p className="text-gray-600 text-sm">
              <a href="tel:+918988159431" className="text-blue-600 hover:underline">
                +91 89881 59431
              </a>
            </p>
            <p className="text-xs text-gray-500 mt-2">Mon-Sat 9AM-6PM IST</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition">
            <MapPin className="w-8 h-8 text-red-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
            <p className="text-gray-600 text-sm">
              Ghurkari, Kangra<br />
              HP, India - 176001
            </p>
            <p className="text-xs text-gray-500 mt-2">Operating Area</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition">
            <Clock className="w-8 h-8 text-purple-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Working Hours</h3>
            <p className="text-gray-600 text-sm">
              Mon - Sat<br />
              9:00 AM - 6:00 PM IST
            </p>
            <p className="text-xs text-gray-500 mt-2">Closed Sundays</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
            
            {submitted ? (
              <div className="p-6 bg-green-50 border border-green-200 rounded-lg flex flex-col items-center justify-center text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mb-4" />
                <h3 className="text-lg font-semibold text-green-900 mb-2">Email Opened</h3>
                <p className="text-green-800">
                  Your default email app has opened with your message pre-filled. Please review and click <strong>Send</strong> in your email app to deliver it to us. We will get back to you within 24-48 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="technical">Technical Issue</option>
                    <option value="payment">Payment Issue</option>
                    <option value="privacy">Privacy/Security</option>
                    <option value="billing">Billing</option>
                    <option value="feature">Feature Request</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="What is this about?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="Please describe your message in detail..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send Message
                </button>

                <p className="text-xs text-gray-500">
                  * Required fields. Clicking <strong>Send Message</strong> will open your default email app with your message pre-filled. Please click Send in your email app to deliver it. We'll respond within 24-48 hours.
                </p>
              </form>
            )}
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            
            {/* Support */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Support</h3>
              <p className="text-gray-700 mb-4">
                For technical issues, payment problems, or general support:
              </p>
              <a
                href="mailto:choudharyajay533@gmail.com"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Email Support
              </a>
            </div>

            {/* Billing */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Billing & Payments</h3>
              <p className="text-gray-700 mb-4">
                For payment issues or billing inquiries:
              </p>
              <a
                href="mailto:choudharyajay533@gmail.com"
                className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Contact Billing
              </a>
            </div>

            {/* Privacy & Security */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Privacy & Security</h3>
              <p className="text-gray-700 mb-4">
                For privacy concerns or security issues:
              </p>
              <a
                href="mailto:choudharyajay533@gmail.com"
                className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition"
              >
                Privacy Contact
              </a>
            </div>

            {/* FAQ Shortcut */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Quick Help</h3>
              <p className="text-gray-700 text-sm mb-4">
                Most questions can be answered quickly in our Help & Support section.
              </p>
              <a href="/help-support" className="text-blue-600 hover:underline font-semibold text-sm">
                View FAQs →
              </a>
            </div>
          </div>
        </div>

        {/* Business Hours */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 mt-12 border border-blue-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" />
            Business Hours
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            <div>
              <p className="font-semibold text-gray-900">Response Times</p>
              <ul className="space-y-1 text-sm mt-2">
                <li>• General inquiries: 24-48 hours</li>
                <li>• Technical issues: 4-8 hours</li>
                <li>• Emergency: As soon as possible</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Support</p>
              <ul className="space-y-1 text-sm mt-2">
                <li>• Email: 24/7 available</li>
                <li>• Phone: Business hours</li>
                <li>• In-app: Always available</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t">
          <p className="text-gray-600 mb-2">
            We value your feedback and are committed to serving you better.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-3 text-xs text-gray-500">
            <a href="/about" className="hover:underline">About Us</a>
            <a href="/services" className="hover:underline">Services</a>
            <a href="/privacy-policy" className="hover:underline">Privacy Policy</a>
            <a href="/terms-of-service" className="hover:underline">Terms of Service</a>
            <a href="/refund-policy" className="hover:underline">Refund Policy</a>
            <a href="/shipping-policy" className="hover:underline">Shipping Policy</a>
          </div>
          <p className="text-xs text-gray-500">
            © 2026 Meena Devi – Bus Transport Service. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
