'use client'

import Link from 'next/link'
import { Home, Shield, HelpCircle, ArrowLeft } from 'lucide-react'

// 404 Not Found Page
export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-muted-50 via-white to-primary-50 flex flex-col">
      
      {/* Header */}
      <header className="p-6">
        <div className="max-w-7xl mx-auto">
          <Link 
            href="/" 
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center justify-center w-8 h-8 bg-primary-600 rounded-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-muted-900">InsureWise</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg w-full">
          
          {/* 404 Card */}
          <div className="bg-white rounded-xl border border-muted-200 shadow-md text-center">
            <div className="pt-12 pb-8 px-6">
              
              {/* 404 Illustration */}
              <div className="mx-auto w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mb-8">
                <HelpCircle className="w-12 h-12 text-primary-600" />
              </div>
              
              {/* Error Message */}
              <div className="space-y-4 mb-8">
                <h1 className="text-6xl font-bold text-primary-600">404</h1>
                <h2 className="text-2xl font-semibold text-muted-900">
                  Page Not Found
                </h2>
                <p className="text-muted-600 leading-relaxed">
                  We couldn`&apos;`t find the page you`&apos;`re looking for. It might have been moved, 
                  deleted, or the URL might be incorrect.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/" className="flex-1">
                    <button className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 bg-primary-600 text-white shadow-md hover:bg-primary-700 hover:shadow-lg h-12 px-6 text-base">
                      <Home className="h-4 w-4 mr-2" />
                      Go Home
                    </button>
                  </Link>
                  
                  <Link href="/#insurance-form" className="flex-1">
                    <button className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 border-2 border-primary-300 bg-transparent text-primary-700 hover:bg-primary-50 hover:border-primary-400 h-12 px-6 text-base">
                      <Shield className="h-4 w-4 mr-2" />
                      Get Quote
                    </button>
                  </Link>
                </div>
                
                {/* Back Button */}
                <button
                  onClick={() => window.history.back()}
                  className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 bg-transparent text-muted-700 hover:bg-muted-100 hover:text-muted-900 h-12 px-6 text-base"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </button>
              </div>

            </div>
          </div>

          {/* Help Section */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-500 mb-4">
              Still need help? We`&apos;`re here to assist you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
              <Link 
                href="/#contact" 
                className="text-primary-600 hover:text-primary-700 transition-colors"
              >
                Contact Support
              </Link>
              <Link 
                href="/#help" 
                className="text-primary-600 hover:text-primary-700 transition-colors"
              >
                Help Center
              </Link>
              <Link 
                href="/#faq" 
                className="text-primary-600 hover:text-primary-700 transition-colors"
              >
                FAQ
              </Link>
            </div>
          </div>

        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="p-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs text-muted-500">
            © {new Date().getFullYear()} InsureWise. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  )
}