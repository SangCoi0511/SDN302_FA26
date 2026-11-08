/**
 * @fileoverview OurStorySection - Giới thiệu về Sân Siêu Tốc
 */

import logoImg from '../../../assets/images/logo.png';

const OurStorySection = ({ t }) => {
  return (
    <section className="py-20 bg-white dark:bg-[#14532d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left - Text content */}
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold text-[#00E536] bg-[#00E536]/10 mb-6 tracking-wide uppercase">
              {t('home.ourStoryBadge')}
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
              {t('home.ourStoryTitle')}{' '}
              <span className="text-[#00E536]">{t('home.ourStoryHighlight')}</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-4">
              {t('home.ourStoryP1')}
            </p>
            <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-4"
              dangerouslySetInnerHTML={{ __html: t('home.ourStoryP2') }}
            />
            <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-10"
              dangerouslySetInnerHTML={{ __html: t('home.ourStoryP3') }}
            />
            <div className="flex items-center gap-8 pt-6 border-t border-gray-200 dark:border-green-700">
              {[
                { value: t('home.ourStoryStat1Value'), label: t('home.ourStoryStat1Label') },
                { value: t('home.ourStoryStat2Value'), label: t('home.ourStoryStat2Label') },
                { value: t('home.ourStoryStat3Value'), label: t('home.ourStoryStat3Label') },
              ].map((stat, i) => (
                <div key={i} className={`${i < 2 ? 'pr-8 border-r border-gray-200 dark:border-green-700' : ''}`}>
                  <div className="text-2xl font-black text-[#00E536]">{stat.value}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Image */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] bg-gradient-to-br from-green-50 to-emerald-100 dark:from-[#052e16] dark:to-[#14532d] flex items-center justify-center">
              <img
                src={logoImg}
                alt="Sân Siêu Tốc"
                className="w-2/3 h-2/3 object-contain drop-shadow-2xl"
              />
              <div className="absolute top-6 right-6 w-20 h-20 rounded-full bg-[#00E536]/10" />
              <div className="absolute bottom-8 left-8 w-14 h-14 rounded-full bg-[#00E536]/15" />
            </div>
            <div className="absolute -bottom-5 -left-5 bg-white dark:bg-[#052e16] rounded-2xl shadow-xl px-6 py-4 flex items-center gap-3 border border-gray-100 dark:border-green-800">
              <div className="w-10 h-10 rounded-full bg-[#00E536]/10 flex items-center justify-center">
                <span className="material-icons-outlined text-[#00E536]">emoji_events</span>
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900 dark:text-white">#1 Sports Booking</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Vietnam 2024</div>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full border-4 border-[#00E536]/20 dark:border-[#00E536]/10" />
          </div>

        </div>
      </div>
    </section>
  );
};

export default OurStorySection;
