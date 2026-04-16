import React from 'react';
import { RefreshCw, CheckCircle, AlertTriangle, Clock, Mail, Phone } from 'lucide-react';

export default function RefundPolicy() {
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
            <RefreshCw className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Refund & Cancellation Policy</h1>
          </div>
          <p className="text-gray-600">
            Mount Carmel School Bus &mdash; Fee Payment & Bus Management
          </p>
          <p className="text-sm text-gray-500 mt-1">Last Updated: April 2026</p>
          <p className="text-sm text-gray-500">Operated by: Mount Carmel School Bus (Proprietor: Singal), V.P.O. Ghurkari, Tehsil & District Kangra, Himachal Pradesh - 176001, India</p>
        </div>

        <div className="space-y-8 text-gray-700 leading-relaxed">

          {/* Section 1 */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">1. Overview</h2>
            </div>
            <p>
              Mount Carmel School Bus operates a digital platform that enables parents to pay school bus transportation fees online.
              All payments made through this platform are for <strong>school bus transportation services</strong> provided
              to students of Mount Carmel School, Gaggal. This policy outlines the conditions under which refunds and
              cancellations are processed.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <RefreshCw className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">2. Refund Eligibility</h2>
            </div>
            <p className="mb-3">Refunds may be issued under the following circumstances:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Duplicate Payment:</strong> If a parent is charged more than once for the same billing period due to a technical error, the duplicate amount will be refunded in full.</li>
              <li><strong>Excess Payment:</strong> If the amount charged exceeds the actual fee for the billing period, the excess amount will be refunded.</li>
              <li><strong>Service Not Provided:</strong> If the school bus transportation service is permanently discontinued for a student (e.g., student withdrawal, route cancellation by the school), a pro-rata refund for the unused period may be issued subject to school administration approval.</li>
              <li><strong>Failed Transaction with Amount Debited:</strong> If a payment fails but the amount is debited from the parent's account, the amount will be automatically refunded by the payment gateway (PayU) within 5-7 business days. If not received, the parent may raise a request.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <h2 className="text-xl font-bold text-gray-900">3. Non-Refundable Scenarios</h2>
            </div>
            <p className="mb-3">Refunds will <strong>not</strong> be provided in the following cases:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The student has availed the bus transportation service for the billed month/period.</li>
              <li>Voluntary absence from the bus service by the student (the seat remains reserved).</li>
              <li>Late fee or penalty charges that were correctly applied as per the school's fee policy.</li>
              <li>Change of mind after a successful payment for a valid billing cycle.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">4. Refund Process & Timeline</h2>
            </div>
            <div className="bg-blue-50 rounded-lg p-5 space-y-3">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shrink-0">1</span>
                <p><strong>Request:</strong> Parent submits a refund request via the Contact Us page or by emailing <strong>choudharyajay533@gmail.com</strong> with the transaction ID, student name, and reason.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shrink-0">2</span>
                <p><strong>Review:</strong> The school administration reviews the request within <strong>3-5 business days</strong>.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shrink-0">3</span>
                <p><strong>Approval & Processing:</strong> If approved, the refund is initiated via the original payment method (PayU gateway).</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shrink-0">4</span>
                <p><strong>Credit:</strong> Refund is credited to the parent's original payment source within <strong>7-10 business days</strong> from the date of approval.</p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">5. Cancellation Policy</h2>
            </div>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Before Payment:</strong> Parents may cancel at any time before completing the payment. No charges are applied.</li>
              <li><strong>After Payment:</strong> Once a payment is successfully processed for a billing cycle, it cannot be cancelled. However, the parent may request a refund as per Section 2 above if eligible.</li>
              <li><strong>Service Cancellation by School:</strong> If the school discontinues bus service for any reason, affected parents will receive a refund for the unused portion of the paid period.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Mail className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">6. How to Request a Refund</h2>
            </div>
            <p className="mb-3">To request a refund, please contact us through any of the following channels:</p>
            <div className="bg-gray-50 rounded-lg p-5 space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-600" />
                <p><strong>Email:</strong> <a href="mailto:choudharyajay533@gmail.com" className="text-blue-600 hover:underline">choudharyajay533@gmail.com</a></p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-600" />
                <p><strong>Phone:</strong> <a href="tel:+918988159431" className="text-blue-600 hover:underline">+91 89881 59431</a></p>
              </div>
              <div className="flex items-center gap-3">
                <i className="fas fa-globe text-blue-600 w-5 text-center"></i>
                <p><strong>Website:</strong> <a href="/contact-us" className="text-blue-600 hover:underline">Contact Us Page</a></p>
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-500">
              Please include your <strong>Transaction ID</strong>, <strong>Student Name</strong>, <strong>Admission Number</strong>, and <strong>Reason for Refund</strong> in your request.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">7. Payment Gateway</h2>
            </div>
            <p>
              All online payments are securely processed through <strong>PayU</strong>, a PCI DSS compliant payment gateway.
              PayU supports Credit Cards, Debit Cards, UPI (Google Pay, PhonePe, BHIM), Net Banking, and Wallets.
              Mount Carmel School Bus does not store any card or bank account details. All payment data is handled directly by PayU
              under their security protocols.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">8. Amendments</h2>
            </div>
            <p>
              Mount Carmel School Bus reserves the right to modify this Refund & Cancellation Policy at any time.
              Changes will be posted on this page with an updated revision date. Continued use of the
              platform after changes constitutes acceptance of the revised policy.
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 text-sm text-blue-600">
            <a href="/about" className="hover:underline">About Us</a>
            <a href="/services" className="hover:underline">Services</a>
            <a href="/privacy-policy" className="hover:underline">Privacy Policy</a>
            <a href="/terms-of-service" className="hover:underline">Terms of Service</a>
            <a href="/shipping-policy" className="hover:underline">Shipping & Delivery</a>
            <a href="/contact-us" className="hover:underline">Contact Us</a>
          </div>
          <p className="text-sm text-gray-500 mt-3">&copy; {new Date().getFullYear()} Mount Carmel School Bus. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
