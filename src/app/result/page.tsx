"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

function ResultContent() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handlePopState = () => {
      router.replace("/");
    };

    const currentUrl = window.location.href;
    if (!window.history.state?.isResultPage) {
      window.history.pushState({ isResultPage: true }, "", currentUrl);
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image 
                src="/logo.png" 
                alt="Namma QA Logo" 
                width={220} 
                height={36}
                className="object-contain"
              />
              {/* <h1 className="text-xl font-semibold text-gray-900">Namma QA</h1> */}
            </div>
            <Link href="/">
              <Button variant="outline" size="sm">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Success Message */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-10 mb-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-full mb-5">
            <svg 
              className="w-8 h-8 text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
          <h2 className="text-3xl font-semibold text-gray-900 mb-3">
            Test Submitted Successfully
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your assessment has been recorded and will be reviewed by our team
          </p>
        </div>

        {/* WhatsApp Community Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="border-b border-gray-200 bg-gray-50 px-8 py-5">
            <div className="flex items-center gap-3">
              <Image 
                src="/NAMMAQAlogo.svg" 
                alt="Namma QA Logo" 
                width={219} 
                height={48}
                className="object-contain"
              />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Join Namma QA Community
                </h3>
                <p className="text-sm text-gray-600">
                  Connect with QA professionals nationwide
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 p-8">
            
            {/* Left: Community Benefits */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Why Join Our Community?
              </h4>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Connect with 1000+ active QA professionals</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Get daily updates on industry trends</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Access exclusive QA content and resources</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Receive job alerts and career opportunities</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Learn from expert guidance and discussions</span>
                </li>
              </ul>
            </div>

            {/* Right: WhatsApp CTA */}
            <div className="flex flex-col justify-center">
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Join WhatsApp Channel
                </h4>
                
                <p className="text-sm text-gray-600 mb-5">
                  Stay connected and get instant updates
                </p>

                <a 
                  href="https://whatsapp.com/channel/0029VaBY9Vl6GcGDnAzEQY1N"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Join WhatsApp Channel
                  </Button>
                </a>

                <p className="text-xs text-gray-500 mt-3">
                  Free to join • No spam • Quality content
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Thank You and About Section */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Thank You Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Thank You
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Thank you for taking the time to complete this assessment. Your dedication 
              to improving your QA skills is appreciated. We've successfully received your 
              responses and our team will review them carefully. You can expect results soon.
            </p>
          </div>

          {/* About Namma QA Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              About Namma QA
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Namma QA is a community-driven platform for QA professionals. We provide 
              learning resources, skill assessments, mentorship, and networking opportunities 
              to help you grow in your quality assurance career.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-md">
                Community
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-md">
                Learning
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-md">
                Growth
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <Image 
                src="/NAMMAQAlogo.svg" 
                alt="Namma QA Logo" 
                width={219} 
                height={40}
                className="object-contain"
              />
            </div>
            {/* <h3 className="text-base font-semibold text-gray-900 mb-2">Namma QA</h3> */}
            <p className="text-sm text-gray-600 mb-3">
              Empowering QA Professionals | Building Quality Communities
            </p>
            <a href="mailto:support@nammaqa.com" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
              support@nammaqa.com
            </a>
            <p className="text-xs text-gray-500 mt-4">
              © 2024 Namma QA. All Rights Reserved
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-gray-200 border-t-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
}
