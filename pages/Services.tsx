import React from 'react';
import { Bus, MapPin, Shield, Bell, FileText, Users, CheckCircle2, Wallet, CreditCard } from 'lucide-react';

export default function Services() {
  const services = [
    {
      icon: <Bus className="w-10 h-10 text-blue-600" />,
      title: 'Monthly School Bus Service',
      description: 'Safe and reliable pickup & drop service for students between home and school. Includes morning pickup and evening drop.',
      price: '₹1,500',
      priceUnit: '/ month per student',
      features: [
        'Morning pickup from assigned stop',
        'Evening drop to assigned stop',
        'Trained and verified drivers',
        'GPS tracked buses',
        'Daily attendance marking',
      ],
    },
    {
      icon: <MapPin className="w-10 h-10 text-green-600" />,
      title: 'Live GPS Bus Tracking',
      description: 'Real-time bus location tracking so parents know exactly where their child is. View live map in the app.',
      price: '₹200',
      priceUnit: '/ month add-on',
      features: [
        'Real-time GPS location',
        'Estimated arrival time',
        'Route history',
        'Live map view in app',
        'Location alerts',
      ],
    },
    {
      icon: <Bell className="w-10 h-10 text-amber-600" />,
      title: 'SMS & Push Notifications',
      description: 'Instant alerts for bus departure, arrival, delays, and fee reminders via SMS and in-app notifications.',
      price: '₹100',
      priceUnit: '/ month add-on',
      features: [
        'Bus departure alerts',
        'Arrival notifications',
        'Delay notifications',
        'Fee payment reminders',
        'Emergency alerts',
      ],
    },
    {
      icon: <Shield className="w-10 h-10 text-purple-600" />,
      title: 'Yearly Bus Service Package',
      description: 'Full academic year bus service at a discounted rate. Better value for parents committing to yearly service.',
      price: '₹15,000',
      priceUnit: '/ academic year (10 months)',
      features: [
        '10 months of bus service',
        'Savings vs monthly rate',
        'Priority boarding point',
        'Free GPS tracking included',
        'Free SMS notifications',
      ],
    },
    {
      icon: <Users className="w-10 h-10 text-rose-600" />,
      title: 'Multi-Child Family Package',
      description: 'Discounted pricing for families with 2 or more children using the school bus service.',
      price: '₹2,700',
      priceUnit: '/ month for 2 children',
      features: [
        '10% off for 2 children',
        '15% off for 3+ children',
        'Single family account',
        'Consolidated billing',
        'One-click payment for all',
      ],
    },
    {
      icon: <FileText className="w-10 h-10 text-indigo-600" />,
      title: 'Digital Receipts & Invoices',
      description: 'Automated digital receipts and tax invoices for all fee payments. Download anytime from the app.',
      price: 'Free',
      priceUnit: 'with any package',
      features: [
        'PDF receipt after payment',
        'Monthly statements',
        'Annual tax invoice',
        'Email delivery',
        'Download from app',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-12 text-white mb-12 text-center">
          <Bus className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Our Services & Pricing</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Mount Carmel School Bus — Safe, reliable, and affordable bus transportation for Mount Carmel School, Gaggal.
            Serving 100+ students across 2 buses with transparent pricing.
          </p>
        </div>

        {/* Routes Served */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-12 border-l-4 border-blue-600">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <MapPin className="w-7 h-7 text-blue-600" />
            Bus Routes Served
          </h2>
          <p className="text-gray-700 mb-6">
            We currently operate 2 dedicated bus routes to Mount Carmel School, Gaggal.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-xs font-bold text-blue-600 uppercase mb-1">Route 1</p>
              <p className="font-semibold text-gray-900 text-lg">Kangra → Mount Carmel School, Gaggal</p>
              <p className="text-sm text-gray-600 mt-1">Morning pickup & evening drop</p>
            </div>
            <div className="p-5 bg-green-50 rounded-lg border border-green-100">
              <p className="text-xs font-bold text-green-600 uppercase mb-1">Route 2</p>
              <p className="font-semibold text-gray-900 text-lg">Shahpur → Mount Carmel School, Gaggal</p>
              <p className="text-sm text-gray-600 mt-1">Morning pickup & evening drop</p>
            </div>
          </div>
        </div>

        {/* Payment Methods Banner */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-12 border-l-4 border-green-600">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <Wallet className="w-7 h-7 text-green-600" />
            Accepted Payment Methods
          </h2>
          <p className="text-gray-700 mb-6">
            We accept multiple payment methods for your convenience — online and offline options available.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <CreditCard className="w-6 h-6 text-blue-600 mb-2" />
              <p className="font-semibold text-gray-900">Credit/Debit Cards</p>
              <p className="text-xs text-gray-600 mt-1">Visa, MasterCard, RuPay</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <Wallet className="w-6 h-6 text-green-600 mb-2" />
              <p className="font-semibold text-gray-900">UPI</p>
              <p className="text-xs text-gray-600 mt-1">Google Pay, PhonePe, BHIM, Paytm</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
              <FileText className="w-6 h-6 text-purple-600 mb-2" />
              <p className="font-semibold text-gray-900">Netbanking</p>
              <p className="text-xs text-gray-600 mt-1">All major banks</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
              <Wallet className="w-6 h-6 text-amber-600 mb-2" />
              <p className="font-semibold text-gray-900">Cash on Delivery (COD)</p>
              <p className="text-xs text-gray-600 mt-1">Pay cash directly to driver or office</p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-900">
              <strong>Cash on Delivery (COD) Available:</strong> Parents who prefer to pay cash can hand over the monthly fee directly to the bus driver or at the school bus office during working hours. Digital receipt will be provided for all cash payments.
            </p>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {services.map((service, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all p-6 border border-gray-100">
              <div className="mb-4">{service.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">{service.description}</p>

              <div className="mb-4 pb-4 border-b border-gray-100">
                <p className="text-3xl font-black text-blue-600">{service.price}</p>
                <p className="text-xs text-gray-500 font-medium">{service.priceUnit}</p>
              </div>

              <ul className="space-y-2">
                {service.features.map((feature, fidx) => (
                  <li key={fidx} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Terms & Info */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Important Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Fee Payment</h3>
              <ul className="space-y-1 list-disc list-inside">
                <li>Fees are charged monthly in advance</li>
                <li>Due date: 10th of every month</li>
                <li>Late fee of ₹50/day after due date</li>
                <li>Maximum late fee: ₹500 per month</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Service Details</h3>
              <ul className="space-y-1 list-disc list-inside">
                <li>Service operates Monday to Saturday</li>
                <li>No service on Sundays and school holidays</li>
                <li>Routes pre-approved by school administration</li>
                <li>Parents receive SMS for delays or changes</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 text-center border border-blue-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to Enroll?</h2>
          <p className="text-gray-700 mb-6">
            Contact us to register your child for bus service. Our team will help you choose the right package.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:choudharyajay533@gmail.com"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition inline-block"
            >
              Email Us
            </a>
            <a
              href="tel:+918988159431"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition inline-block"
            >
              Call +91 89881 59431
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t">
          <p className="text-gray-600 mb-2">
            Mount Carmel School Bus • Proprietorship (Singal)
          </p>
          <p className="text-sm text-gray-500 mb-4">
            V.P.O. Ghurkari, Tehsil & District Kangra, Himachal Pradesh - 176001, India
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
            <a href="/about" className="hover:underline">About Us</a>
            <a href="/contact-us" className="hover:underline">Contact Us</a>
            <a href="/privacy-policy" className="hover:underline">Privacy Policy</a>
            <a href="/terms-of-service" className="hover:underline">Terms of Service</a>
            <a href="/refund-policy" className="hover:underline">Refund Policy</a>
            <a href="/shipping-policy" className="hover:underline">Shipping Policy</a>
          </div>
        </div>
      </div>
    </div>
  );
}
