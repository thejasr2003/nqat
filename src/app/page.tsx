"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
  {/* Header/Navigation */}
  <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
    <div className="mx-auto max-w-6xl pl-0 pr-0 py-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center -ml-2">
          <Image 
            src="/logo.png" 
            alt="WizzyBox Logo" 
            width={380} 
            height={80}
            className="h-20"
          />
        </div>

        <div className="flex items-center gap-4">
          <a 
            href="https://wizzybox.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-sm text-slate-600 hover:text-blue-600 transition-colors hidden sm:block font-medium"
          >
            Company Website
          </a>
          
          {/* <Link href="/allresult" className="text-sm text-slate-600 hover:text-blue-600 transition-colors hidden sm:block font-medium">
            Results
          </Link>

          <Link href="/addquestion" className="text-sm text-slate-600 hover:text-blue-600 transition-colors hidden sm:block font-medium">
            Admin
          </Link> */}
          
          <Link href="/details">
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm">
              Start Test
            </Button>
          </Link>
        </div>
      </div>
    </div>
  </header>

      {/* Hero Section - WizzyBox Introduction + Assessment */}
      <section className="relative bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="mx-auto max-w-7xl px-4 py-16 sm:py-24 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left: About WizzyBox */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-300/30 bg-blue-500/20 backdrop-blur-sm px-4 py-2 text-sm font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                Bengaluru's Trusted IT Services Partner
              </div>

              <div>
                <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-4">
                  Welcome to
                  <span className="block text-yellow-300 mt-2">WizzyBox</span>
                </h1>
                <p className="text-2xl font-semibold text-blue-100 mb-6">
                  We enhance your app
                </p>
              </div>

              <div className="space-y-4 text-lg text-blue-50 leading-relaxed">
                <p>
                  <strong className="text-white">WizzyBox Private Limited</strong> is your premier destination for cutting-edge 
                  <span className="text-yellow-300 font-semibold"> software testing and development services</span>.
                </p>
                <p>
                  Founded in 2024 and based in Bengaluru, Karnataka, we are a rapidly growing IT services company 
                  specializing in <strong className="text-white">Quality Assurance, Software Development, Staffing Solutions, 
                  and Managed Services</strong>.
                </p>
                <p>
                  We are a <span className="text-yellow-300 font-semibold">one-stop shop for Development, Testing, 
                  Project Management, and Strategic Consulting</span> – helping businesses thrive through 
                  tailored IT solutions backed by flawless QA processes.
                </p>
              </div>

              {/* Company Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 p-4 text-center">
                  <p className="text-3xl font-bold">51-200</p>
                  <p className="text-xs text-blue-100 mt-1">Expert Team</p>
                </div>
                <div className="rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 p-4 text-center">
                  <p className="text-3xl font-bold">50+</p>
                  <p className="text-xs text-blue-100 mt-1">Clients</p>
                </div>
                <div className="rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 p-4 text-center">
                  <p className="text-3xl font-bold">2024</p>
                  <p className="text-xs text-blue-100 mt-1">Founded</p>
                </div>
              </div>

              {/* Core Values Icons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <div className="rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm font-medium">
                  🏆 Excellence
                </div>
                <div className="rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm font-medium">
                  🤝 Collaboration
                </div>
                <div className="rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm font-medium">
                  💡 Innovation
                </div>
              </div>

              <div className="pt-4">
                <a href="https://wizzybox.com" target="_blank" rel="noopener noreferrer">
                  {/* <Button size="lg" variant="outline" className="h-12 px-8 text-base font-semibold border-2 border-white text-white hover:bg-white/10">
                    Explore Our Services
                    <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Button> */}
                </a>
              </div>
            </div>

            {/* Right: Assessment Portal Card */}
            <div className="relative">
              <div className="rounded-2xl bg-white/10 backdrop-blur-md border-2 border-white/20 p-8 shadow-2xl">
                {/* <div className="absolute -top-4 -right-4 rounded-full bg-yellow-400 text-slate-900 px-4 py-2 text-sm font-bold shadow-lg">
                  🎯 Free Assessment
                </div> */}

                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-3">
                      Test Your Technical Skills
                    </h2>
                    <p className="text-blue-100 text-lg leading-relaxed">
                      Validate your software testing and development knowledge with our 
                      comprehensive MCQ assessment designed by industry experts.
                    </p>
                  </div>

                  {/* Assessment Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg bg-blue-500/30 backdrop-blur-sm border border-blue-300/30 p-4 text-center">
                      <p className="text-3xl font-bold">50</p>
                      <p className="text-xs text-blue-100 mt-1">Questions</p>
                    </div>
                    <div className="rounded-lg bg-blue-500/30 backdrop-blur-sm border border-blue-300/30 p-4 text-center">
                      <p className="text-3xl font-bold">45min</p>
                      <p className="text-xs text-blue-100 mt-1">Duration</p>
                    </div>
                    <div className="rounded-lg bg-blue-500/30 backdrop-blur-sm border border-blue-300/30 p-4 text-center">
                      <p className="text-3xl font-bold">⚡</p>
                      <p className="text-xs text-blue-100 mt-1">Instant</p>
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-2">
                    {[
                      '✓ Industry-standard questions by WizzyBox QA experts',
                      '✓ Instant results with detailed performance analysis',
                      '✓ Shareable certificate upon completion',
                      '✓ No registration fee required'
                    ].map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-blue-50">
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Link href="/details">
                    <Button size="lg" className="w-full h-14 text-lg font-bold bg-yellow-400 text-slate-900 hover:bg-yellow-300 shadow-xl">
                      Begin Assessment Now
                      <svg className="ml-2 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Button>
                  </Link>

                  <p className="text-center text-xs text-blue-200">
                    Powered by WizzyBox's proven QA methodology
                  </p>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-purple-500 rounded-full blur-3xl opacity-30"></div>
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-yellow-400 rounded-full blur-3xl opacity-30"></div>
            </div>
          </div>
        </div>
        
        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>
    {/* NammaQA Community Section */}
    <div className="mt-16 flex justify-center">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 
                      border border-blue-200 rounded-3xl shadow-sm p-8 
                      max-w-5xl text-center">

        <h3 className="text-xl font-semibold text-slate-900 mb-3">
          Connected With NammaQA – Bengaluru’s IT QA Community
        </h3>

        <p className="text-slate-600 leading-relaxed">
          NammaQA is a recognized QA & IT community focused on empowering professionals 
          through practical learning, hands-on project experience, and industry mentorship.
          Our association with NammaQA strengthens our competency in testing, quality 
          engineering, and IT education — ensuring high standards in everything we deliver.
        </p>

        <a
          href="https://nammaqa.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-5 text-blue-600 font-medium hover:text-blue-700"
        >
          Visit NammaQA →
        </a>
      </div>
    </div>
      {/* What Makes WizzyBox Unique */}
<section className="relative py-20 bg-white">
  <div className="mx-auto max-w-6xl px-4">
    
    {/* Section Heading */}
    <div className="text-center mb-16">
      <span className="text-blue-600 font-semibold text-sm tracking-widest uppercase">
        Why WizzyBox
      </span>

      <h2 className="text-4xl font-bold text-slate-900 mt-2">
        What Makes Us Your Trusted IT Partner
      </h2>

      <p className="text-lg text-slate-600 mt-4 max-w-2xl mx-auto leading-relaxed">
        We combine expertise, innovation, and industry best practices to deliver
        reliable IT solutions that support your business goals and accelerate growth.
      </p>
    </div>

    {/* Services Grid */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      {[
        {
          title: "Software Testing",
          desc: "End-to-end QA services with strong manual and automation capabilities to ensure product stability and performance.",
        },
        {
          title: "Software Development",
          desc: "Custom-built, scalable applications designed using modern technologies for real-world business needs.",
        },
        {
          title: "IT Staffing",
          desc: "Providing skilled and reliable IT professionals to enhance your teams and deliver project success.",
        },
        {
          title: "Managed Services",
          desc: "Comprehensive IT infrastructure management ensuring uptime, security, and operational excellence.",
        }
      ].map((item, idx) => (
        <div
          key={idx}
          className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200 
                     hover:shadow-md transition-all duration-300"
        >
          <h3 className="text-xl font-semibold text-slate-900 mb-3">
            {item.title}
          </h3>

          <p className="text-sm text-slate-600 leading-relaxed">
            {item.desc}
          </p>
        </div>
      ))}
    </div>


  </div>
</section>
{/* Assessment Details - Simple & Clean */}
<section className="bg-slate-50 py-16 border-t border-slate-200">
  <div className="mx-auto max-w-6xl px-4">
    <div className="text-center mb-12">
      <h2 className="text-3xl font-bold text-slate-900 mb-4">What to Expect in This Assessment</h2>
      <p className="text-lg text-slate-600">Comprehensive evaluation of your technical skills by WizzyBox experts</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Left: Preview */}
      <div className="relative">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500"></div>
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-500"></div>
              <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
            </div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Preview</span>
          </div>
          
          <div className="space-y-5">
            <div className="rounded-lg bg-slate-50 p-5">
              <div className="mb-4">
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Sample Question</span>
              </div>
              <p className="text-sm text-slate-900 font-medium mb-5">
                What is the primary purpose of regression testing?
              </p>
              <div className="space-y-2.5">
                {[
                  'To find new bugs',
                  'To verify bug fixes don\'t break existing features',
                  'To test performance',
                  'To validate UI'
                ].map((option, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center gap-3 rounded-lg border p-3 text-sm transition-all ${
                      idx === 1 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className={`h-4 w-4 rounded-full border-2 flex-shrink-0 ${
                      idx === 1 ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                    }`}>
                      {idx === 1 && <div className="h-2 w-2 rounded-full bg-white m-auto mt-0.5"></div>}
                    </div>
                    <span className={idx === 1 ? 'text-blue-900 font-medium' : 'text-slate-700'}>
                      {option}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 p-4 text-white">
                <p className="text-xs font-medium opacity-90 mb-1">Time Left</p>
                <p className="text-2xl font-bold">24:15</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-xs font-medium text-slate-600 mb-1">Progress</p>
                <p className="text-2xl font-bold text-slate-900">5/25</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Features */}
      <div>
        {/* <h3 className="text-2xl font-bold text-slate-900 mb-2">Assessment Features</h3>
        <p className="text-slate-600 mb-6">Everything you need to know</p> */}
        
        <div className="space-y-3">
          {[
            { title: '2 MCQ Questions', desc: 'Carefully curated by WizzyBox QA professionals' },
            { title: '45 Minutes Timer', desc: 'Real-time countdown with automatic submission' },
            { title: 'Instant Results', desc: 'Get your score immediately after completion' },
            { title: 'Performance Analysis', desc: 'Detailed breakdown of strengths and improvements' },
            { title: 'Industry Standard', desc: 'Questions aligned with current industry practices' },
            { title: 'Mobile Friendly', desc: 'Take the test on any device, anywhere' }
          ].map((feature, idx) => (
            <div 
              key={idx} 
              className="flex items-start gap-4 p-4 rounded-lg bg-white border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-blue-600"></div>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">{feature.title}</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
</section>

      {/* How It Works */}
      <section className="bg-white py-16 border-t border-slate-200">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-slate-600">Simple 3-step process to complete your assessment</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Register', desc: 'Fill in your basic details to get started', icon: '✍️' },
              { step: '02', title: 'Take Test', desc: 'Answer 50 questions in 45 minutes', icon: '💻' },
              { step: '03', title: 'Get Results', desc: 'View your score and performance report instantly', icon: '🎉' }
            ].map((item, idx) => (
              <div key={idx} className="relative text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-4xl shadow-xl">
                  {item.icon}
                </div>
                <div className="mb-3 text-sm font-bold text-blue-600">{item.step}</div>
                <h3 className="mb-2 text-xl font-bold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-600">{item.desc}</p>
                {idx < 2 && (
                  <div className="absolute top-10 left-[60%] hidden md:block w-[80%] border-t-2 border-dashed border-slate-300"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 py-20 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Test Your Skills?</h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join hundreds of candidates who have validated their technical knowledge through WizzyBox assessment portal
          </p>
          <Link href="/details">
            <Button size="lg" className="h-16 px-12 text-xl font-bold bg-white text-blue-600 hover:bg-blue-50 shadow-2xl">
              Start Assessment Now
              <svg className="ml-3 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </Link>
          <p className="mt-6 text-sm text-blue-200">
            💡 Ensure you have a stable internet connection and a quiet environment before starting
          </p>
        </div>
      </section>

      {/* Footer - Simple */}
      <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                {/* <Image 
                  src="/logo.png" 
                  alt="WizzyBox Logo" 
                  width={40} 
                  height={40}
                  className="h-10 w-10"
                /> */}
                <div>
                  <h3 className="text-lg font-bold text-white">WizzyBox Private Limited</h3>
                  <p className="text-xs text-slate-400">We enhance your app</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 mb-4 max-w-md">
                Your premier destination for cutting-edge software testing and development services. 
                Part of the NammaQA community.
              </p>
              <div className="flex gap-4">
                <a href="https://www.linkedin.com/company/wizzybox" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:bg-blue-600 hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"></path><circle cx="4" cy="4" r="2"></circle></svg>
                </a>
                <a href="https://www.instagram.com/wizzybox_private_limited/" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:bg-pink-600 hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/><path d="M12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wide mb-4">Quick Links</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="https://wizzybox.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">Company Website</a></li>
                <li><a href="https://wizzybox.com/about-us/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">About Us</a></li>
                <li><a href="https://wizzybox.com/careers/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">Careers</a></li>
                <li><a href="https://nammaqa.com/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">NammaQA Community</a></li>
                <li><a href="mailto:contactus@wizzybox.com" className="hover:text-blue-400 transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-400">
            <p>© 2024 WizzyBox Private Limited. Bengaluru, Karnataka. All rights reserved.</p>
            <p className="mt-2 text-xs text-slate-500">
              1st Floor, #962, above SBI Bank, near Deepa Complex, Papreddy Palya, 2nd Stage, Naagarabhaavi, Bengaluru 560072
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
