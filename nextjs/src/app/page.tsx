import React from 'react';
import Link from 'next/link';
import { ArrowRight, Globe, Shield, Users, Database, Clock } from 'lucide-react';
import AuthAwareButtons from '@/components/AuthAwareButtons';

export default function Home() {
  const features = [
    {
      icon: Database,
      title: 'Multi-Store Inventory',
      description: 'Centralized inventory tracking across multiple store locations with real-time stock updates',
      color: 'text-blue-600'
    },
    {
      icon: ArrowRight,
      title: 'Sales & Returns Management',
      description: 'Complete transaction processing with automated stock adjustments and return handling',
      color: 'text-green-600'
    },
    {
      icon: Globe,
      title: 'Stock Adjustments',
      description: 'Manual inventory corrections with full audit trail for cycle counts and damage tracking',
      color: 'text-orange-600'
    },
    {
      icon: Users,
      title: 'Supplier Management',
      description: 'Comprehensive vendor information and procurement tracking for efficient supply chain',
      color: 'text-purple-600'
    },
    {
      icon: Clock,
      title: 'Real-time Analytics',
      description: 'Live inventory insights, sales performance, and stock movement reporting',
      color: 'text-teal-600'
    },
    {
      icon: Shield,
      title: 'Audit & Compliance',
      description: 'Complete transaction history and movement tracking for regulatory compliance',
      color: 'text-red-600'
    }
  ];

  return (
      <div className="min-h-screen">
        <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-sm z-50 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center space-x-3">
                <img
                  src="/assets/logo.jpg"
                  alt="HATESCO Logo"
                  className="h-10 w-10 object-contain"
                />
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-black-600">HATESCO</span>
                  <span className="text-xs text-muted-foreground -mt-1">Inventory Management</span>
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-8">
                <AuthAwareButtons variant="nav" />
              </div>
            </div>
          </div>
        </nav>

        <section className="relative pt-32 pb-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                Professional Inventory
                <span className="block text-primary-600">Management Solutions</span>
              </h1>
              <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
                Streamline your business operations with HATESCO&apos;s comprehensive multi-store inventory management system. Track products, manage sales, and analyze performance across all your locations.
              </p>
              <div className="mt-10 flex gap-4 justify-center">
                <AuthAwareButtons />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold">Comprehensive Inventory Solutions</h2>
              <p className="mt-4 text-xl text-gray-600">
                Advanced features designed for modern retail and trading operations
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                  <div
                      key={index}
                      className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <feature.icon className={`h-8 w-8 ${feature.color}`} />
                    <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-gray-600">{feature.description}</p>
                  </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold">Get In Touch</h2>
              <p className="mt-4 text-xl text-gray-600">
                Ready to streamline your inventory management? Contact our team today
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Location</h3>
                <p className="text-gray-600">
                  Nam Hoa Civil Group<br />
                  Hong An Ward, Hai Phong City<br />
                  Việt Nam
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Contact</h3>
                <p className="text-gray-600">
                  Email: hatesco@gmail.com<br />
                  Phone: (+84) 225.8606 389
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Business Hours</h3>
                <p className="text-gray-600">
                  Monday - Friday: 8:00 AM - 6:00 PM<br />
                  Saturday: 8:00 AM - 4:00 PM<br />
                  Sunday: Closed
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-primary-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white">
              Ready to Optimize Your Inventory Management?
            </h2>
            <p className="mt-4 text-xl text-primary-100">
              Join businesses across Vietnam trusting HATESCO for their inventory management needs
            </p>
            <Link
                href="/auth/register"
                className="mt-8 inline-flex items-center px-6 py-3 rounded-lg bg-white text-primary-600 font-medium hover:bg-primary-50 transition-colors"
            >
              Start Managing Inventory
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </section>

        <footer className="py-16 px-6 md:px-8 border-t bg-slate-50">
          <div className="container mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-5 gap-12 items-start justify-items-center lg:justify-items-start">
              {/* Company Logo Section - Takes 2 columns */}
              <div className="lg:col-span-2 text-center lg:text-left">
                <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-4 lg:space-y-0 lg:space-x-4">
                  <img
                    src="/assets/logo.jpg"
                    alt="HATESCO Logo"
                    className="h-20 w-20 object-contain flex-shrink-0"
                  />
                  <div>
                    <h3 className="font-bold text-2xl text-primary mb-2">HATESCO</h3>
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1 leading-tight">
                        CÔNG TY TNHH DỊCH VỤ KỸ THUẬT VÀ THƯƠNG MẠI HẢI PHONG
                      </p>
                      <p className="text-xs text-muted-foreground leading-tight">
                        HAI PHONG TRADING AND ENGINEERING SERVICES COMPANY LIMITED
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information Section - Takes 2 columns */}
              <div className="lg:col-span-2 space-y-4 text-center lg:text-left">
                <h4 className="font-semibold text-lg text-muted-foreground uppercase tracking-wider">LIÊN HỆ</h4>

                <div className="space-y-3">
                  <div>
                    <p className="text-base font-medium text-foreground">
                      Email: <span className="text-muted-foreground">hatesco@gmail.com</span>
                    </p>
                  </div>

                  <div>
                    <p className="text-base font-medium text-foreground">
                      Số điện thoại: <span className="text-muted-foreground">(+84)225.8606 389</span>
                    </p>
                  </div>

                  <div>
                    <p className="text-base text-muted-foreground leading-relaxed">
                      Nam Hoa Civil Group, Hong An Ward, Hai Phong City, Việt Nam
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Media Section - Takes 1 column */}
              <div className="space-y-4 text-center lg:text-left">
                <h4 className="font-semibold text-lg text-muted-foreground uppercase tracking-wider">FOLLOW US</h4>

                <div className="flex justify-center lg:justify-start space-x-4">
                  {/* Facebook */}
                  <a href="#" className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                    <svg className="h-6 w-6 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  {/* Zalo */}
                  <a href="#" className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                    <svg className="h-6 w-6 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.546 20.2c-.19.49.18 1.02.7.99l3.721-.542C8.44 21.475 10.11 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm4.7 11.2c0 .66-.54 1.2-1.2 1.2H8.5c-.66 0-1.2-.54-1.2-1.2s.54-1.2 1.2-1.2h7c.66 0 1.2.54 1.2 1.2zm0-3c0 .66-.54 1.2-1.2 1.2H8.5c-.66 0-1.2-.54-1.2-1.2s.54-1.2 1.2-1.2h7c.66 0 1.2.54 1.2 1.2z"/>
                    </svg>
                  </a>
                  {/* LinkedIn */}
                  <a href="#" className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                    <svg className="h-6 w-6 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                </div>

                <div className="pt-6">
                  <div className="flex items-center justify-center lg:justify-start space-x-3">
                    <span className="text-sm text-muted-foreground">Authorized Partner:</span>
                    <img
                      src="/assets/banner.jpg"
                      alt="YANMAR"
                      className="h-8"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Copyright Section */}
            <div className="mt-12 pt-8 border-t text-center">
              <p className="text-sm text-muted-foreground">
                &copy; 2024 HATESCO - Hai Phong Trading and Engineering Services Company Limited. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
  );
}