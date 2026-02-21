import { Link } from 'react-router-dom'
import { FileText, AlertTriangle, Scale, Shield, ChevronRight } from 'lucide-react'

export default function Legal() {
  return (
    <div className="bg-primary min-h-screen">
      {/* Header */}
      <section className="bg-primary-dark py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Legal Information</h1>
          <p className="text-xl text-gray-300">Terms of use, disclaimers, and important notices</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Important Disclaimer */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 mb-12">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-8 h-8 text-amber-400 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-bold text-white mb-3">Important Disclaimer</h2>
              <p className="text-gray-300 mb-4">
                Radio Check is a peer support and wellbeing tool. It is <strong className="text-white">not a substitute 
                for professional medical advice, diagnosis, or treatment</strong>. Always seek the advice of qualified 
                health providers with any questions you may have regarding a medical or mental health condition.
              </p>
              <p className="text-gray-300">
                <strong className="text-amber-300">In an emergency, always call 999.</strong> Radio Check is not an emergency service 
                and cannot respond to immediate crises.
              </p>
            </div>
          </div>
        </div>

        {/* Terms of Use */}
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Terms of Use</h2>
          </div>
          <div className="bg-surface/50 rounded-2xl p-6 border border-white/10 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">1. Acceptance of Terms</h3>
              <p className="text-gray-300">
                By accessing and using Radio Check, you accept and agree to be bound by these Terms of Use. 
                If you do not agree to these terms, please do not use the application.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">2. Service Description</h3>
              <p className="text-gray-300">
                Radio Check provides AI-assisted conversation tools and peer support resources for veterans 
                and serving military personnel. The service is provided "as is" without warranties of any kind.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">3. User Responsibilities</h3>
              <p className="text-gray-300">
                Users must be 18 years or older to use Radio Check. You agree to use the service responsibly 
                and not to misuse, abuse, or attempt to manipulate the AI systems.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">4. AI Limitations</h3>
              <p className="text-gray-300">
                The AI companions are designed to provide supportive conversation but are not sentient, 
                do not have real-world knowledge of your situation beyond what you share, and cannot 
                provide professional advice.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">5. Safeguarding</h3>
              <p className="text-gray-300">
                Our AI systems are designed to recognise indicators of crisis and will encourage users 
                to seek appropriate professional help. In cases of immediate risk, conversations may be 
                reviewed to ensure user safety in accordance with our safeguarding policies.
              </p>
            </div>
          </div>
        </section>

        {/* Medical Disclaimer */}
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Medical Disclaimer</h2>
          </div>
          <div className="bg-surface/50 rounded-2xl p-6 border border-white/10 space-y-4">
            <p className="text-gray-300">
              The information and support provided by Radio Check is for general wellness purposes only and 
              does not constitute medical advice. The AI companions and peer support features are not 
              qualified healthcare providers.
            </p>
            <p className="text-gray-300">
              <strong className="text-white">Radio Check does not:</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Diagnose medical or mental health conditions</li>
              <li>Prescribe or recommend medications</li>
              <li>Provide therapy or clinical treatment</li>
              <li>Replace professional medical care</li>
              <li>Offer crisis intervention services</li>
            </ul>
            <p className="text-gray-300">
              If you are experiencing a mental health emergency, please contact emergency services (999), 
              call Samaritans (116 123), or go to your nearest A&E department.
            </p>
          </div>
        </section>

        {/* Liability */}
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Scale className="w-6 h-6 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Limitation of Liability</h2>
          </div>
          <div className="bg-surface/50 rounded-2xl p-6 border border-white/10 space-y-4">
            <p className="text-gray-300">
              Radio Check and its operators shall not be liable for any direct, indirect, incidental, 
              consequential, or punitive damages arising from your use of the service.
            </p>
            <p className="text-gray-300">
              While we strive to provide helpful and accurate information, we make no guarantees about 
              the completeness, reliability, or suitability of the AI responses or peer support provided.
            </p>
            <p className="text-gray-300">
              By using Radio Check, you acknowledge that you understand and accept these limitations.
            </p>
          </div>
        </section>

        {/* Copyright */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Copyright Notice</h2>
          <div className="bg-surface/50 rounded-2xl p-6 border border-white/10">
            <p className="text-gray-300">
              © {new Date().getFullYear()} Radio Check. All rights reserved.
            </p>
            <p className="text-gray-300 mt-4">
              All content, including text, graphics, logos, and software, is the property of Radio Check 
              or its content suppliers and is protected by UK and international copyright laws.
            </p>
            <p className="text-gray-300 mt-4">
              Reproduction, modification, or distribution of any content without prior written consent is prohibited.
            </p>
          </div>
        </section>

        {/* Link to Privacy */}
        <div className="text-center">
          <Link
            to="/privacy"
            className="inline-flex items-center justify-center gap-2 bg-accent-teal hover:bg-accent-teal/90 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:scale-105"
          >
            View Privacy Policy & GDPR
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
