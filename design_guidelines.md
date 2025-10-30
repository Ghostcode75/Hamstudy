# Ham Radio Technician Test Prep - Design Guidelines

## Design Approach

**Selected Framework:** Material Design 3 (Material You)
- Education-focused utility application requiring clear information hierarchy
- Emphasize readability, learnability, and systematic progress tracking
- Green earthy aesthetic direction for brand warmth while maintaining Material's clarity

**Design Principles:**
1. **Clarity First:** Questions and answers must be instantly scannable
2. **Progress Visibility:** Users should always know where they stand
3. **Focused Learning:** Minimize distractions, maximize comprehension
4. **Confidence Building:** Clear visual feedback on mastery and improvement

---

## Typography System

**Font Family:** Roboto (Material Design standard) or Roboto Flex for variable weight control

**Hierarchy:**
- **Question Text:** Text-xl to text-2xl, font-medium (500), generous line-height (1.6-1.7) for readability
- **Answer Options:** Text-base to text-lg, font-normal (400), comfortable touch targets
- **Explanations:** Text-sm to text-base, font-normal (400), slightly muted treatment
- **Section Headers:** Text-2xl to text-3xl, font-bold (700)
- **Navigation Labels:** Text-sm, font-medium (500), all-caps with letter-spacing
- **Stats/Numbers:** Text-3xl to text-5xl, font-bold (700) for dashboard metrics
- **Body Text:** Text-base, line-height 1.6 for optimal reading

---

## Layout & Spacing System

**Tailwind Spacing Units:** Consistent use of 4, 6, 8, 12, 16, 20, 24 for spacing rhythm

**Container Strategy:**
- Main content area: max-w-4xl for optimal question reading width
- Dashboard cards: max-w-7xl for multi-column layouts
- Mobile: Full width with px-4 padding
- Desktop: Centered containers with px-6 to px-8

**Vertical Rhythm:**
- Section spacing: py-12 to py-16
- Card internal padding: p-6 to p-8
- Component gaps: space-y-4 to space-y-6
- List items: py-3 to py-4

**Grid Layouts:**
- Dashboard stats: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
- Topic cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Answer options: Single column stack for clarity

---

## Component Library

### Navigation
- **Top App Bar:** Material elevation-1, fixed position with logo, current section, profile/settings
- **Bottom Navigation (Mobile):** 4-5 primary sections (Study, Practice, Progress, Browse, More)
- **Side Navigation (Desktop):** Persistent drawer showing topic hierarchy and quick stats
- **Breadcrumbs:** For deep navigation within question pools

### Cards & Containers
- **Question Card:** Elevated surface (shadow-lg), rounded-xl, p-6 to p-8, generous whitespace
- **Answer Option Cards:** Interactive surfaces with hover states, rounded-lg, p-4, clear visual states (default, selected, correct, incorrect)
- **Topic Summary Cards:** Medium elevation, display topic name, question count, mastery percentage with circular progress indicator
- **Explanation Panel:** Slightly recessed surface or bordered container, rounded-lg, p-6, distinct from question area

### Buttons & Actions
- **Primary CTA:** Filled Material button, rounded-lg, px-6 py-3, medium elevation on hover
- **Secondary Actions:** Outlined buttons, same padding
- **Icon Buttons:** 48px touch target, rounded-full, subtle background on hover
- **Floating Action Button:** For quick "Resume Study" or "Start Practice Test" - bottom-right positioning

### Progress Indicators
- **Circular Progress:** For topic mastery percentages, 80-120px diameter
- **Linear Progress:** For current test/session progress, 4-6px height, rounded ends
- **Stepper:** For multi-step exam process (Material Design stepper component)
- **Stats Badges:** Pill-shaped indicators for question counts, streaks, scores

### Data Display
- **Score Display:** Large numerals with context labels, card-based layout
- **Performance Charts:** Material-style bar charts for topic breakdown, linear indicators for trends
- **Question Counter:** Clear "15/35" or "142/412 Mastered" with progress bar
- **Timer:** Clean numeric display with circular progress for timed practice tests

### Forms & Inputs
- **Search Bar:** Material outlined style, rounded-lg, with search icon and clear button
- **Filter Chips:** Material chip component for topic/status filtering, toggleable states
- **Radio Buttons:** For answer selection, large touch targets (minimum 44px), clear visual differentiation

### Overlays & Modals
- **Explanation Dialog:** Scrim overlay with centered card, max-w-2xl, smooth scale animation
- **Results Screen:** Full-screen overlay with celebration/retry messaging based on pass/fail
- **Settings Sheet:** Bottom sheet (mobile) or dialog (desktop) with Material Design lists

---

## Page Layouts

### Dashboard (Home)
- **Hero Stats Row:** 4-column grid with large metric cards (questions mastered, practice tests taken, avg score, study streak)
- **Quick Actions:** Prominent "Continue Studying" and "Take Practice Test" cards
- **Topic Proficiency Grid:** 3-column grid of all 10 subelements with progress circles and quick access
- **Recent Activity:** Timeline or list of recent sessions with scores

### Study Mode
- **Single Question Focus:** Centered card layout, max-w-3xl
- **Top Bar:** Question counter, timer (optional), close button
- **Question Area:** Large text block with generous padding
- **Answer Options:** Vertical stack of full-width cards with radio buttons
- **Bottom Actions:** Previous, Next, Explain buttons - fixed or floating
- **Side Panel (Desktop):** Quick navigation to specific questions, bookmarked items

### Practice Test
- **Test Header:** Exam title, timer, question counter, score (if study mode)
- **Question Display:** Same as study mode but optimized for sequential flow
- **Review Mode:** Grid view of all 35 questions showing status (answered, flagged, correct/incorrect)
- **Results Screen:** Large pass/fail message, score breakdown by subelement, action buttons

### Question Browser
- **Sidebar Filters:** Topic tree, status filters (mastered/needs review/unanswered), search
- **Question List:** Compact card view with question ID, first line of question text, status badge
- **Detail View:** Expanded card showing full question, all answers, explanation, and action buttons

### Progress Dashboard
- **Time-Based Charts:** Line or area chart showing score trends over time
- **Topic Mastery Grid:** Visual heat map or progress bars for all subelements
- **Weak Areas Highlight:** Special section calling out topics needing attention
- **Achievement Badges:** Material Design badge system for milestones

---

## Interaction Patterns

### Answer Selection
- Clear visual states: default (subtle border), hover (elevated), selected (filled), correct (success treatment), incorrect (error treatment)
- Immediate feedback option with smooth transitions
- Haptic feedback on mobile for selection

### Navigation Flow
- Swipe gestures (mobile) for previous/next question
- Keyboard shortcuts (desktop): arrow keys for navigation, number keys for answer selection
- Smooth page transitions using Material motion principles

### Loading States
- Skeleton screens for data-heavy views
- Material circular progress for actions in flight
- Optimistic updates for instant feedback

---

## Animations

**Minimal & Purposeful Only:**
- Card elevation changes on hover (subtle scale and shadow)
- Progress bar fills with smooth easing
- Success/failure state transitions (scale + fade)
- Page transitions: Shared element transitions between views
- NO decorative animations, scroll effects, or attention-grabbing motion

---

## Accessibility

- Minimum 44px touch targets for all interactive elements
- WCAG AA contrast ratios throughout (especially for answer options)
- Keyboard navigation for all functionality
- Screen reader friendly labels for all UI elements
- Focus indicators on all interactive elements (Material Design focus rings)
- Semantic HTML with proper heading hierarchy

---

## Images

**No Images Required:** This is a utility application focused on text-based learning. All visual interest comes from:
- Well-structured typography hierarchy
- Material Design elevation and surfaces
- Progress visualizations and data displays
- Thoughtful use of the green earthy theme throughout UI elements

Any future diagram figures from the question pool should be displayed in bordered containers with captions and zoom functionality.