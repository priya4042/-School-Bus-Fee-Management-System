import React from 'react';
import { Truck, CheckCircle, Clock, Globe, Mail } from 'lucide-react';

export default function ShippingPolicy() {
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
            <Truck className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Shipping & Delivery Policy</h1>
          </div>
          <p className="text-gray-600">
            Meena Devi – Bus Transport Service &mdash; Fee Payment & Bus Management
          </p>
          <p className="text-sm text-gray-500 mt-1">Last Updated: April 2026</p>
          <p className="text-sm text-gray-500">Operated by: Meena Devi (Proprietor – Bus Transport Service), V.P.O. Ghurkari, Tehsil & District Kangra, Himachal Pradesh - 176001, India</p>
        </div>

        <div className="space-y-8 text-gray-700 leading-relaxed">

          {/* Section 1 */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">1. Nature of Service</h2>
            </div>
            <p>
              Meena Devi – Bus Transport Service is a <strong>digital platform</strong> that provides an online fee payment and school bus management service.
              This is <strong>not a physical product</strong> &mdash; no physical goods are shipped or delivered.
            </p>
            <div className="mt-3 bg-blue-50 rounded-lg p-4">
              <p className="font-semibold text-blue-800">What Meena Devi – Bus Transport Service provides:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-blue-700">
                <li>Online payment of monthly school bus transportation fees</li>
                <li>Digital payment receipts (downloadable PDF)</li>
                <li>Real-time bus tracking for parents</li>
                <li>Fee history and billing records</li>
                <li>Notifications and alerts</li>
              </ul>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">2. Service Delivery</h2>
            </div>
            <p className="mb-3">
              Since Meena Devi – Bus Transport Service is a digital service, all deliverables are provided electronically and instantly:
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-4 bg-gray-50 rounded-lg p-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Payment Confirmation</p>
                  <p className="text-sm text-gray-600">Delivered instantly upon successful payment via on-screen confirmation and in-app notification.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 bg-gray-50 rounded-lg p-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Digital Receipt</p>
                  <p className="text-sm text-gray-600">Available for download immediately after payment. Also accessible anytime via the Receipts section of the app.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 bg-gray-50 rounded-lg p-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Fee Status Update</p>
                  <p className="text-sm text-gray-600">The student's fee record is updated in real-time to reflect "PAID" status in both parent and admin dashboards.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 bg-gray-50 rounded-lg p-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Email Notification (if enabled)</p>
                  <p className="text-sm text-gray-600">Payment confirmation email sent to the parent's registered email address within minutes of successful payment.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Truck className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">3. Bus Transportation Service</h2>
            </div>
            <p>
              The actual school bus transportation service is provided by the <strong>school/institution</strong>, not by Meena Devi – Bus Transport Service.
              Meena Devi – Bus Transport Service acts solely as a technology platform to facilitate fee collection, tracking, and communication
              between schools and parents.
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Bus routes, schedules, and operations are managed by the school administration.</li>
              <li>Any queries regarding bus service availability, pickup/drop timings, or route changes should be directed to the school's bus administration office.</li>
              <li>Meena Devi – Bus Transport Service provides real-time GPS tracking of buses as an informational service to parents.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">4. Service Availability</h2>
            </div>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Platform:</strong> Meena Devi – Bus Transport Service is accessible 24/7 via web browser and Android mobile app.</li>
              <li><strong>Coverage:</strong> The service is available across India wherever the partnered school operates bus services.</li>
              <li><strong>Downtime:</strong> Scheduled maintenance windows, if any, will be communicated via in-app notifications. We aim for 99.9% uptime.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Mail className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">5. Contact Us</h2>
            </div>
            <p className="mb-3">For any queries regarding service delivery:</p>
            <div className="bg-gray-50 rounded-lg p-5 space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-600" />
                <p><strong>Email:</strong> <a href="mailto:choudharyajay533@gmail.com" className="text-blue-600 hover:underline">choudharyajay533@gmail.com</a></p>
              </div>
              <div className="flex items-center gap-3">
                <i className="fas fa-phone text-blue-600 w-5 text-center"></i>
                <p><strong>Phone:</strong> <a href="tel:+918988159431" className="text-blue-600 hover:underline">+91 89881 59431</a></p>
              </div>
              <div className="flex items-center gap-3">
                <i className="fas fa-globe text-blue-600 w-5 text-center"></i>
                <p><strong>Website:</strong> <a href="/contact-us" className="text-blue-600 hover:underline">Contact Us Page</a></p>
              </div>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 text-sm text-blue-600">
            <a href="/about" className="hover:underline">About Us</a>
            <a href="/services" className="hover:underline">Services</a>
            <a href="/privacy-policy" className="hover:underline">Privacy Policy</a>
            <a href="/terms-of-service" className="hover:underline">Terms of Service</a>
            <a href="/refund-policy" className="hover:underline">Refund & Cancellation</a>
            <a href="/contact-us" className="hover:underline">Contact Us</a>
          </div>
          <p className="text-sm text-gray-500 mt-3">&copy; {new Date().getFullYear()} School Busway Pro. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
