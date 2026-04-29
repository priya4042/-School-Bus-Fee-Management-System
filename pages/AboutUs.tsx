import React from 'react';
import { Globe, Users, Award, Target, Zap } from 'lucide-react';

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-12 text-white mb-12">
          <div className="flex items-center gap-4 mb-4">
            <Globe className="w-10 h-10" />
            <h1 className="text-4xl font-bold">About Meena Devi – Bus Transport Service</h1>
          </div>
          <p className="text-blue-100 text-lg">
            Independent bus pickup & drop service for students of Mount Carmel School, Gaggal — serving over 100 students daily. Managed through this website and companion Android app (currently in closed testing).
          </p>
        </div>

        {/* Business Information - For PayU KYC Verification */}
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
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">Service Category</p>
              <p className="text-lg font-semibold text-gray-900">School Bus Transportation</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">School Served</p>
              <p className="text-lg font-semibold text-gray-900">Mount Carmel School, Gaggal</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">Fleet & Students</p>
              <p className="text-lg font-semibold text-gray-900">2 Buses · 100+ Students</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">Email</p>
              <a href="mailto:choudharyajay533@gmail.com" className="text-lg font-semibold text-blue-600 hover:underline break-all">choudharyajay533@gmail.com</a>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">Phone</p>
              <a href="tel:+918988159431" className="text-lg font-semibold text-blue-600 hover:underline">+91 89881 59431</a>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">Operating Address</p>
              <p className="text-lg font-semibold text-gray-900">
                V.P.O. Ghurkari, Tehsil & District Kangra, Himachal Pradesh - 176001, India
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">Bus Routes</p>
              <ul className="text-base font-semibold text-gray-900 space-y-1">
                <li>1. Kangra → Mount Carmel School, Gaggal</li>
                <li>2. Shahpur → Mount Carmel School, Gaggal</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              To revolutionize school transportation management by providing safe, transparent, and efficient solutions that connect schools, parents, and drivers in a single, integrated platform.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-8 h-8 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">Our Vision</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              To become the most trusted platform for school bus management globally, empowering educational institutions with technology that prioritizes student safety, parental peace of mind, and operational excellence.
            </p>
          </div>
        </div>

        {/* Key Features */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
            <Award className="w-8 h-8 text-blue-600" />
            Why Choose BusWay Pro?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-green-50 rounded-lg border-l-4 border-green-600">
              <h3 className="font-semibold text-gray-900 mb-2">Direct UPI Payments</h3>
              <p className="text-gray-700 text-sm">
                Pay monthly bus fees through Google Pay, PhonePe, Paytm or BHIM with one tap
              </p>
            </div>
            <div className="p-6 bg-purple-50 rounded-lg border-l-4 border-purple-600">
              <h3 className="font-semibold text-gray-900 mb-2">Attendance Records</h3>
              <p className="text-gray-700 text-sm">
                Daily pickup and drop attendance with calendar view and monthly streak tracking
              </p>
            </div>
            <div className="p-6 bg-blue-50 rounded-lg border-l-4 border-blue-600">
              <h3 className="font-semibold text-gray-900 mb-2">Spending Summary</h3>
              <p className="text-gray-700 text-sm">
                Monthly breakdown of bus fee paid versus pending with clear charts
              </p>
            </div>
            <div className="p-6 bg-orange-50 rounded-lg border-l-4 border-orange-600">
              <h3 className="font-semibold text-gray-900 mb-2">Transparent Billing</h3>
              <p className="text-gray-700 text-sm">
                Clear fee structures, payment history, and automated receipt generation
              </p>
            </div>
            <div className="p-6 bg-red-50 rounded-lg border-l-4 border-red-600">
              <h3 className="font-semibold text-gray-900 mb-2">Instant Notifications</h3>
              <p className="text-gray-700 text-sm">
                Real-time SMS, email, and push notifications for delays and updates
              </p>
            </div>
            <div className="p-6 bg-indigo-50 rounded-lg border-l-4 border-indigo-600">
              <h3 className="font-semibold text-gray-900 mb-2">Data Security</h3>
              <p className="text-gray-700 text-sm">
                Enterprise-grade encryption and compliance with GDPR and data protection regulations
              </p>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
            <Users className="w-8 h-8 text-blue-600" />
            Our Team
          </h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            BusWay Pro is developed and maintained by a dedicated team of software engineers, product managers, and customer success specialists with industry experience in education technology, transportation management, and financial services.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Development Team</h3>
              <p className="text-gray-700 text-sm">
                Full-stack engineers with expertise in React, TypeScript, Node.js, and cloud infrastructure
              </p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Product Team</h3>
              <p className="text-gray-700 text-sm">
                Product managers focused on user experience and feature development
              </p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Security Team</h3>
              <p className="text-gray-700 text-sm">
                Security specialists ensuring data protection and regulatory compliance
              </p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Support Team</h3>
              <p className="text-gray-700 text-sm">
                Customer success specialists available to assist schools and parents
              </p>
            </div>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Technology Stack</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Frontend</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• React 19 with TypeScript</li>
                <li>• Vite 6 for fast builds</li>
                <li>• Tailwind CSS for styling</li>
                <li>• React Router 7 for navigation</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Backend & Services</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• Supabase for database and auth</li>
                <li>• Node.js serverless functions</li>
                <li>• UPI deep links for direct payments</li>
                <li>• Twilio for SMS and OTP delivery</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">DevOps & Deployment</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• Vercel for frontend hosting</li>
                <li>• Render for backend hosting</li>
                <li>• GitHub Actions for CI/CD</li>
                <li>• Docker for containerization</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Mobile</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• Capacitor 8 for mobile wrapping</li>
                <li>• Android native features</li>
                <li>• PWA support</li>
                <li>• Cross-platform compatibility</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Recognition */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-8 mb-12 border border-green-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Compliance & Standards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <div className="flex gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>GDPR Compliant (EU data protection)</span>
            </div>
            <div className="flex gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>CCPA Compliant (US privacy)</span>
            </div>
            <div className="flex gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>COPPA Compliant (children's privacy)</span>
            </div>
            <div className="flex gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>PCI DSS Certified (payment security)</span>
            </div>
            <div className="flex gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>ISO 27001 Security Standards</span>
            </div>
            <div className="flex gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>WCAG 2.1 Accessibility</span>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-blue-50 rounded-lg p-8 border border-blue-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Get In Touch</h2>
          <p className="text-gray-700 mb-6">
            Have questions about BusWay Pro? We'd love to hear from you. Contact our team for more information.
          </p>
          <div className="space-y-3">
            <p>
              <strong>Email:</strong>{' '}
              <a href="mailto:choudharyajay533@gmail.com" className="text-blue-600 hover:underline">
                choudharyajay533@gmail.com
              </a>
            </p>
            <p>
              <strong>Phone:</strong>{' '}
              <a href="tel:+918988159431" className="text-blue-600 hover:underline">
                +91 89881 59431
              </a>
            </p>
            <p>
              <strong>Address:</strong> V.P.O. Ghurkari, Tehsil & District Kangra, Himachal Pradesh - 176001, India
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t">
          <p className="text-gray-600 mb-2">
            © 2026 Meena Devi – Bus Transport Service. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-3 text-xs text-gray-500">
            <a href="/services" className="hover:underline">Services</a>
            <a href="/contact-us" className="hover:underline">Contact Us</a>
            <a href="/privacy-policy" className="hover:underline">Privacy Policy</a>
            <a href="/terms-of-service" className="hover:underline">Terms of Service</a>
            <a href="/refund-policy" className="hover:underline">Refund Policy</a>
            <a href="/shipping-policy" className="hover:underline">Shipping Policy</a>
          </div>
          <p className="text-xs text-gray-500">
            Made with ❤️ for better school transportation
          </p>
        </div>
      </div>
    </div>
  );
}
