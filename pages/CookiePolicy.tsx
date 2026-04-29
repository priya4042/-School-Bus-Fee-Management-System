import React from 'react';
import { Cookie, Settings, Info, X } from 'lucide-react';

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="mb-8 border-b-4 border-orange-600 pb-6">
          <div className="flex items-center gap-3 mb-4">
            <Cookie className="w-8 h-8 text-orange-600" />
            <h1 className="text-4xl font-bold text-gray-900">Cookie Policy</h1>
          </div>
          <p className="text-gray-600">
            Last Updated: <span className="font-semibold">March 23, 2026</span>
          </p>
        </div>

        {/* Introduction */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. What Are Cookies?</h2>
          <p className="text-gray-700 leading-relaxed">
            Cookies are small text files that are stored on your device (computer, mobile phone, tablet, etc.) when you visit our website or use our mobile application. They are commonly used to remember information about your visit, such as your preferences and login information.
          </p>
          <p className="text-gray-700 leading-relaxed mt-4">
            Cookies are not harmful and do not contain viruses. However, they do collect and store information about your browsing habits.
          </p>
        </section>

        {/* Types of Cookies */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Types of Cookies We Use</h2>
          <div className="space-y-4">
            <div className="p-4 border-l-4 border-blue-600 bg-blue-50">
              <h3 className="font-semibold text-gray-900 mb-2">Essential Cookies</h3>
              <p className="text-gray-700 text-sm">
                <strong>Purpose:</strong> Required for basic functionality, authentication, and security
              </p>
              <p className="text-gray-700 text-sm mt-1">
                <strong>Examples:</strong> Session tokens, login credentials, CSRF tokens
              </p>
              <p className="text-gray-700 text-sm mt-1 text-blue-800">
                <strong>Can be disabled?</strong> No - app functionality will be severely impacted
              </p>
            </div>

            <div className="p-4 border-l-4 border-green-600 bg-green-50">
              <h3 className="font-semibold text-gray-900 mb-2">Performance Cookies</h3>
              <p className="text-gray-700 text-sm">
                <strong>Purpose:</strong> Analyze how you use the app and improve performance
              </p>
              <p className="text-gray-700 text-sm mt-1">
                <strong>Examples:</strong> Page load times, feature usage, error tracking, crash reports
              </p>
              <p className="text-gray-700 text-sm mt-1 text-green-800">
                <strong>Can be disabled?</strong> Yes - via Settings → Privacy
              </p>
            </div>

            <div className="p-4 border-l-4 border-purple-600 bg-purple-50">
              <h3 className="font-semibold text-gray-900 mb-2">Preference Cookies</h3>
              <p className="text-gray-700 text-sm">
                <strong>Purpose:</strong> Remember your preferences and settings
              </p>
              <p className="text-gray-700 text-sm mt-1">
                <strong>Examples:</strong> Language selection, theme preference, notification settings, sidebar state
              </p>
              <p className="text-gray-700 text-sm mt-1 text-purple-800">
                <strong>Can be disabled?</strong> Yes, but your preferences won't be saved
              </p>
            </div>

            <div className="p-4 border-l-4 border-orange-600 bg-orange-50">
              <h3 className="font-semibold text-gray-900 mb-2">Third-Party Cookies</h3>
              <p className="text-gray-700 text-sm">
                <strong>Purpose:</strong> Set by external services integrated with our app
              </p>
              <p className="text-gray-700 text-sm mt-1">
                <strong>Examples:</strong> Supabase (database and authentication), Twilio (SMS notifications)
              </p>
              <p className="text-gray-700 text-sm mt-1 text-orange-800">
                <strong>Can be disabled?</strong> Partially - depends on service requirements
              </p>
            </div>
          </div>
        </section>

        {/* How We Use Cookies */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Cookies</h2>
          <div className="space-y-3">
            <div className="flex gap-3">
              <span className="text-orange-600 font-bold text-lg">1.</span>
              <div>
                <h3 className="font-semibold text-gray-900">Authentication & Security</h3>
                <p className="text-gray-700 text-sm">To keep you logged in and secure your account</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-orange-600 font-bold text-lg">2.</span>
              <div>
                <h3 className="font-semibold text-gray-900">App Personalization</h3>
                <p className="text-gray-700 text-sm">To remember your preferences and provide a customized experience</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-orange-600 font-bold text-lg">3.</span>
              <div>
                <h3 className="font-semibold text-gray-900">Performance Analytics</h3>
                <p className="text-gray-700 text-sm">To understand how you use the app and identify improvements</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-orange-600 font-bold text-lg">4.</span>
              <div>
                <h3 className="font-semibold text-gray-900">Feature Functionality</h3>
                <p className="text-gray-700 text-sm">To provide payments, attendance and notifications</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-orange-600 font-bold text-lg">5.</span>
              <div>
                <h3 className="font-semibold text-gray-900">Error Tracking</h3>
                <p className="text-gray-700 text-sm">To monitor and fix bugs and issues</p>
              </div>
            </div>
          </div>
        </section>

        {/* Specific Cookies Table */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Specific Cookies Used</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-3 text-left font-semibold text-gray-900">Cookie Name</th>
                  <th className="border border-gray-300 p-3 text-left font-semibold text-gray-900">Type</th>
                  <th className="border border-gray-300 p-3 text-left font-semibold text-gray-900">Purpose</th>
                  <th className="border border-gray-300 p-3 text-left font-semibold text-gray-900">Expiry</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-3">session_token</td>
                  <td className="border border-gray-300 p-3">Essential</td>
                  <td className="border border-gray-300 p-3">User authentication</td>
                  <td className="border border-gray-300 p-3">Session end</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-3">user_preferences</td>
                  <td className="border border-gray-300 p-3">Preference</td>
                  <td className="border border-gray-300 p-3">Theme, language, layout settings</td>
                  <td className="border border-gray-300 p-3">1 year</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-3">notification_settings</td>
                  <td className="border border-gray-300 p-3">Preference</td>
                  <td className="border border-gray-300 p-3">SMS/Email/Push preferences</td>
                  <td className="border border-gray-300 p-3">1 year</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-3">_ga</td>
                  <td className="border border-gray-300 p-3">Performance</td>
                  <td className="border border-gray-300 p-3">Google Analytics tracking</td>
                  <td className="border border-gray-300 p-3">2 years</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-3">api_key</td>
                  <td className="border border-gray-300 p-3">Essential</td>
                  <td className="border border-gray-300 p-3">API authentication</td>
                  <td className="border border-gray-300 p-3">Session end</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-3">csrf_token</td>
                  <td className="border border-gray-300 p-3">Security</td>
                  <td className="border border-gray-300 p-3">CSRF attack prevention</td>
                  <td className="border border-gray-300 p-3">Session end</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Cookie Management */}
        <section className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            5. How to Manage Cookies
          </h2>
          
          <h3 className="font-semibold text-gray-900 mt-4 mb-2">In the App</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-2 mb-4">
            <li>Go to Settings → Privacy</li>
            <li>Toggle "Allow Analytics Cookies" on/off</li>
            <li>Toggle "Allow Performance Cookies" on/off</li>
            <li>Note: Essential cookies cannot be disabled</li>
          </ol>

          <h3 className="font-semibold text-gray-900 mb-2">In Your Browser</h3>
          <p className="text-gray-700 mb-2">
            You can control cookies through your device's browser or app settings:
          </p>
          <ul className="space-y-1 text-gray-700 ml-4">
            <li>• <strong>Chrome/Android:</strong> Settings → Privacy → Clear browsing data</li>
            <li>• <strong>Safari/iOS:</strong> Settings → Safari → Clear History and Website Data</li>
            <li>• <strong>Firefox:</strong> Settings → Privacy → Manage Data</li>
          </ul>
        </section>

        {/* Third-Party Services */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Third-Party Cookie Services</h2>
          <p className="text-gray-700 mb-4">
            External services used in our app may set their own cookies:
          </p>
          <div className="space-y-4">
            <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
              <h3 className="font-semibold text-gray-900">Supabase</h3>
              <p className="text-gray-700 text-sm">For database hosting and authentication</p>
              <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                Supabase Privacy Policy →
              </a>
            </div>
            <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
              <h3 className="font-semibold text-gray-900">Twilio</h3>
              <p className="text-gray-700 text-sm">For SMS and OTP delivery</p>
              <a href="https://www.twilio.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                Twilio Privacy Policy →
              </a>
            </div>
            <div className="p-4 border-l-4 border-purple-500 bg-purple-50">
              <h3 className="font-semibold text-gray-900">Stripe</h3>
              <p className="text-gray-700 text-sm">For alternative payment processing</p>
              <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline text-sm">
                Stripe Privacy Policy →
              </a>
            </div>
          </div>
        </section>

        {/* Data Retention */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookie Data Retention</h2>
          <p className="text-gray-700 mb-4">
            We retain cookie data based on the following principles:
          </p>
          <ul className="space-y-2 text-gray-700">
            <li className="flex gap-2">
              <span className="text-orange-600 font-bold">•</span>
              <span><strong>Session cookies:</strong> Deleted when you logout or close the app</span>
            </li>
            <li className="flex gap-2">
              <span className="text-orange-600 font-bold">•</span>
              <span><strong>Persistent cookies:</strong> Retained for the duration specified (typically 1-2 years)</span>
            </li>
            <li className="flex gap-2">
              <span className="text-orange-600 font-bold">•</span>
              <span><strong>Analytics data:</strong> Aggregated and anonymized after 24 months</span>
            </li>
            <li className="flex gap-2">
              <span className="text-orange-600 font-bold">•</span>
              <span><strong>User request:</strong> Deleted upon account deletion</span>
            </li>
          </ul>
        </section>

        {/* Consent */}
        <section className="mb-8 p-6 bg-green-50 rounded-lg border border-green-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Your Consent</h2>
          <p className="text-gray-700 mb-4">
            By using BusWay Pro, you consent to our use of cookies as described in this policy. You can withdraw consent at any time by disabling non-essential cookies in your Settings.
          </p>
          <p className="text-gray-700">
            <strong>Note:</strong> Disabling essential cookies may prevent the app from functioning properly.
          </p>
        </section>

        {/* Changes to Cookie Policy */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Changes to This Policy</h2>
          <p className="text-gray-700">
            BusWay Pro may update this Cookie Policy at any time. Changes will be posted here with an updated "Last Updated" date. Significant changes will be communicated through in-app notifications.
          </p>
        </section>

        {/* Questions */}
        <section className="mb-8 p-6 bg-gray-100 rounded-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Info className="w-6 h-6 text-gray-700" />
            Have Questions?
          </h2>
          <p className="text-gray-700 mb-2">
            If you have questions about our use of cookies:
          </p>
          <a href="mailto:privacy@buswayapp.com" className="text-blue-600 hover:underline font-semibold">
            Contact us at privacy@buswayapp.com
          </a>
        </section>

        {/* Footer */}
        <div className="border-t pt-6 mt-8">
          <p className="text-center text-sm text-gray-600">
            Thank you for helping us improve BusWay Pro while protecting your privacy.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-3 text-xs text-gray-500">
            <a href="/privacy" className="hover:underline">Privacy Policy</a>
            <a href="/terms" className="hover:underline">Terms of Service</a>
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
