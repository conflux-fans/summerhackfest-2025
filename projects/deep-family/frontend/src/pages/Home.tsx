import { memo, useMemo, lazy, Suspense } from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { DynamicIcon } from '../components/home/DynamicIcon'
import { 
  HERO_STYLES as HERO_STYLE_CONSTANTS, 
  FLOATING_SHAPES as FLOATING_SHAPE_CONSTANTS, 
  TAG_STRIP_STYLES, 
  CTA_BUTTON_STYLES, 
  HERO_CONTENT_STYLES,
  TAG_DATA,
  type ButtonConfig
} from '../constants/homeStyles'
import { ANIMATION_CLASSES } from '../constants/animationStyles'

// Lazy loaded components
const ValuePropositions = lazy(() => import('../components/home/ValuePropositions'))
const TwoLayerValueSystem = lazy(() => import('../components/home/TwoLayerValueSystem'))
const WorkflowSection = lazy(() => import('../components/WorkflowSection'))
const CoreFeatures = lazy(() => import('../components/home/CoreFeatures'))
const Tokenomics = lazy(() => import('../components/home/Tokenomics'))
const Audience = lazy(() => import('../components/home/Audience'))
const CallToAction = lazy(() => import('../components/home/CallToAction'))
const LoadingFallback = lazy(() => import('../components/home/LoadingFallback'))

// Floating shapes component
const FloatingShapes = memo(() => (
  <div className="absolute inset-0 w-full h-full pointer-events-none">
    {FLOATING_SHAPE_CONSTANTS.map((shape, index) => (
      <div key={index} className={shape.className} />
    ))}
  </div>
))

// Tag strip component
const TagStrip = memo(() => {
  const { t } = useTranslation()

  return (
    <div className={TAG_STRIP_STYLES.container}>
      <div className={TAG_STRIP_STYLES.wrapper}>
        {TAG_DATA.map((tag, index) => (
          <div key={tag.key} className={`${TAG_STRIP_STYLES.tagBase} border ${tag.borderClass}`}>
            <div className={`${TAG_STRIP_STYLES.dotBase} ${tag.dotClass}`} style={{ animationDelay: `${index * 200}ms` }} />
            <span className={TAG_STRIP_STYLES.text}>
              {t(`home.tagStrip.${tag.key}`)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
})

// CTA buttons component
const CTAButtons = memo(() => {
  const { t } = useTranslation()
  
  const buttons = useMemo((): ButtonConfig[] => [
    {
      to: "/actions",
      icon: "Users",
      text: t('home.blockchainActions'),
      className: CTA_BUTTON_STYLES.primaryButton,
      hasOverlay: true
    },
    {
      to: "/familyTree",
      icon: "Network",
      text: t('home.exploreFamilyTree'),
      className: `${CTA_BUTTON_STYLES.secondaryButton} ${CTA_BUTTON_STYLES.blueSecondary}`,
      hasOverlay: false
    }
  ], [t])

  return (
    <div className={CTA_BUTTON_STYLES.container}>
      {buttons.map((button) => (
        <NavLink key={button.to} to={button.to} className={button.className}>
          {button.hasOverlay && (
            <div className={CTA_BUTTON_STYLES.overlay} />
          )}
          <div className={CTA_BUTTON_STYLES.content}>
            <DynamicIcon name={button.icon} className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 flex-shrink-0" />
            <span className={CTA_BUTTON_STYLES.text}>{button.text}</span>
          </div>
        </NavLink>
      ))}
    </div>
  )
})

export default function Home() {
  const { t } = useTranslation()

  return (
    <>
      {/* Hero Section - Full Width */}
      <section className={HERO_STYLE_CONSTANTS.section}>
        <div className={HERO_STYLE_CONSTANTS.backgroundOverlay} />

        {/* Floating background shapes with animations */}
        <FloatingShapes />

        {/* Gradient overlay for depth */}
        <div className={HERO_STYLE_CONSTANTS.gradientOverlay} />

        <div className="relative text-center w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Enhanced Main Title with animations */}
          <div className={ANIMATION_CLASSES.FADE_IN_UP}>
            <div className={HERO_CONTENT_STYLES.badge}>
              <DynamicIcon name="Sparkles" className={HERO_CONTENT_STYLES.badgeIcon} />
              <span className={HERO_CONTENT_STYLES.badgeText}>Digital Legacy</span>
            </div>
            
            <h1 className={HERO_CONTENT_STYLES.title}>
              <span className={HERO_CONTENT_STYLES.titleGradient}>
                {t('home.title')}
              </span>
            </h1>
          </div>
          
          {/* Enhanced Subtitle */}
          <div className={`${ANIMATION_CLASSES.FADE_IN_UP} ${ANIMATION_CLASSES.DELAY_200}`}>
            <p className={HERO_CONTENT_STYLES.subtitle}>
              {t('home.subtitle')}
            </p>
          </div>
          
          {/* Enhanced CTA Buttons */}
          <CTAButtons />
          
          {/* Enhanced Tag Strip */}
          <TagStrip />
          </div>
        </div>
      </section>

      {/* Content Container */}

      {/* Value Propositions */}
      <Suspense fallback={<LoadingFallback />}>
        <ValuePropositions />
      </Suspense>

      {/* Two-Layer Value System */}
      <Suspense fallback={<LoadingFallback />}>
        <TwoLayerValueSystem />
      </Suspense>

      {/* Workflow Section */}
      <Suspense fallback={<LoadingFallback />}>
        <WorkflowSection />
      </Suspense>

      {/* Core Features */}
      <Suspense fallback={<LoadingFallback />}>
        <CoreFeatures />
      </Suspense>

      {/* Tokenomics */}
      <Suspense fallback={<LoadingFallback />}>
        <Tokenomics />
      </Suspense>

      {/* Audience */}
      <Suspense fallback={<LoadingFallback />}>
        <Audience />
      </Suspense>

        {/* Call to Action */}
        <Suspense fallback={<LoadingFallback />}>
          <CallToAction />
        </Suspense>
    </>
  )
}


