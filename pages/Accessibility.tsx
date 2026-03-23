import React from 'react';
import { Eye, Ear, Keyboard, Zap, CheckCircle, AlertCircle } from 'lucide-react';

export default function Accessibility() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="mb-8 border-b-4 border-purple-600 pb-6">
          <div className="flex items-center gap-3 mb-4">
            <Eye className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold text-gray-900">Accessibility Statement</h1>
          </div>
          <p className="text-gray-600">
            Last Updated: <span className="font-semibold">March 23, 2026</span>
          </p>
        </div>

        {/* Commitment */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Commitment to Accessibility</h2>
          <p className="text-gray-700 leading-relaxed">
            BusWay Pro is committed to ensuring digital accessibility for people with disabilities. We are continuously working to improve the accessibility of our web application and mobile app to conform with Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards.
          </p>
        </section>

        {/* Accessibility Features */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Accessibility Features</h2>
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 border-l-4 border-purple-600 rounded">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-600" />
                Visual Accessibility
              </h3>
              <ul className="space-y-2 text-gray-700 text-sm ml-7">
                <li>• High contrast text (WCAG AA compliant)</li>
                <li>• Adjustable font sizes using browser controls</li>
                <li>• Support for dark mode (reduced eye strain)</li>
                <li>• Clear visual hierarchy and structure</li>
                <li>• Descriptive alt text for all images</li>
                <li>• Color is not the only means of conveying information</li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50 border-l-4 border-blue-600 rounded">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-blue-600" />
                Keyboard Navigation
              </h3>
              <ul className="space-y-2 text-gray-700 text-sm ml-7">
                <li>• Full keyboard access to all features (no mouse required)</li>
                <li>• Logical tab order through interactive elements</li>
                <li>• Visible focus indicators for keyboard navigation</li>
                <li>• Skip navigation links</li>
                <li>• Support for common keyboard shortcuts</li>
              </ul>
            </div>

            <div className="p-4 bg-green-50 border-l-4 border-green-600 rounded">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Ear className="w-5 h-5 text-green-600" />
                Screen Reader Support
              </h3>
              <ul className="space-y-2 text-gray-700 text-sm ml-7">
                <li>• Compatible with popular screen readers (NVDA, JAWS, VoiceOver)</li>
                <li>• Proper use of semantic HTML</li>
                <li>• ARIA labels and roles for custom components</li>
                <li>• Form labels associated with inputs</li>
                <li>• Meaningful link text</li>
              </ul>
            </div>

            <div className="p-4 bg-orange-50 border-l-4 border-orange-600 rounded">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-600" />
                Mobile Accessibility
              </h3>
              <ul className="space-y-2 text-gray-700 text-sm ml-7">
                <li>• Responsive design works on all devices</li>
                <li>• Touch targets minimum 48x48 pixels</li>
                <li>• Support for platform accessibility features</li>
                <li>• Works with mobile screen readers (TalkBack, VoiceOver)</li>
                <li>• Zoom and magnification support</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Standards & Guidelines */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Accessibility Standards</h2>
          <p className="text-gray-700 mb-4">
            BusWay Pro aims to conform to the following accessibility standards:
          </p>
          <div className="space-y-3">
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900">WCAG 2.1 Level AA</h3>
                <p className="text-gray-700 text-sm">Web Content Accessibility Guidelines</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900">Section 508 (ADA)</h3>
                <p className="text-gray-700 text-sm">Americans with Disabilities Act Compliance</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900">EN 301 549</h3>
                <p className="text-gray-700 text-sm">European accessibility standard for ICT products</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900">ARIA Best Practices</h3>
                <p className="text-gray-700 text-sm">Accessible Rich Internet Applications</p>
              </div>
            </div>
          </div>
        </section>

        {/* Known Issues */}
        <section className="mb-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-yellow-600" />
            Known Accessibility Issues
          </h2>
          <p className="text-gray-700 mb-4">
            We are aware of the following accessibility limitations and are actively working to resolve them:
          </p>
          <ul className="space-y-2 text-gray-700">
            <li>• <strong>Real-time tracking maps:</strong> Third-party map services may have limited accessibility features. We recommend using keyboard navigation alongside map features.</li>
            <li>• <strong>Video content:</strong> Bus camera feeds may require captions or audio descriptions. We're implementing these features.</li>
            <li>• <strong>Complex data tables:</strong> Some admin reports are being updated for better screen reader compatibility.</li>
          </ul>
          <p className="text-gray-700 mt-4">
            If you encounter any accessibility barriers, please let us know immediately so we can address them.
          </p>
        </section>

        {/* Testing & Validation */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Testing & Validation</h2>
          <p className="text-gray-700 mb-4">
            We regularly conduct accessibility testing using:
          </p>
          <ul className="space-y-2 text-gray-700 ml-4">
            <li>• Automated accessibility scanners (Axe, Lighthouse, WebAIM)</li>
            <li>• Manual testing with keyboard navigation</li>
            <li>• Screen reader testing (NVDA, JAWS, VoiceOver)</li>
            <li>• User testing with people with disabilities</li>
            <li>• Continuous integration accessibility checks</li>
          </ul>
        </section>

        {/* Browser & AT Support */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Browser & Assistive Technology Support</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Browsers</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• Chrome/Chromium (latest 2 versions)</li>
                <li>• Firefox (latest 2 versions)</li>
                <li>• Safari (latest 2 versions)</li>
                <li>• Edge (latest 2 versions)</li>
                <li>• Mobile browsers on iOS and Android</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Assistive Technologies</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• NVDA (Windows)</li>
                <li>• JAWS (Windows)</li>
                <li>• VoiceOver (macOS, iOS)</li>
                <li>• TalkBack (Android)</li>
                <li>• Dragon NaturallySpeaking</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Accessibility Support */}
        <section className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Accessibility Support</h2>
          <p className="text-gray-700 mb-4">
            If you have difficulty accessing any part of BusWay Pro or need accessibility assistance:
          </p>
          <div className="space-y-3 text-gray-700">
            <p>
              <strong>Email:</strong>{' '}
              <a href="mailto:accessibility@buswayapp.com" className="text-blue-600 hover:underline">
                accessibility@buswayapp.com
              </a>
            </p>
            <p>
              <strong>Response time:</strong> We aim to respond within 2 business days
            </p>
            <p>
              <strong>Include:</strong> Description of issue, browser/AT used, and steps to reproduce
            </p>
          </div>
        </section>

        {/* Accessibility Resources */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Resources & Tools</h2>
          <p className="text-gray-700 mb-4">
            Helpful resources for using BusWay Pro with accessibility needs:
          </p>
          <ul className="space-y-2 text-gray-700">
            <li>
              • <strong>WCAG Guidelines:</strong>{' '}
              <a href="https://www.w3.org/WAI/WCAG21/quickref/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                W3C Web Accessibility Initiative
              </a>
            </li>
            <li>
              • <strong>Screen Reader Downloads:</strong> NVDA, JAWS, VoiceOver available from respective platforms
            </li>
            <li>
              • <strong>Keyboard Shortcuts:</strong> Guide available in app Help & Support section
            </li>
            <li>
              • <strong>Accessibility Statement:</strong> This document is available in alternative formats upon request
            </li>
          </ul>
        </section>

        {/* Feedback */}
        <section className="mb-8 p-6 bg-green-50 rounded-lg border border-green-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Feedback Matters</h2>
          <p className="text-gray-700 mb-4">
            We're committed to continuous improvement. If you find accessibility issues or have suggestions:
          </p>
          <a
            href="mailto:feedback@buswayapp.com"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Send Accessibility Feedback
          </a>
        </section>

        {/* Footer */}
        <div className="border-t pt-6 mt-8">
          <p className="text-center text-sm text-gray-600">
            Accessibility is not a feature—it's a fundamental right. We're committed to making BusWay Pro accessible to everyone.
          </p>
          <p className="text-center text-xs text-gray-500 mt-2">
            © 2026 BusWay Pro. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
