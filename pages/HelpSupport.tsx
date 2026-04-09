import React, { useState } from 'react';
import { MessageCircle, Mail, Phone, Clock, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

export default function HelpSupport() {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(0);

  const faqs = [
    {
      question: "How do I reset my password?",
      answer: "Click 'Forgot Password' on the login screen, enter your email, and follow the instructions sent to your email address."
    },
    {
      question: "How can I change my notification preferences?",
      answer: "Go to Settings → Notifications and toggle SMS, Email, or Push notifications on/off based on your preferences."
    },
    {
      question: "What payment methods are accepted?",
      answer: "We accept credit cards, debit cards, and digital payment methods through PayU and Stripe."
    },
    {
      question: "How do I view my payment history?",
      answer: "Navigate to Payments → Fee History to view all past payments and download receipts."
    },
    {
      question: "Can I request a fee waiver?",
      answer: "Yes, you can submit a waiver request through Payments → Request Waiver. Requests are reviewed by school administration."
    },
    {
      question: "How is my location data used?",
      answer: "Location data is only used for real-time bus tracking and route optimization. It's never shared with third parties except for map services."
    },
    {
      question: "How do I delete my account?",
      answer: "Go to Settings → Account → Delete Account. Your data will be securely deleted within 30 days."
    },
    {
      question: "Is my payment information stored?",
      answer: "No, payment information is never stored. We use secure payment gateways (PayU/Stripe) with PCI DSS compliance."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <MessageCircle className="w-8 h-8" />
              <h1 className="text-4xl font-bold">Help & Support</h1>
            </div>
            <p className="text-blue-100">
              We're here to help! Find answers to common questions and get in touch with our support team.
            </p>
          </div>
        </div>

        {/* Quick Support Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <Mail className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Support</h3>
            <p className="text-gray-600 text-sm mb-4">
              Contact us for detailed inquiries and documentation
            </p>
            <a
              href="mailto:support@buswayapp.com"
              className="text-blue-600 hover:text-blue-800 font-semibold text-sm flex items-center gap-1"
            >
              support@buswayapp.com <ArrowRight className="w-3 h-3" />
            </a>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <Phone className="w-8 h-8 text-green-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Phone Support</h3>
            <p className="text-gray-600 text-sm mb-4">
              Call our support team during business hours
            </p>
            <p className="text-green-600 font-semibold text-sm">
              Your School Office
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <Clock className="w-8 h-8 text-purple-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">In-App Chat</h3>
            <p className="text-gray-600 text-sm mb-4">
              Get instant help through the app support
            </p>
            <p className="text-purple-600 font-semibold text-sm">
              Available in app
            </p>
          </div>
        </div>

        {/* Privacy & Security Support */}
        <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-6 mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-blue-600" />
            Privacy & Security Concerns
          </h2>
          <p className="text-gray-700 mb-4">
            For privacy issues, data access requests, or security concerns:
          </p>
          <div className="space-y-2 text-gray-700">
            <p>
              <strong>Email:</strong>{' '}
              <a href="mailto:privacy@buswayapp.com" className="text-blue-600 hover:underline">
                privacy@buswayapp.com
              </a>
            </p>
            <p className="text-sm text-gray-600">Response time: 5-7 business days</p>
          </div>
        </div>

        {/* Related Pages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <a
            href="/privacy-policy"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition hover:border-blue-600 border"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Privacy Policy</h3>
            <p className="text-gray-600 text-sm mb-4">
              Learn how we collect and use your information
            </p>
            <span className="text-blue-600 font-semibold text-sm flex items-center gap-1">
              Read more <ArrowRight className="w-3 h-3" />
            </span>
          </a>

          <a
            href="/terms-of-service"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition hover:border-green-600 border"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Terms of Service</h3>
            <p className="text-gray-600 text-sm mb-4">
              Understand the rules and responsibilities for using the app
            </p>
            <span className="text-green-600 font-semibold text-sm flex items-center gap-1">
              Read more <ArrowRight className="w-3 h-3" />
            </span>
          </a>

          <a
            href="/data-protection"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition hover:border-purple-600 border"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Protection</h3>
            <p className="text-gray-600 text-sm mb-4">
              Discover our security measures and data protection practices
            </p>
            <span className="text-purple-600 font-semibold text-sm flex items-center gap-1">
              Read more <ArrowRight className="w-3 h-3" />
            </span>
          </a>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
            <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
            <p className="text-blue-100 mt-2">Find quick answers to common questions</p>
          </div>

          <div className="divide-y">
            {faqs.map((faq, index) => (
              <div key={index} className="p-6 hover:bg-gray-50 transition">
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  className="w-full text-left font-semibold text-gray-900 flex items-start justify-between gap-4"
                >
                  <span>{faq.question}</span>
                  <span
                    className={`text-blue-600 text-2xl flex-shrink-0 transition transform ${
                      expandedFAQ === index ? 'rotate-45' : ''
                    }`}
                  >
                    +
                  </span>
                </button>
                {expandedFAQ === index && (
                  <p className="mt-4 text-gray-700 leading-relaxed">
                    {faq.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Feedback Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mt-12 border-l-4 border-green-600">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            We Value Your Feedback
          </h2>
          <p className="text-gray-700 mb-6">
            Have suggestions for improving BusWay Pro? We'd love to hear from you! Your feedback helps us build better features and provide a better experience.
          </p>
          <a
            href="mailto:feedback@buswayapp.com"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            <Mail className="w-5 h-5" />
            Send Feedback
          </a>
        </div>

        {/* Emergency */}
        <div className="mt-12 p-6 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-lg font-bold text-red-800 flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5" />
            Emergency or Urgent Issue?
          </h3>
          <p className="text-red-700">
            For urgent matters affecting student safety or critical system issues, contact your school administration immediately or call emergency services if needed.
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t">
          <p className="text-gray-600 mb-2">
            Average response time: 24-48 hours
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-3 text-xs text-gray-500">
            <a href="/privacy" className="hover:underline">Privacy Policy</a>
            <a href="/terms" className="hover:underline">Terms of Service</a>
            <a href="/refund-policy" className="hover:underline">Refund Policy</a>
            <a href="/shipping-policy" className="hover:underline">Shipping Policy</a>
          </div>
          <p className="text-xs text-gray-500">
            © 2026 BusWay Pro. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
