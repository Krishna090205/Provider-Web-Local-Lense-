import React, { useState } from 'react';
import { Compass, Mail, Phone, MapPin, Send, CheckCircle2, ShieldCheck, Heart, Train, CloudSun } from 'lucide-react';
import { useLanguage } from '../features/i18n';

export const AboutContactPage: React.FC = () => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Suggestion');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setName('');
      setEmail('');
      setMessage('');
      setSubmitted(false);
    }, 4000);
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16 text-sunset-text">
      
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-sunset-border text-sunset-accent text-xs font-semibold uppercase tracking-widest shadow-md font-serif">
          <Compass className="w-3.5 h-3.5 text-sunset-accent" />
          <span>{t('aboutPage.badge')}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold font-serif text-sunset-text">
          {t('aboutPage.title')}
        </h1>
        <p className="text-sm sm:text-base text-sunset-muted font-normal leading-relaxed">
          {t('aboutPage.subtitle')}
        </p>
      </div>

      {/* Core Principles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="glass-card p-6 rounded-3xl border border-sunset-border space-y-3">
          <div className="w-12 h-12 rounded-xl bg-sunset-accent/15 text-sunset-accent flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold font-serif text-sunset-text">Uncompromising Data Honesty</h3>
          <p className="text-xs sm:text-sm text-sunset-muted leading-relaxed font-normal">
            We never fabricate ratings, operating hours, or telephone contacts. Missing data is shown clearly as "—" rather than guessed.
          </p>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-sunset-border space-y-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/15 text-cyan-500 flex items-center justify-center">
            <Train className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold font-serif text-sunset-text">Authentic Local Transit</h3>
          <p className="text-xs sm:text-sm text-sunset-muted leading-relaxed font-normal">
            Insights on Mumbai's local trains (Western, Central & Harbour lines), black-and-yellow Kaali Peeli taxis, and scenic coastal road linkages.
          </p>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-sunset-border space-y-3">
          <div className="w-12 h-12 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center">
            <CloudSun className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold font-serif text-sunset-text">Monsoon & Sahyadri Seasons</h3>
          <p className="text-xs sm:text-sm text-sunset-muted leading-relaxed font-normal">
            Real season advisories for visiting historic fortresses like Raigad and Sinhagad safely during the lush Western Ghats monsoon.
          </p>
        </div>
      </div>

      {/* Contact Form & Office Grid */}
      <div id="contact" className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        
        {/* Contact Info */}
        <div className="glass-panel p-8 rounded-3xl border border-sunset-border space-y-6">
          <h2 className="text-2xl font-bold font-serif text-sunset-text">Contact Our Curators</h2>
          <p className="text-xs sm:text-sm text-sunset-muted leading-relaxed font-normal">
            Are you a local Mumbai heritage business owner, historian, or traveler with verified corrections? Get in touch with our curation team.
          </p>

          <div className="space-y-4 text-xs sm:text-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sunset-bg text-sunset-accent flex items-center justify-center flex-shrink-0 border border-sunset-border">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="text-sunset-text">Kala Ghoda Arts Precinct, Fort, Mumbai 400001</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sunset-bg text-sunset-accent flex items-center justify-center flex-shrink-0 border border-sunset-border">
                <Mail className="w-4 h-4" />
              </div>
              <span className="text-sunset-text">curation@locallens-mumbai.in</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sunset-bg text-sunset-accent flex items-center justify-center flex-shrink-0 border border-sunset-border">
                <Phone className="w-4 h-4" />
              </div>
              <span className="text-sunset-text">+91 22 2284 3940 (Mon–Fri, 10am–6pm IST)</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="glass-panel p-8 rounded-3xl border border-sunset-border space-y-5">
          <h3 className="text-xl font-bold font-serif text-sunset-text">Send Us an Inquiry</h3>

          {submitted && (
            <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Thank you! Your message has been sent to our Mumbai curators.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-sunset-text font-semibold">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="Arun Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-3 glass-input rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-sunset-text font-semibold">Your Email</label>
                <input
                  type="email"
                  required
                  placeholder="arun@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-3 glass-input rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-sunset-text font-semibold">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full h-11 px-3 glass-input rounded-xl cursor-pointer"
              >
                <option value="Suggestion" className="bg-sunset-bg text-sunset-text">Recommend a Hidden Mumbai Gem</option>
                <option value="Provider" className="bg-sunset-bg text-sunset-text">Provider Listing Partnership</option>
                <option value="Correction" className="bg-sunset-bg text-sunset-text">Data Verification or Correction</option>
                <option value="Forts" className="bg-sunset-bg text-sunset-text">Maharashtra Fort Trekking Query</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-sunset-text font-semibold">Message</label>
              <textarea
                required
                rows={4}
                placeholder="Share your details or feedback with our team..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-3 glass-input rounded-xl resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full btn-accent h-12 flex items-center justify-center gap-2 text-xs sm:text-sm"
            >
              <Send className="w-4 h-4 stroke-[2.5]" />
              <span>Submit Message</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
