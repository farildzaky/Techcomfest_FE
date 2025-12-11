'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// --- KONFIGURASI ---
// ID Google Analytics Anda (Web Stream)
const GA_MEASUREMENT_ID = 'G-9111Z5H3YE'; 

const COOKIE_NAME = 'ink_consent_preferences';
const EXPIRY_DAYS = 365;

// --- TYPESCRIPT DEFINITIONS ---
// Menambahkan definisi agar window.gtag tidak dianggap error
declare global {
    interface Window {
        dataLayer: any[];
        gtag: (...args: any[]) => void;
    }
}

type ConsentSettings = {
    necessary: boolean; // Selalu true
    analytics: boolean;
    marketing: boolean;
};

// --- UTILITIES ---
const setCookie = (name: string, value: string, days: number) => {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const secure = process.env.NODE_ENV === 'production' ? 'secure;' : '';
    document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/; ${secure} samesite=Lax`;
};

const getCookie = (name: string) => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return match[2];
    return null;
};

// --- ICON COMPONENTS (SVG) ---
const CookieIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#E87E2F]">
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 11.5373 21.3065 11.4608 21.0672 11.8519C20.5646 12.6729 19.6642 13.1818 18.6765 13.1818C16.8913 13.1818 15.4444 11.7349 15.4444 9.94975C15.4444 8.96205 15.9533 8.06161 16.7744 7.55903C17.1654 7.31972 17.0889 6.62626 16.6263 6.62626C11.1035 6.62626 6.62626 11.1035 6.62626 16.6263C6.62626 17.0889 7.31972 17.1654 7.55903 16.7744C8.06161 15.9533 8.96205 15.4444 9.94975 15.4444C11.7349 15.4444 13.1818 16.8913 13.1818 18.6765C13.1818 19.6642 12.6729 20.5646 11.8519 21.0672C11.4608 21.3065 11.5373 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const CloseIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [showModal, setShowModal] = useState(false);
    
    // Default Preferences
    const [preferences, setPreferences] = useState<ConsentSettings>({
        necessary: true, 
        analytics: false,
        marketing: false,
    });

    useEffect(() => {
        // Cek apakah user sudah pernah memilih
        const savedConsent = getCookie(COOKIE_NAME);
        if (!savedConsent) {
            // Delay sedikit agar animasi masuk lebih smooth saat load page
            setTimeout(() => setIsVisible(true), 1000);
        } else {
            // Jika sudah ada cookie, load settingan lama DAN JALANKAN TRACKING
            const parsedSettings = JSON.parse(decodeURIComponent(savedConsent));
            setPreferences(parsedSettings);
            executeScripts(parsedSettings);
        }
    }, []);

    // --- MAIN LOGIC: INJECT GOOGLE ANALYTICS ---
    const executeScripts = (settings: ConsentSettings) => {
        // 1. Logic untuk Analytics (GA4)
        if (settings.analytics) {
            // Cek biar script tidak double (duplikat)
            if (!document.getElementById('google-analytics-script')) {
                console.log("🟢 Initializing Google Analytics...");
                
                // Buat elemen script
                const script = document.createElement('script');
                script.id = 'google-analytics-script';
                script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
                script.async = true;
                
                // Masukkan ke head
                document.head.appendChild(script);

                // Inisialisasi fungsi gtag
                script.onload = () => {
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){window.dataLayer.push(arguments);}
                    // @ts-ignore
                    gtag('js', new Date());
                    // @ts-ignore
                    gtag('config', GA_MEASUREMENT_ID, {
                        page_path: window.location.pathname,
                    });
                    console.log("🚀 GA4 Tracking Active: " + GA_MEASUREMENT_ID);
                };
            }
        }

        // 2. Logic untuk Marketing (Jika nanti Anda pasang FB Pixel / Google Ads)
        if (settings.marketing) {
            console.log("🟢 Marketing Scripts Allowed (Placeholder)");
        }
    };

    // --- HANDLERS ---

    const handleAcceptAll = () => {
        const allGranted = { necessary: true, analytics: true, marketing: true };
        setPreferences(allGranted); // Update visual state agar toggle berubah
        saveConsent(allGranted);
    };

    const handleRejectAll = () => {
        const allRejected = { necessary: true, analytics: false, marketing: false };
        setPreferences(allRejected);
        saveConsent(allRejected);
    };

    const handleSavePreferences = () => {
        saveConsent(preferences);
    };

    const saveConsent = (settings: ConsentSettings) => {
        setCookie(COOKIE_NAME, JSON.stringify(settings), EXPIRY_DAYS);
        executeScripts(settings); // Jalankan script sesuai pilihan
        setIsVisible(false);
        setShowModal(false);
    };

    const togglePreference = (key: keyof ConsentSettings) => {
        if (key === 'necessary') return; // Necessary selalu true
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    };

    if (!isVisible && !showModal) return null;

    return (
        <>
            {/* --- 1. THE MAIN BANNER (Floating Bottom) --- */}
            {isVisible && !showModal && (
                <div className="fixed bottom-6 left-6 right-6 md:left-auto md:max-w-md z-[1000] animate-slide-up">
                    <div className="bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl shadow-2xl p-6 flex flex-col gap-4">
                        
                        {/* Header */}
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-[#FFF3EB] rounded-full shrink-0">
                                <CookieIcon />
                            </div>
                            <div>
                                <h3 className="satoshiBold text-gray-900 text-lg">Kami menghargai privasi Anda</h3>
                                <p className="text-gray-600 text-sm mt-1 satoshiMedium leading-relaxed">
                                    Kami menggunakan cookie untuk meningkatkan pengalaman browsing, menayangkan konten yang dipersonalisasi, dan menganalisis traffic kami.
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3 mt-2">
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => setShowModal(true)}
                                    className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm satoshiBold hover:bg-gray-50 transition-colors"
                                >
                                    Atur Preferensi
                                </button>
                                <button 
                                    onClick={handleRejectAll}
                                    className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm satoshiBold hover:bg-gray-50 transition-colors"
                                >
                                    Tolak Semua
                                </button>
                            </div>
                            <button 
                                onClick={handleAcceptAll}
                                className="w-full px-4 py-2.5 rounded-xl bg-[#E87E2F] text-white text-sm satoshiBold hover:bg-[#D7762E] transition-transform active:scale-[0.98] shadow-lg shadow-orange-200"
                            >
                                Terima Semua
                            </button>
                        </div>
                        
                        {/* Footer Links */}
                        <div className="text-center">
                             <Link href="/privacy-policy" className="text-xs text-gray-400 hover:text-[#E87E2F] underline transition-colors">
                                Kebijakan Privasi
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* --- 2. PREFERENCES MODAL (Deep Dive) --- */}
            {showModal && (
                <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    
                    {/* Modal Content */}
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        
                        {/* Modal Header */}
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#FFF3EB] rounded-full text-[#E87E2F]">
                                    <CookieIcon />
                                </div>
                                <h3 className="satoshiBold text-xl text-gray-900">Preferensi Cookie</h3>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                                <CloseIcon />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="p-6 overflow-y-auto flex-1 space-y-6">
                            <p className="text-gray-600 text-sm satoshiMedium">
                                Kelola preferensi persetujuan Anda. Cookie yang dikategorikan sebagai "Wajib" disimpan di browser Anda karena sangat penting untuk fungsi dasar situs.
                            </p>

                            {/* Option 1: Essential */}
                            <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                                <div>
                                    <h4 className="satoshiBold text-gray-900 text-sm">Wajib (Strictly Necessary)</h4>
                                    <p className="text-xs text-gray-500 mt-1">Diperlukan agar situs web berfungsi dengan baik. Tidak dapat dinonaktifkan.</p>
                                </div>
                                <div className="text-[#E87E2F] text-xs satoshiBold px-2 py-1 bg-[#FFF3EB] rounded">Selalu Aktif</div>
                            </div>

                            {/* Option 2: Analytics */}
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <h4 className="satoshiBold text-gray-900 text-sm">Analitik & Performa</h4>
                                    <p className="text-xs text-gray-500 mt-1">Membantu kami memahami bagaimana pengunjung berinteraksi dengan situs.</p>
                                </div>
                                <ToggleSwitch 
                                    checked={preferences.analytics} 
                                    onChange={() => togglePreference('analytics')} 
                                />
                            </div>

                            {/* Option 3: Marketing */}
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <h4 className="satoshiBold text-gray-900 text-sm">Pemasaran (Marketing)</h4>
                                    <p className="text-xs text-gray-500 mt-1">Digunakan untuk menampilkan iklan yang relevan bagi Anda.</p>
                                </div>
                                <ToggleSwitch 
                                    checked={preferences.marketing} 
                                    onChange={() => togglePreference('marketing')} 
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row gap-3 justify-end">
                            <button 
                                onClick={handleRejectAll}
                                className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm satoshiBold hover:bg-white hover:shadow-sm transition-all"
                            >
                                Tolak Semua
                            </button>
                            <button 
                                onClick={handleSavePreferences}
                                className="px-5 py-2.5 rounded-xl bg-[#E87E2F] text-white text-sm satoshiBold hover:bg-[#D7762E] shadow-lg shadow-orange-200 transition-all active:scale-95"
                            >
                                Simpan Preferensi Saya
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button 
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E87E2F] ${
            checked ? 'bg-[#E87E2F]' : 'bg-gray-200'
        }`}
    >
        <span className="sr-only">Toggle setting</span>
        <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                checked ? 'translate-x-5' : 'translate-x-0.5'
            } mt-0.5`}
        />
    </button>
);

export default CookieConsent;