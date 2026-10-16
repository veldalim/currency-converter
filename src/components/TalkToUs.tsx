/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DiscussionEmbed, CommentCount } from 'disqus-react';
import { 
  MessageSquare, 
  Users, 
  ShieldCheck, 
  Key, 
  ExternalLink, 
  Info, 
  Settings2,
  ChevronDown,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export interface TalkToUsArticle {
  url: string;
  id: string;
  title: string;
}

export const FORUM_TOPICS: TalkToUsArticle[] = [
  {
    id: 'exchange-rate-mas-general',
    title: 'General Feedback & Feature Requests - SG FX Live',
    url: typeof window !== 'undefined' ? `${window.location.origin}/#general` : 'https://exchange-rate-mas.example.com/#general',
  },
  {
    id: 'exchange-rate-mas-mas-api',
    title: 'MAS API & Official Benchmark Exchange Rates Discussions',
    url: typeof window !== 'undefined' ? `${window.location.origin}/#mas-api` : 'https://exchange-rate-mas.example.com/#mas-api',
  },
  {
    id: 'exchange-rate-mas-money-changers',
    title: 'Singapore Money Changers (The Arcade, Lucky Plaza, People\'s Park) & JB Travel',
    url: typeof window !== 'undefined' ? `${window.location.origin}/#money-changers` : 'https://exchange-rate-mas.example.com/#money-changers',
  },
];

export const TalkToUs: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<TalkToUsArticle>(FORUM_TOPICS[0]);
  const [showSsoSettings, setShowSsoSettings] = useState<boolean>(false);
  const [enableSso, setEnableSso] = useState<boolean>(false);
  const [ssoRemoteAuth, setSsoRemoteAuth] = useState<string>('');
  const [ssoApiKey, setSsoApiKey] = useState<string>('');
  const [keyResetCounter, setKeyResetCounter] = useState<number>(0);

  // Disqus configuration object as requested
  const disqusShortname = 'exchange-rate-mas';

  const disqusConfig = {
    url: selectedTopic.url,
    identifier: selectedTopic.id,
    title: selectedTopic.title,
    language: 'en',
    ...(enableSso
      ? {
          remoteAuthS3: ssoRemoteAuth,
          apiKey: ssoApiKey,
          sso: {
            name: 'SampleNews',
            button: 'http://example.com/images/samplenews.gif',
            icon: 'http://example.com/favicon.png',
            url: 'http://example.com/login/',
            logout: 'http://example.com/logout/',
            profile_url: 'http://example.com/profileUrlTemplate/{username}',
            width: '800',
            height: '400',
          },
        }
      : {}),
  };

  const handleReloadForum = () => {
    setKeyResetCounter((prev) => prev + 1);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Forum Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <MessageSquare className="w-5 h-5" />
              </span>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Talk to Us</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Community Forum
              </span>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Have questions about Singapore exchange rates, MAS daily benchmarks, money changers, or currency conversions? Join the discussion, report rates, or share your cross-border travel tips below.
            </p>

            {/* Comment Count Embed as requested */}
            <div className="flex items-center gap-4 text-xs pt-1">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300">
                <Users className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-slate-400">Total Discussions:</span>
                <span className="font-semibold text-white font-mono-nums">
                  <CommentCount
                    shortname={disqusShortname}
                    config={{
                      url: selectedTopic.url,
                      identifier: selectedTopic.id,
                      title: selectedTopic.title,
                    }}
                  >
                    Comments
                  </CommentCount>
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Powered by Disqus ({disqusShortname})</span>
              </div>
            </div>
          </div>

          {/* Action buttons: Reload & SSO Settings */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleReloadForum}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
              title="Reload Discussion Thread"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Reload Forum</span>
            </button>

            <button
              onClick={() => setShowSsoSettings(!showSsoSettings)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-colors ${
                showSsoSettings || enableSso
                  ? 'bg-sky-950 text-sky-300 border-sky-700'
                  : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>SSO Settings</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSsoSettings ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Discussion Topics Selector */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
          Topic Channels:
        </span>
        {FORUM_TOPICS.map((topic) => {
          const isSelected = selectedTopic.id === topic.id;
          return (
            <button
              key={topic.id}
              onClick={() => setSelectedTopic(topic)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-900/40 border border-sky-500'
                  : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              <span>{topic.title.split(' - ')[0]}</span>
              <span className="text-[10px] opacity-80 font-mono-nums">
                <CommentCount
                  shortname={disqusShortname}
                  config={{
                    url: topic.url,
                    identifier: topic.id,
                    title: topic.title,
                  }}
                >
                  ·
                </CommentCount>
              </span>
            </button>
          );
        })}
      </div>

      {/* Single Sign-On (SSO) Configuration Drawer (as requested in item 3) */}
      {showSsoSettings && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-white text-sm">Disqus Single Sign-On (SSO) Configuration</h3>
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={enableSso}
                onChange={(e) => setEnableSso(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-sky-500 focus:ring-0"
              />
              <span className="text-xs font-semibold text-slate-200">Enable SSO Payload</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">
                remoteAuthS3 (HMAC SHA1 Signed Payload)
              </label>
              <input
                type="text"
                placeholder="e.g. Generated by your server (message + hmac + timestamp)"
                value={ssoRemoteAuth}
                onChange={(e) => setSsoRemoteAuth(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-sky-500 placeholder-slate-600"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Server-generated payload for seamless user login without a separate Disqus account.
              </span>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">
                Disqus Public API Key (apiKey)
              </label>
              <input
                type="text"
                placeholder="Paste Disqus application public API key..."
                value={ssoApiKey}
                onChange={(e) => setSsoApiKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-sky-500 placeholder-slate-600"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Obtained from your Disqus API application dashboard.
              </span>
            </div>
          </div>

          {/* Preset SSO Brand Meta */}
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 flex flex-wrap items-center gap-4">
            <span><strong>Brand Name:</strong> SampleNews / SG FX Live</span>
            <span><strong>Login URL:</strong> http://example.com/login/</span>
            <span><strong>Logout URL:</strong> http://example.com/logout/</span>
            <a
              href="https://help.disqus.com/customer/en/articles/1717160-integrating-single-sign-on"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:underline flex items-center gap-1 ml-auto"
            >
              <span>Disqus SSO Documentation</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* Main Disqus Embed Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl min-h-[500px]">
        
        {/* Active Thread Meta */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4 mb-6 text-xs">
          <div>
            <span className="text-slate-400">Current Discussion Thread:</span>
            <h3 className="text-white font-bold text-sm mt-0.5">{selectedTopic.title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono text-[11px]">
              ID: {selectedTopic.id}
            </span>
            {enableSso && (
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-medium">
                SSO Active
              </span>
            )}
          </div>
        </div>

        {/* Disqus Embed Component */}
        <div 
          key={`${selectedTopic.id}-${keyResetCounter}-${enableSso ? 'sso' : 'std'}`}
          className="disqus-container rounded-2xl bg-white/5 p-4 sm:p-6 border border-slate-800/60"
        >
          <DiscussionEmbed
            shortname={disqusShortname}
            config={disqusConfig}
          />
        </div>

        {/* Disclaimer / Fallback Note for Ad Blockers / Cookies */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-start sm:items-center gap-2">
            <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5 sm:mt-0" />
            <span>
              If the forum comments do not render, check your browser ad blocker or third-party cookie permissions for Disqus.
            </span>
          </div>

          <a
            href={`https://disqus.com/home/forum/${disqusShortname}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1 shrink-0"
          >
            <span>Open Forum on Disqus</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>

    </div>
  );
};
