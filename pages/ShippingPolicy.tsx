import React from 'react';
import { Truck, CheckCircle, Globe, Mail } from 'lucide-react';

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
            <h1 className="text-3xl font-bold text-gray-900">Shipping & Service Delivery Policy</h1>
          </div>
          <p className="text-gray-600">
            Meena Devi – Bus Transport Service &mdash; School Bus Pickup & Drop Service
          </p>
          <p className="text-sm text-gray-500 mt-1">Last Updated: April 2026</p>
          <p className="text-sm text-gray-500">Operated by: Meena Devi (Proprietor – Bus Transport Service), V.P.O. Ghurkari, Tehsil & District Kangra, Himachal Pradesh - 176001, India</p>
        </div>

        <div className="space-y-8 text-gray-700 leading-relaxed">

          {/* Section 1 */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">1. No Physical Shipping or Delivery</h2>
            </div>
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-3">
              <p className="font-semibold text-amber-900">
                We do NOT ship or deliver any physical goods, products, or merchandise.
              </p>
              <p className="text-sm text-amber-800 mt-2">
                This is a <strong>school bus transportation service</strong>. The only "service" we provide is picking up students from their assigned bus stop in the morning and dropping them back in the evening. There is nothing to ship, courier, or deliver.
              </p>
            </div>
            <p className="mt-3">
              Meena Devi – Bus Transport Service operates 2 buses that pick up and drop students of Mount Carmel School, Gaggal between their home stop and the school. The website and Android app are used only to manage student records, fee payments, attendance and notifications related to this bus service.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Truck className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">2. How the Bus Service Is Delivered</h2>
            </div>
            <p className="mb-3">
              Our service is delivered through the daily operation of our 2 buses:
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-4 bg-gray-50 rounded-lg p-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Morning Pickup</p>
                  <p className="text-sm text-gray-600">Our bus arrives at the student's assigned stop on the route and picks up the student to take them to Mount Carmel School, Gaggal.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 bg-gray-50 rounded-lg p-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Evening Drop</p>
                  <p className="text-sm text-gray-600">After school hours, our bus drops the student back at the same assigned stop on the route.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 bg-gray-50 rounded-lg p-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Service Days</p>
                  <p className="text-sm text-gray-600">Monday to Saturday during the school's working days. No service on Sundays and school holidays.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 bg-gray-50 rounded-lg p-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Digital Receipt After Payment</p>
                  <p className="text-sm text-gray-600">Once a parent pays the monthly bus fee (online via PayU or in cash to the admin/driver), a PDF receipt is generated automatically and made available in the app and on the website.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Truck className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">3. Bus Service Operator</h2>
            </div>
            <p>
              The bus pickup and drop service is owned and operated by <strong>Meena Devi (Proprietor)</strong>. The school (Mount Carmel School, Gaggal) is the destination served — it does not operate these buses. The buses, drivers, routes and stops are managed entirely by the proprietor.
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>2 buses currently in operation, serving 100+ students daily.</li>
              <li>Routes operated: Kangra → Gaggal and Shahpur → Gaggal.</li>
              <li>For any queries regarding pickup/drop timings, route changes or driver behaviour, parents may contact the proprietor directly.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">4. Website & App Availability</h2>
            </div>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Platform:</strong> The website and the companion Android app are accessible 24/7 for fee payment, attendance and notifications.</li>
              <li><strong>Coverage:</strong> The bus pickup and drop service is currently available only on the Kangra → Gaggal and Shahpur → Gaggal routes serving Mount Carmel School, Gaggal.</li>
              <li><strong>Downtime:</strong> Any planned maintenance of the website or app will be communicated to parents via in-app notification.</li>
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
