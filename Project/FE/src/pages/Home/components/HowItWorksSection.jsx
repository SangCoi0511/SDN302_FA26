/**
 * @fileoverview HowItWorksSection - 3 bước đặt sân
 */

import { Link } from 'react-router-dom';

const HowItWorksSection = ({ t }) => {
  const steps = [
    {
      step: '01',
      icon: 'search',
      image: '/assets/images/football.jpg',
      title: t('home.step1Title'),
      description: t('home.step1Desc'),
      color: 'from-green-400 to-emerald-500',
    },
    {
      step: '02',
      icon: 'event_available',
      image: '/assets/images/badminton.jpg',
      title: t('home.step2Title'),
      description: t('home.step2Desc'),
      color: 'from-emerald-400 to-teal-500',
    },
    {
      step: '03',
      icon: 'sports_soccer',
      image: '/assets/images/tennis.jpg',
      title: t('home.step3Title'),
      description: t('home.step3Desc'),
      color: 'from-teal-400 to-green-500',
    },
  ];

  return (
    <section className="relative py-24 overflow-hidden bg-white dark:bg-[#052e16]">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-72 h-72 rounded-full opacity-5" style={{ background: 'radial-gradient(circle, #00E536 0%, transparent 70%)', transform: 'translate(-50%, -50%)' }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-5" style={{ background: 'radial-gradient(circle, #00E536 0%, transparent 70%)', transform: 'translate(40%, 40%)' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold text-[#00E536] bg-[#00E536]/10 mb-4 tracking-wide uppercase">
            {t('home.howItWorks')}
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            {t('home.howItWorksTitle')}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-lg">
            {t('home.howItWorksDesc')}
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, index) => (
            <div key={index} className="relative group flex flex-col items-center text-center">
              {index < 2 && (
                <div className="hidden md:flex absolute top-14 -right-6 z-20 items-center justify-center">
                  <span className="material-icons-outlined text-[#00E536] text-3xl">arrow_forward</span>
                </div>
              )}
              <div className="relative w-full bg-white dark:bg-[#14532d] rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2 overflow-hidden">
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-60`} />
                  <div className="absolute top-3 left-3 w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                    <span className="text-white font-black text-sm">{step.step}</span>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/40 group-hover:scale-110 transition-transform duration-300">
                      <span className="material-icons-outlined text-white text-3xl">{step.icon}</span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[#00E536] transition-colors duration-200">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{step.description}</p>
                </div>
                <div className={`h-1 w-0 group-hover:w-full bg-gradient-to-r ${step.color} transition-all duration-500`} />
              </div>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center mt-14">
          <Link
            to="/fields"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            style={{ background: 'linear-gradient(135deg, #00E536, #00c42e)' }}
          >
            <span className="material-icons-outlined">rocket_launch</span>
            {t('home.bookNow')}
            <span className="material-icons-outlined">arrow_forward</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
