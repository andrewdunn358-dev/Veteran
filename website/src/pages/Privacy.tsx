import { Link } from 'react-router-dom'
import { Shield, Database, Eye, Trash2, FileText, Lock, Globe, Mail, ChevronRight } from 'lucide-react'

export default function Privacy() {
  return (
    <div className="bg-primary min-h-screen">
      {/* Header */}
      <section className="bg-primary-dark py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Privacy Policy & GDPR</h1>
          <p className="text-xl text-gray-300">How we protect and handle your data</p>
          <p className="text-gray-400 mt-4 text-sm">Last updated: February 2026</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Overview */}
        <div className="bg-accent-teal/10 border border-accent-teal/30 rounded-2xl p-6 mb-12">
          <div className="flex items-start gap-4">
            <Shield className="w-8 h-8 text-accent-teal flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-bold text-white mb-3">Our Commitment to Your Privacy</h2>
              <p className="text-gray-300">
                Radio Check is committed to protecting your privacy and handling your data with care. 
                We process data in accordance with the UK General Data Protection Regulation (UK GDPR) 
                and the Data Protection Act 2018.
              </p>
            </div>
          </div>
        </div>

        {/* What We Collect */}
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Database className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">What Information We Collect</h2>
          </div>
          <div className="bg-surface/50 rounded-2xl p-6 border border-white/10 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Account Information</h3>
              <p className="text-gray-300">
                When you create an account, we collect your email address and any profile information 
                you choose to provide. Staff and volunteer accounts include additional verification information.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Conversation Data</h3>
              <p className="text-gray-300">
                Conversations with AI companions are processed to provide the service. These may be stored 
                temporarily for quality assurance and safeguarding purposes. No conversation data is shared 
                with third parties except where required by law.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Journal Entries</h3>
              <p className="text-gray-300">
                Journal entries are stored locally on your device by default. If you choose to enable 
                cloud backup, entries are encrypted and stored securely.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Technical Data</h3>
              <p className="text-gray-300">
                We collect anonymised usage data to improve the service, including device type, 
                operating system, and feature usage statistics.
              </p>
            </div>
          </div>
        </section>

        {/* How We Use Data */}
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Eye className="w-6 h-6 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">How We Use Your Data</h2>
          </div>
          <div className="bg-surface/50 rounded-2xl p-6 border border-white/10">
            <ul className="space-y-4">
              {[
                'To provide and maintain the Radio Check service',
                'To deliver AI companion conversations and peer support features',
                'To ensure user safety through safeguarding protocols',
                'To improve and develop new features',
                'To communicate important service updates',
                'To comply with legal obligations',
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent-teal mt-2 flex-shrink-0"></div>
                  <span className="text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Your Rights */}
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Your GDPR Rights</h2>
          </div>
          <div className="bg-surface/50 rounded-2xl p-6 border border-white/10">
            <p className="text-gray-300 mb-6">
              Under UK GDPR, you have the following rights regarding your personal data:
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { title: 'Right to Access', desc: 'Request copies of your personal data' },
                { title: 'Right to Rectification', desc: 'Request correction of inaccurate data' },
                { title: 'Right to Erasure', desc: 'Request deletion of your data' },
                { title: 'Right to Restrict', desc: 'Request restricted processing of your data' },
                { title: 'Right to Portability', desc: 'Request transfer of your data' },
                { title: 'Right to Object', desc: 'Object to processing of your data' },
              ].map((right, idx) => (
                <div key={idx} className="bg-primary/50 rounded-xl p-4">
                  <h4 className="text-white font-semibold mb-1">{right.title}</h4>
                  <p className="text-gray-400 text-sm">{right.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-gray-400 text-sm mt-6">
              To exercise any of these rights, please contact us at{' '}
              <a href="mailto:privacy@radiocheck.me" className="text-accent-teal hover:text-accent-teal/80">
                privacy@radiocheck.me
              </a>
            </p>
          </div>
        </section>

        {/* Data Retention */}
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Data Retention</h2>
          </div>
          <div className="bg-surface/50 rounded-2xl p-6 border border-white/10 space-y-4">
            <p className="text-gray-300">
              We retain your personal data only for as long as necessary to provide our services 
              and comply with legal obligations:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-400 mt-2 flex-shrink-0"></div>
                <span className="text-gray-300">
                  <strong className="text-white">Account data:</strong> Retained while your account is active, 
                  deleted within 30 days of account closure
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-400 mt-2 flex-shrink-0"></div>
                <span className="text-gray-300">
                  <strong className="text-white">Conversation logs:</strong> Temporarily stored for up to 
                  90 days for quality and safeguarding purposes
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-400 mt-2 flex-shrink-0"></div>
                <span className="text-gray-300">
                  <strong className="text-white">Anonymised analytics:</strong> May be retained indefinitely 
                  for service improvement
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* Security */}
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
              <Lock className="w-6 h-6 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Data Security</h2>
          </div>
          <div className="bg-surface/50 rounded-2xl p-6 border border-white/10 space-y-4">
            <p className="text-gray-300">
              We implement appropriate technical and organisational measures to protect your data:
            </p>
            <ul className="space-y-2">
              {[
                'Encryption of data in transit and at rest',
                'Secure authentication systems',
                'Regular security assessments',
                'Access controls limiting data to authorised personnel',
                'Staff training on data protection',
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-400 mt-2 flex-shrink-0"></div>
                  <span className="text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Third Parties */}
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <Globe className="w-6 h-6 text-cyan-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Third-Party Services</h2>
          </div>
          <div className="bg-surface/50 rounded-2xl p-6 border border-white/10 space-y-4">
            <p className="text-gray-300">
              Radio Check uses the following third-party services to provide our app:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2 flex-shrink-0"></div>
                <span className="text-gray-300">
                  <strong className="text-white">AI Services:</strong> We use OpenAI's API to power our 
                  AI companions. Conversations are processed according to OpenAI's usage policies.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2 flex-shrink-0"></div>
                <span className="text-gray-300">
                  <strong className="text-white">Hosting:</strong> Our services are hosted on secure cloud 
                  infrastructure within the UK/EU.
                </span>
              </li>
            </ul>
            <p className="text-gray-300">
              We do not sell your personal data to third parties.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center">
              <Mail className="w-6 h-6 text-pink-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Contact Us</h2>
          </div>
          <div className="bg-surface/50 rounded-2xl p-6 border border-white/10">
            <p className="text-gray-300 mb-4">
              For any questions about this privacy policy or to exercise your data rights, contact:
            </p>
            <p className="text-white font-semibold">Data Protection Officer</p>
            <p className="text-gray-300">Radio Check</p>
            <a href="mailto:privacy@radiocheck.me" className="text-accent-teal hover:text-accent-teal/80">
              privacy@radiocheck.me
            </a>
            <p className="text-gray-400 text-sm mt-6">
              You also have the right to lodge a complaint with the Information Commissioner's Office (ICO) 
              if you believe your data has been handled incorrectly.
            </p>
          </div>
        </section>

        {/* Link to Legal */}
        <div className="text-center">
          <Link
            to="/legal"
            className="inline-flex items-center justify-center gap-2 bg-accent-teal hover:bg-accent-teal/90 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:scale-105"
          >
            View Terms & Disclaimers
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
