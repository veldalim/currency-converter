import React from 'react';
import { ExternalLink, Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-16 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="font-bold text-slate-800 text-sm mb-1">BreezeSG</div>
          <p className="max-w-md text-slate-500 leading-relaxed">
            Public air quality telemetry platform referencing official Singapore National Environment Agency (NEA) standards and open data specifications.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs">
          <a
            href="https://www.nea.gov.sg/our-services/pollution-control/air-pollution/faqs"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-900 transition-colors flex items-center gap-1"
          >
            <span>NEA Air Quality Guidelines</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
          <a
            href="https://data.gov.sg"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-900 transition-colors flex items-center gap-1"
          >
            <span>data.gov.sg Public API</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
          <div className="flex items-center gap-1 text-slate-400">
            <Shield className="w-3.5 h-3.5" />
            <span>Client-side PWA &amp; Push Web Notifications</span>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>&copy; {new Date().getFullYear()} BreezeSG. All readings in Singapore Standard Time (SGT).</span>
        <span>Front-end Architecture Ready for Serverless Integration</span>
      </div>
    </footer>
  );
};
