import React from 'react';
import { BookOpen, CheckCircle, AlertTriangle } from 'lucide-react';

export default function TermsOfService() {
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
        <div className="mb-8 border-b-4 border-green-600 pb-6">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-green-600" />
            <h1 className="text-4xl font-bold text-gray-900">Terms of Service</h1>
          </div>
          <p className="text-gray-600">
            Last Updated: <span className="font-semibold">March 23, 2026</span>
          </p>
        </div>

        {/* Introduction */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-700 leading-relaxed">
            By accessing and using BusWay Pro ("Service"), you accept and agree to be bound by and abide by these Terms of Service and our Privacy Policy. If you do not agree to abide by the above, please do not use this service.
          </p>
        </section>

        {/* Use License */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use License</h2>
          <p className="text-gray-700 mb-4">
            Permission is granted to temporarily download one copy of the materials (including information and software) from BusWay Pro for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul className="space-y-2 ml-4 text-gray-700">
            <li className="flex gap-2">
              <span className="text-green-600 font-bold">•</span>
              <span>Modifying or copying the materials</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-600 font-bold">•</span>
              <span>Using the materials for any commercial purpose or for any public display</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-600 font-bold">•</span>
              <span>Attempting to decompile or reverse engineer any software contained on BusWay Pro</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-600 font-bold">•</span>
              <span>Removing any copyright or other proprietary notations from the materials</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-600 font-bold">•</span>
              <span>Transferring the materials to another person or "mirroring" the materials on any other server</span>
            </li>
          </ul>
        </section>

        {/* Disclaimer */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Disclaimer</h2>
          <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400">
            <p className="text-gray-700">
              The materials on BusWay Pro are provided on an 'as is' basis. BusWay Pro makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </div>
        </section>

        {/* Limitations */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Limitations</h2>
          <p className="text-gray-700 mb-4">
            In no event shall BusWay Pro or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on BusWay Pro, even if BusWay Pro or an authorized representative has been notified orally or in writing of the possibility of such damage.
          </p>
        </section>

        {/* Accuracy of Materials */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Accuracy of Materials</h2>
          <p className="text-gray-700">
            The materials appearing on BusWay Pro could include technical, typographical, or photographic errors. BusWay Pro does not warrant that any of the materials on the Service are accurate, complete, or current. BusWay Pro may make changes to the materials contained on its Service at any time without notice.
          </p>
        </section>

        {/* Materials Links */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Links</h2>
          <p className="text-gray-700">
            BusWay Pro has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by BusWay Pro of the site. Use of any such linked website is at the user's own risk.
          </p>
        </section>

        {/* Modifications */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Modifications</h2>
          <p className="text-gray-700">
            BusWay Pro may revise these terms of service for its Service at any time without notice. By using this Service, you are agreeing to be bound by the then current version of these terms of service.
          </p>
        </section>

        {/* Governing Law */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Governing Law</h2>
          <p className="text-gray-700">
            These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which the school is located, and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
          </p>
        </section>

        {/* User Accounts */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">9. User Accounts</h2>
          <p className="text-gray-700 mb-4">
            If you create an account on BusWay Pro, you are responsible for maintaining the confidentiality of your password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
          </p>
          <p className="text-gray-700">
            You agree that you will not use the service to conduct any activity that is illegal, threatening, abusive, defamatory, obscene, or otherwise objectionable.
          </p>
        </section>

        {/* Payment Terms */}
        <section className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Payment Terms</h2>
          <div className="space-y-3 text-gray-700">
            <p>
              <strong>Fee Payment:</strong> All fees are to be paid according to the billing cycle specified by the school. Payment can be made through the integrated payment gateways (PayU or Stripe).
            </p>
            <p>
              <strong>Late Payments:</strong> Late payments may incur penalties as specified by the school administration.
            </p>
            <p>
              <strong>Refunds:</strong> Refund policy is determined by the school and will be communicated separately.
            </p>
            <p>
              <strong>Payment Disputes:</strong> Please contact the school administration to resolve payment-related issues.
            </p>
          </div>
        </section>

        {/* Limitation of Liability */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Limitation of Liability</h2>
          <p className="text-gray-700">
            BusWay Pro shall not be liable to you in relation to the contents of, or use of, or otherwise in connection with, any linked site for any indirect, special or consequential loss, or for any business losses, loss of revenue, income, profits or anticipated savings.
          </p>
        </section>

        {/* Prohibited Activities */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Prohibited Activities</h2>
          <p className="text-gray-700 mb-4">
            You may not engage in any of the following prohibited activities:
          </p>
          <div className="space-y-2 ml-4">
            <div className="flex gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">Harassment, threats, or abuse of other users</span>
            </div>
            <div className="flex gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">Posting or transmitting abusive, obscene, or offensive content</span>
            </div>
            <div className="flex gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">Impersonating any person or entity</span>
            </div>
            <div className="flex gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">Distributing or transmitting viruses, malware, or harmful code</span>
            </div>
            <div className="flex gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">Unauthorized access to or use of the service or systems</span>
            </div>
          </div>
        </section>

        {/* Termination */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Termination of Service</h2>
          <p className="text-gray-700 mb-4">
            BusWay Pro may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason whatsoever, including if you breach the Terms.
          </p>
          <p className="text-gray-700">
            Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may do so by contacting the school administration.
          </p>
        </section>

        {/* Contact Support */}
        <section className="mb-8 p-6 bg-green-50 rounded-lg border border-green-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Support & Questions</h2>
          <p className="text-gray-700 mb-4">
            If you have any questions about these Terms of Service, please use the Help & Support section in the app or contact:
          </p>
          <div className="space-y-2 text-gray-700">
            <p>
              <strong>Email:</strong>{' '}
              <a href="mailto:support@buswayapp.com" className="text-green-600 hover:underline">
                support@buswayapp.com
              </a>
            </p>
            <p>
              <strong>In-App Support:</strong> Help & Support section in the application
            </p>
          </div>
        </section>

        {/* Footer */}
        <div className="border-t pt-6 mt-8">
          <p className="text-center text-sm text-gray-600">
            By using BusWay Pro, you agree to these Terms of Service.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-3 text-xs text-gray-500">
            <a href="/privacy" className="hover:underline">Privacy Policy</a>
            <a href="/cookie-policy" className="hover:underline">Cookie Policy</a>
            <a href="/data-protection" className="hover:underline">Data Protection</a>
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
