import { useState } from 'react'
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle } from 'lucide-react'

export default function Contact() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formState.name || !formState.email || !formState.message) {
      setError('Please fill in all required fields')
      return
    }

    // For now, we'll just show a success message
    // In production, this would send to a backend API
    setSubmitted(true)
    setError('')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormState(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    setError('')
  }

  return (
    <div className="bg-primary min-h-screen">
      {/* Header */}
      <section className="bg-primary-dark py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Contact Us</h1>
          <p className="text-xl text-gray-300">Get in touch with the Radio Check team</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Send Us a Message</h2>
            
            {submitted ? (
              <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Message Sent!</h3>
                <p className="text-gray-300">
                  Thank you for contacting us. We'll get back to you as soon as possible.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false)
                    setFormState({ name: '', email: '', subject: '', message: '' })
                  }}
                  className="mt-6 text-accent-teal hover:text-accent-teal/80 font-medium"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <p className="text-red-300">{error}</p>
                  </div>
                )}

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Your Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formState.name}
                    onChange={handleChange}
                    className="w-full bg-surface/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent-teal transition-colors"
                    placeholder="John Smith"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formState.email}
                    onChange={handleChange}
                    className="w-full bg-surface/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent-teal transition-colors"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formState.subject}
                    onChange={handleChange}
                    className="w-full bg-surface/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-teal transition-colors"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Enquiry</option>
                    <option value="support">Support Question</option>
                    <option value="volunteer">Volunteering</option>
                    <option value="partnership">Partnership Opportunities</option>
                    <option value="press">Press & Media</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                    Message <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formState.message}
                    onChange={handleChange}
                    rows={6}
                    className="w-full bg-surface/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent-teal transition-colors resize-none"
                    placeholder="How can we help?"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-accent-teal hover:bg-accent-teal/90 text-white px-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <Send className="w-5 h-5" />
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Other Ways to Reach Us</h2>
            
            <div className="space-y-6">
              <div className="bg-surface/50 rounded-2xl p-6 border border-white/10">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent-blue/20 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-accent-blue" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Email</h3>
                    <a href="mailto:hello@radiocheck.me" className="text-accent-teal hover:text-accent-teal/80 transition-colors">
                      hello@radiocheck.me
                    </a>
                    <p className="text-gray-400 text-sm mt-1">We aim to respond within 48 hours</p>
                  </div>
                </div>
              </div>

              <div className="bg-surface/50 rounded-2xl p-6 border border-white/10">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">For Veterans in Crisis</h3>
                    <p className="text-gray-300 mb-2">If you need immediate support:</p>
                    <ul className="space-y-1 text-gray-400 text-sm">
                      <li>Combat Stress: <span className="text-white">0800 138 1619</span></li>
                      <li>Samaritans: <span className="text-white">116 123</span></li>
                      <li>Emergency: <span className="text-red-400 font-bold">999</span></li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-surface/50 rounded-2xl p-6 border border-white/10">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Location</h3>
                    <p className="text-gray-400">
                      Radio Check operates online throughout the United Kingdom, supporting veterans and serving personnel wherever they are.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Volunteer CTA */}
            <div className="mt-8 bg-gradient-to-r from-accent-teal/20 to-accent-blue/20 rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-2">Want to Volunteer?</h3>
              <p className="text-gray-300 mb-4">
                We're always looking for volunteers to help support our veteran community. 
                If you're interested in becoming a peer supporter, get in touch using the form.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
